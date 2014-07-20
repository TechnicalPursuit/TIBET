//  ========================================================================
/*
NAME:   TIBETDHTMLPrimitivesBase.js
AUTH:   Scott Shattuck (ss), William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ========================================================================

/*
Common functionality related to DHTML operations.
*/

/* JSHint checking */

/* jshint newcap:false,
          evil:true
*/

//  ------------------------------------------------------------------------

//  A global hash of display values for non-inline elements.
TP.XHTML_10_NONINLINE_ELEMENTS = TP.hc(
    'address', 'block',
    'applet', 'block',
    'blockquote', 'block',
    'body', 'block',
    'caption', 'table-caption',
    'center', 'block',
    'col', 'table-column',
    'colgroup', 'table-column-group',
    'dd', 'block',
    'dir', 'block',
    'div', 'block',
    'dl', 'block',
    'dt', 'block',
    'fieldset', 'block',
    'form', 'block',
    'frame', 'block',
    'frameset', 'block',
    'h1', 'block',
    'h2', 'block',
    'h3', 'block',
    'h4', 'block',
    'h5', 'block',
    'h6', 'block',
    'hr', 'block',
    'iframe', 'block',
    'li', 'list-item',
    'menu', 'block',
    'noframes', 'block',
    'object', 'block',
    'ol', 'block',
    'p', 'block',
    'pre', 'block',
    'table', 'table',
    'td', 'table-cell',
    'th', 'table-cell',
    'tr', 'table-row',
    'thead', 'table-header-group',
    'tbody', 'table-row-group',
    'tfoot', 'table-footer-group',
    'ul', 'block');

