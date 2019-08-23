//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
Common functionality related to DHTML operations.
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
     * @method objectGetXY
     * @summary Returns the 'global' (according to the supplied object) X and Y
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
     * @exception TP.sig.InvalidObject
     * @returns {Number[]} An ordered pair where the first item is the X
     *     coordinate and the second item is the Y coordinate.
     */

    var anX,
        anY;

    if (TP.notValid(anObject)) {
        return TP.raise(this, 'TP.sig.InvalidObject');
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

TP.definePrimitive('documentConstructScriptElement',
function(aDocument, aURL, aContent, aLoadedFunction) {

    /**
     * @method documentConstructScriptElement
     * @summary Creates an (X)HTML 'script' element in the document, using
     *     the URL provided and configures it to call the supplied loaded
     *     function when it completes loading.
     * @description In order for the script element produced by this routine
     *     to actually load its content, it needs to be appended to an
     *     (X)HTML document, preferable to the 'head'.
     * @param {Document} aDocument The document to create the 'script'
     *     element in.
     * @param {String} aURL The URL to load the script from.
     * @param {String} aContent The content to set as the text content of
     *     the script. This will only be used if there is no value for aURL.
     * @param {Function} aLoadedFunction The function to execute when the
     *     script has completed loading its content.
     * @exception TP.sig.InvalidDocument
     * @returns {HTMLElement} The script element created in the supplied
     *     document.
     */

    var newScriptElement,
        scriptContentNode;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    newScriptElement = TP.documentConstructElement(aDocument,
                                                    'script',
                                                    TP.w3.Xmlns.XHTML);

    //  NOTE!! This *must* be done by using the '.async' property. Setting the
    //  'async' attribute to 'false' here will actually cause the new script
    //  element to always be asynchronous, since the 'async' attribute is an
    //  'existence' attribute.
    newScriptElement.async = false;

    if (TP.notEmpty(aURL)) {
        newScriptElement.src = aURL;
    } else if (TP.notEmpty(aContent)) {
        scriptContentNode = aDocument.createTextNode(aContent);
        newScriptElement.appendChild(scriptContentNode);
    }

    if (TP.isCallable(aLoadedFunction)) {
        newScriptElement.onload = aLoadedFunction;
    }

    return newScriptElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentCopyTextToClipboard',
function(aDocument, aText) {

    /**
     * @method documentCopyTextToClipboard
     * @summary Copies the supplied text to the system clipboard.
     * @description This method should be invoked only as part of a
     *     user-generated event handler. Otherwise, most browsers will throw an
     *     exception due to security concerns.
     * @param {Document} aDocument The document to use to stage the text content
     *     to copy.
     * @param {String} aText The text to copy to the clipboard.
     * @exception TP.sig.InvalidDocument
     */

    var newSpanElement,

        range,
        selection,

        success;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  Create a new 'span' element in the document, position it way offscreen,
    //  set it's text content and append it to the document's documentElement.
    newSpanElement = TP.documentConstructElement(aDocument,
                                                'span',
                                                TP.w3.Xmlns.XHTML);

    TP.elementSetStyleString(
        newSpanElement,
        'position: absolute; top: -1000px; left: -1000px; ');

    TP.nodeSetTextContent(newSpanElement, aText);

    TP.nodeAppendChild(aDocument.documentElement, newSpanElement, false);

    //  Now, create a Range to use for selecting the text.
    range = aDocument.createRange();

    //  Select the span's content into the Range.
    range.selectNodeContents(newSpanElement);

    //  Grab the Window associated with the document and it's selection object.
    //  Then clear all of its ranges and add the new range.
    selection = TP.nodeGetWindow(aDocument).getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    //  Attempt to copy the selection to the clipboard.
    try {
        success = aDocument.execCommand('copy', false, null);
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Error copying text to clipboard')) : 0;
    }

    if (!success) {
        TP.ifWarn() ?
            TP.warn('Did not copy text to clipboard') : 0;
    }

    //  Make sure to remove our newly created span from its parent (the
    //  document's documentElement) before we exit.
    TP.nodeDetach(newSpanElement);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetHeight',
function(aDocument) {

    /**
     * @method documentGetHeight
     * @summary Returns the document's height.
     * @param {Document} aDocument The document to get the height of.
     * @exception TP.sig.InvalidDocument
     * @returns {Number} The document's height in pixels.
     */

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    return TP.documentGetBody(aDocument).offsetHeight;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetScrollX',
function(aDocument) {

    /**
     * @method documentGetScrollX
     * @summary Returns the document's X scrolling position with its window
     *     frame.
     * @param {Document} aDocument The document to get the X scroll position of.
     * @exception TP.sig.InvalidDocument
     * @returns {Number} The document's X scroll position in pixels.
     */

    var win;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    return TP.isWindow(win = TP.nodeGetWindow(aDocument)) ?
                    win.pageXOffset :
                    0;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetScrollY',
function(aDocument) {

    /**
     * @method documentGetScrollY
     * @summary Returns the document's Y scrolling position with its window
     *     frame.
     * @param {Document} aDocument The document to get the Y scroll position of.
     * @exception TP.sig.InvalidDocument
     * @returns {Number} The document's Y scroll position in pixels.
     */

    var win;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    return TP.isWindow(win = TP.nodeGetWindow(aDocument)) ?
                    win.pageYOffset :
                    0;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetViewableHeight',
function(aDocument) {

    /**
     * @method documentGetViewableHeight
     * @summary Returns the document's 'viewable' height (that is, the height
     *     that can currently be seen and has not scrolled offscreen).
     * @param {HTMLDocument} aDocument The document to compute the viewable
     *     height for.
     * @exception TP.sig.InvalidDocument
     * @returns {Number} The document's viewable height in pixels.
     */

    var win;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    win = TP.nodeGetWindow(aDocument);
    if (TP.isValid(win)) {
        return win.innerHeight;
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetViewableWidth',
function(aDocument) {

    /**
     * @method documentGetViewableWidth
     * @summary Returns the document's 'viewable' width (that is, the width
     *     that can currently be seen and has not scrolled offscreen).
     * @param {HTMLDocument} aDocument The document to compute the viewable
     *     width for.
     * @exception TP.sig.InvalidDocument
     * @returns {Number} The document's viewable width in pixels.
     */

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    return aDocument.documentElement.clientWidth;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetVisibility',
function(aDocument) {

    /**
     * @method documentGetVisibility
     * @summary Returns the supplied document's 'visibility state'. This
     *     leverages the HTML5 'document.visibilityState' property.
     * @param {Document} aDocument The document to obtain the visibility state
     *     of.
     * @exception TP.sig.InvalidDocument
     * @returns {String} The supplied document's visibility state. This will be
     *     one of: TP.VISIBLE, TP.HIDDEN or TP.PRERENDER.
     */

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    return aDocument.visibilityState;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetWidth',
function(aDocument) {

    /**
     * @method documentGetWidth
     * @summary Returns the document's width.
     * @param {Document} aDocument The document to get the width of.
     * @exception TP.sig.InvalidDocument
     * @returns {Number} The document's width in pixels.
     */

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    return TP.documentGetBody(aDocument).offsetWidth;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentIsVisible',
function(aDocument) {

    /**
     * @method documentIsVisible
     * @summary Returns whether or not the supplied document is visible to the
     *     user. This leverages the HTML5 'document.hidden' property.
     * @param {Document} aDocument The document to test to see if its visible.
     * @exception TP.sig.InvalidDocument
     * @returns {Boolean} Whether or not the supplied document's is currently
     *     visible.
     */

    var propName;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
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
     * @method documentClearSelection
     * @summary Clears any selection the user might have made in the supplied
     *     document.
     * @param {Document} aDocument The document to clear the selection in.
     * @exception TP.sig.InvalidDocument
     */

    var theSelection;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
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
     * @method documentCollapseSelection
     * @summary 'Collapse's any selection the user might have made in the
     *     supplied document to either the start or the end of itself.
     * @param {Document} aDocument The document to collapse the selection in.
     * @param {Boolean} toStart Whether or not to collapse the selection to the
     *     start of itself. This defaults to false (i.e. the selection will
     *     collapse to the end).
     * @exception TP.sig.InvalidDocument
     */

    var theSelection;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
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
        //  empty
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentConstructSelectionMarker',
function(aDocument) {

    /**
     * @method documentConstructSelectionMarker
     * @summary Returns an object that can be used in conjunction with
     *     TP.documentMoveSelectionToMarker() to move around in the document.
     * @param {Document} aDocument The document to create the selection marker
     *     in.
     * @exception TP.sig.InvalidDocument
     * @returns {Object} The object representing a selection marker.
     */

    var theSelection,
        theRange;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
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
     * @method documentInsertAfterSelection
     * @summary Appends the newContent after any current selection in the
     *     document. If there is no selection this method does nothing.
     * @param {Document} aDocument The document whose selection should be
     *     appended to.
     * @param {String} newContent A new string of content.
     * @exception TP.sig.InvalidDocument
     */

    var theSelection,
        theRange,

        theFragment;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
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
     * @method documentInsertBeforeSelection
     * @summary Inserts the newContent before any current selection in the
     *     document. If there is no selection this method does nothing.
     * @param {Document} aDocument The document whose selection should be
     *     inserted before.
     * @param {String} newContent A new string of content.
     * @exception TP.sig.InvalidDocument
     */

    var theSelection,
        theRange,

        theFragment;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
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
     * @method documentIsSelectionCollapsed
     * @summary Returns whether or not the supplied document's current
     *     selection is collapsed (whether or not its empty).
     * @param {Document} aDocument The document to test the current selection of
     *     to see if its collapsed.
     * @exception TP.sig.InvalidDocument
     * @returns {Boolean} Whether or not the supplied document's current
     *     selection is collapsed.
     */

    var theSelection;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    theSelection = TP.nodeGetWindow(aDocument).getSelection();

    if (TP.notValid(theSelection)) {
        return true;
    }

    //  If the selection is collapsed or its 'toString()' representation is
    //  empty, then its collapsed.
    /* eslint-disable no-extra-parens */
    return (theSelection.isCollapsed ||
            TP.isEmpty(theSelection.toString()));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetSelectionElement',
function(aDocument) {

    /**
     * @method documentGetSelectionElement
     * @summary Returns any single HTML element that is currently selected.
     *     Note that this method will only return real results if only a single
     *     element is selected. Otherwise it will return null.
     * @param {Document} aDocument The document to obtain the selected element
     *     for.
     * @exception TP.sig.InvalidDocument
     * @returns {HTMLElement} The single element that was selected in the
     *     supplied document.
     */

    var selectionType,

        theSelection,

        selectedElement;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
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
    selectedElement = theSelection.anchorNode.
                                        childNodes[theSelection.anchorOffset];

    if (TP.isElement(selectedElement)) {
        return selectedElement;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetSelectionParent',
function(aDocument) {

    /**
     * @method documentGetSelectionParent
     * @summary Returns the parent (element) of the supplied document's current
     *     selection.
     * @param {Document} aDocument The document to obtain the selection's parent
     *     node in.
     * @exception TP.sig.InvalidDocument
     * @returns {HTMLElement} The selection's parent node.
     */

    var selectionType,

        selElem,

        win,

        theSelection,

        selectionParentElement;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
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

    if (!TP.isWindow(win = TP.nodeGetWindow(aDocument))) {
        return null;
    }

    theSelection = win.getSelection();

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
     * @method documentGetSelectionText
     * @summary Returns any plain text (no markup) that is currently selected.
     *     Note that this method will only return real results if text is
     *     selected. Otherwise it will return null.
     * @param {Document} aDocument The document to obtain the selected text for.
     * @exception TP.sig.InvalidDocument
     * @returns {String} The text that was selected in the supplied document.
     */

    var selectionType,

        theSelection;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  Grab the current selection type. This returns
    //  TP.SELECTION_NONE if the selection is null.
    selectionType = TP.documentGetSelectionType(aDocument);

    //  If the selection type isn't a whole chunk of text, then bail out here by
    //  returning null. We want text.
    if (selectionType !== TP.SELECTION_TEXT) {
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
     * @method documentGetSelectionType
     * @summary Returns the current selection 'type'. This is one of the
     *     following constants:
     *
     *     TP.SELECTION_NONE - no selection TP.SELECTION_TEXT - text (or a
     *     combination of text and elements). TP.SELECTION_ELEMENT - a single,
     *     whole element
     *
     *
     * @param {Document} aDocument The document to obtain the selected type for.
     * @exception TP.sig.InvalidDocument
     * @returns {String} A constant, detailed above, that indicates which type
     *     the current selection is.
     */

    var win,

        theSelection,
        theRange;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    if (!TP.isWindow(win = TP.nodeGetWindow(aDocument))) {
        return TP.SELECTION_NONE;
    }

    theSelection = win.getSelection();

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

        /* eslint-disable no-extra-parens */
        if (theRange.startContainer === theRange.endContainer &&
            (theRange.endOffset - theRange.startOffset) === 1 &&
            !TP.isTextNode(theRange.startContainer)) {
            return TP.SELECTION_ELEMENT;
        }
        /* eslint-enable no-extra-parens */
    }

    //  Otherwise, its not null, not collapsed and not a Node.ELEMENT_NODE,
    //  so it must be text.
    return TP.SELECTION_TEXT;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentMoveSelectionToMarker',
function(aDocument, aSelectionMarker) {

    /**
     * @method documentMoveSelectionToMarker
     * @summary Moves the selection to the supplied marker object.
     * @param {Document} aDocument The document to move the selection of.
     * @param {Object} aSelectionMarker The object to use as the selection
     *     marker.
     * @exception TP.sig.InvalidDocument
     */

    var theSelection;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
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
     * @method documentRemoveSelection
     * @summary Deletes the supplied document's selection.
     * @param {Document} aDocument The document to delete the selection of.
     * @exception TP.sig.InvalidDocument
     */

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
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
     * @method documentReplaceSelection
     * @summary Replaces the supplied document's selection with newContent.
     * @param {Document} aDocument The document whose selection should be
     *     replaced.
     * @param {String} newContent The new content to use.
     * @exception TP.sig.InvalidDocument
     */

    var theSelection,
        theRange,

        theFragment;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
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

TP.definePrimitive('elementAddResizeListener',
function(anElement, aHandler, useTrackerElement) {

    /**
     * @method elementAddResizeListener
     * @summary Adds a 'resize listener' to the supplied element. This listener
     *     will be called back when the element resizes in the DOM.
     * @description Note that there are two techniques to monitor resizing used
     *     here, depending on the setting of the useTrackerElement parameter.
     *     If useTrackerElement is false (the default) then the W3C standard
     *     ResizeObserver will be used to monitor resizing.
     *     If useTrackerElement is true, then a 'tracking element' approach is
     *     taken. The technique embodied in this approach depends upon two
     *     things: 1. That the supplied Element is positioned in some
     *     fashion (and, in fact, the Element will be positioned 'relative' if
     *     it's position is 'static' when it is supplied) and 2. an absolutely
     *     positioned child element will be added to the supplied Element.
     *     NB: This code adapted from:
     *         http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
     * @param {HTMLElement} anElement The element to add a resize listener to.
     * @param {Function} aHandler The handler Function to invoke when the
     *     supplied Element is resized. Note that this Function will be invoked
     *     in the context of the supplied Element, such that the 'this'
     *     reference will be that Element.
     * @param {Boolean} [useTrackerElement=false] Whether or not to use a
     *     'tracker element' approach.
     * @exception TP.sig.InvalidElement,TP.sig.InvalidFunction
     */

    var trackerFunc,
        trackerElem;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (!TP.isCallable(aHandler)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    if (useTrackerElement) {

        //  Define a 'work Function' that will execute when the tracking element
        //  resizes.
        trackerFunc = function(evt) {

            var win;

            //  Grab the content window of the tracker. This will be the target
            //  of the event that triggered this hander.
            win = TP.eventGetTarget(evt);

            //  If we have a valid resizing requestAnimationFrame constant, then
            //  cancel it.
            if (TP.isValid(win.__resizeRAF__)) {
                win.cancelAnimationFrame(win.__resizeRAF__);
            }

            //  Set up a resizing requestAnimationFrame constant by supplying a
            //  Function that will use the resizing target (i.e. the Element
            //  that we're installing the resize listener for) and, iterate over
            //  its listeners, invoking the registered resize listener for each
            //  one.
            win.__resizeRAF__ =
                win.requestAnimationFrame(
                        function() {
                            var target;

                            target = win.__resizeTarget__;

                            if (TP.isElement(target)) {
                                target[TP.RESIZE_LISTENERS].forEach(
                                    function(fn) {
                                        fn.call(target);
                                    });
                            }
                        });
        };

        //  If the resize listener Array is empty, then set one up and set up a
        //  'resizing tracking element' that will be appended underneath the
        //  supplied Element.

        if (TP.isEmpty(anElement[TP.RESIZE_LISTENERS])) {

            anElement[TP.RESIZE_LISTENERS] = TP.ac();
            anElement[TP.RESIZE_LISTENERS].trackerFunc = trackerFunc;

            //  If the element isn't positioned, we need to make it at least
            //  'relative'. Then resizing will properly propagate to the tracker
            //  child that we'll be adding below.
            if (!TP.elementIsPositioned(anElement)) {
                TP.elementSetStyleProperty(anElement, 'position', 'relative');
            }

            //  Create a tracker Element (which will be an XHTML 'object'
            //  element) and style it to be 100%/100%, positioned absolute, but
            //  not accepting any pointer events.
            trackerElem = TP.documentConstructElement(
                                        TP.nodeGetDocument(anElement),
                                        'object',
                                        TP.w3.Xmlns.XHTML);
            TP.elementAddClass(trackerElem, 'resizetracker');

            //  Capture a reference to the tracker element on the Array itself.
            anElement[TP.RESIZE_LISTENERS].tracker = trackerElem;

            //  Mark this element as one that was generated by TIBET and
            //  shouldn't be considered in CSS queries, etc.
            trackerElem[TP.GENERATED] = true;

            //  Capture a reference to the target element back onto the tracker
            //  element.
            trackerElem.__resizeTarget__ = anElement;

            //  Set up an onload on the tracker element that will add an
            //  EventListener on it's 'contentWindow' that will call the
            //  tracking function above when the 'contentWindow' resizes.
            trackerElem.onload = function(evt) {

                var win,
                    doc;

                win = this.contentWindow;

                //  Fix for Safari/Webkit bug:
                //  https://bugs.webkit.org/show_bug.cgi?id=148876
                if (!TP.isWindow(win)) {

                    doc = this.contentDocument;
                    if (TP.isDocument(doc)) {
                        win = doc.defaultView;
                    }

                    if (!TP.isWindow(win)) {
                        return;
                    }
                }

                win.__resizeTarget__ = this.__resizeTarget__;
                win.addEventListener('resize', trackerFunc);
            };

            //  Set some necessary properties on the tracker element.
            trackerElem.type = 'text/html';
            trackerElem.data = 'about:blank';

            //  Append the tracker element to the target element.
            anElement.appendChild(trackerElem);
        }
    } else {

        //  Some old browsers still don't have native ResizeObserver support.
        if (TP.notValid(ResizeObserver)) {
            TP.ifWarn() ? TP.warn('Native ResizeObserver unavailable for: ' +
                        TP.name(anElement)) : 0;
            return;
        }

        //  If the global ResizeObserver that manages our resizing events hasn't
        //  been allocated and initialized with the callback function, do so now.
        if (TP.notValid(TP.RESIZING_RESIZE_OBSERVER)) {
            TP.RESIZING_RESIZE_OBSERVER =
                /* eslint-disable no-undef */
                new ResizeObserver(
                /* eslint-enable no-undef */
                    function(entries, observer) {

                        entries.forEach(
                            function(anEntry) {
                                var target,
                                    targetWin;

                                //  The target will be the target Element that
                                //  got resized. Make sure it's an Element and
                                //  then run the callback functions defined on
                                //  the Element.
                                target = anEntry.target;
                                targetWin = TP.nodeGetWindow(target);

                                if (TP.isElement(target)) {
                                    //  Note here how we put these into a
                                    //  requestAnimationFrame. Otherwise, Chrome
                                    //  (at least) has trouble with servicing
                                    //  the ResizeObserver loop (it seems that
                                    //  supposed recursion loop checks don't
                                    //  work - or not with deep stacks, anyway).
                                    targetWin.requestAnimationFrame(
                                        function() {
                                            var listeners;

                                            listeners =
                                                target[TP.RESIZE_LISTENERS];
                                            if (TP.notValid(listeners)) {
                                                TP.ifWarn() ?
                                                    TP.warn('Can\'t find' +
                                                            ' listeners for: ' +
                                                            TP.str(target)) : 0;
                                                return;
                                            }

                                            listeners.forEach(
                                            function(fn) {
                                                fn.call(target);
                                            });
                                        });
                                }
                            });
                    });
        }

        //  If the resize listener Array is empty, then set one up and cause the
        //  global ResizeObserver to observe it.
        if (TP.isEmpty(anElement[TP.RESIZE_LISTENERS])) {
            anElement[TP.RESIZE_LISTENERS] = TP.ac();
            TP.RESIZING_RESIZE_OBSERVER.observe(anElement);
        }
    }

    //  Push the handler onto the Array of element resize listeners.
    anElement[TP.RESIZE_LISTENERS].push(aHandler);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementContentIsScrolled',
function(anElement) {

    /**
     * @method elementContentIsScrolled
     * @summary Whether or not the element is scrolling its content.
     * @param {HTMLElement} anElement The element to check to see if its
     *     scrolling its content.
     * @exception TP.sig.InvalidElement
     * @returns {Boolean} Whether or not the element is scrolling its content.
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    /* eslint-disable no-extra-parens */
    return (anElement.scrollWidth > anElement.clientWidth ||
            anElement.scrollHeight > anElement.clientHeight);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetElementAtPoint',
function(anElement, x, y) {

    /**
     * @method elementGetElementAtPoint
     * @summary Returns the 'most nested' child element at the x and y
     *     coordinates given.
     * @description Note that the coordinates should be given in 'document'
     *     coordinates.
     * @param {HTMLElement} anElement The element to begin searching for the
     *     element at x and y.
     * @param {Number} x The X coordinate to use to look for the child element.
     * @param {Number} y The Y coordinate to use to look for the child element.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidNumber
     * @returns {Element} The 'most nested' child element found at x and y
     *     coordinates given.
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (!TP.isNumber(x) || !TP.isNumber(y)) {
        return TP.raise(this, 'TP.sig.InvalidNumber');
    }

    return TP.nodeGetDocument(anElement).elementFromPoint(x, y);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetIFrameDocument',
function(anElement) {

    /**
     * @method elementGetIFrameDocument
     * @summary Returns the document of the iframe element supplied. NB: The
     *     caller *must* supply an 'iframe' element here, or an
     *     'TP.sig.InvalidElement' exception will be thrown.
     * @param {Element} anElement The 'iframe' element to retrieve the document
     *     for.
     * @exception TP.sig.InvalidElement
     * @returns {Document} The document of the iframe supplied.
     */

    if (!TP.isElement(anElement) ||
        TP.elementGetLocalName(anElement).toLowerCase() !== 'iframe' &&
            TP.elementGetLocalName(anElement).toLowerCase() !== 'object') {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    return anElement.contentDocument;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetIFrameWindow',
function(anElement) {

    /**
     * @method elementGetIFrameWindow
     * @summary Returns the window of the iframe element supplied. If the
     *     iframe's content window doesn't have a name and the iframe element
     *     has an id, the content window's name will be set to that id. NB: The
     *     caller *must* supply an 'iframe' element here, or an
     *     'TP.sig.InvalidElement' exception will be thrown.
     * @param {Element} anElement The 'iframe' element to retrieve the window
     *     for.
     * @exception TP.sig.InvalidElement
     * @returns {Window} The window of the iframe supplied.
     */

    var iframeWindow;

    /* eslint-disable no-extra-parens */
    if (!TP.isElement(anElement) ||
        (TP.elementGetLocalName(anElement).toLowerCase() !== 'iframe' &&
            TP.elementGetLocalName(anElement).toLowerCase() !== 'object')) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }
    /* eslint-enable no-extra-parens */

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
     * @method elementGetOpacity
     * @summary Gets the element's opacity level. The level should be a
     *     fractional number between 0 and 1 that will represent the percentage
     *     of opacity the element is set to (e.g. it will be '.5' if the element
     *     is set to 50% opacity).
     * @param {HTMLElement} anElement The element to set the opacity of.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidStyleDeclaration
     * @returns {Number} The element's opacity level.
     */

    var computedStyle;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  Grab the computed style for the element
    if (TP.notValid(computedStyle = TP.elementGetComputedStyleObj(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidStyleDeclaration');
    }

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
     * @method elementGetOuterContent
     * @summary Gets the 'outer content' of anElement.
     * @description This method gets the 'outer content' of anElement which
     *     means that the entire element, including its start and end tags, will
     *     be returned.
     * @param {HTMLElement} anElement The element to get the 'outer content' of.
     * @exception TP.sig.InvalidElement
     * @returns {String} The 'outer content' of the Element.
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    return anElement.outerHTML;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetOwnContent',
function(anElement) {

    /**
     * @method elementGetOwnContent
     * @summary Gets the markup which represents only the element
     *     itself... effectively the outer content minus the inner content.
     * @param {HTMLElement} anElement The element to get the 'own content' of.
     * @exception TP.sig.InvalidElement
     * @returns {String} The 'owned content' of the Element.
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    return anElement.outerHTML.replace(anElement.innerHTML, '');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetComputedStyleValueInPixels',
function(anElement, styleProperty, wantsTransformed) {

    /**
     * @method elementGetComputedStyleValueInPixels
     * @summary Gets the computed style value of the property on the element in
     *     pixels. This routine can return NaN if a Number couldn't be computed.
     * @param {HTMLElement} anElement The element to get the numeric property
     *     value of.
     * @param {String} styleProperty The name of the style property to obtain
     *     the value of.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidStyleDeclaration
     * @returns {Number} The supplied property as a pixel value.
     */

    var computedStyle;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(styleProperty)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  Grab the computed style for the element
    if (TP.notValid(computedStyle = TP.elementGetComputedStyleObj(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidStyleDeclaration');
    }

    return TP.elementGetPixelValue(anElement,
                                    computedStyle[styleProperty],
                                    styleProperty,
                                    wantsTransformed);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetComputedStyleValuesInPixels',
function(anElement, styleProperties, wantsTransformed) {

    /**
     * @method elementGetComputedStyleValuesInPixels
     * @summary Gets the computed style values of the properties on the element
     *     in pixels. This routine can produce NaNs in the output if a Number
     *     couldn't be computed for that property.
     * @param {HTMLElement} anElement The element to get the numeric property
     *     value of.
     * @param {String[]} styleProperties The names of the style property to
     *     obtain the value of.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidStyleDeclaration
     * @returns {TP.core.Hash} A TP.core.Hash of Numbers containing the supplied
     *     properties as a pixel value.
     */

    var computedStyle,

        valuesInPixels,

        len,
        i;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(styleProperties)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  Grab the computed style for the element
    if (TP.notValid(computedStyle = TP.elementGetComputedStyleObj(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidStyleDeclaration');
    }

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
     * @method elementGetComputedTransformMatrix
     * @summary Returns the current transformation matrix of the supplied
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
     * @exception TP.sig.InvalidElement
     * @returns {Number[][]} An Array of Arrays representing the current
     *     transformation matrix.
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
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    identity = TP.matrixFromCSSString('matrix(1,0,0,1,0,0)');

    //  Start with the identity matrix
    matrix = identity;

    currentElement = anElement;

    doc = TP.nodeGetDocument(anElement);
    win = TP.nodeGetWindow(anElement);

    while (currentElement && currentElement !== doc.documentElement) {

        //  NB: Firefox has a non-CSSOM-spec compliant way of returning null for
        //  'getComputedStyle' when the element in question is 'display:none'
        //  (or one its parents is). Make sure to account for that.
        computedStyle = win.getComputedStyle(currentElement, null) || {};

        computedMatrixString =
            (computedStyle.OTransform ||
                computedStyle.WebkitTransform ||
                computedStyle.msTransform ||
                computedStyle.MozTransform ||
                computedStyle.transform ||
                'none').replace(/^none$/, 'matrix(1,0,0,1,0,0)');

        computedMatrix = TP.matrixFromCSSString(computedMatrixString);

        matrix = TP.matrixMultiply(matrix, computedMatrix);

        currentElement = currentElement.parentNode;
    }

    //  If the computation resulted in the identity matrix, then there was no
    //  transformation either on the target element or up the chain - just
    //  use the identity matrix here.
    if (TP.str(matrix) === TP.str(identity)) {
        matrix = identity;
    } else {
        matrix = TP.matrixTranslate(
                    matrix, -win.pageXOffset, -win.pageYOffset, 0);

        transformedRect =
                    TP.$elementTransformBoundingClientRect(anElement, matrix);

        rect = anElement.getBoundingClientRect(anElement);
        matrix = TP.matrixTranslate(
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
     * @method elementGetTransformValues
     * @summary Returns the values of any CSS3 transforms of the given Element.
     * @description This code derived from: https://gist.github.com/2329465.
     * @param {Element} anElement The element to retrive the transform
     *     values from.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.Hash} A hash of values, keyed by the following keys:
     *     TP.ROTATE, TP.SKEW, TP.SCALE, TP.TRANSLATE
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
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    length = function(val) {
        return Math.sqrt(val[0] * val[0] + val[1] * val[1]);
    };

    //  normalizes the length of the passed point to 1

    normalize = function(val) {
        var l;

        l = length(val);

        return l ? [val[0] / l, val[1] / l] : [0, 0];
    };

    //  returns the dot product of the passed points

    dot = function(left, right) {
        return left[0] * right[0] + left[1] * right[1];
    };

    //  returns the principal value of the arc tangent of
    //  y/x, using the signs of both arguments to determine
    //  the quadrant of the return value

    atan2 = Math.atan2;

    /* eslint-disable no-extra-parens */

    combine = function(val1, val2, ascl, bscl) {
        return [
            (ascl * val1[0]) + (bscl * val2[0]),
            (ascl * val1[1]) + (bscl * val2[1])
        ];
    };

    if (TP.notValid(transformMatrix =
                    TP.elementGetTransformMatrix(anElement, true))) {
        return TP.hc(
                TP.ROTATE, 0.0,
                TP.SKEW, 0.0,
                TP.SCALE, TP.ac(1.0, 1.0),
                TP.TRANSLATE, TP.ac(0.0, 0.0));
    }

    a = transformMatrix[0][0];
    b = transformMatrix[1][0];
    c = transformMatrix[0][1];
    d = transformMatrix[1][1];
    tx = transformMatrix[0][2];
    ty = transformMatrix[1][2];

    //  Make sure the matrix is invertible
    if ((a * d - b * c) === 0) {
        return null;
    }

    /* eslint-enable no-extra-parens */

    //  Take care of translation

    translate = [tx, ty];

    //  Put the components into a 2x2 matrix
    m = [[a, b], [c, d]];

    //  Compute X scale factor and normalize first row.

    scale = [length(m[0])];
    m[0] = normalize(m[0]);

    //  Compute shear factor and make 2nd row orthogonal to 1st.

    skew = dot(m[0], m[1]);
    m[1] = combine(m[1], m[0], 1, -skew);

    //  Now, compute Y scale and normalize 2nd row.

    scale[1] = length(m[1]);
    // m[1] = normalize(m[1]) //
    skew /= scale[1];

    //  Now, get the rotation out

    rotate = atan2(m[0][1], m[0][0]);

    //  And convert to degrees
    rotate = rotate * (180 / Math.PI);

    return TP.hc(TP.ROTATE, rotate,
                    TP.SKEW, skew,
                    TP.SCALE, scale,
                    TP.TRANSLATE, translate);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementIsPositioned',
function(anElement) {

    /**
     * @method elementIsPositioned
     * @summary Returns whether or not the supplied element is considered to be
            'positioned' (in the CSS sense).
     * @param {HTMLElement} anElement The element to check to see if it has been
     *     positioned.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidStyleDeclaration
     * @returns {Boolean} Whether or not the element has been positioned.
     */

    var computedStyle,
        positionVal;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  Grab the computed style for the element
    if (TP.notValid(computedStyle =
                    TP.elementGetComputedStyleObj(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidStyleDeclaration');
    }

    positionVal = computedStyle.position;

    if (positionVal === 'absolute' ||
        positionVal === 'relative' ||
        positionVal === 'fixed') {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementIsTransformed',
function(anElement) {

    /**
     * @method elementIsTransformed
     * @summary Returns whether or not the supplied element has been
     *     transformed with a CSS transformation.
     * @description This method takes into account any CSS transformations that
     *     are applying to the element because a parent of the element has had a
     *     CSS transformation applied to it.
     * @param {HTMLElement} anElement The element to check to see if it has been
     *     transformed.
     * @exception TP.sig.InvalidElement
     * @returns {Boolean} Whether or not the element has been transformed using
     *     CSS transforms.
     */

    var doc,
        win,

        currentElement,

        computedStyle,

        val;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    doc = TP.nodeGetDocument(anElement);
    win = TP.nodeGetWindow(anElement);

    currentElement = anElement;

    //  Got to walk the parent tree - we might be transformed because of a
    //  tranformation applied to a parent.
    while (currentElement && currentElement !== doc.documentElement) {

        computedStyle = win.getComputedStyle(currentElement, null);

        //  NB: Firefox has a non-CSSOM-spec compliant way of returning null for
        //  'getComputedStyle' when the element in question is 'display:none'
        //  (or one its parents is). Make sure to account for that.
        if (TP.notValid(computedStyle)) {
            break;
        }

        if (TP.notEmpty((val = computedStyle.OTransform) ||
                            (val = computedStyle.WebkitTransform) ||
                            (val = computedStyle.msTransform) ||
                            (val = computedStyle.MozTransform) ||
                            (val = computedStyle.transform))) {
            if (TP.notEmpty(val) && val !== 'none') {
                return true;
            }
        }

        currentElement = currentElement.parentNode;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementRemoveResizeListener',
function(anElement, aHandler) {

    /**
     * @method elementRemoveResizeListener
     * @summary Removes a 'resize listener' from the supplied element. This
     *     listener would have been registered using
     *     TP.elementAddResizeListener. See that method for more explanation on
     *     how resizing is monitored.
     * @param {HTMLElement} anElement The element to remove a resize listener
     *     from.
     * @param {Function} aHandler The handler Function that was registered when
     *     this listener was added.
     * @exception TP.sig.InvalidElement,TP.sig.InvalidFunction
     */

    var listeners,

        trackerElem,
        trackerFunc;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (!TP.isCallable(aHandler)) {
        return TP.raise(this, 'TP.sig.InvalidFunction');
    }

    //  Grab the Array of resize listeners from the target Element.
    listeners = anElement[TP.RESIZE_LISTENERS];
    if (TP.isEmpty(listeners)) {
        TP.ifWarn() ?
            TP.warn('Can\'t find listeners for: ' + TP.str(anElement)) : 0;

        return;
    }

    //  Splice out the handler from the list of listeners
    listeners.splice(listeners.indexOf(aHandler), 1);

    //  If it's a set of listeners that's using a 'tracker element', then we
    //  need to remove that, if the listeners are empty etc.
    if (TP.isElement(listeners.tracker)) {

        if (TP.isEmpty(listeners)) {
            //  Grab the tracker element and function from where they were
            //  placed by the TP.elementAddResizeListener method - directly on
            //  the listener Array.
            trackerElem = listeners.tracker;
            trackerFunc = listeners.trackerFunc;

            //  Remove the tracker function as a tracker element's
            //  contentWindow's resize listener and remove the tracker element
            //  from the target element. Note that sometimes, in a detachment
            //  scenario, the tracker element's contentWindow will already be
            //  gone. So we test for that here before accessing it.
            if (TP.isWindow(trackerElem.contentWindow)) {
                trackerElem.contentWindow.removeEventListener(
                                                'resize', trackerFunc);
            }
            anElement.removeChild(trackerElem);

            //  Null out all references for GC purposes and return

            listeners.trackerFunc = null;
            listeners.tracker = null;

            anElement[TP.RESIZE_LISTENERS] = null;
        }

    } else {
        //  If we're using ResizeObserver and the listener list is now empty,
        //  remove the element from the global ResizeObserver machinery.
        if (TP.isEmpty(listeners)) {
            TP.RESIZING_RESIZE_OBSERVER.unobserve(anElement);
            anElement[TP.RESIZE_LISTENERS] = null;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSelectContent',
function(anElement, includeElement) {

    /**
     * @method elementSelectContent
     * @summary Selects the content of the supplied Element. If the Element is
     *     an 'input element' of some sort (i.e. an 'input' or 'textarea'
     *     element), this method selects its text content.
     * @param {HTMLElement} anElement The element to select the content of.
     * @param {Boolean} includeElement Whether or not the element itself should
     *     be included in the selection. Note that this setting has no meaning
     *     if the element is a sort of 'input element'. The default is false.
     * @exception TP.sig.InvalidElement
     */

    var elementName,

        theSelection,

        theRange;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    //  Grab the element name
    elementName = TP.elementGetLocalName(anElement).toLowerCase();

    /* eslint-disable no-extra-parens */

    //  If it's one of the 'input type' elements (i.e. 'input' or
    //  'textarea'), then we can use a special call and exit here.
    if ((elementName === 'input' && anElement.type === 'text') ||
        elementName === 'textarea') {
        anElement.setSelectionRange(0, anElement.value.length);

        return;
    }

    /* eslint-enable no-extra-parens */

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
     * @method elementSetClass
     * @summary Sets the element's CSS class name(s) to the supplied CSS class
     *     name(s). Note that if the class name is null, the 'class' attribute
     *     will be removed from the element.
     * @param {Element} anElement The element to set the CSS class name for.
     * @param {String} aClassName Class name(s) to use as the CSS class names
     *     for the element.
     * @exception TP.sig.InvalidElement
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.notValid(aClassName)) {
        TP.elementRemoveAttribute(anElement, 'class');
    } else {
        //  NB: We use native 'setAttribute' call here, or we'll recurse
        //  into TP.elementSetAttribute()
        anElement.setAttribute('class', aClassName);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetOpacity',
function(anElement, opacityLevel) {

    /**
     * @method elementSetOpacity
     * @summary Sets the element's opacity level. The level should be a
     *     fractional number between 0 and 1 that will represent the percentage
     *     of opacity the element should be set to (e.g. it should be '.5' to
     *     set the element to 50% opacity).
     * @param {HTMLElement} anElement The element to set the opacity of.
     * @param {Number|String} opacityLevel The fractional number to set the
     *     opacity to or the empty String ('') to clear the element's opacity
     *     value.
     * @exception TP.sig.InvalidElement
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    TP.elementGetStyleObj(anElement).opacity = opacityLevel;

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$elementTransformBoundingClientRect',
function(anElement, transformationMatrix) {

    /**
     * @method $elementTransformBoundingClientRect
     * @summary Transforms the bounding client rect of the supplied element
     *     using the supplied transformation matrix
     * @description This code derived from:
     *     https://gist.github.com/Yaffle/1145197
     * @param {Element} anElement The element to compute the bounding client
     *     rect for.
     * @param {Number[][]} transformationMatrix An Array of Arrays representing
     *     the transformation matrix.
     * @exception TP.sig.InvalidElement
     * @returns {Object} An Object with left, top, right and bottom properties
     *     representing the bounding client rect.
     */

    var points;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    points = TP.matrixMultiply(
        TP.matrixAs3DMatrix(transformationMatrix),
        [
            [0, anElement.offsetWidth, 0, anElement.offsetWidth],
            [0, 0, anElement.offsetHeight, 0, anElement.offsetHeight],
            [0, 0, 0, 0],
            [1, 1, 1, 1]
        ]
    );

    return {
        left: Math.min.apply(Math, points[0]),
        top: Math.min.apply(Math, points[1]),
        right: Math.max.apply(Math, points[0]),
        bottom: Math.max.apply(Math, points[1])
    };
});

//  ------------------------------------------------------------------------

TP.definePrimitive('textElementInsertContent',
function(anElement, aContent) {

    /**
     * @method textElementInsertContent
     * @summary Inserts the supplied content at the element's insertion point.
     * @description Note that this method focuses the text element in question.
     *     It also ensures that the supplied element is a 'textarea' or an
     *     'input' with 'type="text"' and will raise an TP.sig.InvalidElement
     *     exception if its not.
     * @param {Element} anElement The 'input type="text"' or 'textarea' element
     *     to insert content into.
     * @param {String} aContent The content to insert.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidString
     */

    var elementName,
        start,
        end;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    elementName = TP.elementGetLocalName(anElement).toLowerCase();
    if (elementName !== 'textarea' &&
        (elementName !== 'input' || anElement.type !== 'text')) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (!TP.isString(aContent)) {
        return TP.raise(this, 'TP.sig.InvalidString');
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
        return TP.raise(this, 'TP.sig.DOMComponentException',
                        TP.ec(e));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('textElementReplaceSelection',
function(anElement, aContent) {

    /**
     * @method textElementReplaceSelection
     * @summary Replaces the element's current selection (could be empty) with
     *     the supplied content.
     * @description Note that this method focuses the text element in question.
     *     It also ensures that the supplied element is a 'textarea' or an
     *     'input' with 'type="text"' and will raise an TP.sig.InvalidElement
     *     exception if its not.
     * @param {Element} anElement The 'input type="text"' or 'textarea' element
     *     to replace the selection of.
     * @param {String} aContent The content to use as the replacement.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidString
     */

    var elementName,

        selStart,
        selEnd;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    elementName = TP.elementGetLocalName(anElement).toLowerCase();
    if (elementName !== 'textarea' &&
        (elementName !== 'input' || anElement.type !== 'text')) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (!TP.isString(aContent)) {
        return TP.raise(this, 'TP.sig.InvalidString');
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
        return TP.raise(this, 'TP.sig.DOMComponentException',
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
     * @method nodeGetWindow
     * @summary Returns the node's window.
     * @param {Node} aNode The node to use.
     * @exception TP.sig.InvalidNode
     * @returns {Window}
     */

    //  Note that we don't check for an HTML document here, even though that
    //  might seem logical. A lot of times an XML document will be passed in
    //  and the caller is depending on this method returning null.

    if (aNode === null) {
        return;
    }

    if (aNode.nodeType === Node.DOCUMENT_NODE) {
        return aNode.defaultView;
    } else if (aNode.ownerDocument !== undefined) {
        return aNode.ownerDocument.defaultView;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeHasWindow',
function(aNode) {

    /**
     * @method nodeHasWindow
     * @summary Returns true if the node provided appears to be in a document
     *     that is situated within a Window.
     * @param {Node} aNode The DOM node to operate on.
     * @returns {Boolean} True if the node is in a document that is in a window.
     * @exception TP.sig.InvalidNode Raised when an object that isn't a Node is
     *     provided to the method.
     */

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    return TP.isWindow(TP.nodeGetWindow(aNode));
});

//  ------------------------------------------------------------------------
//  WINDOW PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('windowArmEvents',
function(aWindow, eventNameArray, aHandler) {

    /**
     * @method windowArmEvents
     * @summary Arms all elements in the window's document to fire the events
     *     named in eventNameArray.
     * @param {Window} aWindow The window to arm events for.
     * @param {String[]} eventNameArray The array of event names to instrument
     *     all elements in the document to fire.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler to be used instead of the default handler.
     * @exception TP.sig.InvalidWindow
     * @exception TP.sig.InvalidArray
     */

    var i,
        len,
        eventName,
        nativeEventName,
        handler;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    if (TP.isEmpty(eventNameArray)) {
        return TP.raise(this, 'TP.sig.InvalidArray');
    }

    handler = TP.ifInvalid(aHandler, TP.$dispatchEventToTIBET);

    //  Put the handler on the document and register it to be a
    //  bubbling handler (by supplying 'false' as the third
    //  parameter) so that it always gets the event last.
    len = eventNameArray.getSize();
    for (i = 0; i < len; i++) {
        eventName = eventNameArray.at(i);
        nativeEventName = TP.$getEventNameForSignalName(eventName);

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
     * @method windowConstructObject
     * @summary Constructs an object in another Window, using that the named
     *     object as the constructor *in the target Window* to construct the
     *     object. Note that this function also passes along any additional
     *     arguments to this function to the constructor.
     * @param {Window} aWindow The window to construct the object in.
     * @param {String} objectName The 'type name' of the object to construct.
     * @exception TP.sig.InvalidWindow
     * @returns {Object}
     */

    var constructorObj,
        $$newinst;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    constructorObj = aWindow[objectName];

    if (TP.notValid(constructorObj)) {
        return null;
    }

    //  we start by using the built-in constructor for any arguments so
    //  behavior is consistent with native JS, and then we try parsing on
    //  our own
    /* eslint-disable new-cap */
    switch (arguments.length) {
        case 2:
            $$newinst = new constructorObj();
            break;
        case 3:
            $$newinst = new constructorObj(arguments[2]);
            break;
        case 4:
            $$newinst = new constructorObj(arguments[2], arguments[3]);
            break;
        case 5:
            $$newinst = new constructorObj(arguments[2], arguments[3],
                                            arguments[4]);
            break;
        case 6:
            $$newinst = new constructorObj(arguments[2], arguments[3],
                                            arguments[4], arguments[5]);
            break;
        case 7:
            $$newinst = new constructorObj(arguments[2], arguments[3],
                                            arguments[4], arguments[5],
                                            arguments[6]);
            break;
        case 8:
            $$newinst = new constructorObj(arguments[2], arguments[3],
                                            arguments[4], arguments[5],
                                            arguments[6], arguments[7]);
            break;
        case 9:
            $$newinst = new constructorObj(arguments[2], arguments[3],
                                            arguments[4], arguments[5],
                                            arguments[6], arguments[7],
                                            arguments[8]);
            break;
        default:
            //  TODO: reevaluate when this would be used.
            /* eslint-disable no-eval */
            eval('$$newinst = new constructorObj(' +
                TP.sys.$buildArgString(2, arguments.length) + ');');
            /* eslint-enable no-eval */
            break;
    }
    /* eslint-enable new-cap */

    return $$newinst;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowDisarmEvents',
function(aWindow, eventNameArray, aHandler) {

    /**
     * @method windowDisarmEvents
     * @summary Disarms all elements in the window's document for the events
     *     named in eventNameArray.
     * @param {Window} aWindow The window whose element(s) should be disarmed.
     * @param {String[]} eventNameArray The array of event names to disarm.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler that was used instead of the default handler for TIBET.
     * @exception TP.sig.InvalidWindow
     * @exception TP.sig.InvalidArray
     */

    var i,
        len,
        eventName,
        nativeEventName,
        handler;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    if (TP.isEmpty(eventNameArray)) {
        return TP.raise(this, 'TP.sig.InvalidArray');
    }

    handler = TP.ifInvalid(aHandler, TP.$dispatchEventToTIBET);

    len = eventNameArray.getSize();
    for (i = 0; i < len; i++) {
        eventName = eventNameArray.at(i);
        nativeEventName = TP.$getEventNameForSignalName(eventName);

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
     * @method windowGetInnerHeight
     * @summary Returns the window's inner height (the height not including
     *     scrollbars, button bars, etc.).
     * @param {Window} aWindow The window to get the inner height of.
     * @exception TP.sig.InvalidWindow
     * @returns {Number} The window's inner height.
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    return aWindow.innerHeight;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowGetInnerWidth',
function(aWindow) {

    /**
     * @method windowGetInnerWidth
     * @summary Returns the window's inner width (the width not including
     *     scrollbars, button bars, etc.).
     * @param {Window} aWindow The window to get the inner width of.
     * @exception TP.sig.InvalidWindow
     * @returns {Number} The window's inner width.
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    return aWindow.innerWidth;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowGetOuterHeight',
function(aWindow) {

    /**
     * @method windowGetOuterHeight
     * @summary Returns the window's outer height (the height including
     *     scrollbars, button bars, etc.).
     * @param {Window} aWindow The window to get the outer height of.
     * @exception TP.sig.InvalidWindow
     * @returns {Number} The window's outer height.
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    return aWindow.outerHeight;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowGetOuterWidth',
function(aWindow) {

    /**
     * @method windowGetOuterWidth
     * @summary Returns the window's outer width (the width including
     *     scrollbars, button bars, etc.).
     * @param {Window} aWindow The window to get the outer width of.
     * @exception TP.sig.InvalidWindow
     * @returns {Number} The window's outer width.
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    return aWindow.outerWidth;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowGetX',
function(aWindow) {

    /**
     * @method windowGetX
     * @summary Returns the window's X position on the overall screen.
     * @param {Window} aWindow The window to get the X position of.
     * @exception TP.sig.InvalidWindow
     * @returns {Number} The window's X position on the screen in pixels.
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    return aWindow.screenX;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowGetY',
function(aWindow) {

    /**
     * @method windowGetY
     * @summary Returns the window's Y position on the overall screen.
     * @param {Window} aWindow The window to get the Y position of.
     * @exception TP.sig.InvalidWindow
     * @returns {Number} The window's Y position on the screen in pixels.
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    return aWindow.screenY;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowInstallOnlineOfflineHook',
function(aWindow) {

    /**
     * @method windowInstallOnlineOfflineHook
     * @summary Installs event handlers for online / offline events which then
     *     rebroadcasts those events as 'AppOnline' / 'AppOffline' signals.
     * @param {Window} aWindow The window to install the online/offline event
     *     hooks onto.
     * @exception TP.sig.InvalidWindow
     * @exception TP.sig.InvalidElement
     */

    var bodyElem;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    if (!TP.isElement(bodyElem = TP.documentGetBody(aWindow.document))) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    bodyElem.addEventListener(
                'online',
                function() {

                    TP.sys.isOffline(false);
                    TP.signal(null, 'TP.sig.AppOnline');
                },
                false);

    bodyElem.addEventListener(
                'offline',
                function() {

                    TP.sys.isOffline(true);
                    TP.signal(null, 'TP.sig.AppOffline');
                },
                false);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowInstallDocumentVisibilityHook',
function(aWindow) {

    /**
     * @method windowInstallDocumentVisibilityHook
     * @summary Installs event handlers for the 'visibility change' event
     *     which then rebroadcasts that event as 'DocumentVisible' /
     *     'DocumentInvisible' events.
     * @param {Window} aWindow The window to install the document visibility
     *     change event hooks onto.
     * @exception TP.sig.InvalidWindow
     * @exception TP.sig.InvalidDocument
     */

    var doc;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    if (!TP.isDocument(doc = aWindow.document)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    doc.addEventListener(
                'visibilitychange',
                function() {

                    if (TP.documentIsVisible(doc)) {
                        TP.signal(null,
                            'TP.sig.DocumentVisible',
                            TP.documentGetVisibility(doc));
                    } else {
                        TP.signal(null,
                            'TP.sig.DocumentInvisible',
                            TP.documentGetVisibility(doc));
                    }
                },
                false);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
