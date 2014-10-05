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
 * @synopsis A subtype of TP.core.ElementNode that implements 'grouping'
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
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
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

    //  Grab all of the members of this group, iterate over them and add
    //  ourself as a group that contains them. Note that an element can have
    //  more than one group.
    if (TP.notEmpty(groupTPElems = elemTPNode.getMembers())) {
        groupTPElems.perform(
                function(aTPElem) {

                    //  Note: This will overwrite any prior group element
                    //  setting for aTPElem
                    aTPElem.setGroupElement(elemTPNode);
                });
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('findFocusableElements',
function(includesGroups) {

    /**
     * @name findFocusableElements
     * @synopsis Finds focusable elements under the receiver and returns an
     *     Array of TP.core.ElementNodes of them.
     * @param {Boolean} includesGroups Whether or not to include 'tibet:group'
     *     elements as 'focusable' elements under the receiver.
     * @returns {Array} An Array of TP.core.ElementNodes under the receiver that
     *     can be focused.
     * @todo
     */

    var results;

    //  Query for any elements under the context element that have an
    //  attribute of 'tabindex'. This indicates elements that can be
    //  focused.

    //  Note that, unlike our supertype's version of this method, we also
    //  add an attribute selector to the query to filter for only elements
    //  that are within our group, not any nested groups.

    //  If we should include 'tibet:group' elements, then include them in
    //  the CSS selector.
    if (includesGroups) {
        results = this.get(
                '*[tabindex][tibet|group="' + this.getLocalID() + '"]' +
                ', tibet|group');
    } else {
        results = this.get(
                '*[tabindex][tibet|group="' + this.getLocalID() + '"]');
    }

    //  Iterate over them and see if they're displayed (not hidden by CSS -
    //  although they could currently not be visible to the user).
    results = results.select(
                    function(anElem) {

                        return TP.elementIsDisplayed(anElem);
                    });

    //  Wrap the results to make TP.core.ElementNodes
    return TP.wrap(results);
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('focus',
function() {

    /**
     * @name focus
     * @raises TP.sig.InvalidNode
     * @returns {TP.core.UIElementNode} The receiver.
     * @abtract Focuses the receiver for keyboard input.
     * @todo
     */

    var focusableElements;

    if (TP.notEmpty(focusableElements = this.findFocusableElements())) {
        focusableElements.first().focus();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.group.Inst.defineMethod('getMembers',
function() {

    /**
     * @name getMembers
     * @synopsis Returns the members of the group based on the query on the
     *     receiver.
     * @description If no query is supplied, a default of './*' (all descendants
     *     from the receiver down) is used. Also, if the receiver is not empty,
     *     it is used as the 'context' of the query. If the receiver is empty,
     *     then the document element of the document the receiver is in is used
     *     as the context.
     * @returns {Array} The Array of member TP.core.ElementNodes that the
     *     receiver designates via its query and context.
     * @todo
     */

    var query,

        contextElem,

        results;

    //  No query? Use the standard 'all child elements'
    if (TP.isEmpty(query = this.getAttribute('tibet:query'))) {
        query = './*';
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
    if (TP.notValid(results = contextElem.get(query))) {
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
     * @name getMemberGroups
     * @synopsis Returns the members of the group that are themselves groups
     * @returns {Array} The Array of member 'tibet:group' TP.core.ElementNodes.
     * @todo
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
//  end
//  ========================================================================