//  ------------------------------------------------------------------------
//  OBJECT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('objectGetXY',
function(anObject) {

    /**
     * @name objectGetXY
     * @synopsis Returns the 'global' (according to the supplied object) X and Y
     *     as extracted from the supplied object.
     * @description A variety of different objects can be supplied to this
     *     method to extract X and Y values from. Depending on the type of that
     *     object, here is how the X and Y are computed:
     *     
     *     Array -> The X is extracted from the object's '.first()' property
     *     and the Y is extracted from the '.last()' property. Event -> The X
     *     and Y corresponding to the document position that the event occurred
     *     in will be returned. These numbers will *not* be offset by any
     *     scrolling. Element -> The X and Y corresponding to the element's
     *     TP.BORDER_BOX will be returned. Object -> The X is extracted by
     *     calling '.get("x")' and the Y is extracted by calling '.get("y")'.
     *     These may return undefined values.
     *     
     *     
     * @param {Object} anObject The object to extract the X and Y for.
     * @raises TP.sig.InvalidObject
     * @returns {Array} An ordered pair where the first item is the X coordinate
     *     and the second item is the Y coordinate.
     * @todo
     */

    var anX,
        anY;

    if (TP.notValid(anObject)) {
        return TP.raise(this, 'TP.sig.InvalidObject', arguments);
    }

    if (TP.isElement(anObject)) {
        //  This method defaults to TP.BORDER_BOX
        return TP.elementGetPageXY(anObject);
    }

    if (TP.isEvent(anObject)) {
        return TP.ac(anObject.pageX, anObject.pageY);
    }

    if (TP.isArray(anObject)) {
        return TP.ac(anObject.first(), anObject.last());
    }

    if (TP.isNumber(anX = anObject.get('x')) &&
        TP.isNumber(anY = anObject('y'))) {
        return TP.ac(anX, anY);
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------
//  DOCUMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetHeight',
function(aDocument) {

    /**
     * @name documentGetHeight
     * @synopsis Returns the document's height.
     * @param {Document} aDocument The document to get the height of.
     * @raises TP.sig.InvalidDocument
     * @returns {Number} The document's height in pixels.
     */

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    return TP.documentGetBody(aDocument).offsetHeight;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetScrollX',
function(aDocument) {

    /**
     * @name documentGetScrollX
     * @synopsis Returns the document's X scrolling position with its window
     *     frame.
     * @param {Document} aDocument The document to get the X scroll position of.
     * @raises TP.sig.InvalidDocument
     * @returns {Number} The document's X scroll position in pixels.
     */

    var win;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    return TP.isWindow(win = TP.nodeGetWindow(aDocument)) ?
                    win.pageXOffset :
                    0;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetScrollY',
function(aDocument) {

    /**
     * @name documentGetScrollY
     * @synopsis Returns the document's Y scrolling position with its window
     *     frame.
     * @param {Document} aDocument The document to get the Y scroll position of.
     * @raises TP.sig.InvalidDocument
     * @returns {Number} The document's Y scroll position in pixels.
     */

    var win;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    return TP.isWindow(win = TP.nodeGetWindow(aDocument)) ?
                    win.pageYOffset :
                    0;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetViewableHeight',
function(aDocument) {

    /**
     * @name documentGetViewableHeight
     * @synopsis Returns the document's 'viewable' height (that is, the height
     *     that can currently be seen and has not scrolled offscreen).
     * @param {HTMLDocument} aDocument The document to compute the viewable
     *     height for.
     * @raises TP.sig.InvalidDocument
     * @returns {Number} The document's viewable height in pixels.
     */

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    return aDocument.defaultView.innerHeight;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetViewableWidth',
function(aDocument) {

    /**
     * @name documentGetViewableWidth
     * @synopsis Returns the document's 'viewable' width (that is, the width
     *     that can currently be seen and has not scrolled offscreen).
     * @param {HTMLDocument} aDocument The document to compute the viewable
     *     width for.
     * @raises TP.sig.InvalidDocument
     * @returns {Number} The document's viewable width in pixels.
     */

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    return aDocument.documentElement.clientWidth;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetVisibility',
function(aDocument) {

    /**
     * @name documentGetVisibility
     * @synopsis Returns the supplied document's 'visibility state'. This
     *     leverages the HTML5 'document.visibilityState' property.
     * @param {Document} aDocument The document to obtain the visibility state
     *     of.
     * @raises TP.sig.InvalidDocument
     * @returns {String} The supplied document's visibility state. This will be
     *     one of: TP.VISIBLE, TP.HIDDEN or TP.PRERENDER.
     */

    var propName;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    if (TP.isDefined(aDocument.mozHidden)) {
        propName = 'mozVisibilityState';
    } else if (TP.isDefined(aDocument.webkitHidden)) {
        propName = 'webkitVisibilityState';
    } else if (TP.isDefined(aDocument.msHidden)) {
        propName = 'msVisibilityState';
    } else {
        propName = 'visibilityState';
    }

    return aDocument[propName];
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetWidth',
function(aDocument) {

    /**
     * @name documentGetWidth
     * @synopsis Returns the document's width.
     * @param {Document} aDocument The document to get the width of.
     * @raises TP.sig.InvalidDocument
     * @returns {Number} The document's width in pixels.
     */

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    return TP.documentGetBody(aDocument).offsetWidth;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentIsVisible',
function(aDocument) {

    /**
     * @name documentIsVisible
     * @synopsis Returns whether or not the supplied document is visible to the
     *     user. This leverages the HTML5 'document.hidden' property.
     * @param {Document} aDocument The document to test to see if its visible.
     * @raises TP.sig.InvalidDocument
     * @returns {Boolean} Whether or not the supplied document's is currently
     *     visible.
     */

    var propName;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    if (TP.isDefined(aDocument.mozHidden)) {
        propName = 'mozHidden';
    } else if (TP.isDefined(aDocument.webkitHidden)) {
        propName = 'webkitHidden';
    } else if (TP.isDefined(aDocument.msHidden)) {
        propName = 'msHidden';
    } else {
        propName = 'hidden';
    }

    //  Explicitly return true here because of Boolean testing around the
    //  property not existing
    if (aDocument[propName] === false) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------
//  Selection Management
//  ------------------------------------------------------------------------

TP.definePrimitive('documentClearSelection',
function(aDocument) {

    /**
     * @name documentClearSelection
     * @synopsis Clears any selection the user might have made in the supplied
     *     document.
     * @param {Document} aDocument The document to clear the selection in.
     * @raises TP.sig.InvalidDocument
     */

    var theSelection;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    theSelection = TP.nodeGetWindow(aDocument).getSelection();

    if (TP.isValid(theSelection)) {
        //  Removing all of the ranges clears the selection
        theSelection.removeAllRanges();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentCollapseSelection',
function(aDocument, toStart) {

    /**
     * @name documentCollapseSelection
     * @synopsis 'Collapse's any selection the user might have made in the
     *     supplied document to either the start or the end of itself.
     * @param {Document} aDocument The document to collapse the selection in.
     * @param {Boolean} toStart Whether or not to collapse the selection to the
     *     start of itself. This defaults to false (i.e. the selection will
     *     collapse to the end).
     * @raises TP.sig.InvalidDocument
     * @todo
     */

    var theSelection;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    theSelection = TP.nodeGetWindow(aDocument).getSelection();

    if (TP.notValid(theSelection)) {
        return;
    }

    if (theSelection.rangeCount === 0) {
        //  No ranges - can't collapse
        return;
    }

    try {
        if (TP.isTrue(toStart)) {
            theSelection.collapseToStart();
        } else {
            theSelection.collapseToEnd();
        }
    } catch (e) {
        //  moz likes to throw up if there are any issues here so just
        //  ignore it, it's half-brained most of the time anyway
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentCreateSelectionMarker',
function(aDocument) {

    /**
     * @name documentCreateSelectionMarker
     * @synopsis Returns an object that can be used in conjunction with
     *     TP.documentMoveSelectionToMarker() to move around in the document.
     * @param {Document} aDocument The document to create the selection marker
     *     in.
     * @raises TP.sig.InvalidDocument
     * @returns {Object} The object representing a selection marker.
     */

    var theSelection,
        theRange;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    theSelection = TP.nodeGetWindow(aDocument).getSelection();

    //  Make sure that the selection actually has a rangeCount of at least 1 -
    //  otherwise, Mozilla will throw an exception
    if (theSelection.rangeCount < 1) {
        return;
    }

    if (TP.isValid(theSelection)) {
        //  In W3C-compliant browsers, the 'selection marker' is really just
        //  a Range.
        theRange = theSelection.getRangeAt(0);

        if (TP.isValid(theRange)) {
            //  Clone the Range and return that.
            return theRange.cloneRange();
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentInsertAfterSelection',
function(aDocument, newContent) {

    /**
     * @name documentInsertAfterSelection
     * @synopsis Appends the newContent after any current selection in the
     *     document. If there is no selection this method does nothing.
     * @param {Document} aDocument The document whose selection should be
     *     appended to.
     * @param {String} newContent A new string of content.
     * @raises TP.sig.InvalidDocument
     * @todo
     */

    var theSelection,
        theRange,

        theFragment;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    if (TP.notValid(theSelection =
                    TP.nodeGetWindow(aDocument).getSelection())) {
        //  No selection - can't insert
        return;
    }

    if (theSelection.rangeCount === 0) {
        //  No ranges - can't insert
        return;
    }

    theRange = theSelection.getRangeAt(0);
    theRange.collapse(false);

    theFragment = theRange.createContextualFragment(TP.str(newContent));
    theRange.insertNode(theFragment);

    theSelection.removeAllRanges();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentInsertBeforeSelection',
function(aDocument, newContent) {

    /**
     * @name documentInsertBeforeSelection
     * @synopsis Inserts the newContent before any current selection in the
     *     document. If there is no selection this method does nothing.
     * @param {Document} aDocument The document whose selection should be
     *     inserted before.
     * @param {String} newContent A new string of content.
     * @raises TP.sig.InvalidDocument
     * @todo
     */

    var theSelection,
        theRange,

        theFragment;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    if (TP.notValid(theSelection =
                    TP.nodeGetWindow(aDocument).getSelection())) {
        //  No selection - can't insert
        return;
    }

    if (theSelection.rangeCount === 0) {
        //  No ranges - can't insert
        return;
    }

    theRange = theSelection.getRangeAt(0);
    theRange.collapse(true);

    theFragment = theRange.createContextualFragment(TP.str(newContent));
    theRange.insertNode(theFragment);

    theSelection.removeAllRanges();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentIsSelectionCollapsed',
function(aDocument) {

    /**
     * @name documentIsSelectionCollapsed
     * @synopsis Returns whether or not the supplied document's current
     *     selection is collapsed (whether or not its empty).
     * @param {Document} aDocument The document to test the current selection of
     *     to see if its collapsed.
     * @raises TP.sig.InvalidDocument
     * @returns {Boolean} Whether or not the supplied document's current
     *     selection is collapsed.
     */

    var theSelection;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    theSelection = TP.nodeGetWindow(aDocument).getSelection();

    if (TP.notValid(theSelection)) {
        return true;
    }

    //  If the selection is collapsed or its 'toString()' representation is
    //  empty, then its collapsed.
    return (theSelection.isCollapsed ||
            TP.isEmpty(theSelection.toString()));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetSelectionElement',
function(aDocument) {

    /**
     * @name documentGetSelectionElement
     * @synopsis Returns any single HTML element that is currently selected.
     *     Note that this method will only return real results if only a single
     *     element is selected. Otherwise it will return null.
     * @param {Document} aDocument The document to obtain the selected element
     *     for.
     * @raises TP.sig.InvalidDocument
     * @returns {HTMLElement} The single element that was selected in the
     *     supplied document.
     */

    var selectionType,

        theSelection,

        selectedElement;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  Grab the current selection type. This returns
    //  TP.SELECTION_NONE if the selection is null.
    selectionType = TP.documentGetSelectionType(aDocument);

    //  If the selection type isn't a whole HTMLElement, then bail out here
    //  by returning null.
    if (selectionType !== TP.SELECTION_ELEMENT) {
        return null;
    }

    theSelection = TP.nodeGetWindow(aDocument).getSelection();

    //  The selected element will be the child node of the selection's
    //  anchor node which is at the anchor's offset in the selection.
    selectedElement = theSelection.anchorNode.childNodes[
                                            theSelection.anchorOffset];

    if (TP.isElement(selectedElement)) {
        return selectedElement;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetSelectionParent',
function(aDocument) {

    /**
     * @name documentGetSelectionParent
     * @synopsis Returns the parent (element) of the supplied document's current
     *     selection.
     * @param {Document} aDocument The document to obtain the selection's parent
     *     node in.
     * @raises TP.sig.InvalidDocument
     * @returns {HTMLElement} The selection's parent node.
     */

    var selectionType,

        selElem,

        theSelection,

        selectionParentElement;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  Grab the current selection type. This returns
    //  TP.SELECTION_NONE if the selection is null.
    selectionType = TP.documentGetSelectionType(aDocument);

    //  If the selection type is a whole HTMLElement, then we can just use
    //  its parent node.
    if (selectionType === TP.SELECTION_ELEMENT) {
        if (TP.isElement(selElem =
                            TP.documentGetSelectionElement(aDocument))) {
            return selElem.parentNode;
        }

        return null;
    }

    theSelection = TP.nodeGetWindow(aDocument).getSelection();

    if (TP.notValid(theSelection)) {
        return null;
    }

    //  Loop upward over the ancestor chain of the selection's anchorNode
    //  and detect the first parent that is a Node.ELEMENT_NODE.
    selectionParentElement = TP.nodeDetectAncestor(
                                theSelection.anchorNode,
                                function(aParentNode) {

                                    if (TP.isElement(aParentNode)) {
                                        return true;
                                    }

                                    return false;
                                });

    return selectionParentElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetSelectionText',
function(aDocument) {

    /**
     * @name documentGetSelectionText
     * @synopsis Returns any plain text (no markup) that is currently selected.
     *     Note that this method will only return real results if text is
     *     selected. Otherwise it will return null.
     * @param {Document} aDocument The document to obtain the selected text for.
     * @raises TP.sig.InvalidDocument
     * @returns {String} The text that was selected in the supplied document.
     */

    var selectionType,

        theSelection;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  Grab the current selection type. This returns
    //  TP.SELECTION_NONE if the selection is null.
    selectionType = TP.documentGetSelectionType(aDocument);

    //  If the selection type is a whole HTMLElement, then bail out here
    //  by returning null. We want text.
    if (selectionType === TP.SELECTION_ELEMENT) {
        return null;
    }

    theSelection = TP.nodeGetWindow(aDocument).getSelection();

    if (TP.notValid(theSelection)) {
        return null;
    }

    return theSelection.toString();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetSelectionType',
function(aDocument) {

    /**
     * @name documentGetSelectionType
     * @synopsis Returns the current selection 'type'. This is one of the
     *     following constants:
     *     
     *     TP.SELECTION_NONE - no selection TP.SELECTION_TEXT - text (or a
     *     combination of text and elements). TP.SELECTION_ELEMENT - a single,
     *     whole element
     *     
     *     
     * @param {Document} aDocument The document to obtain the selected type for.
     * @raises TP.sig.InvalidDocument
     * @returns {String} A constant, detailed above, that indicates which type
     *     the current selection is.
     */

    var theSelection,
        theRange;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    theSelection = TP.nodeGetWindow(aDocument).getSelection();

    //  If we didn't get a valid selection, or the selection is collapsed,
    //  then we have no selected content, so return TP.SELECTION_NONE
    if (TP.notValid(theSelection) || TP.isTrue(theSelection.isCollapsed)) {
        return TP.SELECTION_NONE;
    }

    //  If the rangeCount is 1, then we can be assured that its only a whole
    //  chunk of something that is selected. Now we test to see if that
    //  something is an Element node, with no other surrounding content.
    if (theSelection.rangeCount === 1) {
        theRange = theSelection.getRangeAt(0);

        //  If the start container matches the end container and the end
        //  offset minus the start offset is 1, that means that the
        //  selection does not span nodes. Then we just have to check the
        //  nodeType of the current selection to make sure its not a
        //  Node.TEXT_NODE.
        if ((theRange.startContainer === theRange.endContainer) &&
            ((theRange.endOffset - theRange.startOffset) === 1) &&
            (!TP.isTextNode(theRange.startContainer))) {
            return TP.SELECTION_ELEMENT;
        }
    }

    //  Otherwise, its not null, not collapsed and not a Node.ELEMENT_NODE,
    //  so it must be text.
    return TP.SELECTION_TEXT;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentMoveSelectionToMarker',
function(aDocument, aSelectionMarker) {

    /**
     * @name documentMoveSelectionToMarker
     * @synopsis Moves the selection to the supplied marker object.
     * @param {Document} aDocument The document to move the selection of.
     * @param {Object} aSelectionMarker The object to use as the selection
     *     marker.
     * @raises TP.sig.InvalidDocument
     * @todo
     */

    var theSelection;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    theSelection = TP.nodeGetWindow(aDocument).getSelection();

    if (TP.isValid(theSelection)) {
        //  Clear all of the current Ranges and add the 'selection marker'
        //  (which on W3C-compliant browsers is a Range object), to the
        //  selection. This will cause the selection to move to that place.
        theSelection.removeAllRanges();
        theSelection.addRange(aSelectionMarker);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentRemoveSelection',
function(aDocument) {

    /**
     * @name documentRemoveSelection
     * @synopsis Deletes the supplied document's selection.
     * @param {Document} aDocument The document to delete the selection of.
     * @raises TP.sig.InvalidDocument
     */

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  If there is a real, non-collapsed selection, then delete it.
    if (TP.documentGetSelectionType(aDocument) !== TP.SELECTION_NONE) {
        TP.nodeGetWindow(aDocument).getSelection().deleteFromDocument();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentReplaceSelection',
function(aDocument, newContent) {

    /**
     * @name documentReplaceSelection
     * @synopsis Replaces the supplied document's selection with newContent.
     * @param {Document} aDocument The document whose selection should be
     *     replaced.
     * @param {String} newContent The new content to use.
     * @raises TP.sig.InvalidDocument
     * @todo
     */

    var theSelection,
        theRange,

        theFragment;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  replace can operate on either an empty selection (in which case it
    //  functions like an insert) or on a text selection.

    if (TP.notValid(theSelection =
                    TP.nodeGetWindow(aDocument).getSelection())) {
        //  No selection - can't insert
        return;
    }

    if (theSelection.rangeCount === 0) {
        //  No ranges - can't insert
        return;
    }

    theRange = theSelection.getRangeAt(0);

    theRange.deleteContents();
    theRange.collapse(true);

    theFragment = theRange.createContextualFragment(TP.str(newContent));
    theRange.insertNode(theFragment);

    theSelection.removeAllRanges();

    return;
});

//  ------------------------------------------------------------------------
//  ELEMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('elementContentIsScrolled',
function(anElement) {

    /**
     * @name elementContentIsScrolled
     * @synopsis Whether or not the element is scrolling its content.
     * @param {HTMLElement} anElement The element to check to see if its
     *     scrolling its content.
     * @raises TP.sig.InvalidElement
     * @returns {Boolean} Whether or not the element is scrolling its content.
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    return (anElement.scrollWidth > anElement.clientWidth ||
            anElement.scrollHeight > anElement.clientHeight);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetElementAtPoint',
function(anElement, x, y) {

    /**
     * @name elementGetElementAtPoint
     * @synopsis Returns the 'most nested' child element at the x and y
     *     coordinates given.
     * @description Note that the coordinates should be given in 'document'
     *     coordinates.
     * @param {HTMLElement} anElement The element to begin searching for the
     *     element at x and y.
     * @param {Number} x The X coordinate to use to look for the child element.
     * @param {Number} y The Y coordinate to use to look for the child element.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidNumber
     * @returns {Element} The 'most nested' child element found at x and y
     *     coordinates given.
     * @todo
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!TP.isNumber(x) || !TP.isNumber(y)) {
        return TP.raise(this, 'TP.sig.InvalidNumber', arguments);
    }

    return TP.nodeGetDocument(anElement).elementFromPoint(x, y);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementIsTransformed',
function(anElement) {

    /**
     * @name elementIsTransformed
     * @synopsis Returns whether or not the supplied element has been
     *     transformed with a CSS transformation.
     * @description This method takes into account any CSS transformations that
     *     are applying to the element because a parent of the element has had a
     *     CSS transformation applied to it.
     * @param {HTMLElement} anElement The element to check to see if it has been
     *     transformed.
     * @raises TP.sig.InvalidElement
     * @returns {Boolean} Whether or not the element has been transformed using
     *     CSS transforms.
     */

    var doc,
        win,

        currentElement,
    
        computedStyle;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    doc = TP.nodeGetDocument(anElement);
    win = TP.nodeGetWindow(anElement);

    currentElement = anElement;

    //  Got to walk the parent tree - we might be transformed because of a
    //  tranformation applied to a parent.
    while (currentElement && currentElement !== doc.documentElement) {

        computedStyle = win.getComputedStyle(currentElement, null);

        if (TP.notEmpty(computedStyle.OTransform ||
                            computedStyle.WebkitTransform ||
                            computedStyle.msTransform ||
                            computedStyle.MozTransform ||
                            computedStyle.transform)) {
            return true;
        }

        currentElement = currentElement.parentNode;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetIFrameDocument',
function(anElement) {

    /**
     * @name elementGetIFrameDocument
     * @synopsis Returns the document of the iframe element supplied. NB: The
     *     caller *must* supply an 'iframe' element here, or an
     *     'TP.sig.InvalidElement' exception will be thrown.
     * @param {Element} anElement The 'iframe' element to retrieve the document
     *     for.
     * @raises TP.sig.InvalidElement
     * @returns {Document} The document of the iframe supplied.
     */

    if (!TP.isElement(anElement) ||
        (TP.elementGetLocalName(anElement).toLowerCase() !== 'iframe' &&
            TP.elementGetLocalName(anElement).toLowerCase() !== 'object')) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    return anElement.contentDocument;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetIFrameWindow',
function(anElement) {

    /**
     * @name elementGetIFrameWindow
     * @synopsis Returns the window of the iframe element supplied. If the
     *     iframe's content window doesn't have a name and the iframe element
     *     has an id, the content window's name will be set to that id. NB: The
     *     caller *must* supply an 'iframe' element here, or an
     *     'TP.sig.InvalidElement' exception will be thrown.
     * @param {Element} anElement The 'iframe' element to retrieve the window
     *     for.
     * @raises TP.sig.InvalidElement
     * @returns {Window} The window of the iframe supplied.
     */

    var iframeWindow;

    if (!TP.isElement(anElement) ||
        (TP.elementGetLocalName(anElement).toLowerCase() !== 'iframe' &&
            TP.elementGetLocalName(anElement).toLowerCase() !== 'object')) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  Note that here we set the window's name to the id of the element, if
    //  it doesn't already have a name. This facilitates observing
    //  TP.sig.DocumentLoaded/TP.sig.DocumentUnloaded signals from the
    //  iframe.

    iframeWindow = anElement.contentWindow;

    if (TP.notValid(iframeWindow)) {
        return null;
    }

    if (TP.isEmpty(iframeWindow.name)) {
        iframeWindow.name = TP.elementGetAttribute(anElement, 'id');
    }

    return iframeWindow;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetOpacity',
function(anElement) {

    /**
     * @name elementGetOpacity
     * @synopsis Gets the element's opacity level. The level should be a
     *     fractional number between 0 and 1 that will represent the percentage
     *     of opacity the element is set to (e.g. it will be '.5' if the element
     *     is set to 50% opacity).
     * @param {HTMLElement} anElement The element to set the opacity of.
     * @raises TP.sig.InvalidElement
     * @returns {Number} The element's opacity level.
     */

    var computedStyle;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  Grab the computed style for the element
    computedStyle = TP.elementGetComputedStyleObj(anElement);

    //  If there is no 'opacity' property defined on the style for the
    //  element, then just return '1.0', as the element is fully opaque.
    if (TP.isEmpty(computedStyle.opacity)) {
        return 1.0;
    }

    return parseFloat(computedStyle.opacity);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetOuterContent',
function(anElement) {

    /**
     * @name elementGetOuterContent
     * @synopsis Gets the 'outer content' of anElement.
     * @description This method gets the 'outer content' of anElement which
     *     means that the entire element, including its start and end tags, will
     *     be returned.
     * @param {HTMLElement} anElement The element to get the 'outer content' of.
     * @raises TP.sig.InvalidElement
     * @returns {String} The 'outer content' of the Element.
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    return anElement.outerHTML;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetStyleValueInPixels',
function(anElement, styleProperty, wantsTransformed) {

    /**
     * @name elementGetStyleValueInPixels
     * @synopsis Gets the computed style value of the property on the element in
     *     pixels. This routine can return NaN if a Number couldn't be computed.
     * @param {HTMLElement} anElement The element to get the numeric property
     *     value of.
     * @param {String} styleProperty The name of the style property to obtain
     *     the value of.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidParameter
     * @returns {Number} The supplied property as a pixel value.
     * @todo
     */

    var computedStyle;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isEmpty(styleProperty)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    //  Grab the computed style for the element
    computedStyle = TP.elementGetComputedStyleObj(anElement);

    return TP.elementGetPixelValue(anElement,
                                    computedStyle[styleProperty],
                                    styleProperty,
                                    wantsTransformed);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetStyleValuesInPixels',
function(anElement, styleProperties, wantsTransformed) {

    /**
     * @name elementGetStyleValueInPixels
     * @synopsis Gets the computed style values of the properties on the element
     *     in pixels. This routine can produce NaNs in the output if a Number
     *     couldn't be computed for that property.
     * @param {HTMLElement} anElement The element to get the numeric property
     *     value of.
     * @param {Array} styleProperties The names of the style property to obtain
     *     the value of.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidParameter
     * @returns {TP.lang.Hash} A TP.lang.Hash of Numbers containing the supplied
     *     properties as a pixel value.
     * @todo
     */

    var computedStyle,

        valuesInPixels,

        len,
        i;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isEmpty(styleProperties)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    //  Grab the computed style for the element
    computedStyle = TP.elementGetComputedStyleObj(anElement);

    valuesInPixels = TP.hc();

    len = styleProperties.getSize();
    for (i = 0; i < len; i++) {
        valuesInPixels.atPut(
            styleProperties.at(i),
            TP.elementGetPixelValue(anElement,
                                    computedStyle[styleProperties.at(i)],
                                    styleProperties.at(i),
                                    wantsTransformed));
    }

    return valuesInPixels;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetComputedTransformMatrix',
function(anElement, wants2DMatrix) {

    /**
     * @name elementGetComputedTransformMatrix
     * @synopsis Returns the current transformation matrix of the supplied
     *     element.
     * @description This method computes the current transformation matrix of
     *     the supplied element by obtaining any transformation matrix of the
     *     element itself and then walking the parent tree and integrating each
     *     transformation matrix of that element to the computed matrix. This
     *     code derived from: https://gist.github.com/Yaffle/1145197
     *     Note that this method will, by default, return a 4x4 matrix suitable
     *     for use with CSS 3D transforms. By passing true to wants2DMatrix, a
     *     3x2 matrix suitable for use by CSS 2D transforms will be returned.
     * @param {Element} anElement The element to use the transformation from.
     * @param {Boolean} wants2DMatrix An optional parameter that tells the
     *     method whether or not to return a 3x2 matrix for use with CSS 2D
     *     transforms. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Array} An Array of Arrays representing the current
     *     transformation matrix.
     * @todo
     */

    var identity,

        matrix,
        currentElement,

        doc,
        win,

        computedStyle,
        computedMatrixString,

        computedMatrix,

        transformedRect,
        rect;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    identity = TP.matrixFromCSSString('matrix(1,0,0,1,0,0)');

    //  Start with the identity matrix
    matrix = identity;

    currentElement = anElement;

    doc = TP.nodeGetDocument(anElement);
    win = TP.nodeGetWindow(anElement);

    while (currentElement && currentElement !== doc.documentElement) {
        computedStyle = win.getComputedStyle(currentElement, null) || {};

        computedMatrixString =
            (computedStyle.OTransform ||
                computedStyle.WebkitTransform ||
                computedStyle.msTransform ||
                computedStyle.MozTransform ||
                computedStyle.transform ||
                'none').replace(/^none$/, 'matrix(1,0,0,1,0,0)');

        computedMatrix = TP.matrixFromCSSString(computedMatrixString);

        matrix = TP.multiplyMatrix(matrix, computedMatrix);

        currentElement = currentElement.parentNode;
    }

    //  If the computation resulted in the identity matrix, then there was no
    //  transformation either on the target element or up the chain - just
    //  use the identity matrix here.
    if (TP.str(matrix) === TP.str(identity)) {
        matrix = identity;
    } else {
        matrix = TP.translateMatrix(matrix, -win.pageXOffset, -win.pageYOffset, 0);

        transformedRect = TP.$elementTransformBoundingClientRect(anElement, matrix);

        rect = anElement.getBoundingClientRect(anElement);
        matrix = TP.translateMatrix(
                                matrix,
                                rect.left - transformedRect.left,
                                rect.top - transformedRect.top,
                                0);
    }

    if (TP.isValid(matrix) && TP.isTrue(wants2DMatrix)) {
        return TP.matrixAs2DMatrix(matrix);
    }

    return matrix;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetTransformValues',
function(anElement) {

    /**
     * @name elementGetTransformValues
     * @synopsis Returns the values of any CSS3 transforms of the given Element.
     * @description This code derived from: https://gist.github.com/2329465.
     * @param {Element} anElement The element to retrive the transform
     *     values from.
     * @raises TP.sig.InvalidElement
     * @returns {TP.lang.Hash} A hash of values, keyed by the following keys:
     *     TP.ROTATE, TP.SKEW, TP.SCALE, TP.TRANSLATE
     * @todo
     */

    var length,
        normalize,
        dot,
        atan2,
        combine,
    
        transformMatrix,
        a,
        b,
        c,
        d,
        tx,
        ty,
        
        translate,
        m,
        scale,
        skew,
        rotate;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    length = function(a){
        return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    };
     
    // normalizes the length of the passed point to 1
     
    normalize = function(a){
        var l = length(a);

        return l ? [a[0] / l, a[1] / l] : [0, 0];
    };
     
    // returns the dot product of the passed points
     
    dot = function(a, b){
        return a[0] * b[0] + a[1] * b[1];
    };
     
    // returns the principal value of the arc tangent of
    // y/x, using the signs of both arguments to determine
    // the quadrant of the return value
     
    atan2 = Math.atan2;
     
    combine = function(a, b, ascl, bscl){
        return [
            (ascl * a[0]) + (bscl * b[0]),
            (ascl * a[1]) + (bscl * b[1])
        ];
    };

    if (TP.notValid(transformMatrix =
                    TP.elementGetTransformMatrix(anElement, true))) {
        return TP.hc();
    }

    a = transformMatrix[0];
    b = transformMatrix[1];
    c = transformMatrix[2];
    d = transformMatrix[3];
    tx = transformMatrix[4];
    ty = transformMatrix[5];

    // Make sure the matrix is invertible
    if ((a * d - b * c) === 0) {
        return null;
    }
 
    // Take care of translation
    
    translate = [tx, ty];
 
    // Put the components into a 2x2 matrix
    m = [[a, b], [c, d]];
 
    // Compute X scale factor and normalize first row.
 
    scale = [length(m[0])];
    m[0] = normalize(m[0]);
 
    // Compute shear factor and make 2nd row orthogonal to 1st.
 
    skew = dot(m[0], m[1]);
    m[1] = combine(m[1], m[0], 1, -skew);
 
    // Now, compute Y scale and normalize 2nd row.
 
    scale[1] = length(m[1]);
    // m[1] = normalize(m[1]) //
    skew /= scale[1];
 
    // Now, get the rotation out
 
    rotate = atan2(m[0][1], m[0][0]);

    //  And convert to degrees
    rotate = rotate * (180 / Math.PI);

    return TP.hc(TP.ROTATE, rotate,
                    TP.SKEW, skew,
                    TP.SCALE, scale,
                    TP.TRANSLATE, translate);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSelectContent',
function(anElement, includeElement) {

    /**
     * @name elementSelectContent
     * @synopsis Selects the content of the supplied Element. If the Element is
     *     an 'input element' of some sort (i.e. an 'input' or 'textarea'
     *     element), this method selects its text content.
     * @param {HTMLElement} anElement The element to select the content of.
     * @param {Boolean} includeElement Whether or not the element itself should
     *     be included in the selection. Note that this setting has no meaning
     *     if the element is a sort of 'input element'. The default is false.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    var elementName,

        theSelection,

        theRange;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  Grab the element name
    elementName = TP.elementGetLocalName(anElement).toLowerCase();

    //  If it's one of the 'input type' elements (i.e. 'input' or
    //  'textarea'), then we can use a special call and exit here.
    if ((elementName === 'input' && anElement.type === 'text') ||
        (elementName === 'textarea')) {
        anElement.setSelectionRange(0, anElement.value.length);

        return;
    }

    //  Grab the selection object and make sure its real
    theSelection = TP.nodeGetWindow(anElement).getSelection();
    if (TP.notValid(theSelection)) {
        return;
    }

    //  If we're supposed to include the element, then we need to create a
    //  Range object, use it to select the element, clear any existing
    //  ranges, and add the new Range to the selection.
    if (TP.isTrue(includeElement)) {
        theRange = TP.nodeGetDocument(anElement).createRange();
        if (TP.isValid(theRange)) {
            theRange.selectNode(anElement);
            theSelection.removeAllRanges();
            theSelection.addRange(theRange);
        }
    } else {
        //  Otherwise, we're only selecting children of the element, so
        //  W3C-compliant browsers provide a nice convenience method for us.
        theSelection.selectAllChildren(anElement);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetClass',
function(anElement, aClassName) {

    /**
     * @name elementSetClass
     * @synopsis Sets the element's CSS class name(s) to the supplied CSS class
     *     name(s). Note that if the class name is null, the 'class' attribute
     *     will be removed from the element.
     * @param {Element} anElement The element to set the CSS class name for.
     * @param {String} aClassName Class name(s) to use as the CSS class names
     *     for the element.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.notValid(aClassName)) {
        TP.elementRemoveAttribute(anElement, 'class');
    } else {
        //  NB: We use native 'setAttribute' call here, or we'll recurse
        //  into TP.$elementSetAttribute()
        anElement.setAttribute('class', aClassName);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetOpacity',
function(anElement, opacityLevel) {

    /**
     * @name elementSetOpacity
     * @synopsis Sets the element's opacity level. The level should be a
     *     fractional number between 0 and 1 that will represent the percentage
     *     of opacity the element should be set to (e.g. it should be '.5' to
     *     set the element to 50% opacity).
     * @param {HTMLElement} anElement The element to set the opacity of.
     * @param {Number|String} opacityLevel The fractional number to set the
     *     opacity to or the empty String ('') to clear the element's opacity
     *     value.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    TP.elementGetStyleObj(anElement).opacity = opacityLevel;

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$elementTransformBoundingClientRect',
function(anElement, transformationMatrix) {

    /**
     * @name $elementTransformBoundingClientRect
     * @synopsis Transforms the bounding client rect of the supplied element
     *     using the supplied transformation matrix
     * @description This code derived from:
     *     https://gist.github.com/Yaffle/1145197
     * @param {Element} anElement The element to compute the bounding client
     *     rect for.
     * @param {Array} transformationMatrix An Array of Arrays representing the
     *     transformation matrix.
     * @raises TP.sig.InvalidElement
     * @returns {Object} An Object with left, top, right and bottom properties
     *     representing the bounding client rect.
     * @todo
     */

    var points;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    points = TP.multiplyMatrix(
                transformationMatrix,
                [
                    [0, anElement.offsetWidth, 0, anElement.offsetWidth],
                    [0, 0, anElement.offsetHeight, 0, anElement.offsetHeight],
                    [0, 0, 0, 0],
                    [1, 1, 1, 1]
                ]
    );

    return {
                left:   Math.min.apply(Math, points[0]),
                top:    Math.min.apply(Math, points[1]),
                right:  Math.max.apply(Math, points[0]),
                bottom: Math.max.apply(Math, points[1])
            };
});

//  ------------------------------------------------------------------------

TP.definePrimitive('textElementInsertContent',
function(anElement, aContent) {

    /**
     * @name textElementInsertContent
     * @synopsis Inserts the supplied content at the element's insertion point.
     * @description Note that this method focuses the text element in question.
     *     It also ensures that the supplied element is a 'textarea' or an
     *     'input' with 'type="text"' and will raise an TP.sig.InvalidElement
     *     exception if its not.
     * @param {Element} anElement The 'input type="text"' or 'textarea' element
     *     to insert content into.
     * @param {String} aContent The content to insert.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidString
     * @todo
     */

    var elementName,

        start,
        end;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elementName = TP.elementGetLocalName(anElement).toLowerCase();
    if ((elementName !== 'textarea') &&
        (elementName !== 'input' || anElement.type !== 'text')) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!TP.isString(aContent)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    try {
        anElement.focus();

        if (TP.isNumber(anElement.selectionStart)) {
            start = anElement.selectionStart;
            end = anElement.selectionEnd;

            anElement.value = anElement.value.substr(0, start) +
                                    aContent +
                                    anElement.value.substr(end);

            anElement.selectionStart = start + aContent.length;
            anElement.selectionEnd = start + aContent.length;
        } else {
            anElement.value += aContent;
        }
    } catch (e) {
        return TP.raise(this, 'TP.sig.DOMComponentException', arguments,
                        TP.ec(e));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('textElementReplaceSelection',
function(anElement, aContent) {

    /**
     * @name textElementReplaceSelection
     * @synopsis Replaces the element's current selection (could be empty) with
     *     the supplied content.
     * @description Note that this method focuses the text element in question.
     *     It also ensures that the supplied element is a 'textarea' or an
     *     'input' with 'type="text"' and will raise an TP.sig.InvalidElement
     *     exception if its not.
     * @param {Element} anElement The 'input type="text"' or 'textarea' element
     *     to replace the selection of.
     * @param {String} aContent The content to use as the replacement.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidString
     * @todo
     */

    var elementName,

        selStart,
        selEnd;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elementName = TP.elementGetLocalName(anElement).toLowerCase();
    if ((elementName !== 'textarea') &&
        (elementName !== 'input' || anElement.type !== 'text')) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!TP.isString(aContent)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    try {
        selStart = anElement.selectionStart;
        selEnd = anElement.selectionEnd;

        anElement.value = TP.join(anElement.value.substring(0, selStart),
                                    aContent,
                                    anElement.value.substring(selEnd));

        anElement.setSelectionRange(selStart + aContent.length,
                                    selStart + aContent.length);

    } catch (e) {
        return TP.raise(this, 'TP.sig.DOMComponentException', arguments,
                        TP.ec(e));
    }

    return;
});

//  ------------------------------------------------------------------------
//  NODE PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetWindow',
function(aNode) {

    /**
     * @name nodeGetWindow
     * @synopsis Returns the node's window.
     * @param {Node} aNode The node to use.
     * @raises TP.sig.InvalidNode
     * @returns {Window} 
     */

    var doc;

    //  Note that we don't check for an HTML document here, even though that
    //  might seem logical. A lot of times an XML document will be passed in
    //  and the caller is depending on this method returning null.

    if (aNode === null) {
        return;
    }

    if (aNode.nodeType === Node.DOCUMENT_NODE) {
        return aNode.defaultView;
    }

    if (TP.isDocument(doc = aNode.ownerDocument)) {
        return doc.defaultView;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeHasWindow',
function(aNode) {

    /**
     * @name nodeHasWindow
     * @synopsis Returns true if the node provided appears to be in a document
     *     that is situated within a Window.
     * @param {Node} aNode The DOM node to operate on.
     * @returns {Boolean} True if the node is in a document that is in a window.
     * @raise TP.sig.InvalidNode Raised when an object that isn't a Node is
     *     provided to the method.
     * @todo
     */

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
    }

    return TP.isWindow(TP.nodeGetWindow(aNode));
});

//  ------------------------------------------------------------------------
//  WINDOW PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('windowArmEvents',
function(aWindow, eventNameArray, aHandler) {

    /**
     * @name windowArmEvents
     * @synopsis Arms all elements in the window's document to fire the events
     *     named in eventNameArray.
     * @param {Array} eventNameArray The array of event names to instrument all
     *     elements in the document to fire.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler to be used instead of the default handler.
     * @raises TP.sig.InvalidWindow,TP.sig.InvalidArray
     * @todo
     */

    var i,
        len,
        eventName,
        nativeEventName,
        handler;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (TP.isEmpty(eventNameArray)) {
        return TP.raise(this, 'TP.sig.InvalidArray', arguments);
    }

    handler = TP.ifInvalid(aHandler, TP.$dispatchEventToTIBET);

    //  Put the handler on the document and register it to be a
    //  bubbling handler (by supplying 'false' as the third
    //  parameter) so that it always gets the event last.
    len = eventNameArray.getSize();
    for (i = 0; i < len; i++) {
        eventName = eventNameArray.at(i);
        nativeEventName = TP.eventNameNativeValue(eventName);

        aWindow.document.addEventListener(nativeEventName,
                                            handler,
                                            false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowConstructObject',
function(aWindow, objectName) {

    /**
     * @name windowConstructObject
     * @synopsis Constructs an object in another Window, using that the named
     *     object as the constructor *in the target Window* to construct the
     *     object. Note that this function also passes along any additional
     *     arguments to this function to the constructor.
     * @param {Window} aWindow The window to construct the object in.
     * @param {String} objectName The 'type name' of the object to construct.
     * @raises TP.sig.InvalidWindow
     * @returns {Object} 
     * @todo
     */

    var constructorObj,
        $$newinst;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    constructorObj = aWindow[objectName];

    if (TP.notValid(constructorObj)) {
        return null;
    }

    //  we start by using the built-in constructor for any arguments so
    //  behavior is consistent with native JS, and then we try parsing on
    //  our own
    switch (arguments.length) {
        case    2:
            $$newinst = new constructorObj();
            break;
        case    3:
            $$newinst = new constructorObj(arguments[2]);
            break;
        case    4:
            $$newinst = new constructorObj(arguments[2], arguments[3]);
            break;
        case    5:
            $$newinst = new constructorObj(arguments[2], arguments[3],
                                            arguments[4]);
            break;
        case    6:
            $$newinst = new constructorObj(arguments[2], arguments[3],
                                            arguments[4], arguments[5]);
            break;
        case    7:
            $$newinst = new constructorObj(arguments[2], arguments[3],
                                            arguments[4], arguments[5],
                                            arguments[6]);
            break;
        case    8:
            $$newinst = new constructorObj(arguments[2], arguments[3],
                                            arguments[4], arguments[5],
                                            arguments[6], arguments[7]);
            break;
        case    9:
            $$newinst = new constructorObj(arguments[2], arguments[3],
                                            arguments[4], arguments[5],
                                            arguments[6], arguments[7],
                                            arguments[8]);
            break;
        default:
            eval('$$newinst = new constructorObj(' +
                TP.sys.$buildArgString(2, arguments.length) + ');');
            break;
    }

    return $$newinst;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowDisarmEvents',
function(aWindow, eventNameArray, aHandler) {

    /**
     * @name windowDisarmEvents
     * @synopsis Disarms all elements in the window's document for the events
     *     named in eventNameArray.
     * @param {Window} aWindow The window whose element(s) should be disarmed.
     * @param {Array} eventNameArray The array of event names to disarm.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler that was used instead of the default handler for TIBET.
     * @raises TP.sig.InvalidWindow,TP.sig.InvalidArray
     * @todo
     */

    var i,
        len,
        eventName,
        nativeEventName,
        handler;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (TP.isEmpty(eventNameArray)) {
        return TP.raise(this, 'TP.sig.InvalidArray', arguments);
    }

    handler = TP.ifInvalid(aHandler, TP.$dispatchEventToTIBET);

    len = eventNameArray.getSize();
    for (i = 0; i < len; i++) {
        eventName = eventNameArray.at(i);
        nativeEventName = TP.eventNameNativeValue(eventName);

        aWindow.document.removeEventListener(nativeEventName,
                                                    handler,
                                                    false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowGetInnerHeight',
function(aWindow) {

    /**
     * @name windowGetInnerHeight
     * @synopsis Returns the window's inner height (the height not including
     *     scrollbars, button bars, etc.).
     * @param {Window} aWindow The window to get the inner height of.
     * @raises TP.sig.InvalidWindow
     * @returns {Number} The window's inner height.
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    return aWindow.innerHeight;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowGetInnerWidth',
function(aWindow) {

    /**
     * @name windowGetInnerWidth
     * @synopsis Returns the window's inner width (the width not including
     *     scrollbars, button bars, etc.).
     * @param {Window} aWindow The window to get the inner width of.
     * @raises TP.sig.InvalidWindow
     * @returns {Number} The window's inner width.
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    return aWindow.innerWidth;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowGetOuterHeight',
function(aWindow) {

    /**
     * @name windowGetOuterHeight
     * @synopsis Returns the window's outer height (the height including
     *     scrollbars, button bars, etc.).
     * @param {Window} aWindow The window to get the outer height of.
     * @raises TP.sig.InvalidWindow
     * @returns {Number} The window's outer height.
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    return aWindow.outerHeight;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowGetOuterWidth',
function(aWindow) {

    /**
     * @name windowGetOuterWidth
     * @synopsis Returns the window's outer width (the width including
     *     scrollbars, button bars, etc.).
     * @param {Window} aWindow The window to get the outer width of.
     * @raises TP.sig.InvalidWindow
     * @returns {Number} The window's outer width.
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    return aWindow.outerWidth;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowGetX',
function(aWindow) {

    /**
     * @name windowGetX
     * @synopsis Returns the window's X position on the overall screen.
     * @param {Window} aWindow The window to get the X position of.
     * @raises TP.sig.InvalidWindow
     * @returns {Number} The window's X position on the screen in pixels.
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    return aWindow.screenX;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowGetY',
function(aWindow) {

    /**
     * @name windowGetY
     * @synopsis Returns the window's Y position on the overall screen.
     * @param {Window} aWindow The window to get the Y position of.
     * @raises TP.sig.InvalidWindow
     * @returns {Number} The window's Y position on the screen in pixels.
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    return aWindow.screenY;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowInstallOnlineOfflineHook',
function(aWindow) {

    /**
     * @name windowInstallOnlineOfflineHook
     * @synopsis Installs event handlers for online / offline events which then
     *     rebroadcasts those events as 'AppOnline' / 'AppOffline' signals.
     * @param {Window} aWindow The window to install the online/offline event
     *     hooks onto.
     * @raises TP.sig.InvalidWindow,TP.sig.InvalidElement
     */

    var bodyElem;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (!TP.isElement(bodyElem = TP.documentGetBody(aWindow.document))) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    bodyElem.addEventListener(
                'online',
                function() {

                    TP.sys.isOffline(false);
                    TP.signal(null, 'TP.sig.AppOnline', arguments);
                },
                false);

    bodyElem.addEventListener(
                'offline',
                function() {

                    TP.sys.isOffline(true);
                    TP.signal(null, 'TP.sig.AppOffline', arguments);
                },
                false);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowInstallDocumentVisibilityHook',
function(aWindow) {

    /**
     * @name windowInstallDocumentVisibilityHook
     * @synopsis Installs event handlers for the 'visibility change' event
     *     which then rebroadcasts that event as 'DocumentVisible' /
     *     'DocumentInvisible' events.
     * @param {Window} aWindow The window to install the document visibility
     *     change event hooks onto.
     * @raises TP.sig.InvalidWindow,TP.sig.InvalidDocument
     */

    var doc,
        evtName;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (!TP.isDocument(doc = aWindow.document)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isDefined(doc.mozHidden)) {
        evtName = 'mozvisibilitychange';
    } else if (TP.isDefined(doc.webkitHidden)) {
        evtName = 'webkitvisibilitychange';
    } else if (TP.isDefined(doc.msHidden)) {
        evtName = 'msvisibilitychange';
    } else {
        evtName = 'visibilitychange';
    }

    doc.addEventListener(
                evtName,
                function() {

                    if (TP.documentIsVisible(doc)) {
                        TP.signal(null,
                            'TP.sig.DocumentVisible',
                            arguments,
                            TP.documentGetVisibility(doc));
                    } else {
                        TP.signal(null,
                            'TP.sig.DocumentInvisible',
                            arguments,
                            TP.documentGetVisibility(doc));
                    }
                },
                false);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
