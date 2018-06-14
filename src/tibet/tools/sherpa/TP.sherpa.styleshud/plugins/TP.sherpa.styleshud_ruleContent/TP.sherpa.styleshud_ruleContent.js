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
 * @type {TP.sherpa.styleshud_ruleContent}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('styleshud_ruleContent');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.styleshud_ruleContent.Type.defineMethod('tagAttachDOM',
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

    tpElem.observe(TP.uc('urn:tibet:styleshud_readwrite_prop_source'), 'ValueChange');

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud_ruleContent.Type.defineMethod('tagDetachDOM',
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

    tpElem.ignore(TP.uc('urn:tibet:styleshud_readwrite_prop_source'), 'ValueChange');

    //  this makes sure we maintain parent processing - but we need to do it
    //  last because it nulls out our wrapper reference.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.styleshud_ruleContent.Inst.defineAttribute('$propertyNames');

TP.sherpa.styleshud_ruleContent.Inst.defineAttribute('readOnlyGroup',
    TP.cpc('> tibet|group[name="readonly"]', TP.hc('shouldCollapse', true)));

TP.sherpa.styleshud_ruleContent.Inst.defineAttribute('readWriteGroup',
    TP.cpc('> tibet|group[name="readwrite"]', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.styleshud_ruleContent.Inst.defineMethod('buildPropertiesModel',
function(ruleInfo) {

    /**
     * @method buildPropertiesModel
     * @summary Builds the model object used for binding the attributes tile
     *     panel GUI controls.
     * @param {TP.dom.ElementNode} targetTPElem The element to obtain the set of
     *     attributes from.
     * @returns {TP.core.JSONContent} The JSON content object that will be used
     *     as the model.
     */

    var propertyDeclsStr,

        declsData,
        rule,
        decls,

        modelObj,
        newInsertionInfo,
        names,
        ruleProps;

    //  The property declarations String will be at the 3rd position in our
    //  entry.
    propertyDeclsStr = ruleInfo.at(2);

    declsData = TP.extern.cssParser.parse(propertyDeclsStr);
    rule = declsData.stylesheet.rules[0];
    decls = rule.declarations;

    //  Build the model object.
    modelObj = TP.hc();

    //  Register a hash to be placed at the top-level 'info' slot in the model.
    newInsertionInfo = TP.hc();
    modelObj.atPut('info', newInsertionInfo);

    names = TP.ac();

    //  Iterate over the target's attributes and populate the data model with
    //  the name and value.
    ruleProps = TP.ac();
    decls.forEach(
        function(aDecl) {
            ruleProps.push(
                TP.hc('rulePropName', aDecl.property,
                        'rulePropValue', aDecl.value));

            names.push(aDecl.property);
        });
    this.set('$propertyNames', names);

    newInsertionInfo.atPut('ruleProps', ruleProps);

    //  Construct a JSONContent object around the model object so that we can
    //  bind to it using the more powerful JSONPath constructs
    modelObj = TP.core.JSONContent.construct(TP.js2json(modelObj));

    return modelObj;
}, {
    dependencies: [TP.extern.cssParser]
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud_ruleContent.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of this content panel. For this type, this
     *     updates the 'attributes model', which is what it's GUI is bound to.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {TP.sherpa.styleshud_ruleContent} The receiver.
     */

    var propertiesModel,

        sherpaMain,
        modelURI;

    //  NB: In this method, 'value' is the source element that we're currently
    //  inspecting.

    //  Compute the attributes model.
    propertiesModel = this.buildPropertiesModel(aValue);

    sherpaMain = TP.bySystemId('Sherpa');

    //  If the style location isn't mutable, then show the read-only panel.
    if (!sherpaMain.styleLocationIsMutable(aValue.first())) {
        //  Set it as the resource of the URI.
        modelURI = TP.uc('urn:tibet:styleshud_readonly_prop_source');
        this.get('readOnlyGroup').show();
        this.get('readWriteGroup').hide();
    } else {
        //  Set it as the resource of the URI.
        modelURI = TP.uc('urn:tibet:styleshud_readwrite_prop_source');
        this.get('readWriteGroup').show();
        this.get('readOnlyGroup').hide();
    }

    modelURI.setResource(propertiesModel, TP.hc('signalChange', true));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud_ruleContent.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the user changes the value of the underlying model.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     * @returns {TP.sherpa.styleshud_ruleContent} The receiver.
     */

    var aspectPath,

        propertiesTarget,

        rule,

        modelObj,

        nameAspectPath,
        valueAspectPath,

        name,
        value,

        allPropNames,

        action,

        propIndex,
        oldPropName,

        hadProperty,

        removedData,

        targetTPElem,
        haloTPElem;

    aspectPath = aSignal.at('aspect');

    //  If the whole value changed, we're not interested.
    if (aspectPath === 'value') {
        return this;
    }

    //  Make sure we have a valid current target.
    propertiesTarget =
        TP.uc('urn:tibet:styleshud_rule_source').getResource().get('result');
    if (TP.notValid(propertiesTarget)) {
        return this;
    }

    rule = propertiesTarget.at(3);

    //  Grab an ordered list of all of the attribute names.
    allPropNames = this.get('$propertyNames');

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
            TP.uc('urn:tibet:styleshud_readwrite_prop_source').getResource().get('result');

        //  Compute a name aspect path by replacing 'rulePropValue' with
        //  'rulePropName' in the value aspect path.
        nameAspectPath = aspectPath.slice(0, aspectPath.lastIndexOf('.') + 1) +
                            'rulePropName';
        valueAspectPath = aspectPath.slice(0, aspectPath.lastIndexOf('.') + 1) +
                            'rulePropValue';

        //  Grab the name and value from the model.
        name = modelObj.get(nameAspectPath);
        value = modelObj.get(valueAspectPath);

        //  If we're changing the attribute name, but we have an empty value,
        //  then just exit here - no sense in doing a 'set'
        if (aspectPath.endsWith('rulePropName') && TP.isEmpty(value)) {
            return this;
        }

        //  If we're changing the attribute name at this point (with an
        //  attribute that has a real value)
        if (aspectPath.endsWith('rulePropName')) {

            //  We always set hadProperty to true for this case, because we're
            //  actually 'removing' an attribute that did exist.
            hadProperty = true;

            //  Slice out the index, convert it to a number and get the
            //  attribute name at that index in our list of all attribute names.
            //  This will tell us the old attribute name.
            propIndex = aspectPath.slice(
                        aspectPath.indexOf('[') + 1,
                        aspectPath.indexOf(']'));
            propIndex = propIndex.asNumber();
            oldPropName = allPropNames.at(propIndex);

            //  If we got one, remove the attribute at that position.
            if (TP.notEmpty(oldPropName)) {
                try {
                    TP.styleRuleRemoveProperty(rule, oldPropName);
                } catch (e) {
                    TP.ifError() ?
                        TP.error('Error removing old CSS property: ' +
                                    oldPropName) : 0;
                }
            }

            //  Replace the old name with the new name in our list of
            //  attributes.
            allPropNames.replace(oldPropName, name);

            try {
                TP.styleRuleSetProperty(rule, name, value);
            } catch (e) {
                TP.ifError() ?
                    TP.error('Error setting CSS property: ' + name) : 0;
            }
        } else {

            hadProperty = TP.notEmpty(rule.style.getPropertyValue(name));

            //  Set the attribute named by the name to the value
            if (!hadProperty) {
                allPropNames.push(name);
            }

            try {
                TP.styleRuleSetProperty(rule, name, value);
            } catch (e) {
                TP.ifError() ?
                    TP.error('Error setting CSS property: ' + name) : 0;
            }
        }
    } else if (action === TP.DELETE) {

        //  If we're deleting an attribute (because the user clicked an 'X'),
        //  then grab the removed data's 'name' value and remove the
        //  corresponding attribute.
        removedData = aSignal.at('removedData');
        if (TP.isValid(removedData)) {
            name = removedData.at('ruleProps').at('rulePropName');

            if (TP.notEmpty(name)) {
                //  Remove the name from our list of attribute names.
                allPropNames.remove(name);

                try {
                    TP.styleRuleRemoveProperty(rule, name);
                } catch (e) {
                    TP.ifError() ?
                        TP.error('Error removing CSS property: ' + name) : 0;
                }
            }
        }
    }

    targetTPElem =
        TP.uc('urn:tibet:styleshud_target_source').getResource().get('result');

    TP.$elementCSSFlush(TP.unwrap(targetTPElem));

    haloTPElem = TP.byId('SherpaHalo', TP.win('UIROOT'));
    haloTPElem.moveAndSizeToTarget(targetTPElem);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
