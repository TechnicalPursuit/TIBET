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
 * @type {TP.tibet.group}
 * @summary A subtype of TP.dom.ElementNode that implements 'grouping'
 *     behavior for UI elements.
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('tibet:group');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.tibet.group.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        elemTPNode,

        query,
        context;

    //  NOTE: WE DO *NOT* callNextMethod() here. This method is unusual in that
    //  it can take in Attribute nodes, etc. and our supertype method assumes
    //  Element nodes.

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Get a handle to a TP.dom.Node representing an instance of this
    //  element type wrapped around elem. Note that this will both ensure a
    //  unique 'id' for the element and register it.
    elemTPNode = TP.tpnode(elem);

    //  Configure the wrapper to send change signals. This is important because
    //  if the group element changes its state due to underlying state changes
    //  in its members, it needs to signal changes.
    elemTPNode.shouldSignalChange(true);

    //  Set up the members of the group (i.e. by adding attributes to them that
    //  associate them with this group).
    elemTPNode.setupMembers();

    //  We register a query that, if any subtree mutations occur under our
    //  document element we want to be notified. Note that we don't actually
    //  register a query or a query context here - we want to know about all
    //  added or removed nodes.

    //  Note that this calls our 'mutationAddedFilteredNodes' and
    //  'mutationRemovedFilteredNodes' methods below with just the nodes
    //  that got added or removed.

    //  If we provided a query, then build a path object from it and set the
    //  context to be the whole document (since this probably what the author is
    //  going to be thinking when they write the query).
    if (TP.notEmpty(query = elemTPNode.getAttribute('query'))) {
        query = TP.apc(query);
        context = elemTPNode.getNativeDocument();
    } else {
        //  Otherwise, generate an XPath query that will get all nodes under the
        //  current content element or any Element from the whole document that
        //  has a 'tibet:group' attribute on it that matches the group element's
        //  local ID. Also, set the context to the group element.
        query =
            TP.xpc('.//node()' +
                    '|' +
                    '//*[@tibet:group = "' + elemTPNode.getLocalID() + '"]');
        context = elem;
    }

    TP.sig.MutationSignalSource.addSubtreeQuery(
            elem,
            query,
            context);

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        elemTPNode;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Get a handle to a TP.dom.Node representing an instance of this
    //  element type wrapped around elem. Note that this will both ensure a
    //  unique 'id' for the element and register it.
    elemTPNode = TP.tpnode(elem);

    //  Tear down the members of the group (i.e. by removing attributes from
    //  them that associate them with this group).
    elemTPNode.teardownMembers();

    //  We're going away - remove the subtree query that we registered when we
    //  got attached into this DOM.
    TP.sig.MutationSignalSource.removeSubtreeQuery(elem);

    //  this makes sure we maintain parent processing - but we need to do it
    //  last because it nulls out our wrapper reference.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('checkTestConditions',
