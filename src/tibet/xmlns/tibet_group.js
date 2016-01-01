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
 * @summary A subtype of TP.core.ElementNode that implements 'grouping'
 *     behavior for UI elements.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('tibet:group');

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

        groupTPElems;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Get a handle to a TP.core.Node representing an instance of this
    //  element type wrapped around elem. Note that this will both ensure a
    //  unique 'id' for the element and register it.
    elemTPNode = TP.tpnode(elem);

    //  Configure the wrapper to send change signals. This is important because
    //  if the group element changes its state due to underlying state changes
    //  in its members, it needs to signal changes.
    elemTPNode.shouldSignalChange(true);

    //  Grab all of the members of this group, iterate over them and add
    //  ourself as a group that contains them. Note that an element can have
    //  more than one group. Also, we observe each one for AttributeChange.
    if (TP.notEmpty(groupTPElems = elemTPNode.getMembers())) {
        groupTPElems.perform(
                function(aTPElem) {

                    //  Note: This will overwrite any prior group element
                    //  setting for aTPElem
                    aTPElem.setGroupElement(elemTPNode);

                    elemTPNode.observe(aTPElem, 'AttributeChange');
                });
    }

    //  We register a query that, if any subtree mutations occur under our
    //  document element we want to be notified. Note that we don't actually
    //  register a query or a query context here - we want to know about all
    //  added or removed nodes.

    //  Note that this calls our 'mutationAddedFilteredNodes' and
    //  'mutationRemovedFilteredNodes' methods below with just the nodes
    //  that got added or removed.
    TP.core.MutationSignalSource.addSubtreeQuery(elem);

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
        elemTPNode,

        groupTPElems;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Get a handle to a TP.core.Node representing an instance of this
    //  element type wrapped around elem. Note that this will both ensure a
    //  unique 'id' for the element and register it.
    elemTPNode = TP.tpnode(elem);

    //  Grab all of the members of this group, iterate over them and ignore each
    //  one for AttributeChange. This undoes the observation that we made in
    //  tagAttachDOM().
    if (TP.notEmpty(groupTPElems = elemTPNode.getMembers())) {
        groupTPElems.perform(
                function(aTPElem) {
                    elemTPNode.ignore(aTPElem, 'AttributeChange');
                });
    }

    //  We're going away - remove the subtree query that we registered when we
    //  got attached into this DOM.
    TP.core.MutationSignalSource.removeSubtreeQuery(elem);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('findFocusableElements',
function(includesGroups) {

    /**
     * @method findFocusableElements
     * @summary Finds focusable elements under the receiver and returns an
     *     Array of TP.core.ElementNodes of them.
     * @param {Boolean} includesGroups Whether or not to include 'tibet:group'
     *     elements as 'focusable' elements under the receiver. The default is
     *     false.
     * @returns {Array} An Array of TP.core.ElementNodes under the receiver that
     *     can be focused.
     */

    var lid,
        selExpr,

        results;

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

    lid = this.getLocalID();

    selExpr = TP.computeFocusableQuery(
                            '> ', '[tibet|group="' + lid + '"]') +
                            ', ' +
                TP.computeFocusableQuery(
                            '*[tibet|group="' + lid + '"] *:not(tibet|group) ');

    //  If we should include 'tibet:group' elements, then include them in
    //  the CSS selector (but only shallowly - not under any other group).
    if (includesGroups) {
        selExpr += ', > tibet|group, *:not(tibet|group) tibet|group';
    }

    results = this.get(TP.cpc(selExpr));

    results = TP.unwrap(results);

    //  Iterate over them and see if they're displayed (not hidden by CSS -
    //  although they could currently not be visible to the user).
    results = results.select(
                    function(anElem) {

                        return TP.elementIsDisplayed(anElem);
                    });

    //  Sort the Array of elements by their 'tabindex' according to the
    //  HTML5 tabindex rules.
    results.sort(TP.sort.TABINDEX_ORDER);

    //  Wrap the results to make TP.core.ElementNodes
    return TP.wrap(results);
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('focus',
function(moveAction) {

    /**
     * @method focus
     * @summary Focuses the receiver for keyboard input.
     * @param {Constant} moveAction The type of 'move' that the user requested.
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
        elementToFocus;

    if (TP.notEmpty(focusableElements = this.findFocusableElements())) {
        if (moveAction === TP.LAST ||
            moveAction === TP.PREVIOUS ||
            moveAction === TP.LAST_IN_GROUP ||
            moveAction === TP.PRECEDING) {
            elementToFocus = focusableElements.last();
        } else {
            elementToFocus = focusableElements.first();
        }

        elementToFocus.focus();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('getMembers',
function() {

    /**
     * @method getMembers
     * @summary Returns the members of the group based on the query on the
     *     receiver.
     * @description If no query is supplied, a default of './*' (all descendants
     *     from the receiver down) is used. Also, if the receiver is not empty,
     *     it is used as the 'context' of the query. If the receiver is empty,
     *     then the document element of the document the receiver is in is used
     *     as the context.
     * @returns {Array} The Array of member TP.core.ElementNodes that the
     *     receiver designates via its query and context.
     */

    var query,

        contextElem,

        results;

    //  No query? Use the standard 'all child elements'
    if (TP.isEmpty(query = this.getAttribute('query'))) {
        //  This query allows direct children who are any kind of element,
        //  including groups, and other descendants who aren't *under* a group,
        //  thereby populating only shallowly.
        query = '> *, *:not(tibet|group) *';
    }

    //  If we don't have any child *elements*, then the context is the
    //  documentElement.
    if (TP.isEmpty(this.getChildElements())) {
        contextElem = this.getDocument().getDocumentElement();
    } else {
        //  Otherwise, its the receiver.
        contextElem = this;
    }

    //  Grab the 'result nodes' using the get call. If there were no
    //  results, return the empty Array.
    if (TP.notValid(results = contextElem.get(TP.apc(query)))) {
        return TP.ac();
    }

    //  Make sure that it contains only Elements.
    results = results.select(
                function(aTPNode) {

                    return TP.isKindOf(aTPNode, TP.core.ElementNode);
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
     * @returns {Array} The Array of member 'tibet:group' TP.core.ElementNodes.
     */

    var allMembers,
        results;

    if (TP.isEmpty(allMembers = this.getMembers())) {
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
     *     invalidwhen="all"            All of the members must be invalid
     *     invalidwhen="any"            Any of the members may be invalid
     *     invalidwhen="none-or-all"    None or all of the members must be
     *                                  invalid
     * @param {TP.sig.UIAttributeChange} aSignal The signal that caused this
     *     handler to trip.
     */

    var attrName,

        shouldSetFlag,

        attrVal,

        members,

        i,

        count;

    if (TP.isEmpty(attrName = aSignal.at('aspect'))) {
        //  TODO: Raise exception
        return;
    }

    //  attrName will be one of the following:
    //      readonly
    //      disabled
    //      required
    //      invalid

    if (TP.notEmpty(attrVal = this.getAttribute(attrName + 'when'))) {

        //  Grab all of the members of this group and test their values.
        members = this.getMembers();

        switch (attrVal) {

            case 'all':

                //  Initially set it to set our flag
                shouldSetFlag = true;

                for (i = 0; i < members.getSize(); i++) {
                    if (TP.bc(members.at(i).getAttribute(attrName)) === false) {
                        //  One failed - we'll no longer set our flag
                        shouldSetFlag = false;
                        break;
                    }
                }

                break;

            case 'any':

                //  Initially set it to *not* set our flag
                shouldSetFlag = false;

                for (i = 0; i < members.getSize(); i++) {
                    if (TP.bc(members.at(i).getAttribute(attrName)) === true) {
                        //  One succeeded - we'll set our flag
                        shouldSetFlag = true;
                        break;
                    }
                }

                break;

            case 'none-or-all':

                count = 0;

                for (i = 0; i < members.getSize(); i++) {
                    if (TP.bc(members.at(i).getAttribute(attrName)) === true) {
                        count++;
                        break;
                    }
                }

                /* eslint-disable no-extra-parens */
                shouldSetFlag =
                    (count === 0 || count === members.getSize() - 1);
                /* eslint-enable no-extra-parens */

                break;
            default:
                break;
        }

        //  Set the flag (or not) and send the proper signal depending on
        //  whether the flag is already set.
        if (shouldSetFlag) {
            if (!this.$isInState('pclass:' + attrName)) {
                if (attrName === 'invalid') {
                    this.signalUsingFacetAndValue('valid', false);
                } else {
                    this.signalUsingFacetAndValue(attrName, true);
                }
            }
        } else {
            if (this.$isInState('pclass:' + attrName)) {
                if (attrName === 'invalid') {
                    this.signalUsingFacetAndValue('valid', true);
                } else {
                    this.signalUsingFacetAndValue(attrName, false);
                }
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('mutationAddedFilteredNodes',
function(addedNodes) {

    /**
     * @method mutationAddedFilteredNodes
     * @summary Handles when nodes got added to the DOM we're in, filtered by
     *     the query that we registered with the MutationSignalSource.
     * @param {Array} addedNodes The Array of nodes that got added to the DOM,
     *     then filtered by our query.
     * @returns {TP.tibet.group} The receiver.
     */

    var groupTPElems,
        groupElems,
        occursInBoth;

    //  Grab all elements that could be our members - if the added nodes are
    //  part of our group, they will now be in this list.
    if (TP.notEmpty(groupTPElems = this.getMembers())) {

        //  Unwrap them
        groupElems = TP.unwrap(groupTPElems);

        //  Compare that list to what the mutation machinery handed us as added
        //  nodes.
        occursInBoth = groupElems.intersection(addedNodes, TP.IDENTITY);

        //  Set the group of any that are in both lists. Also, we observe each
        //  one for AttributeChange.
        occursInBoth.perform(
                function(anElem) {
                    var aTPElem;

                    aTPElem = TP.wrap(anElem);

                    aTPElem.setGroupElement(this);
                    this.observe(aTPElem, 'AttributeChange');
                }.bind(this));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('mutationRemovedFilteredNodes',
function(removedNodes) {

    /**
     * @method mutationRemovedFilteredNodes
     * @summary Handles when nodes got added to the DOM we're in, filtered by
     *     the query that we registered with the MutationSignalSource.
     * @param {Array} removedNodes The Array of nodes that got removed from the
     *     DOM, then filtered by our query.
     * @returns {TP.tibet.group} The receiver.
     */

    var groupTPElems,
        groupElems,
        occursInBoth;

    //  Grab all elements that could be our members - if the added nodes are
    //  part of our group, they will now be in this list.
    if (TP.notEmpty(groupTPElems = this.getMembers())) {

        //  Unwrap them
        groupElems = TP.unwrap(groupTPElems);

        //  Compare that list to what the mutation machinery handed us as added
        //  nodes.
        occursInBoth = groupElems.intersection(removedNodes, TP.IDENTITY);

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
//  end
//  ========================================================================
