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
 * @type {TP.core.UIElementNode}
 * @summary TP.core.UIElementNode is the common supertype for all UI node
 *     types. In particular, this includes the entire html: tree and most of
 *     the xctrls: namespace, which constitute the majority of UI nodes in
 *     TIBET.
 */

/* JSHint checking */

/* global $focus_stack:true
*/

//  ========================================================================
//  TP.core.UIElementNode
//  ========================================================================

TP.core.ElementNode.defineSubtype('UIElementNode');

//  need a node of a specific subtype, almost always a node in a specific
//  namespace such as html:
TP.core.UIElementNode.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The URI pointings to the XML document holding the key bindings
TP.core.UIElementNode.Type.defineAttribute('keyBindingsURI');

//  The XML document holding the key bindings
TP.core.UIElementNode.Type.defineAttribute('keyBindingsMap');

//  The TP.core.UIElementNode that focus is moving to.
TP.core.UIElementNode.Type.defineAttribute('$focusingTPElement');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('addStylesheetTo',
function(aDocument) {

    /**
     * @method addStylesheetTo
     * @summary Adds the element node's stylesheet to the supplied document. If
     *     the stylesheet is already present, this method will *not* add another
     *     instance.
     * @param {The} aDocument document to add the stylesheet to.
     * @exception TP.sig.InvalidDocument Raised when an invalid Document is
     *     provided to the method.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var ourID,
        themeName,
        sheetID,
        resource,
        styleElem,
        styleURI,
        existingStyleElems;

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  We compute an 'id' by taking our *resource* type name and escaping
    //  it. The resource type name is usually the type name, but can be
    //  overridden for special types that need to supply a different name
    //  here for use in resource location computations.
    ourID = TP.escapeTypeName(this.getResourceTypeName());

    //  Add any theme name we might be using. The presumption is that a theme
    //  sheet that isn't standalone will @import what it requires.

    //  Note that we try to see if the document already has a theme, which will
    //  override any application-level them.
    if (TP.isEmpty(themeName = TP.documentGetTheme(aDocument))) {
        themeName = TP.sys.getApplication().getTheme();
    }

    if (TP.notEmpty(themeName)) {
        sheetID = ourID + '_' + themeName;
        resource = 'style_' + themeName;
    } else {
        sheetID = ourID;
        resource = 'style';
    }

    //  First, see if another occurrence of this UI element node (and which
    //  uses this same stylesheet) has already been processed and has placed
    //  that stylesheet in the document. We don't want the same stylesheet
    //  placed into the document over and over for each occurrence of the
    //  same type of element node.
    if (TP.isElement(TP.byId(sheetID, aDocument))) {
        return this;
    }

    //  Couldn't find that CSS style sheet, so we ask ourself to compute a
    //  'resource URI' for the sheet using the CSS mime type. NOTE that the
    //  computation here will automatically adjust for theme.
    styleURI = this.getResourceURI(resource, TP.ietf.Mime.CSS);
    if (TP.notValid(styleURI)) {
        return this;
    }

    existingStyleElems = TP.nodeGetElementsByTagName(
        TP.documentGetHead(aDocument), 'style');

    //  Add the stylesheet URI's location as an XHTML link element. Make
    //  sure also to set the style element's 'id' attribute, so that the
    //  above logic will work for future occurrences of this element being
    //  processed.
    styleElem = TP.documentAddLinkElement(aDocument,
        styleURI.getLocation(), existingStyleElems.first());

    TP.elementSetAttribute(styleElem, 'id', sheetID);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('getCompilationAttrs',
function(aRequest) {

    /**
     * @method getCompilationAttrs
     * @summary Returns a TP.lang.Hash of any attributes to be added to what is
     *     produced by this type when it is compiled. The default is to compute
     *     an XHTML class name from this type's typename and supply it under the
     *     'class' key.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {TP.lang.Hash} A hash of attributes to be added to the compiled
     *     output from this type.
     */

    var elem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return TP.hc();
    }

    return TP.hc('class', TP.qname(elem).replace(':', '-') + ' ' +
                            TP.elementGetAttribute(elem, 'class'),
                    'tibet:phase', 'Compile');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('getKeyBindingsMap',
function() {

    /**
     * @method getKeyBindingsMap
     * @summary Returns this type's 'key bindings' map or it's supertype's
     *     if this type does not have a map.
     * @description This method returns a map that maps keynames (as
     *     computed by the standard TIBET keyname computation) to signal names.
     *     If a matching signal name is found in the map, that signal is fired
     *     with the currently focused element as the target.
     * @returns {XMLDocument|null} The key bindings map or null.
     */

    var bindingsXML;

    //  If we found the map, we're good to go.
    if (TP.isXMLDocument(bindingsXML = this.$get('keyBindingsMap'))) {
        return bindingsXML;
    }

    //  For speed purposes, the 'loadKeyBindings' routine will have placed a
    //  value of TP.NOT_FOUND into the key bindings XML the first time it tried
    //  to load the map and couldn't find it.
    if (bindingsXML !== TP.NOT_FOUND) {

        //  Try to load the bindings and, if we got a map, we're good to go.

        this.loadKeyBindings();

        if (TP.isXMLDocument(bindingsXML = this.$get('keyBindingsMap'))) {
            return bindingsXML;
        }
    }

    //  If we couldn't find a map in any case, call up to our supertype. This
    //  allows keymaps to be shared down the inheritance chain.
    if (this !== TP.core.UIElementNode) {
        return this.getSupertype().getKeyBindingsMap();
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('onblur',
function(aTargetElem, anEvent) {

    /**
     * @method onblur
     * @summary Handles a 'blur' native event that was dispatched against the
     *     supplied native element.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var evtTargetTPElem;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  Grab the event target element and wrap it
    evtTargetTPElem = TP.wrap(aTargetElem);

    //  Try to make the event target element not be the focused element.
    //  Note that this does *not* blur this element - the normal browser
    //  machinery will do that if we don't prevent the default behavior
    //  here.
    evtTargetTPElem.signal('TP.sig.UIBlur');

    //  It doesn't matter if the system cancelled the TIBET signal here - the
    //  low-level blur signals are not cancelable anyway... although, against
    //  the spec, Firefox tries. We don't support that here for consistency
    //  across browsers.

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('onfocus',
function(aTargetElem, anEvent) {

    /**
     * @method onfocus
     * @summary Handles a 'focus' native event that was dispatched against the
     *     supplied native element.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var evtTargetTPElem;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  Grab the event target element and wrap it
    evtTargetTPElem = TP.wrap(aTargetElem);

    //  Try to make the event target element become the focused element.
    //  Note that this does *not* focus this element - the normal browser
    //  machinery will do that if we don't prevent the default behavior
    //  here.
    evtTargetTPElem.signal('TP.sig.UIFocus');

    //  It doesn't matter if the system cancelled the TIBET signal here - the
    //  low-level focus signals are not cancelable anyway... although, against
    //  the spec, Firefox tries. We don't support that here for consistency
    //  across browsers.

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('onkeydown',
function(aTargetElem, anEvent) {

    /**
     * @method onkeydown
     * @summary Handles a 'keydown' native event that was dispatched against
     *     the supplied native element.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var evtTargetTPElem,

        keyname,

        activateSignal,

        bindingsType,
        bindingsMap,
        bindingEntry,

        sigName;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  Grab the event target element and wrap it
    evtTargetTPElem = TP.wrap(aTargetElem);

    //  If the event target element can handle the key indicated by the
    //  event
    if (evtTargetTPElem.canHandleKey(anEvent)) {
        //  Grab the TIBET 'key name' from the event.
        keyname = TP.domkeysigname(anEvent);

        if (keyname === 'DOM_Enter_Down') {
            //  Try to activate the event target element
            activateSignal = evtTargetTPElem.signal('TP.sig.UIActivate');

            if (activateSignal.shouldPrevent()) {
                //  Since the activation signal was cancelled, we cancel the
                //  native event
                anEvent.preventDefault();
            }

            return this;
        } else if (/DOM(.*)_Tab_Down/.test(keyname)) {
            //  We're going to handle this key down to move the focus ourselves,
            //  so we don't want the browser's natural 'tabbing' code to do
            //  anything. To prevent this, we preventDefault() on the event.
            anEvent.preventDefault();
        }

        sigName = null;

        //  Look in the external keybindings map. If there's an entry there,
        //  then we get the signal name from there.

        //  We compute the 'bindings' type (where we might find key bindings)
        //  from the target TP.core.Element.
        if (TP.isType(bindingsType = evtTargetTPElem.getType())) {

            //  Grab the bindings type bindings map and try to see if there is
            //  an entry for the particular keyname
            bindingsMap = bindingsType.getKeyBindingsMap();

            if (TP.isXMLDocument(bindingsMap)) {
                bindingEntry = bindingsMap.querySelector(
                                        '*[id="' + keyname + '"]');

                //  If there's an entry for this key binding, then try to get
                //  the signal name it has.
                if (TP.isElement(bindingEntry)) {

                    sigName = TP.elementGetAttribute(bindingEntry, 'signal');

                    //  If the signal name is a real TIBET type, then go ahead
                    //  and signal using the name, using the target
                    //  TP.core.Element as the 'target' of this signal.
                    if (TP.isType(TP.sys.require(sigName))) {
                        evtTargetTPElem.signal(sigName);
                    } else {
                        //  Otherwise, it should just be sent as a keyboard
                        //  event. We found a map entry for it, but there was no
                        //  real type.
                        evtTargetTPElem.signal(sigName,
                                                null,
                                                TP.DOM_FIRING,
                                                'TP.sig.' + keyname);
                    }
                }
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('onkeyup',
function(aTargetElem, anEvent) {

    /**
     * @method onkeyup
     * @summary Handles a 'keyup' native event that was dispatched against the
     *     supplied native element.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var evtTargetTPElem,

        keyname,

        deactivateSignal;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  Grab the event target element and wrap it
    evtTargetTPElem = TP.wrap(aTargetElem);

    //  If the event target element can handle the key indicated by the
    //  event
    if (evtTargetTPElem.canHandleKey(anEvent)) {
        //  Grab the TIBET 'key name' from the event.
        keyname = TP.domkeysigname(anEvent);

        if (keyname === 'DOM_Enter_Up') {
            //  Try to deactivate the event target element
            deactivateSignal =
                    evtTargetTPElem.signal('TP.sig.UIDeactivate');

            if (deactivateSignal.shouldPrevent()) {
                //  Since the activation signal was cancelled, we cancel the
                //  native event
                anEvent.preventDefault();
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('onmousedown',
function(aTargetElem, anEvent) {

    /**
     * @method onmousedown
     * @summary Handles a 'mousedown' native event that was dispatched against
     *     the supplied native element.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var evtTargetTPElem,

        activateSignal;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  Grab the event target element and wrap it
    evtTargetTPElem = TP.wrap(aTargetElem);

    //  Try to activate the event target element
    activateSignal = evtTargetTPElem.signal('TP.sig.UIActivate');
    if (activateSignal.shouldPrevent()) {
        //  Since the activation signal was cancelled, we cancel the native
        //  event
        anEvent.preventDefault();
    }

    //  If the target can be focused, do what the 'moveFocus' instance method
    //  does after it computes a 'successor element to focus' - in this case,
    //  that successor element is the element that is our target.
    if (evtTargetTPElem.canFocus()) {
        this.set('$focusingTPElement', evtTargetTPElem);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('onmouseup',
function(aTargetElem, anEvent) {

    /**
     * @method onmouseup
     * @summary Handles a 'mouseup' native event that was dispatched against
     *     the supplied native element.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var evtTargetTPElem,

        deactivateSignal;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  Grab the event target element and wrap it
    evtTargetTPElem = TP.wrap(aTargetElem);

    //  Try to deactivate the event target element
    deactivateSignal = evtTargetTPElem.signal('TP.sig.UIDeactivate');
    if (deactivateSignal.shouldPrevent()) {
        //  Since the deactivation signal was cancelled, we cancel the
        //  native event
        anEvent.preventDefault();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('mutationAddedNodes',
function(aTargetElem, nodesAdded) {

    /**
     * @method mutationAddedNodes
     * @summary Handles a 'nodes added' synthetic 'event' that was dispatched
     *     against the supplied native element.
     * @description This method is usually activated as the result of a 'DOM
     *     Mutation' of this node whereby a descendant is being added. Note that
     *     the 'nodesAdded' parameter here contains a list of *roots* that will
     *     have been added to the receiver. Any descendants of these roots will
     *     not be in this list.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Array} nodesAdded The nodes added to the receiver.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var processor,

        mutatedGIDs,

        len,
        i,

        node;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  Allocate a tag processor and initialize it with the ATTACH_PHASES
    processor = TP.core.TagProcessor.constructWithPhaseTypes(
                                    TP.core.TagProcessor.ATTACH_PHASES);

    mutatedGIDs = TP.ac();

    //  Now, process each *root* that we have gotten as an added node
    len = nodesAdded.getSize();
    for (i = 0; i < len; i++) {
        node = nodesAdded.at(i);

        //  It seems weird that the node might be detached since it was 'added',
        //  but the way that mutation observers work (they trigger this code) is
        //  that the node might have been added and then removed all before the
        //  'mutation records' are processed. We need to make sure the DOM node
        //  is still attached.
        if (TP.nodeIsDetached(node)) {
            continue;
        }

        //  If the node is an Element and it has an attribute of
        //  'tibet:noawaken', then skip processing it.
        if (TP.isElement(node) &&
            TP.elementHasAttribute(node, 'tibet:noawaken', true)) {
            continue;
        }

        //  If the node has an ancestor Element that has an attribute of
        //  'tibet:noawaken', then skip processing it.
        if (TP.isElement(TP.nodeGetFirstAncestorByAttribute(
                                        node, 'tibet:noawaken', null, true))) {
            continue;
        }

        processor.processTree(node);

        mutatedGIDs.push(TP.gid(node));
    }

    //  Signal from our document that attach processing is complete.
    TP.signal(TP.gid(TP.nodeGetDocument(aTargetElem)),
                'TP.sig.AttachProcessingComplete',
                TP.hc('mutatedNodeIDs', mutatedGIDs));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('mutationRemovedNodes',
function(aTargetElem, nodesRemoved) {

    /**
     * @method mutationRemovedNodes
     * @summary Handles a 'nodes removed' synthetic 'event' that was dispatched
     *     against the supplied native element.
     * @description This method is usually activated as the result of a 'DOM
     *     Mutation' of this node whereby a descendant is being removed. Note
     *     that the 'nodesRemoved' parameter here contains a list of *roots*
     *     that will have been removed from the receiver. Any descendants of
     *     these roots will not be in this list.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Array} nodesRemoved  The nodes removed from the receiver.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var processor,

        mutatedGIDs,

        focusStackCheckElems,

        len,
        i,

        shouldProcess,

        node;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  Allocate a tag processor and initialize it with the DETACH_PHASES
    processor = TP.core.TagProcessor.constructWithPhaseTypes(
                                    TP.core.TagProcessor.DETACH_PHASES);

    mutatedGIDs = TP.ac();

    focusStackCheckElems = TP.ac();

    //  Now, process each *root* that we have gotten as a removed node
    len = nodesRemoved.getSize();
    for (i = 0; i < len; i++) {

        node = nodesRemoved.at(i);

        //  If the node is already detached, then just move on here.
        if (TP.nodeIsDetached(node)) {
            continue;
        }

        //  Initially we're set to process this markup.
        shouldProcess = true;

        //  But if the node is an Element and it has an attribute of
        //  'tibet:noawaken', then skip processing it.
        if (TP.isElement(node) &&
            TP.elementHasAttribute(node, 'tibet:noawaken', true)) {
            shouldProcess = false;
        }

        //  And if the node has an ancestor Element that has an attribute of
        //  'tibet:noawaken', then skip processing it.
        if (TP.isElement(TP.nodeGetFirstAncestorByAttribute(
                                        node, 'tibet:noawaken', null, true))) {
            shouldProcess = false;
        }

        if (shouldProcess) {
            processor.processTree(node);
        }

        if (TP.isElement(node)) {
            focusStackCheckElems.push(node);

            focusStackCheckElems = focusStackCheckElems.concat(
                                TP.nodeGetDescendantElements(node, '*'));
        }

        mutatedGIDs.push(TP.gid(node));
    }

    //  Signal from our document that detach processing is complete.
    TP.signal(TP.gid(TP.nodeGetDocument(aTargetElem)),
                'TP.sig.DetachProcessingComplete',
                TP.hc('mutatedNodeIDs', mutatedGIDs));

    //  Filter any elements that are in the document of the nodes we are
    //  removing out of the $focus_stack.

    if (TP.notEmpty(focusStackCheckElems)) {
        $focus_stack = $focus_stack.reject(
                        function(aTPElem) {
                            if (focusStackCheckElems.contains(
                                    aTPElem.getNativeNode(),
                                    TP.IDENTITY)) {
                                return true;
                            }

                            return false;
                        });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('loadKeyBindings',
function() {

    /**
     * @method loadKeyBindings
     * @summary Loads the XML keyboard bindings for this type.
     * @exception TP.sig.InvalidKeymap When the XML key bindings file can't be
     *     loaded.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var url,
        xml;

    url = this.getResourceURI('keybindings', TP.ietf.Mime.XML);
    if (TP.notValid(url)) {
        // Mark the type slot so we don't try again. The load failed.
        this.set('keyBindingsMap', TP.NOT_FOUND);
        return this;
    }

    if (TP.notValid(xml = url.getNativeNode(TP.hc('async', false)))) {
        // Mark the type slot so we don't try again. The load failed.
        this.set('keyBindingsMap', TP.NOT_FOUND);

        return this.raise('TP.sig.InvalidKeymap');
    }

    this.set('keyBindingsURI', url);

    //  cache the XML for speed in other lookups
    this.set('keyBindingsMap', xml);

    return this;
});

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @description This method operates differently depending on a variety of
     *     factors:
     *          - If the current node has a 'tibet:ctrl', but not a
     *              'tibet:tag', and its operating in a native namespace,
     *              this method returns with no transformation occurring and no
     *              child content being processed.
     *          - If the request contains a command target document and that
     *              target document is not an HTML document, then this element
     *              remains untransformed but its children are processed.
     *          - Otherwise, the element is transformed into a 'div' or 'span',
     *              depending on the return value of the 'isBlockLevel' method.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The element that this tag has become.
     */

    var elem,
        ns,

        targetDoc,

        newElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    //  We may have gotten here because the tag processing system was able
    //  to obtain a 'concrete type' for this node using the 'tibet:ctrl'
    //  attribute (which is really just defining a controller type) not a
    //  'tibet:tag' attribute.

    //  Therefore, we want to check the namespace URI of the element and if
    //  its a 'native namespace' (i.e. this element is supported natively on
    //  the platform) and we don't have a 'tibet:tag' attribute we
    //  don't want to transform the tag, so we just exit here.
    if (TP.notEmpty(ns = elem.namespaceURI) &&
        TP.w3.Xmlns.isNative(ns) &&
        !TP.elementHasAttribute(elem, 'tibet:tag', true)) {
        return;
    }

    //  One last check is to see if we're not operating in an HTML document.
    //  We may be operating in an *XHTML* document, in which case we do
    //  *not* 'auto transform' into a 'div' or 'span', but just leave things
    //  alone.
    if (TP.isValid(targetDoc = aRequest.at('doc'))) {
        if (!TP.isHTMLDocument(targetDoc)) {
            return;
        }
    }

    //  Create a new XHTML element from elem, using either 'div' or 'span'
    //  depending on whether the element is block level or not and any
    //  'compilation attributes' defined by this type.
    newElem = TP.elementBecome(elem,
                                this.isBlockLevel() ? 'div' : 'span',
                                this.getCompilationAttrs(aRequest));

    return newElem;
});

//  ------------------------------------------------------------------------
//  TSH Execution Content
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @method cmdRunContent
     * @summary Runs the receiver, effectively invoking its action. This method
     *     is invoked any time a tag is being run as part of the processing of
     *     an enclosing tsh:script, which happens most often when the tag is
     *     being run interactively.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. TP.CONTINUE and TP.BREAK are common values.
     */

    var interactive,
        node,
        shell,
        str;

    interactive = TP.ifKeyInvalid(aRequest, 'cmdInteractive', false);
    if (interactive) {
        shell = aRequest.at('cmdShell');
        node = shell.updateCommandNode(aRequest);

        str = TP.wrap(node).asString();

        //  Have to output the action to get it into the DOM for
        //  awakening etc, otherwise it can't register/run/display.
        aRequest.stdout(str, TP.hc('cmdBox', false,
                                    'cmdAsIs', true,
                                    'cmdEcho', true));

        aRequest.set('result', str);
        aRequest.complete();

        return TP.CONTINUE;
    }

    return this.tshExecute(aRequest);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('act',
function(aSignal) {

    /**
     * @method act
     * @summary Runs the receiver as if it were an action tag. For UI tags this
     *     is a noop.
     * @param {TP.sig.Signal} aSignal The signal (typically a request) which
     *     triggered this activity.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('acceptFocusedResponder',
function() {

    /**
     * @method acceptFocusedResponder
     * @summary Asks the receiver to accept its role as 'focused responder'.
     * @returns {Boolean} Whether or not the receiver should accept focused
     *     responder status.
     */

    var focusTPElem;

    //  If the type is holding a real $focusingTPElement, then we want to
    //  reject accepting focused responder status because this means that the
    //  element that we *really* want to focus on (and which is now contained in
    //  this type's '$focusingTPElement' property) is a different element than
    //  the one we're processing focused responder status for. So we reject
    //  focused responder status here and then this property will be cleared
    //  and when the desired target element is focused, we will accept it.
    focusTPElem = this.getType().get('$focusingTPElement');

    if (TP.isKindOf(focusTPElem, TP.core.UIElementNode) &&
        !focusTPElem.identicalTo(this)) {

        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('becomeFocusedResponder',
function() {

    /**
     * @method becomeFocusedResponder
     * @summary Tells the receiver that it is now the 'focused responder'.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    //  Push ourself and signal 'TP.sig.UIDidPushFocus'
    $focus_stack.push(this);
    this.signal('TP.sig.UIDidPushFocus');

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('canFocus',
function() {

    /**
     * @method canFocus
     * @summary Whether or not the receiver can be focused. In TIBET, this
     *     means that it would have some sort of 'tabindex' attribute, since we
     *     require that for GUI elements that want focus.
     * @returns {Boolean} Whether or not the receiver can be focused.
     */

    return this.hasAttribute('tabindex');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('canHandleKey',
function(anEvent) {

    /**
     * @method canHandleKey
     * @summary Whether or not the receiver can be handle the key that
     *     generated the supplied event.
     * @param {Event} anEvent The native event containing the key information.
     * @returns {Boolean} Whether or not the receiver can handle the key.
     */

    var keyname,

        bindingsType,
        bindingsMap;

    keyname = TP.domkeysigname(anEvent);

    switch (keyname) {

        //  These are the standard keys used for activating.

        case 'DOM_Enter_Down':
        case 'DOM_Enter_Up':

            return true;

        default:
            //  Look in the external keybindings map. If there's an entry there,
            //  then we handle the key.

            //  We compute the 'bindings' type (where we might find key
            //  bindings) from the receiver.
            if (TP.isType(bindingsType = this.getType())) {

                //  Grab the bindings type bindings map and try to see if there
                //  is an entry for the particular keyname
                bindingsMap = bindingsType.getKeyBindingsMap();

                //  If there's an entry for this key binding, then we handle
                //  this key in some form.
                if (TP.isXMLDocument(bindingsMap)) {
                    return TP.isElement(
                        bindingsMap.querySelector('*[id="' + keyname + '"]'));
                }
            }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('computeSuccessorFocusElement',
function(focusedTPElem, moveAction) {

    /**
     * @method computeSuccessorFocusElement
     * @summary Computes the 'successor' focus element using the currently
     *     focused element (if there is one) and the move action.
     * @param {TP.core.ElementNode} focusedTPElem The currently focused element.
     *     This may be null if no element is currently focused.
     * @param {Constant} moveAction The type of 'move' that the user requested.
     *     This can be one of the following: TP.FIRST TP.LAST TP.NEXT
     *     TP.PREVIOUS TP.FIRST_IN_GROUP TP.LAST_IN_GROUP TP.FIRST_IN_NEXT_GROUP
     *     TP.FIRST_IN_PREVIOUS_GROUP TP.FOLLOWING TP.PRECEDING.
     * @returns {TP.core.ElementNode} The element that is the successor focus
     *     element.
     */

    var currentIsInGroup,

        win,

        wrappedBody,

        currentGroupName,
        currentGroup,

        unwrappedBody,
        focusedElem,

        theMoveAction,

        currentGroupWraps,

        usingParentGroup,

        computedGroup,

        results,

        nextGroupName,
        prevGroupName,

        resultElem,

        wantGroups;

    currentIsInGroup = false;

    win = this.getNativeWindow();

    //  If there is a current element, find the closest group to it - this
    //  dictates the 'context' of the search.
    if (TP.isValid(focusedTPElem)) {
        wrappedBody = focusedTPElem.getDocument().getBody();

        //  If the current element has a group, then we use it.
        if (TP.notEmpty(currentGroupName = focusedTPElem.getGroupName())) {
            currentGroup = TP.byOID(currentGroupName, win);
            currentIsInGroup = true;
        } else {
            //  Otherwise, the 'context' is the body element.
            currentGroup = wrappedBody;
        }
    } else {
        wrappedBody = this.getDocument().getBody();

        //  Otherwise, the 'context' is the body element.
        currentGroup = wrappedBody;
    }

    unwrappedBody = TP.unwrap(wrappedBody);
    focusedElem = TP.unwrap(focusedTPElem);

    theMoveAction = moveAction;

    //  Compute whether the current group 'wraps' or not. It will wrap if it
    //  has a 'wrapWhen' attribute and the value of that is not 'false'.
    currentGroupWraps =
            currentGroup.hasAttribute('wrapWhen') &&
            currentGroup.getAttribute('wrapWhen') !== 'false';

    //  If the current group doesn't wrap, then the move action turns from a
    //  TP.NEXT into a TP.FOLLOWING or from a TP.PREVIOUS into a
    //  TP.PRECEDING.
    if (!currentGroupWraps) {
        if (theMoveAction === TP.NEXT) {
            theMoveAction = TP.FOLLOWING;
        } else if (theMoveAction === TP.PREVIOUS) {
            theMoveAction = TP.PRECEDING;
        }
    }

    //  If we're moving between groups, then we need to query for them and
    //  set the computed group element appropriately.

    //  Initially, we're not using the parent group.
    usingParentGroup = false;

    switch (theMoveAction) {
        case TP.FIRST:
        case TP.LAST:
        case TP.NEXT:
        case TP.PREVIOUS:
        case TP.FIRST_IN_GROUP:
        case TP.LAST_IN_GROUP:

            //  No computed group needed for these actions
            break;

        case TP.FIRST_IN_NEXT_GROUP:

            //  If the currently focused element isn't in a group, the 'next
            //  group' is going to be the first group (or the wrapped body).
            if (!currentIsInGroup) {
                if (TP.notEmpty(results = wrappedBody.get(
                                'tibet:group'.asType().getQueryPath(false)))) {
                    //  There was no group found, so the 'next group' is
                    //  going to be the first group.
                    computedGroup = TP.wrap(results.first());
                } else {
                    //  Couldn't find any groups - use the body element.
                    computedGroup = wrappedBody;
                }
            } else {
                //  Grab the next group name from the current group (which
                //  may be nested, and we are interested in wrapping)
                nextGroupName =
                        this.getNextGroupName(currentGroupName, true, true);
                computedGroup = TP.byOID(nextGroupName, win);
            }

        break;

        case TP.FIRST_IN_PREVIOUS_GROUP:

            //  If the currently focused element isn't in a group, the 'previous
            //  group' is going to be the last group (or the wrapped body).
            if (!currentIsInGroup) {
                if (TP.notEmpty(results = wrappedBody.get(
                                'tibet:group'.asType().getQueryPath(false)))) {
                    //  There was no group found, so the 'next group' is
                    //  going to be the last group.
                    computedGroup = TP.wrap(results.last());
                } else {
                    //  Couldn't find any groups - use the body element.
                    computedGroup = wrappedBody;
                }
            } else {
                //  Grab the previous group name from the current group
                //  (which may be nested, and we are interested in wrapping)
                prevGroupName =
                        this.getPreviousGroupName(currentGroupName, true, true);
                computedGroup = TP.byOID(prevGroupName, win);
            }

        break;

        case TP.FOLLOWING:

            //  If the currently focused element isn't in a group, the 'next
            //  group' is going to be the first group (or the wrapped body).
            if (!currentIsInGroup) {
                if (TP.notEmpty(results = wrappedBody.get(
                                'tibet:group'.asType().getQueryPath(false)))) {
                    //  There was no group found, so the 'next group' is
                    //  going to be the first group.
                    computedGroup = TP.wrap(results.first());
                } else {
                    //  Couldn't find any groups - use the body element.
                    computedGroup = wrappedBody;
                }
            } else {
                //  Try to grab the next group name, which may be nested, but we
                //  are not interested in wrapping - we want to see if we need
                //  to check the body for focusable elements.
                nextGroupName =
                    this.getNextGroupName(currentGroupName, false, true);

                //  If we're not wrapping, then we need to make sure that the
                //  'next group' falls *after* this element - otherwise, we're
                //  not interested in it.
                if (TP.notEmpty(nextGroupName) &&
                    !currentGroupWraps &&
                    !TP.nodeComparePosition(this.getNativeNode(),
                                            TP.byId(nextGroupName),
                                            TP.FOLLOWING_NODE)) {
                    nextGroupName = null;
                }

                //  If there was no next group without wrapping and the current
                //  group doesn't have a parent group, then the computed group
                //  may be the body if it has focusable elements.
                if (TP.notValid(nextGroupName) &&
                    TP.notValid(this.getParentGroupName(currentGroupName))) {
                    //  Check to see if the body has focusable elements - if so,
                    //  then set the computedGroup to be the wrapped body.
                    if (TP.notEmpty(wrappedBody.findFocusableElements())) {
                        computedGroup = wrappedBody;
                    }
                }

                if (TP.notValid(computedGroup)) {
                    //  Grab the next group name from the current group (which
                    //  may be nested). This time we wrap.
                    nextGroupName =
                        this.getNextGroupName(currentGroupName, true, true);

                    //  If we couldn't compute a next group or if its the same
                    //  as the current group (in which case, it's a 'leaf' group
                    //  with no sibling groups), then see if we can use the
                    //  parent group.
                    if (TP.notValid(nextGroupName) ||
                        nextGroupName === currentGroupName) {
                        nextGroupName =
                                this.getParentGroupName(currentGroupName);
                    }

                    //  Set the usingParentGroup flag if we're using the parent
                    //  group, however that got computed.
                    if (nextGroupName === this.getParentGroupName(
                                                    currentGroupName)) {
                        usingParentGroup = true;
                    }

                    computedGroup = TP.byOID(nextGroupName, win);
                }
            }

        break;

        case TP.PRECEDING:

            //  If the currently focused element isn't in a group, the 'previous
            //  group' is going to be the last group (or the wrapped body).
            if (!currentIsInGroup) {
                if (TP.notEmpty(results = wrappedBody.get(
                                'tibet:group'.asType().getQueryPath(false)))) {
                    //  There was no group found, so the 'previous group' is
                    //  going to be the last group.
                    computedGroup = TP.wrap(results.last());
                } else {
                    //  Couldn't find any groups - use the body element.
                    computedGroup = wrappedBody;
                }
            } else {
                //  Try to grab the previous group name, which may be nested,
                //  but we are not interested in wrapping - we want to see if we
                //  need to check the body for focusable elements.
                prevGroupName =
                    this.getPreviousGroupName(currentGroupName, false, true);

                //  If we're not wrapping, then we need to make sure that the
                //  'previous group' falls *before* this element - otherwise,
                //  we're not interested in it.
                if (TP.notEmpty(prevGroupName) &&
                    !currentGroupWraps &&
                    !TP.nodeComparePosition(this.getNativeNode(),
                                            TP.byId(prevGroupName),
                                            TP.PRECEDING_NODE)) {
                    nextGroupName = null;
                }

                //  If there was no previous group without wrapping and the
                //  current group doesn't have a parent group, then the computed
                //  group may be the body if it has focusable elements.
                if (TP.notValid(prevGroupName) &&
                    TP.notValid(this.getParentGroupName(currentGroupName))) {
                    //  Check to see if the body has focusable elements - if so,
                    //  then set the computedGroup to be the wrapped body.
                    if (TP.notEmpty(wrappedBody.findFocusableElements())) {
                        computedGroup = wrappedBody;
                    }
                }

                if (TP.notValid(computedGroup)) {
                    //  Grab the previous group name from the current group
                    //  (which may be nested). This time we wrap.
                    prevGroupName =
                        this.getPreviousGroupName(currentGroupName, true, true);

                    //  If we couldn't compute a previous group or if its the
                    //  same as the current group (in which case, it's a 'leaf'
                    //  group with no sibling groups), then see if we can use
                    //  the parent group.
                    if (TP.notValid(prevGroupName) ||
                        prevGroupName === currentGroupName) {
                        prevGroupName =
                                this.getParentGroupName(currentGroupName);
                    }

                    //  Set the usingParentGroup flag if we're using the parent
                    //  group, however that got computed.
                    if (prevGroupName === this.getParentGroupName(
                                                    currentGroupName)) {
                        usingParentGroup = true;
                    }

                    computedGroup = TP.byOID(prevGroupName, win);
                }
            }

            break;

        default:

            return null;
    }

    resultElem = null;

    //  Based on the move action, grab the first, last, next or previous
    //  focusable element (using the current element for next and previous)
    switch (theMoveAction) {
        case TP.FIRST:

            //  We always use the body here - we don't care what the
            //  currentGroup is.

            if (TP.notEmpty(TP.byCSS('tibet|group', unwrappedBody))) {
                results = TP.byCSS(
                        'tibet|group:first > *[tabindex]:first', unwrappedBody);
                results = TP.wrap(results);
            } else {
                results = wrappedBody.findFocusableElements();
            }

            if (TP.isEmpty(results)) {
                return null;
            }

            resultElem = results.first();

            break;

        case TP.LAST:

            //  We always use the body here - we don't care what the
            //  currentGroup is.

            if (TP.notEmpty(TP.byCSS('tibet|group', unwrappedBody))) {
                results = TP.byCSS(
                        'tibet|group:last > *[tabindex]:last', unwrappedBody);
                results = TP.wrap(results);
            } else {
                results = wrappedBody.findFocusableElements();
            }

            if (TP.isEmpty(results)) {
                return null;
            }

            resultElem = results.last();

            break;

        case TP.NEXT:

            if (TP.isEmpty(results = currentGroup.findFocusableElements(true))) {
                //  The current group had no focusable elements.
                return null;
            }

            if (TP.notValid(focusedTPElem) ||
                TP.notValid(resultElem = results.after(
                                            focusedTPElem.getNativeNode(),
                                            TP.EQUALITY,
                                            true))) {

                //  NB: This assumes that we're wrapping - if we're not,
                //  then this operation got converted into a 'TP.FOLLOWING'
                //  above.

                resultElem = results.first();
            }

            break;

        case TP.PREVIOUS:

            if (TP.isEmpty(results = currentGroup.findFocusableElements(true))) {
                //  The current group had no focusable elements.
                return null;
            }

            if (TP.notValid(focusedTPElem) ||
                TP.notValid(resultElem = results.before(
                                            focusedTPElem.getNativeNode(),
                                            TP.EQUALITY,
                                            true))) {

                //  NB: This assumes that we're wrapping - if we're not,
                //  then this operation got converted into a 'TP.PRECEDING'
                //  above.

                resultElem = results.last();
            }

            break;

        case TP.FIRST_IN_GROUP:

            if (TP.isEmpty(results = currentGroup.findFocusableElements())) {
                //  The current group had no focusable elements.
                return null;
            }

            resultElem = results.first();

            break;

        case TP.LAST_IN_GROUP:

            if (TP.isEmpty(results = currentGroup.findFocusableElements())) {
                //  The current group had no focusable elements.
                return null;
            }

            resultElem = results.last();

            break;

        case TP.FIRST_IN_NEXT_GROUP:
        case TP.FIRST_IN_PREVIOUS_GROUP:

            if (!TP.isValid(computedGroup) ||
                TP.isEmpty(results = computedGroup.findFocusableElements())) {
                //  The computed group had no focusable elements.
                return null;
            }

            resultElem = results.first();

            break;

        case TP.FOLLOWING:

            if (TP.isEmpty(results =
                            currentGroup.findFocusableElements(true))) {
                //  The current group had no focusable elements.
                return null;
            }

            //  First, we check to see if the focused element is itself the
            //  body. If so, we just return the first result (which will have
            //  been properly sorted by tabindex by the 'findFocusableElements'
            //  call above)
            if (focusedElem === unwrappedBody) {

                //  The focused element was the body itself (which means that
                //  current group is as well), which means we should just use
                //  the first result element that got returned.
                resultElem = results.first();
            } else if (currentGroup.equalTo(wrappedBody) &&
                        !computedGroup.equalTo(wrappedBody)) {
                if (TP.notEmpty(
                        results = computedGroup.findFocusableElements())) {
                    resultElem = results.first();
                }
            } else {
                resultElem = results.after(focusedTPElem, TP.EQUALITY, true);

                //  We try to see if the current group has a focusable field
                //  following the current one.
                if (TP.notValid(focusedTPElem) || TP.notValid(resultElem)) {

                    //  If it doesn't, then we try to get the first focusable
                    //  field of the computed group (which will be the 'next
                    //  group' according to the group computation which occurred
                    //  above).

                    wantGroups = !computedGroup.equalTo(wrappedBody);

                    if (!TP.isValid(computedGroup) ||
                        TP.isEmpty(
                            results =
                            computedGroup.findFocusableElements(wantGroups))) {

                        //  The computed group had no focusable elements.
                        return null;
                    }

                    if (usingParentGroup) {
                        if (TP.notValid(resultElem = results.after(
                                            currentGroup,
                                            TP.EQUALITY,
                                            true))) {
                            resultElem = results.first();
                        }
                    } else {
                        resultElem = results.first();
                    }
                }
            }

            break;

        case TP.PRECEDING:

            if (TP.isEmpty(results =
                            currentGroup.findFocusableElements(true))) {
                //  The current group had no focusable elements.
                return null;
            }

            //  First, we check to see if the focused element is itself the
            //  body. If so, we just return the first result (which will have
            //  been properly sorted by tabindex by the 'findFocusableElements'
            //  call above)
            if (focusedElem === unwrappedBody) {

                //  The focused element was the body itself (which means that
                //  current group is as well), which means we should just use
                //  the last result element that got returned.
                resultElem = results.last();
            } else if (currentGroup.equalTo(wrappedBody) &&
                        !computedGroup.equalTo(wrappedBody)) {
                if (TP.notEmpty(
                        results = computedGroup.findFocusableElements())) {
                    resultElem = results.last();
                }
            } else {
                resultElem = results.before(focusedTPElem, TP.EQUALITY, true);

                //  We try to see if the current group has a focusable field
                //  preceding the current one.
                if (TP.notValid(focusedTPElem) || TP.notValid(resultElem)) {

                    //  If it doesn't, then we try to get the last focusable
                    //  field of the computed group (which will be the 'last
                    //  group' according to the group computation which occurred
                    //  above).

                    wantGroups = !computedGroup.equalTo(wrappedBody);

                    if (!TP.isValid(computedGroup) ||
                        TP.isEmpty(
                            results =
                            computedGroup.findFocusableElements(wantGroups))) {

                        //  The computed group had no focusable elements.
                        return null;
                    }

                    if (usingParentGroup) {
                        if (TP.notValid(resultElem = results.before(
                                            currentGroup,
                                            TP.EQUALITY,
                                            true))) {
                            resultElem = results.last();
                        }
                    } else {
                        resultElem = results.last();
                    }
                }
            }

            break;

        default:

            return null;
    }

    //  If there's a real result element, then return it. Otherwise return
    //  null.
    if (TP.isValid(resultElem)) {
        return resultElem;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('findFocusableElements',
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

    var selExpr,
        results;

    //  Query for any elements under the context element that have an
    //  attribute of 'tabindex'. This indicates elements that can be
    //  focused.

    //  Note here that the query only includes:
    //  -   elements that have a tabindex that are *direct* children of the
    //      receiver
    //  -   elements that have a tabindex that are descendants of any element
    //      under the receiver that is *not* a tibet:group element.
    //  This allows us to filter out elements with a tabindex but nested
    //  under another tibet:group that is in the receiver (we don't want
    //  these elements).
    selExpr = '> *[tabindex], *:not(tibet|group) *[tabindex]';

    //  If we should include 'tibet:group' elements, then include them in
    //  the CSS selector (but only shallowly - not under any other group).
    if (includesGroups) {
        selExpr += ', > tibet|group, *:not(tibet|group) tibet|group';
    }

    results = TP.byCSS(selExpr, this.getNativeNode());

    //  Iterate over them and see if they're displayed (not hidden by CSS -
    //  although they could currently not be visible to the user).
    results = results.select(
                    function(anElem) {

                        return TP.elementIsDisplayed(anElem);
                    });

    //  Sort the Array of elements by their 'tabindex' according to the
    //  HTML5 tabindex rules.
    results.sort(TP.TABINDEX_ORDER_SORT);

    //  Wrap the results to make TP.core.ElementNodes
    return TP.wrap(results);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getComputedStyleProperty',
function(aProperty) {

    /**
     * @method getComputedStyleProperty
     * @summary Returns the receiver's *computed* style property named by the
     *     supplied property name.
     * @param {String} aProperty The name of the style property to retrieve.
     * @returns {Object} The current computed value of the style property named
     *     by aProperty on the supplied element.
     */

    return TP.elementGetComputedStyleProperty(this.getNativeNode(), aProperty);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getDisplayValue',
function(anAttribute) {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getFocusContextElement',
function() {

    /**
     * @method getFocusContextElement
     * @summary Returns the TP.core.UIElementNode that forms the receiver's
     *     'focus context'. This is normally the document's 'body' element, but
     *     it can be any ancestor element with the 'tibet:focuscontext'
     *     attribute.
     * @returns {TP.core.UIElementNode} The TP.core.UIElementNode acting as the
     *      'focus context' element of the receiver.
     */

    var focusContextTPElem;

    if (TP.isValid(focusContextTPElem =
            this.getFirstAncestorByAttribute('tibet:focuscontext'))) {
        return focusContextTPElem;
    } else {
        return this.getDocument().getBody();
    }
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getFocusedElement',
function(includeBody) {

    /**
     * @method getFocusedElement
     * @summary Returns the TP.core.UIElementNode representing the element in
     *     the document that currently has focus.
     * @param {Boolean} includeBody Whether or not to include the 'body' element
     *     if another element can't be found. HTML5 says that the 'body' will
     *     be the 'active' element if another element can't be found, but
     *     sometimes callers don't want that. This defaults to true.
     * @exception TP.sig.InvalidDocument
     * @returns {TP.core.UIElementNode} The TP.core.UIElementNode that currently
     *     has focus in the document.
     */

    var currentDoc,
        currentElement;

    if (!TP.isDocument(currentDoc = this.getNativeDocument())) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  Couldn't find a focused element
    if (!TP.isElement(currentElement =
                         TP.documentGetFocusedElement(currentDoc))) {
        return null;
    }

    if (TP.notTrue(includeBody) &&
         currentElement === TP.documentGetBody(currentDoc)) {

        //  The caller doesn't want the body back
        return null;
    }

    //  Found a currently focused element - wrap it.
    return TP.wrap(currentElement);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getHeight',
function() {

    /**
     * @method getHeight
     * @summary Returns the receiver's height in pixels.
     * @returns {Number} The receiver's height in pixels.
     */

    return TP.elementGetHeight(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getGlobalPoint',
function(wantsTransformed) {

    /**
     * @method getGlobalPoint
     * @summary Returns the receiver's global position as a TP.core.Point. The
     *     global position is the element's position relative to its overall
     *     *top level* window.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.core.Point} The receiver's global position.
     */

    var coords;

    coords = TP.elementGetGlobalXY(this.getNativeNode(),
                                    TP.BORDER_BOX,
                                    wantsTransformed);

    return TP.pc(coords);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getGlobalRect',
function(wantsTransformed) {

    /**
     * @method getGlobalRect
     * @summary Returns the receiver's global position and size as a
     *     TP.core.Rect. The global position is the element's position relative
     *     to its overall *top level* window.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.core.Rect} The receiver's global position and size.
     */

    var coords;

    coords = TP.elementGetGlobalBox(this.getNativeNode(),
                                    TP.BORDER_BOX,
                                    wantsTransformed);

    return TP.rtc(coords);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getGroupChainNames',
function() {

    /**
     * @method getGroupChainNames
     * @summary Returns an Array of the 'tibet:group' element names that the
     *     receiver is a member of, from the most specific group to the least
     *     specific group (i.e. up the group hierarchy).
     * @returns {Array} The Array of 'tibet:group' names that the receiver is a
     *     member of or the empty Array.
     */

    var groupName,
        allNames,

        win,

        currentGroupName,
        currentGroupElem,
        currentGroupTPElem;

    //  First, get our group name
    groupName = this.getGroupName();

    if (TP.isEmpty(groupName)) {
        return null;
    }

    allNames = TP.ac();

    win = this.getNativeWindow();

    currentGroupName = groupName;
    while (TP.isElement(currentGroupElem = TP.byId(currentGroupName, win))) {
        allNames.push(currentGroupName);

        currentGroupTPElem = TP.wrap(currentGroupElem);

        if (TP.notValid(currentGroupName =
                        currentGroupTPElem.getGroupName())) {
            break;
        }
    }

    return allNames;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getGroupName',
function() {

    /**
     * @method getGroupName
     * @summary Returns the 'tibet:group' element name that the receiver is a
     *     member of.
     * @returns {String} The 'tibet:group' name that the receiver is a member of
     *     or null.
     */

    //  If we don't have a 'tibet:group' attribute, then just return a null
    if (!this.hasAttribute('tibet:group')) {
        return null;
    }

    return this.getAttribute('tibet:group');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getNextGroupName',
function(startGroupName, alwaysWrap, wantsNested) {

    /**
     * @method getNextGroupName
     * @summary Returns the 'next' group name. If a starting group name is
     *     supplied, it is used as the starting point. Otherwise, the group name
     *     of the receiver is used as the starting point.
     * @param {String} startGroupName The group name to start the search for the
     *     next group at.
     * @param {Boolean} alwaysWrap Whether or not to ignore wrapping behavior
     *     and 'always wrap' around. Defaults to false.
     * @param {Boolean} wantsNested Whether or not to consider nested groups as
     *     part of this query. Defaults to false.
     * @returns {String} The name of the 'next' group.
     */

    var ourGroupName,
        fromGroupName,

        shouldWrap,

        chainNames,

        win,

        fromGroupTPElem,

        parentGroupName,
        allGroups,

        memberGroupTPElems,

        nextGroupTPElem,

        parentGroupTPElem;

    if (TP.isEmpty(ourGroupName = this.getGroupName())) {
        return null;
    }

    fromGroupName = TP.ifEmpty(startGroupName, ourGroupName);

    shouldWrap = TP.ifInvalid(alwaysWrap, false);

    //  Grab the 'chain' of group names up the group hierarchy
    chainNames = this.getGroupChainNames();

    win = this.getNativeWindow();

    fromGroupTPElem = TP.byOID(fromGroupName, win);

    //  Look for the 'parent group' name, which should be in the chain after
    //  the 'from' group name.
    if (TP.isEmpty(parentGroupName = chainNames.after(fromGroupName))) {
        //  Can't find the parent group - check the body by obtaining all of
        //  the tibet:groups under the body.
        if (TP.notEmpty(allGroups = this.getDocument().getBody().get(
                        'tibet:group'.asType().getQueryPath(wantsNested)))) {

            //  Wrap all of them.
            memberGroupTPElems = TP.wrap(allGroups);

            //  Look for the group out of all of the groups that comes after
            //  the 'from' group.
            if (TP.notValid(nextGroupTPElem = memberGroupTPElems.after(
                                    fromGroupTPElem, TP.EQUALITY, true))) {
                //  There is no 'next' group after the 'from group'. If
                //  shouldWrap is true, set the next group element to be the
                //  first element - otherwise, return null
                if (shouldWrap) {
                    nextGroupTPElem = memberGroupTPElems.first();
                } else {
                    return null;
                }
            }
        } else {
            //  There are no tibet:group elements - return null
            return null;
        }
    } else {
        //  Grab the parent group's TP.core.ElementNode and its member
        //  groups.
        parentGroupTPElem = TP.byOID(parentGroupName, win);
        memberGroupTPElems = parentGroupTPElem.getMemberGroups();

        //  If there is only one member group, then it is the 'from' group
        //  itself - choose the parent group
        if (memberGroupTPElems.getSize() === 1) {
            nextGroupTPElem = parentGroupTPElem;
        } else if (TP.notValid(nextGroupTPElem = memberGroupTPElems.after(
                                    fromGroupTPElem, TP.EQUALITY, true))) {

            //  Otherwise, loop for the group out of all of the groups *of only
            //  the parent group* that comes after the 'from' group.

            //  If the parent tibet:group has a 'wrapWhen' attribute on it
            //  use that to determine whether we should wrap... unless we
            //  should always wrap, ignoring 'wrapWhen'
            if (parentGroupTPElem.hasAttribute('wrapWhen') || shouldWrap) {
                //  TODO: There are other values for 'wrapWhen'
                nextGroupTPElem = memberGroupTPElems.first();
            } else {
                //  Can't find the next group and we're not wrapping -
                //  return null
                return null;
            }
        }
    }

    return nextGroupTPElem.getAttribute('id');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getNextResponder',
function(aSignal, isCapturing) {

    /**
     * @method getNextResponder
     * @summary Returns the next responder as computed by the receiver.
     * @description The default implementation of this method is to get the
     *     receiver's 'next closest ancestor control element' (i.e. not itself,
     *     but its closest ancestor that has either a 'tibet:tag' or
     *     'tibet:ctrl' attribute) and TP.wrap() it.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if the
     *     receiver is an appropriate responder.
     * @param {Boolean} isCapturing Whether or not the responder computation
     *     machinery is computing the chain for the 'capturing' phase of the
     *     event dispatch.
     * @returns {Object} The next responder as computed by the receiver.
     */

    var node,
        parentNode,
        ancestorControl,
        elementWin,
        frame,
        frameElem;

    node = this.getNativeNode();

    //  Check for a parent node or node controller we can wrap.
    parentNode = node.parentNode;
    if (TP.isElement(parentNode) &&
            TP.isElement(
                ancestorControl = TP.nodeGetControlElement(parentNode))) {

        return TP.wrap(ancestorControl);
    }

    //  Check for a containing iframe element we can leverage as a "screen". We
    //  only return the iframe if it has a specific handler, otherwise we
    //  continue searching upward from the iframe.
    elementWin = TP.nodeGetWindow(this.getNativeDocument());

    if (TP.isIFrameWindow(elementWin)) {
        frameElem = elementWin.frameElement;

        if (TP.isElement(frameElem)) {
            frame = TP.wrap(frameElem);

            if (frame.isResponderFor(aSignal, isCapturing)) {
                return frame;
            } else {
                //  Recurse, calling the iframe's 'getNextResponder' method to
                //  work our way 'up' the tree.
                return frame.getNextResponder(aSignal, isCapturing);
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getOffsetParent',
function() {

    /**
     * @method getOffsetParent
     * @summary Returns the receiver's 'offset parent'.
     * @returns {TP.core.UIElementNode} The receiver's 'offset parent' in the
     *     DOM.
     */

    return TP.wrap(TP.elementGetOffsetParent(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getOffsetPoint',
function(wantsTransformed) {

    /**
     * @method getOffsetPoint
     * @summary Returns the receiver's offset position as a TP.core.Point. The
     *     offset position is the element's position relative to its offset
     *     parent.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.core.Point} The receiver's offset position.
     */

    var coords;

    coords = TP.elementGetOffsetXY(this.getNativeNode(),
                                    TP.BORDER_BOX,
                                    wantsTransformed);

    return TP.pc(coords);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getOffsetRect',
function(wantsTransformed) {

    /**
     * @method getOffsetRect
     * @summary Returns the receiver's offset position and size as a
     *     TP.core.Rect. The offset position is the element's position relative
     *     to its offset parent
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.core.Rect} The receiver's offset position and size.
     */

    var coords;

    coords = TP.elementGetOffsetBox(this.getNativeNode(),
                                    TP.BORDER_BOX,
                                    wantsTransformed);

    return TP.rtc(coords);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getPagePoint',
function(wantsTransformed) {

    /**
     * @method getPagePoint
     * @summary Returns the receiver's page position as a TP.core.Point. The
     *     page position is the element's position relative to its overall page.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.core.Point} The receiver's page position.
     */

    var coords;

    coords = TP.elementGetPageXY(this.getNativeNode(),
                                    TP.BORDER_BOX,
                                    null,
                                    wantsTransformed);

    return TP.pc(coords);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getPageRect',
function(wantsTransformed) {

    /**
     * @method getPageRect
     * @summary Returns the receiver's page position and size as a
     *     TP.core.Rect. The page position is the element's position relative to
     *     its overall page.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.core.Rect} The receiver's page position and size.
     */

    var coords;

    coords = TP.elementGetPageBox(this.getNativeNode(),
                                    TP.BORDER_BOX,
                                    null,
                                    wantsTransformed);

    return TP.rtc(coords);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getParentGroupName',
function(startGroupName) {

    /**
     * @method getParentGroupName
     * @summary Returns the 'next' group name. If a starting group name is
     *     supplied, it is used as the starting point. Otherwise, the group name
     *     of the receiver is used as the starting point.
     * @param {String} startGroupName The group name to start the search for the
     *     next group at.
     * @param {Boolean} alwaysWrap Whether or not to ignore wrapping behavior
     *     and 'always wrap' around.
     * @returns {String} The name of the 'next' group.
     */

    var ourGroupName,
        fromGroupName,

        chainNames,

        parentGroupName;

    if (TP.isEmpty(ourGroupName = this.getGroupName())) {
        return null;
    }

    fromGroupName = TP.ifEmpty(startGroupName, ourGroupName);

    //  Grab the 'chain' of group names up the group hierarchy
    chainNames = this.getGroupChainNames();

    //  Look for the 'parent group' name, which should be in the chain after
    //  the 'from' group name.
    if (TP.isEmpty(parentGroupName = chainNames.after(fromGroupName))) {
        return null;
    }

    return parentGroupName;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getPreviousGroupName',
function(startGroupName, alwaysWrap, wantsNested) {

    /**
     * @method getPreviousGroupName
     * @summary Returns the 'previous' group name. If a starting group name is
     *     supplied, it is used as the starting point. Otherwise, the group name
     *     of the receiver is used as the starting point.
     * @param {String} startGroupName The group name to start the search for the
     *     next group at.
     * @param {Boolean} alwaysWrap Whether or not to ignore wrapping behavior
     *     and 'always wrap' around. Defaults to false.
     * @param {Boolean} wantsNested Whether or not to consider nested groups as
     *     part of this query. Defaults to false.
     * @returns {String} The name of the 'previous' group.
     */

    var ourGroupName,
        fromGroupName,

        shouldWrap,

        chainNames,

        win,

        fromGroupTPElem,

        parentGroupName,

        allGroups,

        memberGroupTPElems,

        prevGroupTPElem,

        parentGroupTPElem;

    if (TP.isEmpty(ourGroupName = this.getGroupName())) {
        return null;
    }

    fromGroupName = TP.ifEmpty(startGroupName, ourGroupName);

    shouldWrap = TP.ifInvalid(alwaysWrap, false);

    //  Grab the 'chain' of group names up the group hierarchy
    chainNames = this.getGroupChainNames();

    win = this.getNativeWindow();

    fromGroupTPElem = TP.byOID(fromGroupName, win);

    //  Look for the 'parent group' name, which should be in the chain after
    //  the 'from' group name.
    if (TP.isEmpty(parentGroupName = chainNames.after(fromGroupName))) {
        //  Can't find the parent group - check the body by obtaining all of
        //  the tibet:groups under the body.
        if (TP.notEmpty(allGroups = this.getDocument().getBody().get(
                        'tibet:group'.asType().getQueryPath(wantsNested)))) {

            //  Wrap all of them.
            memberGroupTPElems = TP.wrap(allGroups);

            //  Look for the group out of all of the groups that comes
            //  before the 'from' group.
            if (TP.notValid(prevGroupTPElem = memberGroupTPElems.before(
                                    fromGroupTPElem, TP.EQUALITY, true))) {
                //  There is no 'previous' group before the 'from group'. If
                //  shouldWrap is true, set the previous group element to be
                //  the last element - otherwise, return null
                if (shouldWrap) {
                    prevGroupTPElem = memberGroupTPElems.last();
                } else {
                    return null;
                }
            }
        } else {
            //  There are no tibet:group elements - return null
            return null;
        }
    } else {
        //  Grab the parent group's TP.core.ElementNode and its member
        //  groups.
        parentGroupTPElem = TP.byOID(parentGroupName, win);
        memberGroupTPElems = parentGroupTPElem.getMemberGroups();

        //  If there is only one member group, then it is the 'from' group
        //  itself - choose the parent group
        if (memberGroupTPElems.getSize() === 1) {
            prevGroupTPElem = parentGroupTPElem;
        } else if (TP.notValid(prevGroupTPElem = memberGroupTPElems.before(
                                    fromGroupTPElem, TP.EQUALITY, true))) {

            //  Otherwise, look for the group out of all of the groups *of only
            //  the parent group* that comes before the 'from' group.

            //  If the parent tibet:group has a 'wrapWhen' attribute on it
            //  use that to determine whether we should wrap... unless we
            //  should always wrap, ignoring 'wrapWhen'
            if (parentGroupTPElem.hasAttribute('wrapWhen') || shouldWrap) {
                //  TODO: There are other values for 'wrapWhen'
                prevGroupTPElem = memberGroupTPElems.last();
            } else {
                //  Can't find the previous group and we're not wrapping -
                //  return null
                return null;
            }
        }
    }

    return prevGroupTPElem.getAttribute('id');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getSubmitName',
function() {

    /**
     * @method getSubmitName
     * @summary Returns the name under which the receiver would be submitted
     *     when used in a forms context. This defaults to the value of the id
     *     attribute, followed by the name attribute.
     * @returns {String} The receiver's submission name.
     */

    var node;

    node = this.getNativeNode();

    //  ID is our first choice, followed by Name
    return TP.elementGetAttribute(node, 'id') ||
            TP.elementGetAttribute(node, 'name');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getWidth',
function() {

    /**
     * @method getWidth
     * @summary Returns the receiver's width in pixels.
     * @returns {Number} The receiver's width in pixels.
     */

    return TP.elementGetWidth(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getWidthAndHeight',
function() {

    /**
     * @method getWidthAndHeight
     * @summary Returns the receiver's width and height as an Array of pixels.
     * @returns {Array} An Array of the receiver's width and height in pixels.
     */

    return TP.ac(TP.elementGetWidth(this.getNativeNode()),
                    TP.elementGetHeight(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('hide',
function() {

    /**
     * @method hide
     * @summary Hides the receiver's node.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    TP.elementHide(this.getNativeNode());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('isVisible',
function() {

    /**
     * @method isVisible
     * @summary Returns whether or not anElement is *really* visible to the
           user, no matter what its CSS setting is.
     * @description In addition to the standard CSS properties of 'display' and
           'visibility', this call also takes into account scrolling and any
           CSS transformation that has been applied to the element.
     * @returns {Boolean} Whether or not anElement is visible.
     */

    return TP.elementIsVisible(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('isResponderFor',
function(aSignal, isCapturing) {

    /**
     * @method isResponderFor
     * @summary Whether or not the receiver is a responder for the supplied
     *     signal and capturing mode.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if the
     *     receiver is an appropriate responder.
     * @param {Boolean} isCapturing Whether or not the responder computation
     *     machinery is computing the chain for the 'capturing' phase of the
     *     event dispatch.
     * @returns {Boolean} Whether or not the receiver is a valid responder for
     *     the supplied signal and capturing mode.
     */

    //  The default is that we don't participate in capturing responder
    //  chains unless there is an 'ev:phase' attribute on us that says
    //  otherwise.
    if (TP.isTrue(isCapturing) && !this.shouldCaptureSignal(aSignal)) {
        return false;
    }

    return TP.isFunction(this.getHandler(aSignal));
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('moveFocus',
function(moveAction) {

    /**
     * @method moveFocus
     * @summary Moves the focus to a 'successor' element based on the
     *     information contained in the supplied event and on the move action.
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
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var currentTPElem,

        successorTPElem;

    //  NB: We pass 'true' here because we want the 'body' element returned if
    //  no other element is focused
    currentTPElem = this.getFocusedElement(true);

    //  If there was a real currently focused element, then we move away
    //  from it to the desired element.
    if (TP.isKindOf(currentTPElem, TP.core.UIElementNode)) {
        //  Now, compute the 'successor' element to focus based on the move
        //  action, the event and the currently focused element (which is
        //  ourself since the signal was fired at us). This could be null if
        //  there is no successor element.
        successorTPElem = this.computeSuccessorFocusElement(
                                        currentTPElem, moveAction);
    } else {
        //  Otherwise, there was no currently focused element, so we compute
        //  the successor element in a different way.
        successorTPElem = this.computeSuccessorFocusElement(
                                        null, moveAction);
    }

    //  If there's a real successor element, then focus it. This will cause
    //  the standard focusing behavior to take over which should cause
    //  UIFocus/UIDidFocus to be signaled, etc. etc.
    if (TP.isKindOf(successorTPElem, TP.core.UIElementNode)) {

        this.getType().set('$focusingTPElement', successorTPElem);

        //  We do this to match the native focusing behavior that haven't
        //  been sent through this computation routine (i.e. clicks, etc.)

        //  Note that we pass the moveAction here - if this is a group, it will
        //  act as a hint as to where to put the focus within the group.
        successorTPElem.focus(moveAction);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('removeAttribute',
function(attributeName) {

    /**
     * @method removeAttribute
     * @summary Removes the named attribute. This version overrides the one
     *     inherited from TP.core.ElementNode to not bother with snapshotting
     *     changes to a transactionally consistent DOM, since this object's
     *     native node is an on-screen control.
     * @param {String} attributeName The attribute name to remove.
     * @returns {null} Null according to the spec for DOM 'removeAttribute'.
     */

    TP.elementRemoveAttribute(this.getNativeNode(), attributeName, true);

    this.changed('@' + attributeName, TP.DELETE);

    //  removeAttribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('resignFocusedResponder',
function() {

    /**
     * @method resignFocusedResponder
     * @summary Tells the receiver that it is no longer the 'focused
     *     responder'.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var newFocusTPElem,
        newFocusContext,

        currentFocusContext,

        foundContext,
        tpElementToFocus;

    //  The element that the focus is moving to. This might be null if we
    //  aren't being told to resign focus because of the TIBET focus manager.
    newFocusTPElem = this.getType().get('$focusingTPElement');

    //  Now, we should clear the $focusingTPElement property so that focusing
    //  on the new element will succeed. We'll adjust this below as necessary in
    //  case we don't want the focusing to happen on the 'current new element'
    //  that the system thinks it wants to focus on, but another element of our
    //  own choosing.
    this.getType().set('$focusingTPElement', null);

    //  If the focus stack is empty, exit here - the 'becomeFocusedResponder'
    //  routine will take care of pushing the new element on the stack.
    if (TP.isEmpty($focus_stack)) {
        return this;
    }

    //  We are the currently focused element, get our focus context
    currentFocusContext = this.getFocusContextElement();

    //  Grab the 'focusing element's' focus context. Since the focusing element
    //  is becoming the focused responder, this context will be considered to be
    //  the 'new' context.
    if (TP.isKindOf(newFocusTPElem, TP.core.UIElementNode)) {
        newFocusContext = newFocusTPElem.getFocusContextElement();
    } else {
        newFocusContext = null;
    }

    //  If the two focus contexts are the same, then we pop the old focused
    //  element, and exit here. The new element will be pushed by the
    //  becomeFocusedResponder() method.
    if (TP.notValid(newFocusContext) ||
            newFocusContext.identicalTo(currentFocusContext.getNativeNode())) {

        $focus_stack.pop();
        this.signal('TP.sig.UIDidPopFocus');

        return this;
    }

    //  Look at the stack to see if the focus context for the 'new' element
    //  is the same as the focus context of one of the elements that has
    //  already been pushed at some point.

    foundContext = $focus_stack.detect(
            function(aTPElement) {
                return aTPElement.getFocusContextElement().identicalTo(
                                                        newFocusContext);
            });

    //  We found a context back on the stack that is the same focus context as
    //  the 'new' element.
    if (TP.isValid(foundContext)) {
        //  Pop the stack once to get back to the previously focused element.
        $focus_stack.pop();
        this.signal('TP.sig.UIDidPopFocus');

        //  Pop it again (and capture the value because this will be the element
        //  that we want to refocus) to get back to the element *before* the
        //  previously focused element. We're gonna re-push the previously
        //  focused element when we focus it below.
        tpElementToFocus = $focus_stack.pop();

        //  Reset the 'focusing element' to be the previously focused element.
        //  The presence of this element will cause the currently focusing
        //  element to *not* be focused (the event will be cancelled) and then
        //  the 'focus' call below will try to focus this element *after it is
        //  forked* (allowing the stack to unwind).
        //  See 'acceptFocusedResponder' for more information.
        this.getType().set('$focusingTPElement', tpElementToFocus);

        (function() {
            //  Clear the $focusingTPElement property so that the focusing on
            //  this element will succeed.
            this.getType().set('$focusingTPElement', null);

            //  This will do the proper signaling for accepting/becoming the
            //  focused responder
            tpElementToFocus.focus();
        }.bind(this)).afterUnwind();
    }

    //  The new element's focusing context has never been encountered before -
    //  leave the stack alone and just return.

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('signalUsingFacetAndValue',
function(facetName, facetValue) {

    /**
     * @method signalUsingFacetAndValue
     * @summary Signals one of the UI state change signals based on the facet
     *     name and value supplied.
     * @param {String} facetName The name of the facet to use to compute the
     *     signal to send.
     * @param {Boolean} facetValue The value of the facet to use to compute the
     *     signal to send.
     * @returns {Object} The receiver.
     */

    var signalName;

    //  Generate a proper signal name based on the facet name and whether the
    //  value is true or false

    switch (facetName) {

        case 'readonly':

            if (TP.isTrue(facetValue)) {
                signalName = 'TP.sig.UIReadonly';
            } else {
                signalName = 'TP.sig.UIReadwrite';
            }

            break;

        case 'relevant':

            if (TP.isTrue(facetValue)) {
                signalName = 'TP.sig.UIEnabled';
            } else {
                signalName = 'TP.sig.UIDisabled';
            }

            break;

        case 'required':

            if (TP.isTrue(facetValue)) {
                signalName = 'TP.sig.UIRequired';
            } else {
                signalName = 'TP.sig.UIOptional';
            }

            break;

        case 'valid':

            if (TP.isTrue(facetValue)) {
                signalName = 'TP.sig.UIValid';
            } else {
                signalName = 'TP.sig.UIInvalid';
            }

            break;

        default:
            break;
    }

    //  Signal the signal name - because the signals above are all responder
    //  policy signals, this will trigger this object's handler as part of the
    //  responder chain. Note we supply the facet name here as a convenience.
    this.signal(signalName, TP.hc('facet', facetName));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('$setAttribute',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method $setAttribute
     * @summary Sets the value of the named attribute. This version overrides
     *     the one inherited from TP.core.ElementNode to not bother with
     *     snapshotting changes to a transactionally consistent DOM, since this
     *     object's native node is an on-screen control.
     * @param {String} attributeName The attribute name to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {null} Null according to the spec for DOM 'setAttribute'.
     */

    var node,

        hadAttribute,

        flag,

        nameParts,
        prefix,
        name,

        url;

    node = this.getNativeNode();

    hadAttribute = TP.elementHasAttribute(node, attributeName, true);

    //  NB: Use this construct this way for better performance
    if (TP.notValid(flag = shouldSignal)) {
        flag = this.shouldSignalChange();
    }

    //  if this is a prefixed attribute then we'll attempt to "do the right
    //  thing" by finding the registered namespace and placing the attribute
    //  in that namespace
    if (TP.regex.NS_QUALIFIED.test(attributeName)) {
        nameParts = attributeName.match(TP.regex.NS_QUALIFIED);
        prefix = nameParts.at(1);
        name = nameParts.at(2);

        if (attributeName.startsWith('xmlns')) {
            //  If the caller was trying to add an 'xmlns' attribute, then
            //  first check to make sure that they weren't trying to set the
            //  default namespace - can't do that :-(.
            if (attributeName === 'xmlns') {
                //  TODO: Throw an error - you cannot reset the default
                //  namespace :-(.
                return;
            }

            //  Otherwise, they're trying to add a prefixed namespace
            //  definition.
            TP.elementAddNamespace(node,
                                    prefix + ':' + name,
                                    attributeValue);

            if (flag) {
                this.changed('@' + attributeName, TP.UPDATE);
            }

            return;
        }

        //  seems like we're dealing with a prefixed attribute that isn't an
        //  xmlns attribute, so the question is do we know a URI so we can
        //  map it properly?
        if (TP.notEmpty(url = TP.w3.Xmlns.getPrefixURI(prefix))) {
            TP.elementSetAttributeInNS(node,
                                        prefix + ':' + name,
                                        attributeValue,
                                        url);
        } else {
            //  no known prefix, just set it as an attribute whose name
            //  happens to include a colon
            TP.elementSetAttribute(node, attributeName, attributeValue);
        }
    } else {
        TP.elementSetAttribute(node, attributeName, attributeValue);
    }

    if (flag) {
        this.changed('attribute',
                    hadAttribute ? TP.UPDATE : TP.CREATE,
                    TP.hc(TP.OLDVAL,
                            TP.elementGetAttribute(node, attributeName, true),
                            TP.NEWVAL,
                            attributeValue));
    }

    //  setAttribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('$setFacet',
function(aspectName, facetName, facetValue, shouldSignal) {

    /**
     * @method $setFacet
     * @summary Sets the value of the named facet of the named aspect to the
     *     value provided. This method should be called from any 'custom facet
     *     setter' in order to a) set the property and b) signal a change, if
     *     configured.
     * @param {String} aspectName The name of the aspect to set.
     * @param {String} facetName The name of the facet to set.
     * @param {Boolean} facetValue The value to set the facet to.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The receiver.
     */

    //  If the facet is 'value', then use the standard 'set' mechanism.
    if (facetName === 'value') {
        //  NB: This will signal the standard TP.sig.ValueChange
        return this.set(aspectName, facetValue, shouldSignal);
    }

    this.signalUsingFacetAndValue(facetName, facetValue);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setGroupElement',
function(aTPElem) {

    /**
     * @method setGroupElement
     * @summary Sets the supplied tibet:group element as a grouping element for
     *     the receiver.
     * @param {tibet:group} aTPElem The element to use as the grouping element
     *     for the receiver.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.UIElementNode} The receiver.
     */

    if (TP.notValid(aTPElem)) {
        return this.raise('TP.sig.InvalidElement', aTPElem);
    }

    this.setAttribute('tibet:group', aTPElem.getLocalID());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setHeight',
function(aHeight) {

    /**
     * @method setHeight
     * @summary Sets the receiver's height.
     * @description If a Number is supplied to aHeight a default unit of 'px' is
     *     assumed.
     * @param {Number|String} aHeight The height dimension to set the receiver's
     *     height to.
     */

    return TP.elementSetHeight(this.getNativeNode(), aHeight);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setPagePosition',
function(aPointOrObject) {

    /**
     * @method setPagePosition
     * @summary Sets the position of the receiver by manipulating its top, and
     *     left style properties. This method assumes the receiver is positioned
     *     in some fashion.
     * @param {TP.core.Point|TP.lang.Hash|Array} aPointOrObject A TP.core.Point
     *     to use or an object that has 'x' and 'y', slots or an Array that has
     *     x in the first position, and y in the second position.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var styleObj;

    styleObj = TP.elementGetStyleObj(this.getNativeNode());

    if (TP.isKindOf(aPointOrObject, TP.core.Point)) {
        styleObj.left = aPointOrObject.getX() + 'px';
        styleObj.top = aPointOrObject.getY() + 'px';
    } else if (TP.isKindOf(aPointOrObject, TP.lang.Hash)) {
        styleObj.left = aPointOrObject.at('x') + 'px';
        styleObj.top = aPointOrObject.at('y') + 'px';
    } else if (TP.isArray(aPointOrObject)) {
        styleObj.left = aPointOrObject.at(0) + 'px';
        styleObj.top = aPointOrObject.at(1) + 'px';
    } else {
        styleObj.left = aPointOrObject.x + 'px';
        styleObj.top = aPointOrObject.y + 'px';
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setPagePositionAndSize',
function(aRectOrObject) {

    /**
     * @method setPagePositionAndSize
     * @summary Sets the position of the receiver by manipulating its top,
     *     right, bottom and left style properties. This method assumes the
     *     receiver is positioned in some fashion.
     * @param {TP.core.Rect|TP.lang.Hash|Array} aRectOrObject A TP.core.Rect to
     *     use or an object that has 'x', 'y', 'width' and 'height' slots or an
     *     Array that has x in the first position, y in the second position,
     *     width in the third position and height in the fourth position.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var styleObj;

    styleObj = TP.elementGetStyleObj(this.getNativeNode());

    if (TP.isKindOf(aRectOrObject, TP.core.Rect)) {
        styleObj.left = aRectOrObject.getX() + 'px';
        styleObj.top = aRectOrObject.getY() + 'px';
        styleObj.width = aRectOrObject.getWidth() + 'px';
        styleObj.height = aRectOrObject.getHeight() + 'px';
    } else if (TP.isKindOf(aRectOrObject, TP.lang.Hash)) {
        styleObj.left = aRectOrObject.at('x') + 'px';
        styleObj.top = aRectOrObject.at('y') + 'px';
        styleObj.width = aRectOrObject.at('width') + 'px';
        styleObj.height = aRectOrObject.at('height') + 'px';
    } else if (TP.isArray(aRectOrObject)) {
        styleObj.left = aRectOrObject.at(0) + 'px';
        styleObj.top = aRectOrObject.at(1) + 'px';
        styleObj.width = aRectOrObject.at(2) + 'px';
        styleObj.height = aRectOrObject.at(3) + 'px';
    } else {
        styleObj.left = aRectOrObject.x + 'px';
        styleObj.top = aRectOrObject.y + 'px';
        styleObj.width = aRectOrObject.width + 'px';
        styleObj.height = aRectOrObject.height + 'px';
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setTransform',
function(aTransformStr) {

    /**
     * @method setTransform
     * @summary Sets the CSS transform of the receiver using the supplied
     *     String (which should conform to one of the values specified in the
     *     CSS Transform specification).
     * @param {String} aTransformStr The value to set on the receiver as its CSS
     *     Transform.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    TP.elementSetTransform(this.getNativeNode(), aTransformStr);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setWidth',
function(aWidth) {

    /**
     * @method setWidth
     * @summary Sets the receiver's width.
     * @description If a Number is supplied to aWidth a default unit of 'px' is
     *     assumed.
     * @param {Number|String} aWidth The width dimension to set the receiver's
     *     width to.
     */

    return TP.elementSetWidth(this.getNativeNode(), aWidth);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('show',
function() {

    /**
     * @method show
     * @summary Show's the receiver's node.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    TP.elementShow(this.getNativeNode());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('yieldFocusedResponder',
function(focusingElement) {

    /**
     * @method yieldFocusedResponder
     * @summary Asks the receiver to yield its role as 'focused responder'.
     * @description At this level, this type just returns true, but subtypes may
     *     run various checks for valid values, etc. and return false if those
     *     checks don't pass.
     * @param {TP.core.UIElementNode} focusingElement The element that the focus
     *     is moving to. This might be null if we aren't being asked to yield
     *     focus because of the TIBET focus manager.
     * @returns {Boolean} Whether or not the receiver should yield focused
     *     responder status.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('toggleDisplay',
function() {

    /**
     * @method toggleDisplay
     * @summary Toggles the 'display' of the receiver from 'node' to it's
     *     default display state or vice-versa, depending on the current
     *     visibility state.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var elem;

    elem = this.getNativeNode();

    if (TP.elementIsDisplayed(elem)) {
        TP.elementHide(elem);
    } else {
        TP.elementShow(elem);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('toggleVisibility',
function() {

    /**
     * @method toggleVisibility
     * @summary Toggles the 'visibility' of the receiver from 'hidden' to
     *     'visible' or vice-versa, depending on the current visibility state.
     * @exception TP.sig.InvalidStyle
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var computedStyle,
        elem;

    elem = this.getNativeNode();

    //  Grab the computed style for the element
    if (TP.notValid(computedStyle = TP.elementGetComputedStyleObj(elem))) {
        return this.raise('TP.sig.InvalidStyle');
    }

    if (computedStyle.visibility === 'visible') {
        elem.style.visibility = 'hidden';
    } else {
        elem.style.visibility = 'visible';
    }

    return this;
});

//  ------------------------------------------------------------------------
//  LOCAL CSS TRANSFORMS
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('addLocalTransform',
function(transformType, varargs) {

    /**
     * @method addLocalTransform
     * @summary Adds a "local" transform to the receiver. This will be a CSS3
     *     transform that will affect just the receiver by using it's local
     *     '.style' attribute.
     * @param {String} transformType The type of transformation to add to the
     *     local transformations. This should be one of the following:
     *     TP.ROTATE, TP.SKEW, TP.SCALE,
     *     TP.TRANSLATE.
     * @param {Array} varargs One or more additional arguments to provide to
     *     configure the transform.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var localTransforms;

    //  If our native node already has an attribute that contains the local
    //  transforms, we use that (decoding it's value from the string JSON
    //  representation that is used). Otherwise, we create one.
    if (TP.isEmpty(localTransforms = this.getAttribute('localTransforms'))) {
        localTransforms = TP.ac();
    } else {
        localTransforms = TP.json2js(localTransforms);
    }

    //  Push on a TP.lang.Hash containing the transform type and an Array
    //  containing the arguments to this method (after slicing off the transform
    //  type).
    localTransforms.push(
        TP.hc('type', transformType, 'args', TP.ac(arguments).slice(1)));

    //  JSONify the local transforms data structure and set the attribute.
    this.setAttribute('localTransforms', TP.js2json(localTransforms));

    //  Set the local transform style from the local transforms that we're
    //  managing.
    this.setTransformFromLocalTransforms();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('generateCSSValueFromTransformRecord',
function(aTransformRecord) {

    /**
     * @method generateCSSValueFromTransformRecord
     * @summary Generates a CSS value from the supplied transform 'record'.
     * @description A transform record consists of a TP.lang.Hash that has two
     *     keys: the transform 'type' that should consist of one of the
     *     following values: TP.ROTATE, TP.SKEW, TP.SCALE, TP.TRANSLATE and the
     *     transform 'args', which are arguments to the transformation.
     * @param {TP.lang.Hash} aTransformRecord The transformation record to use
     *     to generate the CSS value.
     * @exception TP.sig.InvalidParameter
     * @returns {String} The generated CSS value String.
     */

    var str,
        transformArgs;

    if (TP.notValid(aTransformRecord)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Must supply a valid transform record.');
    }

    str = '';

    transformArgs = aTransformRecord.at('args');

    switch (aTransformRecord.at('type')) {

        case TP.ROTATE:

            str += 'rotate(' +
                    transformArgs + 'deg)';

        break;

        case TP.SKEW:

            str += 'skewX(' +
                    transformArgs.first() + 'deg) ' +
                    'skewY(' +
                    transformArgs.last() + 'deg)';

        break;

        case TP.SCALE:

            str += 'scaleX(' +
                    transformArgs.first() + ') ' +
                    'scaleY(' +
                    transformArgs.last() + ')';

        break;

        case TP.TRANSLATE:

            str += 'translateX(' +
                    transformArgs.first() + 'px) ' +
                    'translateY(' +
                    transformArgs.last() + 'px)';
        break;

        default:
        break;
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getLocalTransformValue',
function(transformType, transformIndex) {

    /**
     * @method getLocalTransformValue
     * @summary Returns the values of a particular local transform that has
     *     been added to the receiver as a CSS value.
     * @param {String} transformType The type of transformation to return the
     *     CSS value of. This should be one of the following:
     *     TP.ROTATE, TP.SKEW, TP.SCALE, TP.TRANSLATE, TP.ANY.
     * @param {Number} transformIndex The index of the transform to return the
     *     CSS value of. If this argument is not supplied or invalid, 0 (the
     *     first transform of the specified type) is assumed.
     * @returns {String} The generated CSS value String.
     */

    var localTransforms,

        recordIndex,

        transformRecords,
        typeIndex;

    //  If our native node has an attribute that contains the local transforms,
    //  we use that. Otherwise, there is nothing to do here, so we exit here.
    if (TP.isEmpty(localTransforms = this.getAttribute('localTransforms'))) {
        return '';
    } else {
        localTransforms = TP.json2js(localTransforms);
    }

    //  If a Number wasn't supplied in the transformIndex, we assume a value of
    //  0.
    recordIndex = TP.ifInvalid(transformIndex, 0);

    transformRecords = null;

    //  Find the transform, given our transform type and index
    if (transformType === TP.ANY) {
        //  We're looking for any transform - just return the one at that index.
        return this.generateCSSValueFromTransformRecord(
                                    localTransforms.at(recordIndex));
    } else {
        //  We're looking for a particular type of transform at a particular
        //  index. Keep track of the index which will increment every time we
        //  encounter a transform of that type.
        typeIndex = 0;
        transformRecords = localTransforms.select(
            function(aTransformRecord) {
                if (aTransformRecord.at('type') === transformType) {
                    if (typeIndex === recordIndex) {
                        return aTransformRecord;
                    }
                    typeIndex++;
                }
            });
    }

    //  We found a valid transform record - generate a CSS value from it and
    //  return that.
    if (TP.notEmpty(transformRecords)) {
        return this.generateCSSValueFromTransformRecord(
                                    transformRecords.first());
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('removeAllLocalTransforms',
function() {

    /**
     * @method removeAllLocalTransforms
     * @summary Removes all of the local transforms from the receiver.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    return this.removeLocalTransform(TP.ANY, TP.ALL);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('removeLocalTransform',
function(transformType, transformIndex) {

    /**
     * @method removeLocalTransform
     * @summary Removes a particular local transform from the receiver.
     * @param {String} transformType The type of transformation to remove.
     *     This should be one of the following:
     *     TP.ROTATE, TP.SKEW, TP.SCALE, TP.TRANSLATE, TP.ANY.
     * @param {Number} transformIndex The index of the transform to remove.
     *     If this argument is not supplied or invalid, 0 (the first transform
     *     of the specified type) is assumed. This argument can also have a
     *     value of TP.ALL, in which case all transforms of the specified type
     *     will be removed.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var localTransforms,

        recordIndex,

        transformRecords,

        typeIndex,

        i,
        len;

    //  If our native node has an attribute that contains the local transforms,
    //  we use that. Otherwise, there is nothing to do here, so we exit here.
    if (TP.isEmpty(localTransforms = this.getAttribute('localTransforms'))) {
        return this;
    } else {
        localTransforms = TP.json2js(localTransforms);
    }

    //  If a value wasn't supplied in the transformIndex, we assume a value of
    //  0.
    recordIndex = TP.ifInvalid(transformIndex, 0);

    if (transformType === TP.ANY && recordIndex === TP.ALL) {
        transformRecords = TP.ac();
    } else {
        transformRecords = localTransforms;

        //  If it's any kind of transform, then just splice out the one at the
        //  recordIndex
        if (transformType === TP.ANY) {
            transformRecords.splice(recordIndex, 1);
        } else {
            typeIndex = 0;

            len = transformRecords.getSize();
            for (i = 0; i < len; i++) {
                if (transformRecords.at(i).at('type') === transformType) {
                    if (recordIndex === TP.ALL) {
                        transformRecords.splice(i, 1);
                        len--;
                        i--;
                    } else if (recordIndex === typeIndex) {
                        transformRecords.splice(i, 1);
                        break;
                    }
                    typeIndex++;
                }
            }
        }
    }

    //  JSONify the local transforms data structure and set the attribute.
    this.setAttribute('localTransforms', TP.js2json(transformRecords));

    //  Set the local transform style from the local transforms that we're
    //  managing.
    this.setTransformFromLocalTransforms();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('rotate',
function(degrees) {

    /**
     * @method rotate
     * @summary Rotates the receiver by the amount indicated by using a 'local
     *     transformation'.
     * @param {Number} degrees The amount in degrees to rotate the receiver
     *     by.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    this.addLocalTransform(TP.ROTATE, degrees);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('scale',
function(x, y) {

    /**
     * @method scale
     * @summary Scales the receiver by the amount indicated by using a 'local
     *     transformation'. Note that, if the 'y' value isn't supplied, it is
     *     defaulted to the 'x' value.
     * @param {Number} x The amount to scale the receiver along the X axis.
     * @param {Number} y The amount to scale the receiver along the Y axis.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var yVal;

    //  If a Y value wasn't supplied, use x
    yVal = TP.ifInvalid(y, x);

    this.addLocalTransform(TP.SCALE, x, yVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setLocalTransform',
function(transformType, transformIndex, varargs) {

    /**
     * @method setLocalTransform
     * @summary Sets the values of a particular local transform that has been
     *     added for the receiver.
     * @param {String} transformType The type of transformation to set the
     *     values of. This should be one of the following:
     *     TP.ROTATE, TP.SKEW, TP.SCALE, TP.TRANSLATE, TP.ANY.
     * @param {Number} transformIndex The index of the transform to set the
     *     values of. If this argument is not supplied or invalid, 0 (the first
     *     transform of the specified type) is assumed.
     * @param {Array} varargs One or more additional arguments to provide to
     *     configure the transform.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var localTransforms,

        recordIndex,

        transformRecords,
        typeIndex;

    //  If our native node has an attribute that contains the local transforms,
    //  we use that. Otherwise, there is nothing to do here, so we exit here.
    if (TP.isEmpty(localTransforms = this.getAttribute('localTransforms'))) {
        return this;
    } else {
        localTransforms = TP.json2js(localTransforms);
    }

    //  If a Number wasn't supplied in the transformIndex, we assume a value of
    //  0.
    recordIndex = TP.ifInvalid(transformIndex, 0);

    //  Find the transform, given our transform type and index
    if (transformType === TP.ANY) {
        //  We're looking for any transform - just return the one at that index
        //  (but wrap it in an Array for use below).
        transformRecords = TP.ac(localTransforms.at(recordIndex));
    } else {
        //  We're looking for a particular type of transform at a particular
        //  index. Keep track of the index which will increment every time we
        //  encounter a transform of that type.
        typeIndex = 0;
        transformRecords = localTransforms.select(
                    function(aTransformRecord) {
                        if (aTransformRecord.at('type') === transformType) {
                            if (typeIndex === recordIndex) {
                                return true;
                            }
                            typeIndex++;
                        }
                    });
    }

    //  Couldn't find any transform records matching our criteria - bail out.
    if (TP.isEmpty(transformRecords)) {
        return this;
    }

    //  Get the first TP.lang.Hash in the result array and put new arguments
    //  into it's 'args' Array that are the arguments to this method (after
    //  slicing off the transform type and index).
    transformRecords.first().atPut('args', TP.ac(arguments).slice(2));

    //  JSONify the local transforms data structure and set the attribute.
    this.setAttribute('localTransforms', TP.js2json(localTransforms));

    //  Set the local transform style from the local transforms that we're
    //  managing.
    this.setTransformFromLocalTransforms();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setTransformFromLocalTransforms',
function() {

    /**
     * @method setTransformFromLocalTransforms
     * @summary Sets the receiver's CSS3 'transforms' style property to the
     *     local transforms that have been populated on the receiver by adding
     *     them.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var localTransforms,
        transformStr;

    //  If our native node does not have an attribute that contains the local
    //  transforms, there is nothing to do, so we set the CSS3 transform to
    //  nothing and exit here.
    if (!this.hasAttribute('localTransforms')) {
        this.setTransform('');

        return this;
    }

    //  If our native node has no local transforms, there is nothing to do, so
    //  we exit here.
    if (TP.isEmpty(localTransforms = this.getAttribute('localTransforms'))) {
        return this;
    } else {
        localTransforms = TP.json2js(localTransforms);
    }

    transformStr = '';

    //  Loop over the local transforms and build up a String containing their
    //  'CSS value'.
    localTransforms.perform(
        function(aRecord) {
            transformStr +=
                    this.generateCSSValueFromTransformRecord(aRecord) + ' ';
        }.bind(this));

    //  Set the CSS transform to the generated String
    this.setTransform(transformStr);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('skew',
function(x, y) {

    /**
     * @method skew
     * @summary Skews the receiver by the amount indicated by using a 'local
     *     transformation'. Note that, if the 'y' value isn't supplied, it is
     *     defaulted to the 'x' value.
     * @param {Number} x The amount in degrees to skew the receiver along the X
     *     axis.
     * @param {Number} y The amount in degrees to skew the receiver along the Y
     *     axis.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var yVal;

    //  If a Y value wasn't supplied, use x
    yVal = TP.ifInvalid(y, x);

    this.addLocalTransform(TP.SKEW, x, yVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('translate',
function(x, y) {

    /**
     * @method translate
     * @summary Translates the receiver by the amount indicated by using a
     *     'local transformation'. Note that, if the 'y' value isn't supplied,
     *     it is defaulted to the 'x' value.
     * @param {Number} x The amount in pixels to translate the receiver along
     *     the X axis.
     * @param {Number} y The amount in pixels to translate the receiver along
     *     the Y axis.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var yVal;

    //  If a Y value wasn't supplied, use x
    yVal = TP.ifInvalid(y, x);

    this.addLocalTransform(TP.TRANSLATE, x, yVal);

    return this;
});

//  ------------------------------------------------------------------------
//  STATE TESTING/MANIPULATION
//  ------------------------------------------------------------------------

/*
Most state flags in TIBET are stored as pclass: attributes on the elements.
This implies that for TIBET we see states as pseudo-classes, much like the
W3 might think of hover. Methods for checking/setting these states all use
the is* pattern common to Boolean attributes. TIBET's get() and set() calls
will look for is* as part of their lookup mechanisms so this all plays well
together.
*/

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('$isInState',
function(stateAttribute, stateFlag, shouldSignal) {

    /**
     * @method $isInState
     * @summary A combined setter/getter for manipulating a particular Boolean
     *     state attribute on the receiver.
     * @param {String} stateAttribute The name of the attribute which maintains
     *     this state.
     * @param {Boolean} stateFlag Optional parameter which defines the whether
     *     the state is in effect.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Boolean} Whether the receiver's state is active.
     */

    var flag;

    //  NB: we use the '$' versions of setAttribute/getAttribute here or
    //  otherwise we'll endlessly recurse.

    if (TP.isBoolean(stateFlag)) {
        if (stateFlag) {
            this.$setAttribute(stateAttribute, 'true', false);
        } else {
            this.$removeAttribute(stateAttribute, false);
        }

        //  NB: Use this construct this way for better performance
        if (TP.notValid(flag = shouldSignal)) {
            flag = this.shouldSignalChange();
        }

        if (flag) {
            this.changed(stateAttribute.slice(7),
                            TP.UPDATE,
                            TP.hc('baseSignalType', TP.sig.AttributeChange));
        }
    }

    return this.hasAttribute(stateAttribute);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getAttrActive',
function() {

    /**
     * @method getAttrActive
     * @summary The getter for the receiver's active state.
     * @returns {Boolean} Whether the receiver's state is active.
     */

    return this.$isInState('pclass:active');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getAttrBusy',
function() {

    /**
     * @method getAttrBusy
     * @summary The getter for the receiver's busy state.
     * @returns {Boolean} Whether the receiver's state is busy.
     */

    return this.$isInState('pclass:busy');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getAttrDisabled',
function() {

    /**
     * @method getAttrDisabled
     * @summary The getter for the receiver's disabled state.
     * @returns {Boolean} Whether the receiver's state is disabled.
     */

    return this.$isInState('pclass:disabled');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getAttrFocused',
function() {

    /**
     * @method getAttrFocused
     * @summary The getter for the receiver's focus state.
     * @returns {Boolean} Whether the receiver's state is focus.
     */

    return this.$isInState('pclass:focus');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getAttrHidden',
function() {

    /**
     * @method getAttrHidden
     * @summary The getter for the receiver's hidden state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    return this.$isInState('pclass:hidden');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getAttrInvalid',
function() {

    /**
     * @method getAttrInvalid
     * @summary The getter for the receiver's invalid state.
     * @returns {Boolean} Whether the receiver's state is invalid.
     */

    return this.$isInState('pclass:invalid');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getAttrOpen',
function() {

    /**
     * @method getAttrOpen
     * @summary The getter for the receiver's open state.
     * @returns {Boolean} Whether the receiver's state is open.
     */

    return this.$isInState('pclass:open');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getAttrOutOfRange',
function() {

    /**
     * @method getAttrOutOfRange
     * @summary The getter for the receiver's out-of-range state.
     * @returns {Boolean} Whether the receiver's state is out-of-range.
     */

    return this.$isInState('pclass:out-of-range');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getAttrReadonly',
function() {

    /**
     * @method getAttrReadonly
     * @summary The getter for the receiver's readonly state.
     * @returns {Boolean} Whether the receiver's state is readonly.
     */

    return this.$isInState('pclass:readonly');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getAttrRequired',
function() {

    /**
     * @method getAttrRequired
     * @summary The getter for the receiver's required state.
     * @returns {Boolean} Whether the receiver's state is required.
     */

    return this.$isInState('pclass:required');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getAttrSelected',
function() {

    /**
     * @method getAttrSelected
     * @summary The getter for the receiver's selected state.
     * @returns {Boolean} Whether the receiver's state is selected.
     */

    return this.$isInState('pclass:selected');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setAttrActive',
function(beActive) {

    /**
     * @method setAttrActive
     * @summary The setter for the receiver's active state.
     * @param {Boolean} beActive Whether or not the receiver is in an active
     *     state.
     * @returns {Boolean} Whether the receiver's state is active.
     */

    this.$isInState('pclass:active', beActive);

    if (TP.isTrue(beActive)) {
        this.signalAfterUnwind('TP.sig.UIDidActivate');
    } else {
        this.signalAfterUnwind('TP.sig.UIDidDeactivate');
    }

    return this.$isInState('pclass:active');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setAttrBusy',
function(beBusy, busyMsg) {

    /**
     * @method setAttrBusy
     * @summary The setter for the receiver's busy state.
     * @param {Boolean} beBusy Whether or not the receiver is in a busy state.
     * @param {String} busyMsg The message to display while busy.
     * @returns {Boolean} Whether the receiver's state is busy.
     */

    this.$isInState('pclass:busy', beBusy);

    if (TP.isTrue(beBusy)) {
        this.displayBusy(busyMsg);

        this.signalAfterUnwind('TP.sig.UIDidBusy');
    } else {
        this.hideBusy();

        this.signalAfterUnwind('TP.sig.UIDidIdle');
    }

    return this.$isInState('pclass:busy');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setAttrClosed',
function(beClosed) {

    /**
     * @method setAttrClosed
     * @summary The setter for the receiver's closed state.
     * @param {Boolean} beClosed Whether or not the receiver is in a closed
     *     state.
     * @returns {Boolean} Whether the receiver's state is closed.
     */

    this.$isInState('pclass:closed', beClosed);

    if (TP.isTrue(beClosed)) {
        this.signalAfterUnwind('TP.sig.UIDidClose');
    } else {
        this.signalAfterUnwind('TP.sig.UIDidOpen');
    }

    return this.$isInState('pclass:closed');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setAttrCollapsed',
function(beCollapsed) {

    /**
     * @method setAttrCollapsed
     * @summary The setter for the receiver's collapsed state.
     * @param {Boolean} beCollapsed Whether or not the receiver is in a
     *     collapsed state.
     * @returns {Boolean} Whether the receiver's state is collapsed.
     */

    this.$isInState('pclass:collapsed', beCollapsed);

    if (TP.isTrue(beCollapsed)) {
        this.signalAfterUnwind('TP.sig.UIDidCollapse');
    } else {
        this.signalAfterUnwind('TP.sig.UIDidExpand');
    }

    return this.$isInState('pclass:collapsed');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setAttrDisabled',
function(beDisabled) {

    /**
     * @method setAttrDisabled
     * @summary The setter for the receiver's disabled state.
     * @param {Boolean} beDisabled Whether or not the receiver is in a disabled
     *     state.
     * @returns {Boolean} Whether the receiver's state is disabled.
     */

    if (TP.isTrue(beDisabled)) {
        //  We go ahead and set a generic 'disabled' attribute here that is used
        //  for (X)HTML. Note the '$setAttribute()' call to avoid calling back
        //  into ourself here. Note also how we do *not* signal change here.
        this.$setAttribute('disabled', true, false);
    } else {
        this.removeAttribute('disabled');
    }

    return this.$isInState('pclass:disabled', beDisabled);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setAttrFocused',
function(beFocused) {

    /**
     * @method setAttrFocused
     * @summary The setter for the receiver's focus state.
     * @param {Boolean} beFocused Whether or not the receiver is in a focus
     *     state.
     * @returns {Boolean} Whether the receiver's state is focused.
     */

    return this.$isInState('pclass:focus', beFocused);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary The setter for the receiver's hidden state.
     * @param {Boolean} beHidden Whether or not the receiver is in a hidden
     *     state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    this.$isInState('pclass:hidden', beHidden);

    if (TP.isTrue(beHidden)) {
        this.signalAfterUnwind('TP.sig.UIDidHide');
    } else {
        this.signalAfterUnwind('TP.sig.UIDidShow');
    }

    return this.$isInState('pclass:hidden');
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setAttrInvalid',
function(beInvalid) {

    /**
     * @method setAttrInvalid
     * @summary The setter for the receiver's invalid state.
     * @param {Boolean} beInvalid Whether or not the receiver is in a invalid
     *     state.
     * @returns {Boolean} Whether the receiver's state is invalid.
     */

    return this.$isInState('pclass:invalid', beInvalid);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setAttrOfOutRange',
function(beOutOfRange) {

    /**
     * @method setAttrOfOutRange
     * @summary The setter for the receiver's out-of-range state.
     * @param {Boolean} beOutOfRange Whether or not the receiver is in a
     *     out-of-range state.
     * @returns {Boolean} Whether the receiver's state is out-of-range.
     */

    return this.$isInState('pclass:out-of-range', beOutOfRange);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setAttrReadonly',
function(beReadonly) {

    /**
     * @method setAttrReadonly
     * @summary The setter for the receiver's readonly state.
     * @param {Boolean} beReadonly Whether or not the receiver is in a readonly
     *     state.
     * @returns {Boolean} Whether the receiver's state is readonly.
     */

    return this.$isInState('pclass:readonly', beReadonly);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setAttrRequired',
function(beRequired) {

    /**
     * @method setAttrRequired
     * @summary The setter for the receiver's required state.
     * @param {Boolean} beRequired Whether or not the receiver is in a required
     *     state.
     * @returns {Boolean} Whether the receiver's state is required.
     */

    return this.$isInState('pclass:required', beRequired);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('setAttrSelected',
function(beSelected) {

    /**
     * @method setAttrSelected
     * @summary The setter for the receiver's selected state.
     * @param {Boolean} beSelected Whether or not the receiver is in a selected
     *     state.
     * @returns {Boolean} Whether the receiver's state is selected.
     */

    return this.$isInState('pclass:selected', beSelected);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('toggle',
function(stateName) {

    /**
     * @method toggle
     * @summary Toggles the value for a particular piece of the receiver's
           state.
     * @param {String} stateName The name of the piece of state to toggle.
     * @returns {Boolean} The value of the piece of state after toggling it.
     */

    if (TP.isTrue(TP.bc(this.getAttribute(stateName)))) {
        this.setAttribute(stateName, false);
    } else {
        this.setAttribute(stateName, true);
    }

    return TP.bc(this.getAttribute(stateName));
});

//  ------------------------------------------------------------------------
//  DISPLAY SUPPORT
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('blur',
function() {

    /**
     * @method blur
     * @summary Blurs the receiver for keyboard input.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var node;

    node = this.getNativeNode();

    //  Note that we do not need to set our 'focused' attribute to 'false'
    //  here, since our event handler defined on our type does that whenever
    //  this node is focused, whether by this mechanism or some other user
    //  interaction.

    //  This will invoke the entire chain of events of blurring. See the
    //  'onblur' method as the starting point.
    if (TP.canInvoke(node, 'blur')) {
        node.blur();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('focus',
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
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var node;

    node = this.getNativeNode();

    //  Note that we do not need to set our 'focused' attribute to 'true'
    //  here, since the signal handler for 'TP.sig.UIFocus' does that
    //  whenever this node is focused, whether by this mechanism or some
    //  other user interaction.

    //  This will invoke the entire chain of events of focusing. See the
    //  'onfocus' method as the starting point.
    if (TP.canInvoke(node, 'focus')) {
        node.focus();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('select',
function() {

    /**
     * @method select
     * @summary Selects the receiver for keyboard input (this also focuses the
     *     receiver).
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var node;

    node = this.getNativeNode();

    //  Set our attributes so that the proper visuals, etc. are showing that
    //  we are both selected and focused.

    this.setAttrSelected(true);
    this.setAttrFocused(true);

    //  TODO: Should we also invoke 'focus' here? If so, we won't need to
    //  set 'selected' above since the focus handler does that.

    if (TP.canInvoke(node, 'select')) {
        node.select();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('toggleSelectedItem',
function(oldItem, newItem) {

    /**
     * @method toggleSelectedItem
     * @summary Sets the old item to be deselected and the new item to be
     *     selected.
     * @param {Element} oldItem The old element to deselect.
     * @param {Element} newItem The new element to select.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.UIElementNode} The receiver.
     */

    if (!TP.isElement(oldItem) || !TP.isElement(newItem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    TP.wrap(oldItem).set('selected', false);
    TP.wrap(newItem).set('selected', true);

    return this;
});

//  ------------------------------------------------------------------------
//  UI ACCESSORY DISPLAY
//  ------------------------------------------------------------------------

/*
Per XForms there are several "accessories" (our terminology) which can be
associated with an element. In particular, there is help, hint, and alert
content which can be associated with the element for display when particular
states or events are triggered. We add "busy" to this so that an element can
also be provided with content to display while loading data or performing
other processing that keeps its normal UI from being displayed.
*/

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('displayAlert',
function(content) {

    /**
     * @method displayAlert
     * @summary Displays alert content for the receiver, if any.
     * @param {String} content The alert content to be displayed.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    //  At this level, we just log out the content.
    TP.ifInfo() ? TP.info('alert: ' + content, TP.LOG) : 0;

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('displayBusy',
function(content) {

    /**
     * @method displayBusy
     * @summary Displays busy content for the receiver, if any.
     * @param {String} content The busy content to be displayed.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    TP.elementShowBusyMessage(this.getNativeNode(), content);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('displayHelp',
function(content) {

    /**
     * @method displayHelp
     * @summary Displays help content for the receiver, if any.
     * @param {String} content The help content to be displayed.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    //  At this level, we just log out the content.
    TP.ifInfo() ? TP.info('help: ' + content, TP.LOG) : 0;

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('displayHint',
function(content) {

    /**
     * @method displayHint
     * @summary Displays hint content for the receiver, if any.
     * @param {String} content The hint content to be displayed.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    //  At this level, we just log out the content.
    TP.ifInfo() ? TP.info('hint: ' + content, TP.LOG) : 0;

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('hideAlert',
function() {

    /**
     * @method hideAlert
     * @summary Hides alert content for the receiver, if any.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    //  At this level, we do nothing.

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('hideBusy',
function() {

    /**
     * @method hideBusy
     * @summary Hides busy content for the receiver, if any.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    TP.elementHideBusyMessage(this.getNativeNode());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('hideHelp',
function() {

    /**
     * @method hideHelp
     * @summary Hides help content for the receiver, if any.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    //  At this level, we do nothing.

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('hideHint',
function() {

    /**
     * @method hideHint
     * @summary Hides hint content for the receiver, if any.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    //  At this level, we do nothing.

    return this;
});

//  ------------------------------------------------------------------------
//  Focus Computation Handlers
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIFocusFirst',
function(aSignal) {

    /**
     * @method handleUIFocusFirst
     * @param {TP.sig.UIFocusFirst} aSignal The signal that caused this handler
     *     trip.
     */

    this.moveFocus(TP.FIRST);

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIFocusLast',
function(aSignal) {

    /**
     * @method handleUIFocusLast
     * @param {TP.sig.UIFocusLast} aSignal The signal that caused this handler
     *     trip.
     */

    this.moveFocus(TP.LAST);

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIFocusNext',
function(aSignal) {

    /**
     * @method handleUIFocusNext
     * @param {TP.sig.UIFocusNext} aSignal The signal that caused this handler
     *     trip.
     */

    this.moveFocus(TP.NEXT);

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIFocusPrevious',
function(aSignal) {

    /**
     * @method handleUIFocusPrevious
     * @param {TP.sig.UIFocusPrevious} aSignal The signal that caused this
     *     handler trip.
     */

    this.moveFocus(TP.PREVIOUS);

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIFocusFollowing',
function(aSignal) {

    /**
     * @method handleUIFocusFollowing
     * @param {TP.sig.UIFocusFollowing} aSignal The signal that caused this
     *     handler trip.
     */

    this.moveFocus(TP.FOLLOWING);

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIFocusPreceding',
function(aSignal) {

    /**
     * @method handleUIFocusPreceding
     * @param {TP.sig.UIFocusPreceding} aSignal The signal that caused this
     *     handler trip.
     */

    this.moveFocus(TP.PRECEDING);

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIFocusFirstInGroup',
function(aSignal) {

    /**
     * @method handleUIFocusFirstInGroup
     * @param {TP.sig.UIFocusFirstInGroup} aSignal The signal that caused this
     *     handler trip.
     */

    this.moveFocus(TP.FIRST_IN_GROUP);

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIFocusLastInGroup',
function(aSignal) {

    /**
     * @method handleUIFocusLastInGroup
     * @param {TP.sig.UIFocusLastInGroup} aSignal The signal that caused this
     *     handler trip.
     */

    this.moveFocus(TP.LAST_IN_GROUP);

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIFocusFirstInPreviousGroup',
function(aSignal) {

    /**
     * @method handleUIFocusFirstInPreviousGroup
     * @param {TP.sig.UIFocusFirstInPreviousGroup} aSignal The signal that
     *     caused this handler trip.
     */

    this.moveFocus(TP.FIRST_IN_PREVIOUS_GROUP);

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIFocusFirstInNextGroup',
function(aSignal) {

    /**
     * @method handleUIFocusFirstInNextGroup
     * @param {TP.sig.UIFocusFirstInNextGroup} aSignal The signal that
     *     caused this handler trip.
     */

    this.moveFocus(TP.FIRST_IN_NEXT_GROUP);

    return;
});

//  ------------------------------------------------------------------------
//  Action Event Handlers
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIActivate',
function(aSignal) {

    /**
     * @method handleUIActivate
     * @param {TP.sig.UIActivate} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrActive(true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIAlert',
function(aSignal) {

    /**
     * @method handleUIAlert
     * @summary Causes alert content to be displayed for the receiver. The
     *     alert content should be encoded into the signal payload.
     * @param {TP.sig.UIAlert} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.displayAlert(aSignal.getPayload().at('msg'));

        this.signalAfterUnwind('TP.sig.UIDidAlert');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIBlur',
function(aSignal) {

    /**
     * @method handleUIBlur
     * @summary Blurs the receiver's native control. For some controls this has
     *     the side-effect of deselecting any selections in the control.
     * @param {TP.sig.UIBlur} aSignal The signal that caused this handler to
     *     trip.
     */

    var focusingTPElem;

    //  The receiver is the currently focused element, but TIBET's focus
    //  navigation machinery stashes a reference to the element we're going to
    //  next. If we're blurring but not coming through the TIBET focus manager,
    //  this will be null.

    focusingTPElem = this.getType().get('$focusingTPElement');

    if (!this.shouldPerformUIHandler(aSignal) ||
        !this.yieldFocusedResponder(focusingTPElem)) {

        aSignal.preventDefault();

        return;
    }

    //  Go ahead and tell ourself to resign from being the focused responder
    this.resignFocusedResponder();

    //  We're blurring... set 'focused' and 'selected' to false
    this.setAttrFocused(false);
    this.setAttrSelected(false);

    this.signalAfterUnwind('TP.sig.UIDidBlur');

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIBusy',
function(aSignal) {

    /**
     * @method handleUIBusy
     * @summary Causes the receiver to be put into its 'busy state'. Content to
     *     be displayed as part of being busy should be encoded into the signal
     *     payload.
     * @param {TP.sig.UIBusy} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrBusy(true, aSignal.getPayload().at('msg'));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIClose',
function(aSignal) {

    /**
     * @method handleUIClose
     * @summary Causes the receiver to be put into its 'closed state'.
     * @param {TP.sig.UIClose} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrClosed(true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUICollapse',
function(aSignal) {

    /**
     * @method handleUICollapse
     * @summary Collapses the receiver, if that's an appropriate action.
     * @param {TP.sig.UICollapse} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrCollapsed(true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIDeactivate',
function(aSignal) {

    /**
     * @method handleUIDeactivate
     * @param {TP.sig.UIDeactivate} aSignal The signal that caused this handler
     *     to trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrActive(false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIDelete',
function(aSignal) {

    /**
     * @method handleUIDelete
     * @param {TP.sig.UIDelete} aSignal The signal that caused this handler to
     *     trip.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIDeselect',
function(aSignal) {

    /**
     * @method handleUIDeselect
     * @summary Deselects the receiver's native data.
     * @param {TP.sig.UIDeselect} aSignal The signal that caused this handler to
     *     trip.
     */

    var node;

    if (this.shouldPerformUIHandler(aSignal)) {
        node = this.getNativeNode();

        //  focus and blur are handled by setAttrSelected when implemented
        if (TP.canInvoke(this, 'setAttrSelected')) {
            this.setAttrSelected(false);
        } else if (TP.canInvoke(node, 'blur')) {
            this.getNativeNode().blur();
        }

        this.removeAttribute('selected');

        this.signalAfterUnwind('TP.sig.UIDidDeselect');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIDidBlur',
function(aSignal) {

    /**
     * @method handleUIDidBlur
     * @param {TP.sig.UIDidBlur} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
    //  alert('got to did blur');
        void 0;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIDidFocus',
function(aSignal) {

    /**
     * @method handleUIDidFocus
     * @param {TP.sig.UIDidFocus} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
    //  alert('got to did focus');
        void 0;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIDidPopFocus',
function(aSignal) {

    /**
     * @method handleUIDidPopFocus
     * @param {TP.sig.UIDidPopFocus} aSignal The signal that caused this
     *     handler to trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        void 0;

        /*
        TP.ifInfo() ?
            TP.info('Popped the focus stack. Stack now has:\n' +
                 $focus_stack.collect(
                     function (item) {return item.asString()}).join('\n'),
                TP.LOG) : 0;
        */
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIDidPushFocus',
function(aSignal) {

    /**
     * @method handleUIDidPushFocus
     * @param {TP.sig.UIDidPushFocus} aSignal The signal that caused this
     *     handler to trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        void 0;

        /*
        TP.ifInfo() ?
            TP.info('Pushed the focus stack. Stack now has:\n' +
                 $focus_stack.collect(
                     function (item) {return item.asString()}).join('\n'),
                TP.LOG) : 0;
        */
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIDisabled',
function(aSignal) {

    /**
     * @method handleUIDisabled
     * @summary Causes the receiver to be put into its 'disabled state'.
     * @param {TP.sig.UIDisabled} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrDisabled(true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIDuplicate',
function(aSignal) {

    /**
     * @method handleUIDuplicate
     * @param {TP.sig.UIDuplicate} aSignal The signal that caused this handler
     *     to trip.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIEnabled',
function(aSignal) {

    /**
     * @method handleUIEnabled
     * @summary Causes the receiver to be put into its 'enabled state'.
     * @param {TP.sig.UIEnabled} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrDisabled(false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIExpand',
function(aSignal) {

    /**
     * @method handleUIExpand
     * @summary Expands the receiver, if that's an appropriate action.
     * @param {TP.sig.UIExpand} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrCollapsed(false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIFocus',
function(aSignal) {

    /**
     * @method handleUIFocus
     * @summary Focuses the receiver's native control.
     * @param {TP.sig.UIFocus} aSignal The signal that caused this handler to
     *     trip.
     */

    if (!this.shouldPerformUIHandler(aSignal) ||
        !this.acceptFocusedResponder()) {

        aSignal.preventDefault();

        return;
    }

    //  Go ahead and tell ourself to become the focused responder
    this.becomeFocusedResponder();

    //  We're focusing... set 'focused' to true
    this.setAttrFocused(true);

    this.signalAfterUnwind('TP.sig.UIDidFocus');

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIFocusAndSelect',
function(aSignal) {

    /**
     * @method handleUIFocusAndSelect
     * @summary Focuses the receiver, and selects its active content.
     * @param {TP.sig.UIFocusAndSelect} aSignal The signal that caused this
     *     handler to trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        if (!this.acceptFocusedResponder()) {
            aSignal.preventDefault();
        } else {
            //  NB: This should automatically focus and, through a series of
            //  events, 'handleUIFocus' above will be called.
            this.select();
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIHelp',
function(aSignal) {

    /**
     * @method handleUIHelp
     * @summary Causes help content to be displayed for the receiver. The help
     *     content should be encoded into the signal payload.
     * @param {TP.sig.UIHelp} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.displayHelp(aSignal.getPayload().at('msg'));

        this.signalAfterUnwind('TP.sig.UIDidHelp');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIHide',
function(aSignal) {

    /**
     * @method handleUIHide
     * @summary Hides the receiver, if that's an appropriate action.
     * @param {TP.sig.UIHide} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrHidden(true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIHint',
function(aSignal) {

    /**
     * @method handleUIHint
     * @summary Causes hint content to be displayed for the receiver. The hint
     *     content should be encoded into the signal payload.
     * @param {TP.sig.UIHint} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.displayHint(aSignal.getPayload().at('msg'));

        this.signalAfterUnwind('TP.sig.UIDidHint');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIIdle',
function(aSignal) {

    /**
     * @method handleUIIdle
     * @summary Causes the receiver to be put into its 'idle state'.
     * @param {TP.sig.UIIdle} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrBusy(false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIInRange',
function(aSignal) {

    /**
     * @method handleUIInRange
     * @summary Causes the receiver to be put into its 'in range state'.
     * @param {TP.sig.UIInRange} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrOfOutRange(false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIInsert',
function(aSignal) {

    /**
     * @method handleUIInsert
     * @param {TP.sig.UIInsert} aSignal The signal that caused this handler to
     *     trip.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIInvalid',
function(aSignal) {

    /**
     * @method handleUIInvalid
     * @summary Causes the receiver to be put into its 'invalid state'.
     * @param {TP.sig.UIInvalid} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrInvalid(true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIOpen',
function(aSignal) {

    /**
     * @method handleUIOpen
     * @summary Causes the receiver to be put into its 'open state'.
     * @param {TP.sig.UIOpen} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrClosed(false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIOptional',
function(aSignal) {

    /**
     * @method handleUIOptional
     * @summary Causes the receiver to be put into its 'optional state'.
     * @param {TP.sig.UIOptional} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrRequired(false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIOutOfRange',
function(aSignal) {

    /**
     * @method handleUIOutOfRange
     * @summary Causes the receiver to be put into its 'out of range state'.
     * @param {TP.sig.UIOutOfRange} aSignal The signal that caused this handler
     *     to trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrOfOutRange(true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIReadonly',
function(aSignal) {

    /**
     * @method handleUIReadonly
     * @summary Causes the receiver to be put into its 'read only state'.
     * @param {TP.sig.UIReadonly} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrReadonly(true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIReadwrite',
function(aSignal) {

    /**
     * @method handleUIReadwrite
     * @summary Causes the receiver to be put into its 'read write state'.
     * @param {TP.sig.UIReadwrite} aSignal The signal that caused this handler
     *     to trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrReadonly(false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIRequired',
function(aSignal) {

    /**
     * @method handleUIRequired
     * @summary Causes the receiver to be put into its 'required state'.
     * @param {TP.sig.UIRequired} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrRequired(true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIScroll',
function(aSignal) {

    /**
     * @method handleUIScroll
     * @param {TP.sig.UIScroll} aSignal The signal that caused this handler to
     *     trip.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUISelect',
function(aSignal) {

    /**
     * @method handleUISelect
     * @summary Deselects the receiver's native data.
     * @param {TP.sig.UISelect} aSignal The signal that caused this handler to
     *     trip.
     */

    var node;

    if (this.shouldPerformUIHandler(aSignal)) {
        node = this.getNativeNode();

        //  focus and blur are handled by setAttrSelected when implemented
        if (TP.canInvoke(this, 'setAttrSelected')) {
            this.setAttrSelected(true);
        } else if (TP.canInvoke(node, 'focus')) {
            node.focus();
        }

        this.setAttribute('selected', 'true');

        this.signalAfterUnwind('TP.sig.UIDidSelect');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIShow',
function(aSignal) {

    /**
     * @method handleUIShow
     * @summary Shows the receiver, if that's an appropriate action.
     * @param {TP.sig.UIShow} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrHidden(false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIValid',
function(aSignal) {

    /**
     * @method handleUIValid
     * @summary Causes the receiver to be put into its 'valid state'.
     * @param {TP.sig.UIValid} aSignal The signal that caused this handler to
     *     trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrInvalid(false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('handleUIValueChange',
function(aSignal) {

    /**
     * @method handleUIValueChange
     * @param {TP.sig.UIValueChange} aSignal The signal that caused this
     *     handler to trip.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  Signaling Methods
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('configureSignalFromAttributes',
function(aSignal) {

    /**
     * @method configureSignalFromAttributes
     * @summary Configures the supplied signal according to any 'ev:'
     *     attributes present on the receiver. These might include attributes to
     *     stop propagation of the signal, prevent the receiver from performing
     *     its default action for that kind of signal or configure the receiver
     *     to perform its action during the capturing phase of the signal
     *     processing.
     * @param {TP.sig.ResponderSignal} aSignal The signal to configure from any
     *     present 'ev:' attributes on the receiver.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    if (this.shouldStopSignal(aSignal)) {
        aSignal.stopPropagation();
    }

    if (this.shouldPreventSignal(aSignal)) {
        aSignal.preventDefault();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('shouldCaptureSignal',
function(aSignal) {

    /**
     * @method shouldCaptureSignal
     * @summary Returns whether or not the signal should be processed as a
     *     capturing signal based on whether the receiver has an 'ev:event'
     *     attribute that contains the supplied signal's name and an 'ev:phase'
     *     of 'capture'.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if it
     *     should be considered to be a 'capturing' signal.
     * @returns {Boolean} Whether or not the signal should be considered to be a
     *     'capturing' signal.
     */

    var node;

    node = this.getNativeNode();

    //  If our native node has an 'ev:event' attribute value matching that
    //  of the signal's name, then check to see if it has an 'ev:phase'
    //  attribute value of 'capture', which means that it would be capturing
    //  the signal.
    if (TP.elementHasAttributeValue(node,
                                    'ev:event',
                                    aSignal.getSignalName())) {
        if (TP.elementHasAttributeValue(node, 'ev:phase', 'capture')) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('shouldPerformUIHandler',
function(aSignal) {

    /**
     * @method shouldPerformUIHandler
     * @summary Returns whether or not the receiver should perform its UI
     *     handler. This method configures the signal from any 'ev:' attributes
     *     on the receiver and then returns true if the signal is *not*
     *     configured to prevent its default action.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if the
     *     receiver should perform its UI handler for the supplied signal.
     * @returns {Boolean} Whether or not the receiver should perform its UI
     *     handler for the supplied signal.
     */

    this.configureSignalFromAttributes(aSignal);

    return !aSignal.shouldPrevent();
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('shouldPreventSignal',
function(aSignal) {

    /**
     * @method shouldPreventSignal
     * @summary Returns whether or not the signal should be prevented from
     *     performing its default action based on whether the receiver has an
     *     'ev:event' attribute that contains the supplied signal's name and an
     *     'ev:defaultAction' of 'cancel'.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if it
     *     should be prevented.
     * @returns {Boolean} Whether or not the signal should be prevented.
     */

    var node;

    node = this.getNativeNode();

    //  If our native node has an 'ev:event' attribute value matching that
    //  of the signal's name, then check to see if it has an
    //  'ev:defaultAction' attribute value of 'cancel', which means that it
    //  would be cancelling the signal's default action.
    if (TP.elementHasAttributeValue(node,
                                    'ev:event',
                                    aSignal.getSignalName())) {
        if (TP.elementHasAttributeValue(node, 'ev:defaultAction', 'cancel')) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('shouldStopSignal',
function(aSignal) {

    /**
     * @method shouldStopSignal
     * @summary Returns whether or not the signal should be stopped from
     *     propagating based on whether the receiver has an 'ev:event' attribute
     *     that contains the supplied signal's name and an 'ev:propagate' of
     *     'stop'.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if it
     *     should be stopped.
     * @returns {Boolean} Whether or not the signal should be stopped.
     */

    var node;

    node = this.getNativeNode();

    //  If our native node has an 'ev:event' attribute value matching that
    //  of the signal's name, then check to see if it has an
    //  'ev:propagate' attribute value of 'stop', which means that it
    //  would be stopping propagation of the signal.
    if (TP.elementHasAttributeValue(node,
                                    'ev:event',
                                    aSignal.getSignalName())) {
        if (TP.elementHasAttributeValue(node, 'ev:propagate', 'stop')) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('signal',
function(aSignal, aPayload, aPolicy, aType, isCancelable,
isBubbling) {

    /**
     * @method signal
     * @summary Signals activity to registered observers. Any additional
     *     arguments are passed to the registered handlers along with the origin
     *     and event.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object (unused in this
     *     override).
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created
     *     (unused in this override).
     * @param {Boolean} isCancelable Optional flag for dynamic signals defining
     *     if they can be cancelled.
     * @param {Boolean} isBubbling Optional flag for dynamic signals defining
     *     whether they bubble (when using TP.DOM_FIRING).
     * @returns {TP.sig.Signal}
     */

    TP.stop('break.signal_dispatch');

    return this.dispatch(aSignal,
                            this.getNativeNode(),
                            aPayload,
                            aPolicy,
                            isCancelable,
                            isBubbling);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('signalAfterUnwind',
function(aSignal, aPayload, aPolicy, aType, isCancelable,
isBubbling) {

    /**
     * @method signalAfterUnwind
     * @summary Signals activity to registered observers, but does so after the
     *     stack is unwound. This is useful when the signaler doesn't care about
     *     the possibility that the signal could be cancelled and wants the UI
     *     to update before the signal is fired.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object (unused in this
     *     override).
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created
     *     (unused in this override).
     * @param {Boolean} isCancelable Optional flag for dynamic signals defining
     *     if they can be cancelled.
     * @param {Boolean} isBubbling Optional flag for dynamic signals defining
     *     whether they bubble (when using TP.DOM_FIRING).
     * @returns {TP.sig.Signal}
     */

    TP.stop('break.signal_dispatch');

    (function() {

        return this.dispatch(
                        aSignal,
                        aPayload,
                        aPolicy,
                        isCancelable,
                        isBubbling);
    }.bind(this)).afterUnwind();
});

//  ========================================================================
//  TP.core.NonNativeUIElementNode
//  ========================================================================

/**
 * @type {TP.core.NonNativeUIElementNode}
 * @summary A type that represents 'non-native' (to a User Agent) element nodes
 *     that need various things like stylesheets to be attached to a hosting DOM
 *     so that they can be rendered properly. This type is normally 'traited in'
 *     to other types.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('core.NonNativeUIElementNode');

//  ------------------------------------------------------------------------

TP.core.NonNativeUIElementNode.Type.defineMethod('tagAttachStyle',
function(aRequest) {

    /**
     * @method tagAttachStyle
     * @summary Sets up runtime style for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var doc;

    //  We see if the request has a target document. If so, we use that as the
    //  document.
    if (!TP.isDocument(doc = aRequest.at('doc'))) {
        //  TODO: Raise an exception
        return;
    }

    this.addStylesheetTo(doc);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