function(attrName, conditionAttrVal, invertConditions) {

    /**
     * @method checkTestConditions
     * @summary Checks attribute test conditions for the receiver.
     * @description It is possible for group elements to change their attribute
     *     setting for certain 'ui state' attributes (i.e. readonly, disabled,
     *     required, invalid) based on whether one or all of their members have
     *     that setting. These take the form of:
     *
     *     validwhen="all"            All of the members must be invalid
     *     validwhen="any"            Any of the members may be invalid
     *     validwhen="none-or-all"    None or all of the members must be
     *                                invalid
     * @param {String} attrName The name of the attribute to check on each of
     *     the receiver's members to see if the test condition passes.
     * @param {String} conditionAttrVal The value of the 'test condition'
     *     attribute on the receiver. This determines what kind of test will be
     *     run and can currently consist of 'all', 'any' or 'none-or-all'
     * @param {Boolean} invertConditions Whether or not to 'invert' conditions
     *     because the value that is supplied is actually for the inverse
     *     attribute. For instance, the user authors a 'validwhen' attribute on
     *     the group, but the attribute we're checking for and need logic built
     *     around is '(pclass:)invalid'.
     * @returns {Boolean|null} True if the members meet the condition, false if
     *     they don't or null if the value of the test condition doesn't match
     *     one of it's currently supported values.
     */

    var shouldHaveAttribute,

        members,
        boundMembers,

        condition,

        len,

        i,

        val;

    //  Grab all of the members of this group and test their values.
    members = this.getMemberElements();

    //  Filter out only members that are bound. They're the only ones we'll
    //  consider for testing.
    boundMembers = members.select(
                    function(anElem) {
                        return TP.wrap(anElem).isBoundElement();
                    });

    if (invertConditions) {

        //  Inverting the value of the condition. (i.e. 'valid' when 'all' of
        //  them are valid means 'invalid' when 'any' are invalid.
        if (conditionAttrVal === 'all') {
            condition = 'any';
        } else if (conditionAttrVal === 'any') {
            //  (i.e. 'valid' when 'any' of them are valid means 'invalid' when
            //  'all' are invalid
            condition = 'all';
        }
    } else {
        condition = conditionAttrVal;
    }

    len = boundMembers.getSize();

    shouldHaveAttribute = null;

    switch (condition) {

        case 'all':

            if (invertConditions) {

                //  If the condition is 'all', that means that if *any* of the
                //  elements under the group do not have the attribute, then the
                //  group should not have the attribute.

                //  Initially set shouldHaveAttribute to true.
                shouldHaveAttribute = true;

                for (i = 0; i < len; i++) {
                    val = TP.bc(boundMembers.at(i).getAttribute(attrName));
                    if (val === false) {
                        //  One did have the attribute - we set our flag to
                        //  false
                        shouldHaveAttribute = false;
                        break;
                    }
                }
            } else {

                //  If the condition is 'all', that means that if *any* of the
                //  elements under the group have the attribute, then the group
                //  should have the attribute.

                //  Initially set shouldHaveAttribute to false.
                shouldHaveAttribute = false;

                for (i = 0; i < len; i++) {
                    val = TP.bc(boundMembers.at(i).getAttribute(attrName));
                    if (val === true) {
                        //  One did have the attribute - we set our flag to true
                        shouldHaveAttribute = true;
                        break;
                    }
                }
            }

            break;

        case 'any':

            if (invertConditions) {

                //  If the condition is 'any', that means that if *any* of the
                //  elements under the group have the attribute, then the group
                //  should have the attribute.

                //  Initially set shouldHaveAttribute to false.
                shouldHaveAttribute = false;

                for (i = 0; i < len; i++) {
                    val = TP.bc(boundMembers.at(i).getAttribute(attrName));
                    if (val === true) {
                        //  One did have the attribute - we set our flag to true
                        shouldHaveAttribute = true;
                        break;
                    }
                }

            } else {

                //  If the condition is 'any', that means that if *any* of the
                //  elements under the group do not have the attribute, then the
                //  group should not have the attribute.

                //  Initially set shouldHaveAttribute to true.
                shouldHaveAttribute = true;

                for (i = 0; i < len; i++) {
                    val = TP.bc(boundMembers.at(i).getAttribute(attrName));
                    if (val === false) {
                        //  One did *not* have the attribute - we set our flag to
                        //  false
                        shouldHaveAttribute = false;
                        break;
                    }
                }
            }

            break;

        default:
            break;
    }

    return shouldHaveAttribute;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('findFocusableElements',
function(includesGroups) {

    /**
     * @method findFocusableElements
     * @summary Finds focusable elements under the receiver and returns an
     *     Array of TP.dom.ElementNodes of them.
     * @param {Boolean} includesGroups Whether or not to include 'tibet:group'
     *     elements as 'focusable' elements under the receiver. The default is
     *     false.
     * @returns {TP.dom.ElementNode[]} An Array of TP.dom.ElementNodes under the
     *     receiver that can be focused.
     */

    var elem,

        lid,

        results,

        queryStr,

        noIntermediateGroups;

    //  Query for any elements under the context element that are focusable.

    //  Note here that the query only includes:
    //  -   elements that are focusable that are *direct* children of the
    //      receiver
    //  -   elements that are focusable that are descendants of any element
    //      under the receiver that is *not* a tibet:group element.
    //  This allows us to filter out elements that are focusable but nested
    //  under another tibet:group that is in the receiver (we don't want
    //  these elements).

    //  Also note that, unlike our supertype's version of this method, we add an
    //  attribute selector to the query to filter for only elements that are
    //  within our group, not in any other groups.

    elem = this.getNativeNode();

    lid = this.getLocalID();

    //  NOTE: Because of how these queries are structured, they have to be
    //  executed separately and their results combined.
    results = TP.ac();

    //  Query for any immediate children that have a 'tibet:group' attribute
    //  that matches our group ID.
    queryStr = TP.computeFocusableQuery('> ', '[tibet|group="' + lid + '"]');

    results.push(
        TP.byCSSPath(queryStr,
                        elem,
                        false,
                        false));

    //  Query for any descendants that have a 'tibet:group' attribute that
    //  matches our group ID.
    queryStr = TP.computeFocusableQuery(null, '[tibet|group="' + lid + '"]');

    //  Query for any descendants that have a 'tibet:group' attribute
    //  that matches our group ID.
    noIntermediateGroups = TP.byCSSPath(queryStr,
                                        elem,
                                        false,
                                        false);

    //  Now, filter that result set to make sure that there are no 'tibet:group'
    //  elements between each result node and our own element.
    noIntermediateGroups = noIntermediateGroups.filter(
                            function(focusableElem) {
                                return !TP.isElement(
                                            TP.nodeAncestorMatchingCSS(
                                                focusableElem,
                                                'tibet|group',
                                                elem));
                            });

    results.push(noIntermediateGroups);

    if (includesGroups) {
        results.push(
            TP.byCSSPath('> tibet|group, *:not(tibet|group) tibet|group',
                            elem,
                            false,
                            false));
    }

    //  Flatten out the results and unique them.
    results = results.flatten();
    results.unique();

    //  Iterate over them and see if they're displayed (not hidden by CSS -
    //  although they could currently not be visible to the user).
    results = results.select(
                    function(anElem) {
                        return TP.elementIsDisplayed(anElem);
                    });

    //  Sort the Array of elements by their 'tabindex' according to the
    //  HTML5 tabindex rules.
    results.sort(TP.sort.TABINDEX_ORDER);

    //  Wrap the results to make TP.dom.ElementNodes
    return TP.wrap(results);
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('focus',
function(moveAction) {

    /**
     * @method focus
     * @summary Focuses the receiver for keyboard input.
     * @param {String} moveAction The type of 'move' that the user requested.
     *     This can be one of the following:
     *          TP.FIRST
     *          TP.LAST
     *          TP.NEXT
     *          TP.PREVIOUS
     *          TP.FIRST_IN_GROUP
     *          TP.LAST_IN_GROUP
     *          TP.FIRST_IN_NEXT_GROUP
     *          TP.FIRST_IN_PREVIOUS_GROUP
     *          TP.FOLLOWING
     *          TP.PRECEDING.
     * @returns {TP.tibet.group} The receiver.
     */

    var focusableElements,
        tpElementToFocus;

    //  If there are focusable element under the group, then move the focus to
    //  one of them.
    if (TP.notEmpty(focusableElements = this.findFocusableElements())) {

        //  If there was a supplied move action that was one of the 'focus
        //  last/previous' actions, then just use the last focusable element.
        if (moveAction === TP.LAST ||
            moveAction === TP.PREVIOUS ||
            moveAction === TP.LAST_IN_GROUP ||
            moveAction === TP.PRECEDING) {
            tpElementToFocus = focusableElements.last();
        } else {

            //  Otherwise, see if there was any selected elements - if there
            //  were, grab the first one. We'll use that.
            tpElementToFocus =
                focusableElements.detect(
                            function(aTPElem) {
                                return aTPElem.hasAttribute('pclass:selected');
                            });

            //  No selected element? Just use the first one.
            if (TP.notValid(tpElementToFocus)) {
                tpElementToFocus = focusableElements.first();
            }
        }

        TP.dom.UIElementNode.set('$calculatedFocusingTPElem',
                                    tpElementToFocus);

        tpElementToFocus.focus();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('getMemberElements',
function() {

    /**
     * @method getMemberElements
     * @summary Returns the members of the group based on the query on the
     *     receiver.
     * @description If no query is supplied, a default of './*' (all descendants
     *     from the receiver down) is used. Also, if the receiver is not empty,
     *     it is used as the 'context' of the query. If the receiver is empty,
     *     then the document element of the document the receiver is in is used
     *     as the context.
     * @returns {TP.dom.ElementNode[]} The Array of member TP.dom.ElementNodes
     *     that the receiver designates via its query and context.
     */

    var query,
        queryWasDefined,

        contextElem,

        results;

    //  No query? Use the standard 'all child elements'
    if (TP.isEmpty(query = this.getAttribute('query'))) {
        queryWasDefined = false;

        //  This query allows direct children who are any kind of element,
        //  including groups, and other descendants who aren't *under* a group,
        //  thereby populating only shallowly.
        query = '> *, *:not(tibet|group) *';
    } else {
        queryWasDefined = true;
    }

    //  If we don't have any child *elements*, then the context is the
    //  documentElement.
    if (TP.isEmpty(this.getChildElements())) {

        //  If the query wasn't defined by the user, then we don't want to query
        //  against the document element using the query above - just return an
        //  empty Array here.
        if (!queryWasDefined) {
            return TP.ac();
        }

        contextElem = this.getDocument().getDocumentElement();
    } else {
        //  Otherwise, its the receiver.
        /* eslint-disable consistent-this */
        contextElem = this;
        /* eslint-enable consistent-this */
    }

    //  Grab the 'result nodes' using the get call. If there were no
    //  results, return the empty Array.
    if (TP.notValid(results = contextElem.get(TP.apc(query)))) {
        return TP.ac();
    }

    //  Make sure that it contains only Elements.
    results = results.select(
                function(aTPNode) {
                    return TP.isKindOf(aTPNode, TP.dom.ElementNode);
                });

    //  This will wrap all of the elements found in the results
    results = TP.wrap(results);

    return results;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('getMemberGroups',
function() {

    /**
     * @method getMemberGroups
     * @summary Returns the members of the group that are themselves groups
     * @returns {TP.tibet.group[]} The Array of member 'tibet:group'
     *     TP.dom.ElementNodes.
     */

    var allMembers,
        results;

    if (TP.isEmpty(allMembers = this.getMemberElements())) {
        return TP.ac();
    }

    results = allMembers.select(
                    function(aTPElem) {
                        return TP.isKindOf(aTPElem, TP.tibet.group);
                    });

    return results;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineHandler('AttributeChange',
function(aSignal) {

    /**
     * @method handleAttributeChange
     * @summary Handles when one of this group's members changes one of its
     *     attributes. This may cause this group element to add or remove the
     *     same attribute from itself.
     * @description It is possible for group elements to change their attribute
     *     setting for certain 'ui state' attributes (i.e. readonly, disabled,
     *     required, invalid) based on whether one or all of their members have
     *     that setting. These take the form of:
     *
     *     validwhen="all"            All of the members must be invalid
     *     validwhen="any"            Any of the members may be invalid
     *     validwhen="none-or-all"    None or all of the members must be
     *                                invalid
     * @param {TP.sig.UIAttributeChange} aSignal The signal that caused this
     *     handler to trip.
     * @returns {TP.tibet.group} The receiver.
     */

    var attrName,
        conditionAttrVal,

        invertCondition,

        positiveState;

    if (TP.isEmpty(attrName = aSignal.at('aspect'))) {
        //  TODO: Raise exception
        return this;
    }

    //  Slice off the 'PClass' prefix and lowercase the remaining portion so
    //  that we can test it consistently.
    attrName = attrName.slice(6).toLowerCase();

    //  attrName will be one of the following:
    //      readonly
    //      disabled
    //      required
    //      invalid

    //  If the attribute name is 'invalid' we query for a 'validwhen' attribute
    //  and set the flag to invert the condition testing.
    if (attrName === 'invalid') {
        conditionAttrVal = this.getAttribute('validwhen');
        invertCondition = true;
    } else {
        conditionAttrVal = this.getAttribute(attrName + 'when');
        invertCondition = false;
    }

    if (TP.notEmpty(conditionAttrVal)) {

        //  NB: This method could return true, false or null. We test explicitly
        //  for true or false below.

        positiveState = this.checkTestConditions(
                                attrName, conditionAttrVal, invertCondition);

        //  Set the flag (or not) and send the proper signal depending on
        //  whether the flag is already set.

        //  Note that positiveState could be null, in which case neither one of
        //  these statements will execute.
        if (TP.isTrue(positiveState)) {
            if (!this.$isInState('pclass:' + attrName)) {
                if (attrName === 'invalid') {
                    this.signalUsingFacetAndValue('valid', false);
                } else {
                    this.signalUsingFacetAndValue(attrName, true);
                }
            }
        } else if (TP.isFalse(positiveState)) {
            if (this.$isInState('pclass:' + attrName)) {
                if (attrName === 'invalid') {
                    this.signalUsingFacetAndValue('valid', true);
                } else {
                    this.signalUsingFacetAndValue(attrName, false);
                }
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineHandler('UIDisabled',
function(aSignal) {

    /**
     * @method handleUIDisabled
     * @summary Causes the receiver to be put into its 'disabled state'.
     * @param {TP.sig.UIDisabled} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.tibet.group} The receiver.
     */

    var conditionAttrVal,
        positiveState,

        shouldSet;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Grab the value of the 'qualifer' attribute that might be set on the
        //  receiver.
        conditionAttrVal = this.getAttribute('disabledwhen');

        //  If that attribute was set on the receiver, then do a more
        //  sophisticated check to see if we should set the attribute matching
        //  this state on the receiver.
        if (TP.notEmpty(conditionAttrVal)) {

            //  Check to see if any of the test conditions are true, using the
            //  name of the attribute of the receiver's members that should be
            //  queried as part of the testing and the value of the qualifier.
            positiveState = this.checkTestConditions(
                                        'disabled', conditionAttrVal, false);

            shouldSet = false;

            if (TP.isTrue(positiveState)) {
                if (!this.$isInState('pclass:disabled')) {
                    shouldSet = true;
                }
            }
        } else {

            //  Otherwise, no sophisticated check required - do the set.
            shouldSet = true;
        }

        if (shouldSet) {
            this.setAttrDisabled(true);
        }
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIDisabled'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIDisabled', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineHandler('UIEnabled',
function(aSignal) {

    /**
     * @method handleUIEnabled
     * @summary Causes the receiver to be put into its 'enabled state'.
     * @param {TP.sig.UIEnabled} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.tibet.group} The receiver.
     */

    var conditionAttrVal,
        positiveState,

        shouldSet;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Grab the value of the 'qualifer' attribute that might be set on the
        //  receiver.
        conditionAttrVal = this.getAttribute('disabledwhen');

        //  If that attribute was set on the receiver, then do a more
        //  sophisticated check to see if we should set the attribute matching
        //  this state on the receiver.
        if (TP.notEmpty(conditionAttrVal)) {

            //  Check to see if any of the test conditions are true, using the
            //  name of the attribute of the receiver's members that should be
            //  queried as part of the testing and the value of the qualifier.
            positiveState = this.checkTestConditions(
                                        'disabled', conditionAttrVal, false);

            shouldSet = false;

            if (TP.isFalse(positiveState)) {
                if (this.$isInState('pclass:disabled')) {
                    shouldSet = true;
                }
            }
        } else {

            //  Otherwise, no sophisticated check required - do the set.
            shouldSet = true;
        }

        if (shouldSet) {
            this.setAttrDisabled(false);
        }
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIEnabled'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIEnabled', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineHandler('UIInvalid',
function(aSignal) {

    /**
     * @method handleUIInvalid
     * @summary Causes the receiver to be put into its 'invalid state'.
     * @param {TP.sig.UIInvalid} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.tibet.group} The receiver.
     */

    var conditionAttrVal,
        positiveState,

        shouldSet;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Grab the value of the 'qualifer' attribute that might be set on the
        //  receiver.
        conditionAttrVal = this.getAttribute('validwhen');

        //  If that attribute was set on the receiver, then do a more
        //  sophisticated check to see if we should set the attribute matching
        //  this state on the receiver.
        if (TP.notEmpty(conditionAttrVal)) {

            //  Check to see if any of the test conditions are true, using the
            //  name of the attribute of the receiver's members that should be
            //  queried as part of the testing and the value of the qualifier.
            positiveState = this.checkTestConditions(
                                        'invalid', conditionAttrVal, true);

            shouldSet = false;

            if (TP.isTrue(positiveState)) {
                if (!this.$isInState('pclass:invalid')) {
                    shouldSet = true;
                }
            }
        } else {

            //  Otherwise, no sophisticated check required - do the set.
            shouldSet = true;
        }

        if (shouldSet) {
            this.setAttrInvalid(true);
        }
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIInvalid'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIInvalid', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineHandler('UIOptional',
function(aSignal) {

    /**
     * @method handleUIOptional
     * @summary Causes the receiver to be put into its 'optional state'.
     * @param {TP.sig.UIOptional} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.tibet.group} The receiver.
     */

    var conditionAttrVal,
        positiveState,

        shouldSet;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Grab the value of the 'qualifer' attribute that might be set on the
        //  receiver.
        conditionAttrVal = this.getAttribute('requiredwhen');

        //  If that attribute was set on the receiver, then do a more
        //  sophisticated check to see if we should set the attribute matching
        //  this state on the receiver.
        if (TP.notEmpty(conditionAttrVal)) {

            //  Check to see if any of the test conditions are true, using the
            //  name of the attribute of the receiver's members that should be
            //  queried as part of the testing and the value of the qualifier.
            positiveState = this.checkTestConditions(
                                        'required', conditionAttrVal, false);

            shouldSet = false;

            if (TP.isFalse(positiveState)) {
                if (this.$isInState('pclass:required')) {
                    shouldSet = true;
                }
            }
        } else {

            //  Otherwise, no sophisticated check required - do the set.
            shouldSet = true;
        }

        if (shouldSet) {
            this.setAttrRequired(false);
        }
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIOptional'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIOptional', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineHandler('UIReadonly',
function(aSignal) {

    /**
     * @method handleUIReadonly
     * @summary Causes the receiver to be put into its 'read only state'.
     * @param {TP.sig.UIReadonly} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.tibet.group} The receiver.
     */

    var conditionAttrVal,
        positiveState,

        shouldSet;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Grab the value of the 'qualifer' attribute that might be set on the
        //  receiver.
        conditionAttrVal = this.getAttribute('readonlywhen');

        //  If that attribute was set on the receiver, then do a more
        //  sophisticated check to see if we should set the attribute matching
        //  this state on the receiver.
        if (TP.notEmpty(conditionAttrVal)) {

            //  Check to see if any of the test conditions are true, using the
            //  name of the attribute of the receiver's members that should be
            //  queried as part of the testing and the value of the qualifier.
            positiveState = this.checkTestConditions(
                                        'readonly', conditionAttrVal, false);

            shouldSet = false;

            if (TP.isTrue(positiveState)) {
                if (!this.$isInState('pclass:readonly')) {
                    shouldSet = true;
                }
            }
        } else {

            //  Otherwise, no sophisticated check required - do the set.
            shouldSet = true;
        }

        if (shouldSet) {
            this.setAttrReadonly(true);
        }
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIReadonly'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIReadonly', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineHandler('UIReadwrite',
function(aSignal) {

    /**
     * @method handleUIReadwrite
     * @summary Causes the receiver to be put into its 'read write state'.
     * @param {TP.sig.UIReadwrite} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.tibet.group} The receiver.
     */

    var conditionAttrVal,
        positiveState,

        shouldSet;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Grab the value of the 'qualifer' attribute that might be set on the
        //  receiver.
        conditionAttrVal = this.getAttribute('readonlywhen');

        //  If that attribute was set on the receiver, then do a more
        //  sophisticated check to see if we should set the attribute matching
        //  this state on the receiver.
        if (TP.notEmpty(conditionAttrVal)) {

            //  Check to see if any of the test conditions are true, using the
            //  name of the attribute of the receiver's members that should be
            //  queried as part of the testing and the value of the qualifier.
            positiveState = this.checkTestConditions(
                                        'readonly', conditionAttrVal, false);

            shouldSet = false;

            if (TP.isFalse(positiveState)) {
                if (this.$isInState('pclass:readonly')) {
                    shouldSet = true;
                }
            }
        } else {

            //  Otherwise, no sophisticated check required - do the set.
            shouldSet = true;
        }

        if (shouldSet) {
            this.setAttrReadonly(false);
        }
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIReadwrite'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIReadwrite', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineHandler('UIRequired',
function(aSignal) {

    /**
     * @method handleUIRequired
     * @summary Causes the receiver to be put into its 'required state'.
     * @param {TP.sig.UIRequired} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.tibet.group} The receiver.
     */

    var conditionAttrVal,
        positiveState,

        shouldSet;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Grab the value of the 'qualifer' attribute that might be set on the
        //  receiver.
        conditionAttrVal = this.getAttribute('requiredwhen');

        //  If that attribute was set on the receiver, then do a more
        //  sophisticated check to see if we should set the attribute matching
        //  this state on the receiver.
        if (TP.notEmpty(conditionAttrVal)) {

            //  Check to see if any of the test conditions are true, using the
            //  name of the attribute of the receiver's members that should be
            //  queried as part of the testing and the value of the qualifier.
            positiveState = this.checkTestConditions(
                                        'required', conditionAttrVal, false);

            shouldSet = false;

            if (TP.isTrue(positiveState)) {
                if (!this.$isInState('pclass:required')) {
                    shouldSet = true;
                }
            }
        } else {

            //  Otherwise, no sophisticated check required - do the set.
            shouldSet = true;
        }

        if (shouldSet) {
            this.setAttrRequired(true);
        }
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIRequired'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIRequired', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineHandler('UIValid',
function(aSignal) {

    /**
     * @method handleUIValid
     * @summary Causes the receiver to be put into its 'valid state'.
     * @param {TP.sig.UIValid} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.tibet.group} The receiver.
     */

    var conditionAttrVal,
        positiveState,

        shouldSet;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Grab the value of the 'qualifer' attribute that might be set on the
        //  receiver.
        conditionAttrVal = this.getAttribute('validwhen');

        //  If that attribute was set on the receiver, then do a more
        //  sophisticated check to see if we should set the attribute matching
        //  this state on the receiver.
        if (TP.notEmpty(conditionAttrVal)) {

            //  Check to see if any of the test conditions are true, using the
            //  name of the attribute of the receiver's members that should be
            //  queried as part of the testing and the value of the qualifier.
            positiveState = this.checkTestConditions(
                                        'invalid', conditionAttrVal, true);

            shouldSet = false;

            if (TP.isFalse(positiveState)) {
                if (this.$isInState('pclass:invalid')) {
                    shouldSet = true;
                }
            }
        } else {

            //  Otherwise, no sophisticated check required - do the set.
            shouldSet = true;
        }

        if (shouldSet) {
            this.setAttrInvalid(false);
        }
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIValid'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIValid', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('isReadyToRender',
function() {

    /**
     * @method isReadyToRender
     * @summary Whether or not the receiver is 'ready to render'. For this type,
     *     this always returns true.
     * @returns {Boolean} Whether or not the receiver is ready to render.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('mutationAddedFilteredNodes',
function(addedNodes, queryInfo) {

    /**
     * @method mutationAddedFilteredNodes
     * @summary Handles when nodes got added to the DOM we're in, filtered by
     *     the query that we registered with the MutationSignalSource.
     * @param {Node[]} addedNodes The Array of nodes that got added to the DOM,
     *     then filtered by our query.
     * @param {TP.core.Hash} queryInfo Information that was registered for this
     *     query when it was originally set up.
     * @returns {TP.tibet.group} The receiver.
     */

    var groupTPElems,
        groupElems,

        addedElems,

        occursInBoth,

        ourLocalID;

    //  Grab all elements that could be our members - if the added nodes are
    //  part of our group, they will now be in this list.
    if (TP.notEmpty(groupTPElems = this.getMemberElements())) {

        //  Unwrap them
        groupElems = TP.unwrap(groupTPElems);

        //  Collect up all of the descendant elements under the addedNodes
        //  (since the mutation machinery will only hand us the added 'roots')
        addedElems = addedNodes.collect(
            function(aNode) {
                if (TP.isElement(aNode)) {
                    return TP.ac(aNode, TP.nodeGetDescendantElements(aNode));
                }
            });

        //  This will be an Array of Arrays - flatten it.
        addedElems = addedElems.flatten();

        //  Compare that list to what the mutation machinery handed us as added
        //  nodes.
        occursInBoth = groupElems.intersection(addedElems, TP.IDENTITY);

        ourLocalID = this.getLocalID();

        //  Set the group of any that are in both lists. Also, we observe each
        //  one for AttributeChange.
        occursInBoth.perform(
                function(anElem) {
                    var aTPElem;

                    aTPElem = TP.wrap(anElem);

                    //  Use $setAttribute() and don't signal for these new
                    //  elements since we're just setting them up.
                    aTPElem.$setAttribute('tibet:group', ourLocalID, false);

                    this.observe(aTPElem, 'AttributeChange');
                }.bind(this));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('mutationRemovedFilteredNodes',
function(removedNodes, queryInfo) {

    /**
     * @method mutationRemovedFilteredNodes
     * @summary Handles when nodes got removed from the DOM we're in, filtered
     *     bythe query that we registered with the MutationSignalSource.
     * @param {Node[]} removedNodes The Array of *all* of the nodes that got
     *     removed from the DOM. Note that because these nodes have already been
     *     removed from the DOM by the time TIBET's machinery gets called,
     *     unlike mutationAddedFilteredNodes, they will *not* have been filtered
     *     by the query.
     * @param {TP.core.Hash} queryInfo Information that was registered for this
     *     query when it was originally set up.
     * @returns {TP.tibet.group} The receiver.
     */

    var groupTPElems,
        groupElems,

        removedElems,

        occursInBoth;

    //  Grab all elements that could be our members - if the added nodes are
    //  part of our group, they will now be in this list.
    if (TP.notEmpty(groupTPElems = this.getMemberElements())) {

        //  Unwrap them
        groupElems = TP.unwrap(groupTPElems);

        //  Collect up all of the descendant elements under the addedNodes
        //  (since the mutation machinery will only hand us the removed 'roots')
        removedElems = removedNodes.collect(
                    function(aNode) {
                        if (TP.isElement(aNode)) {
                            return TP.nodeGetDescendantElements(aNode);
                        }
                    });

        //  This will be an Array of Arrays - flatten it.
        removedElems = removedElems.flatten();

        //  Compare that list to what the mutation machinery handed us as added
        //  nodes.
        occursInBoth = groupElems.intersection(removedElems, TP.IDENTITY);

        //  Ignore each member for AttributeChange. This undoes the observation
        //  that we do in mutationAddedFilteredNodes.
        occursInBoth.perform(
                function(anElem) {
                    var aTPElem;

                    aTPElem = TP.wrap(anElem);

                    this.ignore(aTPElem, 'AttributeChange');
                }.bind(this));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('setupMembers',
function() {

    /**
     * @method setupMembers
     * @summary Sets up the members of this group. This includes associating
     *     them to the group and observing any attribute changes from those
     *     members.
     * @returns {TP.tibet.group} The receiver.
     */

    var groupTPElems;

    //  Grab all of the members of this group, iterate over them and add
    //  ourself as a group that contains them. Note that an element can have
    //  more than one group. Also, we observe each one for AttributeChange.
    if (TP.notEmpty(groupTPElems = this.getMemberElements())) {
        groupTPElems.perform(
                function(aTPElem) {

                    //  Note: This will overwrite any prior group element
                    //  setting for aTPElem
                    aTPElem.setGroupElement(this);

                    this.observe(aTPElem, 'AttributeChange');
                }.bind(this));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('teardownMembers',
function() {

    /**
     * @method teardownMembers
     * @summary Tears down the members of this group. This includes
     *     disassociating them from the group and ignoring any attribute changes
     *     from those members.
     * @returns {TP.tibet.group} The receiver.
     */

    var groupTPElems;

    //  Grab all of the members of this group, iterate over them and add
    //  ourself as a group that contains them. Note that an element can have
    //  more than one group. Also, we observe each one for AttributeChange.
    if (TP.notEmpty(groupTPElems = this.getMemberElements())) {
        groupTPElems.perform(
                function(aTPElem) {

                    //  Note: This will remove the attribute associating aTPElem
                    //  with this group.
                    aTPElem.setGroupElement(null);

                    this.ignore(aTPElem, 'AttributeChange');
                }.bind(this));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
