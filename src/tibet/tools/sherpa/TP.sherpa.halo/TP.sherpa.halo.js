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
 * @type {TP.sherpa.halo}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('halo');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineAttribute('$wasShowing');
TP.sherpa.halo.Inst.defineAttribute('$isRecasting');
TP.sherpa.halo.Inst.defineAttribute('$wasFocused');

TP.sherpa.halo.Inst.defineAttribute('$lastTargetTPElem');

TP.sherpa.halo.Inst.defineAttribute('currentTargetTPElem');
TP.sherpa.halo.Inst.defineAttribute('currentTargetParentTPElem');

TP.sherpa.halo.Inst.defineAttribute('haloRect');

TP.sherpa.halo.Inst.defineAttribute('lastCorner');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.halo.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    TP.wrap(elem).setup();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('blur',
function() {

    /**
     * @method blur
     * @summary Removes the 'halo focus' from a target element. Note that this
     *     is different than showing/hiding the halo, although other halo
     *     machinery will usually hide the halo as part of a 'de-focusing'
     *     process that includes this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem;

    //  Grab the current target. If there's no current target, then just exit
    //  here.
    currentTargetTPElem = this.get('currentTargetTPElem');
    if (TP.notValid(currentTargetTPElem)) {
        return this;
    }

    if (TP.isValid(currentTargetTPElem)) {
        this.set('currentTargetTPElem', null);
        this.set('currentTargetParentTPElem', null);
    }

    //  Remove the class on the current halo target that allowed us to apply
    //  'halo style' to it.
    currentTargetTPElem.removeClass('sherpa-halo-haloed');

    this.signal('TP.sig.HaloDidBlur',
                TP.hc('haloTarget', currentTargetTPElem),
                TP.OBSERVER_FIRING);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('changeHaloFocusOnClick',
function(aSignal) {

    /**
     * @method changeHaloFocusOnClick
     * @summary Changes the halo focus depending on information in the supplied
     *     signal, which is some form of button click.
     * @param {TP.sig.DOMSignal} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var sigTarget,

        handledSignal,

        currentTargetTPElem,
        newTargetTPElem;

    sigTarget = aSignal.getTarget();

    handledSignal = false;

    currentTargetTPElem = this.get('currentTargetTPElem');

    //  If:
    //      a) We have an existing target
    //      b) AND: The user clicked the LEFT button
    //      c) AND: the existing target can blur
    if (TP.isValid(currentTargetTPElem) &&
        aSignal.getButton() === TP.LEFT &&
        currentTargetTPElem.haloCanBlur(this)) {

        //  NOTE: Make sure to hide the halo *before* we blur - this way any
        //  signal handlers that are watching the target element are properly
        //  shut down.
        this.setAttribute('hidden', true);
        this.blur();

        handledSignal = true;
    } else if (aSignal.getButton() === TP.RIGHT) {

        //  A Shift-Right-Click - we're shifting focus to a new element.

        newTargetTPElem = TP.wrap(sigTarget);

        //  If we have an existing target
        if (TP.isValid(currentTargetTPElem)) {

            //  If the Control key is being pressed, and the current target is
            //  either identical to the new one or it contains the new one, then
            //  we want to traverse 'up' the parent hierarchy.
            if (aSignal.getCtrlKey() &&
                (currentTargetTPElem.identicalTo(newTargetTPElem) ||
                currentTargetTPElem.contains(newTargetTPElem))) {

                //  Note here how we ask the *current* target for its nearest
                //  focusable element. The new target very well might at this
                //  point be a descendant of the current target and so asking it
                //  for its nearest focusable target will probably return either
                //  the current target or actually a descendant of the current
                //  target that is somewhere 'between' the two.

                newTargetTPElem = currentTargetTPElem.getNearestHaloFocusable(
                                                            this, aSignal);
            } else {

                //  The Control key is not being pressed, so we could use the
                //  new target. But first, we need to make sure it can be
                //  halo'ed on. If not, find it's nearest haloable element 'up'
                //  the parent hierarchy.
                if (!newTargetTPElem.haloCanFocus(this)) {
                    newTargetTPElem = newTargetTPElem.getNearestHaloFocusable(
                                                            this, aSignal);
                }
            }

        } else {

            //  No current target - completely new selection.

            //  If it can't be focused, traverse 'up' the parent hierarchy.
            if (!newTargetTPElem.haloCanFocus(this)) {
                newTargetTPElem = newTargetTPElem.getNearestHaloFocusable(
                                                                this, aSignal);
            }
        }

        //  Couldn't find a new target... exit.
        if (TP.notValid(newTargetTPElem)) {
            return this;
        }

        //  We computed a new target. If it's not the same as the current
        //  target, then blur the current one and focus on the new one.
        if (TP.isValid(newTargetTPElem) &&
            !newTargetTPElem.identicalTo(currentTargetTPElem)) {

            if (TP.isValid(currentTargetTPElem)) {
                this.blur();
            }

            this.focusOn(newTargetTPElem);

            //  This will 'unhide' the halo.
            this.setAttribute('hidden', false);

            handledSignal = true;
        }
    }

    //  If we actually handled the signal, then we need to clear whatever text
    //  selection might have gotten made. It seems that 'preventDefault()'ing
    //  the event (which we do in the callers of this method) doesn't quite do
    //  all of the right things.
    if (handledSignal) {
        if (TP.isValid(newTargetTPElem)) {
            TP.documentClearSelection(newTargetTPElem.getNativeDocument());
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('deleteTarget',
function() {

    /**
     * @method deleteTarget
     * @summary Deletes the current target element.
     * @returns {String} The TP.TSH_NO_VALUE value to avoid console output.
     */

    var currentTargetTPElem;

    //  No current target element? Exit here.
    currentTargetTPElem = this.get('currentTargetTPElem');
    if (TP.notValid(currentTargetTPElem)) {
        return TP.TSH_NO_VALUE;
    }

    //  Now, we have to make sure that we can delete the target
    if (!currentTargetTPElem.haloCanDelete(this)) {

        TP.alert('The halo\'ed element \'&lt;' +
                    currentTargetTPElem.getFullName() +
                    '/&gt;\' cannot be deleted');

        return TP.TSH_NO_VALUE;
    }

    //  Make sure to confirm this operation, since it's destructive.
    TP.confirm('Really delete the halo\'ed element?').then(
        function(shouldDelete) {

            if (shouldDelete) {

                //  Tell the main Sherpa object that it should go ahead and
                //  process DOM mutations to the source DOM.
                TP.bySystemId('Sherpa').set('shouldProcessDOMMutations', true);

                //  This will cause the 'MutationDetach' signal to fire, which
                //  will blur the halo, etc. See that handler for more
                //  information.
                currentTargetTPElem.detach();
            }
        });

    return TP.TSH_NO_VALUE;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('emptyTarget',
function() {

    /**
     * @method emptyTarget
     * @summary Empties the current target element of its content.
     * @returns {String} The TP.TSH_NO_VALUE value to avoid console output.
     */

    var currentTargetTPElem;

    //  No current target element? Exit here.
    currentTargetTPElem = this.get('currentTargetTPElem');
    if (TP.notValid(currentTargetTPElem)) {
        return TP.TSH_NO_VALUE;
    }

    //  Now, we have to make sure that we can empty the target
    if (!currentTargetTPElem.haloCanEmpty(this)) {

        TP.alert('The halo\'ed element \'&lt;' +
                    currentTargetTPElem.getFullName() +
                    '/&gt;\' cannot be emptied');

        return TP.TSH_NO_VALUE;
    }

    //  Make sure to confirm this operation, since it's destructive.
    TP.confirm('Really empty the halo\'ed element?').then(
        function(shouldEmpty) {

            if (shouldEmpty) {

                //  Tell the main Sherpa object that it should go ahead and
                //  process DOM mutations to the source DOM.
                TP.bySystemId('Sherpa').set('shouldProcessDOMMutations', true);

                currentTargetTPElem.empty();
            }
        });

    return TP.TSH_NO_VALUE;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('focusOn',
function(newTargetTPElem, shouldUnhide) {

    /**
     * @method focusOn
     * @summary Sets the 'halo focus' to the supplied target element. Note that
     *     this is different than showing/hiding the halo, although other halo
     *     machinery may show the halo as part of a 'focusing' process that
     *     includes this method.
     * @description Note that this method does *not* check to see if the halo
     *     can be blurred or focused. That is left up to the caller.
     * @param {TP.dom.ElementNode} newTargetTPElem The element to focus the
     *     halo on.
     * @param {Boolean} [shouldUnhide=false] Whether or not the halo should be
     *     shown if it's hidden. Some scenarios allow the halo to be hidden, but
     *     still focused.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem,
        currentTargetParentTPElem;

    currentTargetTPElem = this.get('currentTargetTPElem');

    //  If we got a valid TP.dom.ElementNode, then we need to go through the
    //  focusing process.
    if (TP.isKindOf(newTargetTPElem, TP.dom.ElementNode)) {

        //  If it's the same element, then just return
        if (currentTargetTPElem === newTargetTPElem) {
            return this;
        }

        //  Set the current halo target to be the target passed in.
        this.set('currentTargetTPElem', newTargetTPElem);

        //  Now that we set the halo target, move and size the halo to the
        //  target.
        this.moveAndSizeToTarget(newTargetTPElem, shouldUnhide);

        //  Set a class on the current halo target that allows us to apply 'halo
        //  style' to it.
        newTargetTPElem.addClass('sherpa-halo-haloed');

        this.signal('TP.sig.HaloDidFocus',
                    TP.hc('haloTarget', newTargetTPElem),
                    TP.OBSERVER_FIRING);

    } else if (TP.isValid(currentTargetTPElem)) {

        //  Otherwise, just blur the existing target.
        this.blur();
    } else {
        //  Empty. No existing target
    }

    //  If we have a current target at the end of this process (either existing
    //  or now), then calculate the halo parent for it and stash it away. Having
    //  the halo parent is useful in other scenarios when we're deleting the
    //  current target, etc.
    currentTargetTPElem = this.get('currentTargetTPElem');

    if (TP.isValid(currentTargetTPElem)) {
        currentTargetParentTPElem = currentTargetTPElem.getHaloParent(this);
        this.set('currentTargetParentTPElem', currentTargetParentTPElem);
    } else {
        this.set('currentTargetParentTPElem', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('CanvasChanged',
function(aSignal) {

    /**
     * @method handleCanvasChanged
     * @summary Handles notifications of the canvas changing from the Sherpa
     *     object.
     * @param {TP.sig.CanvasChanged} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem;

    //  If the signal has an attribute name, then go ahead and process it.
    //  Otherwise, its a change to a whole Node and our
    //  MutationAttach/MutationDetach handlers will process it. No sense in
    //  doing double notification.

    if (TP.notEmpty(aSignal.at('attrName'))) {
        //  If we're not hidden, then we move and resize to our target. It's
        //  size and position might very well have changed due to style changes
        //  in the document.
        if (TP.isFalse(this.getAttribute('hidden'))) {
            currentTargetTPElem = this.get('currentTargetTPElem');
            this.moveAndSizeToTarget(currentTargetTPElem);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DocumentLoaded',
function(aSignal) {

    /**
     * @method handleDocumentLoaded
     * @summary Handles when the document in the current UI canvas loads.
     * @param {TP.sig.DocumentLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    this.observe(TP.sys.uidoc(),
                    TP.ac('TP.sig.DOMClick', 'TP.sig.DOMContextMenu'));

    this.setupInjectedStyleSheet();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DocumentUnloaded',
function(aSignal) {

    /**
     * @method handleDocumentUnloaded
     * @summary Handles when the document in the current UI canvas unloads.
     * @param {TP.sig.DocumentUnloaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    this.ignore(TP.sys.uidoc(),
                    TP.ac('TP.sig.DOMClick', 'TP.sig.DOMContextMenu'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('MutationAttach',
function(aSignal) {

    /**
     * @method handleMutationAttach
     * @summary Handles notifications of node attachment from the overall canvas
     *     that the halo is working with.
     * @param {TP.sig.MutationAttach} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var mutatedIDs,

        newTargetTPElem,
        currentTargetTPElem;

    if (TP.isEmpty(mutatedIDs = aSignal.at('mutatedNodeIDs'))) {
        return this;
    }

    newTargetTPElem = TP.bySystemId(mutatedIDs.last());
    if (TP.notValid(newTargetTPElem) ||
        TP.notValid(TP.unwrap(newTargetTPElem)[TP.SHERPA_MUTATION])) {
        return this;
    }

    currentTargetTPElem = this.get('currentTargetTPElem');

    //  If the new target is not the same as the current target (which in all
    //  likelihood will not be), then we refocus ourself onto the newly inserted
    //  node as our target.
    if (!newTargetTPElem.identicalTo(currentTargetTPElem)) {

        //  See if we can focus the new target element - if not, we'll search up
        //  the parent chain for the nearest focusable element
        if (!newTargetTPElem.haloCanFocus(this)) {
            newTargetTPElem = newTargetTPElem.getNearestHaloFocusable(this);
        }

        //  Couldn't find a focusable target... exit.
        if (TP.notValid(newTargetTPElem)) {
            return this;
        }

        if (TP.isKindOf(newTargetTPElem, TP.dom.ElementNode) &&
            !newTargetTPElem.identicalTo(currentTargetTPElem)) {

            //  This will move the halo off of the old element. Note that we do
            //  *not* check here whether or not we *can* blur - we definitely
            //  want to blur off of the old DOM content - it's probably gone now
            //  anyway.
            this.blur();

            //  If we can't focus on the new target, then hide the halo and exit
            //  here.
            if (!newTargetTPElem.haloCanFocus(this)) {
                //  This will 'hide' the halo.
                this.setAttribute('hidden', true);

                return this;
            }

            //  This will move the halo to the new element.
            this.focusOn(newTargetTPElem);
        }

        //  This will 'unhide' the halo.
        this.setAttribute('hidden', false);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('MutationDetach',
function(aSignal) {

    /**
     * @method handleMutationDetach
     * @summary Handles notifications of node detachment from the overall canvas
     *     that the halo is working with.
     * @param {TP.sig.MutationDetach} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var sigOriginTPDoc,

        currentTargetTPElem,

        currentTargetLocalID,

        mutatedIDs,

        currentTargetGlobalID,

        currentTargetParentTPElem,

        newTargetTPElem;

    //  We don't want to do the back and forth with the halo if we're just
    //  recasting the target.
    if (TP.isTrue(this.get('$isRecasting'))) {
        return this;
    }

    currentTargetTPElem = this.get('currentTargetTPElem');
    if (!TP.isKindOf(currentTargetTPElem, TP.dom.ElementNode)) {
        return this;
    }

    //  Grab the signal origin (which is a TP.dom.DocumentNode).
    sigOriginTPDoc = aSignal.getOrigin();

    //  Grab the current halo target's ID.
    currentTargetLocalID = currentTargetTPElem.getLocalID();

    //  If there were nodes that changed as part of this detachment that can be
    //  determined by their node IDs, then process those first.
    if (TP.notEmpty(mutatedIDs = aSignal.at('mutatedNodeIDs'))) {

        //  Grab the current halo target's ID.
        currentTargetGlobalID = currentTargetTPElem.getID();

        //  If the current halo target's ID is in the list of mutated nodes that
        //  got detached, then that could mean 2 things:
        //      1. An ancestor of the current halo target got detached, taking
        //      the current halo target with it. Therefore, it is in the
        //      collection of nodes that got removed.
        //      2. The halo target itself (and including itself) was the
        //      'top-level' node that got detached. In this case, due to how
        //      TIBET node compilation works, a new 'version' of the node will
        //      be present in the DOM, with the *same ID* as the halo target. In
        //      this case, we just need to blur/focus the halo, causing it to
        //      refocus onto the new version of the node.
        if (mutatedIDs.contains(currentTargetGlobalID)) {

            //  Capture this before we blur.
            currentTargetParentTPElem = this.get('currentTargetParentTPElem');

            //  Blur off of the 'old' target element. It's no longer part of our
            //  DOM anyway. Note that we do *not* check here whether or not we
            //  *can* blur - we definitely want to blur off of the old DOM
            //  content - it's probably gone now anyway.
            this.blur();

            //  See if we can 'reacquire' a new target element, but ones that
            //  uses the same ID as the old target in the DOM. If we can, then
            //  we're in case #2 above. If we cannot, then we're in case #1.
            newTargetTPElem = TP.byId(currentTargetLocalID, sigOriginTPDoc);

            //  If we got one, then focus on it - otherwise, make sure that
            //  we're hidden.
            if (TP.isKindOf(newTargetTPElem, TP.dom.Node) &&
                newTargetTPElem.haloCanFocus(this)) {

                this.focusOn(newTargetTPElem);

                //  This will 'unhide' the halo.
                this.setAttribute('hidden', false);
            } else {

                //  If we have a reference to the deleting element's halo
                //  parent, then focus on that. Otherwise, hide the halo.
                if (TP.isValid(currentTargetParentTPElem) &&
                    currentTargetParentTPElem.haloCanFocus(this)) {
                    this.focusOn(currentTargetParentTPElem);
                } else {
                    //  This will 'hide' the halo.
                    this.setAttribute('hidden', true);
                }
            }

            //  We handled this detachment signal - exit
            return this;
        }
    }

    //  Next, we see if the halo target element is still somewhere in the DOM,
    //  even if it or one of its ancestors didn't get removed. In this case, we
    //  move and resize the halo, since almost assuredly the halo target element
    //  would have moved.

    if (!currentTargetTPElem.isDetached()) {
        this.moveAndSizeToTarget(currentTargetTPElem);

        //  We handled this detachment signal - exit
        return this;
    }

    //  If we have a reference to the deleting element's halo parent, then focus
    //  on that.
    currentTargetParentTPElem = this.get('currentTargetParentTPElem');
    if (TP.isValid(currentTargetTPElem)) {
        this.focusOn(currentTargetTPElem);

        //  We handled this detachment signal - exit
        return this;
    }

    //  Otherwise, nothing else is possible. The halo target element is
    //  completely gone and we can't determine if it reappeared, so we just
    //  blur, hide ourself and exit.

    //  Note that we do *not* check here whether or not we *can* blur - we
    //  definitely want to blur off of the old DOM content - it's probably gone
    //  now anyway.
    this.blur();

    //  This will 'hide' the halo.
    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('MutationStyleChange',
function(aSignal) {

    /**
     * @method handleMutationStyleChange
     * @summary Handles notifications of node style changes from the overall
     *     canvas that the halo is working with.
     * @param {TP.sig.MutationStyleChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem;

    //  If we're not hidden, then we move and resize to our target. It's size
    //  and position might very well have changed due to style changes in the
    //  document.
    if (TP.isFalse(this.getAttribute('hidden'))) {
        currentTargetTPElem = this.get('currentTargetTPElem');
        this.moveAndSizeToTarget(currentTargetTPElem);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('NodeDidRecast',
function(aSignal) {

    /**
     * @method handleNodeDidRecast
     * @summary Handles notifications of when a node is finished being 'recast'
     *     by the TIBET tag processor. This allows the halo to provide feedback
     *     to the user that this is happening.
     * @param {TP.sig.NodeDidRecast} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var wasFocused,
        recastTPNode;

    wasFocused = this.get('$wasFocused');

    //  Blur ourself. This will remove any focusing that might exist on previous
    //  DOM content that is now gone. Note that we do *not* check here whether
    //  or not we *can* blur - we definitely want to blur off of the old DOM
    //  content - it's probably gone now anyway.
    this.blur();

    //  If we were focused, see if we can get a recasting target from the
    //  signal. If so, and it's a type of TP.dom.Node, then focus ourself on it.
    if (wasFocused) {
        recastTPNode = aSignal.at('recastTarget');
        if (TP.isKindOf(recastTPNode, TP.dom.Node)) {
            if (recastTPNode.haloCanFocus(this)) {
                this.focusOn(recastTPNode);
            }
        }
    }

    this.set('$isRecasting', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('NodeWillRecast',
function(aSignal) {

    /**
     * @method handleNodeWillRecast
     * @summary Handles notifications of when a node is about to be 'recast' by
     *     the TIBET tag processor. This allows the halo to provide feedback to
     *     the user that this is happening.
     * @param {TP.sig.NodeWillRecast} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    this.set('$isRecasting', true);
    this.set('$wasFocused', this.isFocused());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('ClosedChange',
function(aSignal) {

    /**
     * @method handleClosedChange
     * @summary Handles notifications of HUD closed change signals.
     * @param {TP.sig.ClosedChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var hud,
        hudIsHidden,

        wasHidden;

    //  Grab the HUD and see if it's currently open or closed.
    hud = TP.byId('SherpaHUD', this.getNativeWindow());
    hudIsHidden = TP.bc(hud.getAttribute('closed'));

    //  If the HUD is hidden, then we also hide ourself. But not before
    //  capturing whether we were 'currently showing' or not (i.e. the HUD can
    //  hide or show independent of us). Otherwise, if the HUD is showing, then
    //  we set ourself to whatever value we had when the HUD last hid.
    if (hudIsHidden) {
        wasHidden = TP.bc(this.getAttribute('hidden'));
        this.set('$wasShowing', !wasHidden);

        //  This will 'hide' the halo.
        this.setAttribute('hidden', true);
    } else {
        this.setAttribute('hidden', !this.get('$wasShowing'));
    }

    return this;
}, {
    origin: 'SherpaHUD'
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @summary Handles notifications of mouse click signals.
     * @param {TP.sig.DOMClick} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    //  In case the popup menu is open, close it.
    this.signal('ClosePopup');

    //  If the Shift key is down and the Alt key is not (otherwise we're drawing
    //  a connector) and we're not currently hidden, then change our
    //  focus based on a variety of key combinations and mouse button states.
    if (aSignal.getShiftKey() &&
        !aSignal.getAltKey() &&
        TP.notTrue(this.getAttribute('hidden'))) {

        aSignal.preventDefault();
        aSignal.stopPropagation();

        this.changeHaloFocusOnClick(aSignal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMContextMenu',
function(aSignal) {

    /**
     * @method handleDOMContextMenu
     * @summary Handles notifications of context menu signals.
     * @param {TP.sig.DOMContextMenu} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var signalGlobalPoint,
        haloGlobalRect,

        triggerTPDoc;

    //  If the Shift key is down, then change our focus based on a variety of
    //  key combinations and mouse button states.
    if (aSignal.getShiftKey()) {

        //  Make sure to prevent default to avoid having the context menu
        //  pop up.
        aSignal.preventDefault();
        aSignal.stopPropagation();

        //  In case the popup menu is open, close it.
        this.signal('ClosePopup');

        //  Change focus of the halo to a target element contained within the
        //  signal. Note that this will *not* affect whether the halo is
        //  currently showing or not, by design.
        this.changeHaloFocusOnClick(aSignal);

    } else {

        //  NB: We use global coordinates here as the halo and the signal
        //  that we're testing very well might have occurred in different
        //  documents.

        signalGlobalPoint = aSignal.getGlobalPoint();
        haloGlobalRect = this.getGlobalRect();

        if (haloGlobalRect.containsPoint(signalGlobalPoint)) {

            //  Make sure to prevent default to avoid having the context
            //  menu pop up.
            aSignal.preventDefault();
            aSignal.stopPropagation();

            triggerTPDoc = TP.tpdoc(this.getNativeDocument());

            this.signal(
                'OpenPopup',
                TP.hc(
                    'overlayID', 'SherpaContextMenuPopup',
                    'overlayCSSClass', 'sherpahalocontextmenu',
                    'contentID', 'SherpaHaloContextMenu',
                    'hideOn', 'SelectMenuItem',
                    'useTopLevelContentElem', true,
                    'trigger', aSignal,
                    'triggerTPDocument', triggerTPDoc,
                    'triggerPoint', signalGlobalPoint));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMMouseMove',
function(aSignal) {

    /**
     * @method handleDOMMouseMove
     * @summary Handles notifications of mouse move signals.
     * @param {TP.sig.DOMMouseMove} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    // this.showHaloCorner(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMMouseOver',
function(aSignal) {

    /**
     * @method handleDOMMouseOver
     * @summary Handles notifications of mouse over signals.
     * @param {TP.sig.DOMMouseOver} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    // this.showHaloCorner(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMMouseOut',
function(aSignal) {

    /**
     * @method handleDOMMouseOut
     * @summary Handles notifications of mouse out signals.
     * @param {TP.sig.DOMMouseOut} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    // this.hideHaloCorner();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMMouseWheel',
function(aSignal) {

    /**
     * @method handleDOMMouseWheel
     * @summary Handles notifications of mouse wheel signals.
     * @param {TP.sig.DOMMouseWheel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem,
        newTargetTPElem;

    //  If the Shift key is down, then change our focus based on a variety of
    //  key combinations and mouse button states.
    if (aSignal.getShiftKey()) {

        aSignal.preventDefault();

        if (aSignal.getWheelDelta().abs() > 0.5) {
            currentTargetTPElem = this.get('currentTargetTPElem');

            if (aSignal.getDirection() === TP.UP) {
                newTargetTPElem = currentTargetTPElem.getHaloParent(this);
            } else {
                newTargetTPElem = currentTargetTPElem.getNextHaloChild(
                                                                this, aSignal);
            }

            //  Couldn't find a new target... exit.
            if (TP.notValid(newTargetTPElem)) {
                return this;
            }

            //  See if we can focus the new target element - if not, we'll
            //  search up the parent chain for the nearest focusable element
            if (!newTargetTPElem.haloCanFocus(this)) {
                newTargetTPElem = newTargetTPElem.getNearestHaloFocusable(
                                                                this, aSignal);
            }

            //  Couldn't find a focusable target... exit.
            if (TP.notValid(newTargetTPElem)) {
                return this;
            }

            //  We computed a new target. If it's not the same as the current
            //  target, then blur the current one and focus on the new one.
            if (TP.isKindOf(newTargetTPElem, TP.dom.ElementNode) &&
                !newTargetTPElem.identicalTo(currentTargetTPElem)) {

                if (currentTargetTPElem.haloCanBlur(this)) {
                    //  This will move the halo off of the old element.
                    this.blur();

                    if (newTargetTPElem.haloCanFocus(this)) {
                        //  This will move the halo to the new element.
                        this.focusOn(newTargetTPElem);

                        //  NB: We don't worry about unhiding the halo here,
                        //  since it should've been already visible.
                    } else {
                        //  This will 'hide' the halo.
                        this.setAttribute('hidden', true);
                    }
                }
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMResize',
function(aSignal) {

    /**
     * @method handleDOMResize
     * @summary Handles notifications of document size changes from the overall
     *     canvas that the halo is working with.
     * @param {TP.sig.DOMResize} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem;

    //  If we're not hidden, then we move and resize to our target. It's size
    //  and position might very well have changed due to resizing changes in
    //  the document.
    if (TP.isFalse(this.getAttribute('hidden'))) {
        currentTargetTPElem = this.get('currentTargetTPElem');
        this.moveAndSizeToTarget(currentTargetTPElem);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('DOMScroll',
function(aSignal) {

    /**
     * @method handleDOMScroll
     * @summary Handles notifications of document scrolling changes from the
     *     overall canvas that the halo is working with.
     * @param {TP.sig.DOMScroll} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem;

    //  If we're not hidden, then we move and resize to our target. It's size
    //  and position might very well have changed due to scrolling changes in
    //  the document.
    if (TP.isFalse(this.getAttribute('hidden'))) {
        currentTargetTPElem = this.get('currentTargetTPElem');
        this.moveAndSizeToTarget(currentTargetTPElem);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('SherpaHaloToggle',
function(aSignal) {

    /**
     * @method handleSherpaHaloToggle
     * @summary Handles notifications of halo toggle signals.
     * @param {TP.sig.SherpaHaloToggle} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var targetTPElem;

    targetTPElem = this.get('currentTargetTPElem');

    //  If we current having a valid target, then capture it and hide & blur the
    //  halo
    if (TP.isValid(targetTPElem)) {

        this.set('$lastTargetTPElem', targetTPElem);

        //  This will 'hide' the halo.
        this.setAttribute('hidden', true);

        //  Note that we do *not* check here whether or not we *can* blur - we
        //  definitely want to blur off of the old DOM content - it's probably
        //  gone now anyway.
        this.blur();
    } else {

        //  See if there is a previously captured target.
        targetTPElem = this.get('$lastTargetTPElem');

        //  If there is no previously captured target, then use the body.
        if (TP.notValid(targetTPElem)) {
            targetTPElem =
                TP.sys.getUICanvas().getDocument().getBody();
        }

        //  If there is no body, then use the document element.
        if (TP.notValid(targetTPElem)) {
            targetTPElem =
                TP.sys.getUICanvas().getDocument().getDocumentElement();
        }

        //  If we actually got a target of some sort, then focus on it and
        //  unhide the halo
        if (TP.isValid(targetTPElem) && targetTPElem.haloCanFocus(this)) {
            this.focusOn(targetTPElem);

            //  This will 'unhide' the halo.
            this.setAttribute('hidden', false);
        }

        //  Null out any previously captured target.
        this.set('$lastTargetTPElem', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineHandler('ToggleScreen',
function(aSignal) {

    /**
     * @method handleToggleScreen
     * @summary Handles notifications of screen toggle signals.
     * @param {TP.sig.ToggleScreen} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var world,
        oldScreenTPWin,

        newScreen,
        newScreenTPWin;

    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());

    //  Grab the old screen TP.core.Window and ignore
    //  DocumentLoaded/DocumentUnloaded signals coming from it.
    oldScreenTPWin = world.get('selectedScreen').getContentWindow();
    this.ignore(oldScreenTPWin, TP.ac('DocumentLoaded', 'DocumentUnloaded'));

    //  Grab the new screen TP.core.Window and observe
    //  DocumentLoaded/DocumentUnloaded signals coming from it.
    newScreen = world.get('screens').at(aSignal.at('screenIndex'));

    if (TP.isValid(newScreen)) {
        newScreenTPWin = newScreen.getContentWindow();
        this.observe(newScreenTPWin,
                        TP.ac('DocumentLoaded', 'DocumentUnloaded'));
    }

    this.setupInjectedStyleSheet();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('hideHaloCorner',
function() {

    /**
     * @method hideHaloCorner
     * @summary Sets whether the current 'last corner' is hidden.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var lastCorner,
        elem;

    lastCorner = this.get('lastCorner');

    if (TP.isElement(elem = TP.byId('haloCorner-' + lastCorner,
                            this.get('$document'),
                            false))) {
        TP.elementHide(elem);
    }

    //  Reset it to null
    this.set('lastCorner', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('inspectTargetAspect',
function(aspectPathParts) {

    /**
     * @method inspectTargetAspect
     * @summary Shifts the focus of the Sherpa Inspector to the halo target's
     *     aspect pointed to by the supplied path parts.
     * @param {String[]} aspectPathParts The Array of path parts that make up
     *     the path to the aspect to be inspected.
     * @returns {String} The TP.TSH_NO_VALUE value to avoid console output.
     */

    var currentTargetTPElem,
        newTargetTPElem,

        pathParts;

    currentTargetTPElem = this.get('currentTargetTPElem');

    //  Note here how we go after the current halo target's nearest 'generator'.
    //  That will usually be its custom tag. If one cannot be found, it will be
    //  the current target's nearest 'parent'.
    newTargetTPElem = currentTargetTPElem.getNearestHaloGenerator(this);

    //  If we acquired a new target, then we blur off of our current target and
    //  focus on it.
    if (TP.isValid(newTargetTPElem)) {

        if (currentTargetTPElem.haloCanBlur(this)) {

            this.blur();

            if (newTargetTPElem.haloCanFocus(this)) {
                this.focusOn(newTargetTPElem);

                //  This will 'unhide' the halo.
                this.setAttribute('hidden', false);
            }
        }
    } else {
        //  Otherwise, we just keep the same target.
        newTargetTPElem = currentTargetTPElem;
    }

    //  Unshift the special '__TARGET__' identifier onto the front of the aspect
    //  path.
    pathParts = TP.copy(aspectPathParts);
    pathParts.unshift('__TARGET__');

    //  Fire the signal for the Inspector to pick up to shift its focus.
    this.signal('InspectObject',
                    TP.hc('targetObject', newTargetTPElem,
                            'targetPath', pathParts.join(TP.PATH_SEP),
                            'showBusy', true));

    return TP.TSH_NO_VALUE;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('isFocused',
function() {

    /**
     * @method isFocused
     * @summary Returns whether or not the halo is currently focused on a
     *     target.
     * @returns {Boolean} Whether or not the halo is focused.
     */

    return TP.isValid(this.get('currentTargetTPElem'));
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('moveAndSizeToTarget',
function(newTargetTPElem, shouldUnhide) {

    /**
     * @method moveAndSizeToTarget
     * @summary Moves and sizes the receiver to the supplied target element or
     *     to the current target if a new target element isn't supplied (the
     *     current target's visual location might have shifted).
     * @param {TP.dom.ElementNode|undefined} [newTargetTPElem] The new target
     *     to move and resize the receiver around.
     * @param {Boolean} [shouldUnhide=false] Whether or not the halo should be
     *     shown if it's hidden. Some scenarios allow the halo to be hidden, but
     *     still focused.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem,

        theRect,

        handler,

        ourRect,

        haloStyleElement,

        newTargetTPDoc;

    currentTargetTPElem = this.get('currentTargetTPElem');

    //  If we don't have a valid new target or a valid current target, then set
    //  haloRect to null and return here.
    if (TP.notValid(newTargetTPElem) && TP.notValid(currentTargetTPElem)) {
        //  No new target and no existing target either - reset the halo
        //  rectangle and bail out.
        this.set('haloRect', null);

        return this;
    }

    if (TP.notValid(newTargetTPElem)) {
        //  Grab rect for the existing target. Note that this will be supplied
        //  in *global* coordinates.
        theRect = currentTargetTPElem.getHaloRect(this);
    } else {
        //  If the target element isn't ready to render (maybe its stylesheet
        //  hasn't loaded yet), then set up a handler to wait for the element to
        //  signal a TP.sig.DOMReady signal and then invoke this method again.
        if (!newTargetTPElem.isReadyToRender()) {

            handler = function() {
                handler.ignore(newTargetTPElem, 'TP.sig.DOMReady');
                this.moveAndSizeToTarget(newTargetTPElem, shouldUnhide);
            }.bind(this);

            handler.observe(newTargetTPElem, 'TP.sig.DOMReady');

            return this;
        } else {
            newTargetTPElem.render();
        }

        //  Grab rect for the new target. Note that this will be supplied in
        //  *global* coordinates.
        theRect = newTargetTPElem.getHaloRect(this);
    }

    //  Given that the halo rect returned by one of the targets above is in
    //  *global* coordinates, we need to sure to adjust for the fact that
    //  the halo itself might be in a container that's positioned. We go to
    //  the halo's offset parent and get it's global rectangle.

    //  Note that we do this because the halo is currently hidden and won't
    //  give proper coordinates when computing relative to its offset
    //  parent.
    ourRect = this.getOffsetParent().getGlobalRect(false);

    theRect.subtractByPoint(ourRect.getXYPoint());

    //  Grab the style sheet that is associated with the halo.
    haloStyleElement =
        TP.styleSheetGetOwnerNode(this.getStylesheetForStyleResource());

    TP.cssElementSetCustomCSSPropertyValue(
        haloStyleElement,
        'sherpa|halo',
        '--sherpa-halo-top',
        theRect.getY() + 'px',
        null,
        false);

    TP.cssElementSetCustomCSSPropertyValue(
        haloStyleElement,
        'sherpa|halo',
        '--sherpa-halo-left',
        theRect.getX() + 'px',
        null,
        false);

    TP.cssElementSetCustomCSSPropertyValue(
        haloStyleElement,
        'sherpa|halo',
        '--sherpa-halo-width',
        theRect.getWidth() + 'px',
        null,
        false);

    TP.cssElementSetCustomCSSPropertyValue(
        haloStyleElement,
        'sherpa|halo',
        '--sherpa-halo-height',
        theRect.getHeight() + 'px',
        null,
        false);

    this.set('haloRect', theRect);

    this.removeAttribute('nonDisplayedTarget');
    this.removeAttribute('descendantOf');

    if (TP.isValid(newTargetTPElem)) {

        if (!newTargetTPElem.isDisplayed()) {
            this.setAttribute('nonDisplayedTarget', 'true');

            newTargetTPDoc = newTargetTPElem.getDocument();

            if (newTargetTPElem === newTargetTPDoc.getHead() ||
                newTargetTPDoc.getHead().contains(
                            newTargetTPElem, TP.IDENTITY)) {
                this.setAttribute('descendantOf', 'head');
            } else if (newTargetTPDoc.getBody().contains(
                            newTargetTPElem, TP.IDENTITY)) {
                this.setAttribute('descendantOf', 'body');
            }
        }
    }

    //  If we should unhide ourself, then do so.
    if (shouldUnhide) {
        //  This will 'unhide' the halo.
        this.setAttribute('hidden', false);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('openExternalEditor',
function(aspectPathParts) {

    /**
     * @method openExternalEditor
     * @summary Opens an external editor on the halo target's aspect pointed to
     *     by the supplied path parts.
     * @param {String[]} aspectPathParts The Array of path parts that make up
     *     the path to the aspect to be inspected.
     * @returns {String} The TP.TSH_NO_VALUE value to avoid console output.
     */

    var currentTargetTPElem,
        newTargetTPElem,

        aspect,
        uri,

        virtualLoc,
        editor,

        cmdVal;

    currentTargetTPElem = this.get('currentTargetTPElem');

    //  Note here how we go after the current halo target's nearest 'generator'.
    //  That will usually be its custom tag. If one cannot be found, it will be
    //  the current target's nearest 'parent'.
    newTargetTPElem = currentTargetTPElem.getNearestHaloGenerator(this);

    //  If we acquired a new target, then we blur off of our current target and
    //  focus on it.
    if (currentTargetTPElem !== newTargetTPElem && TP.isValid(newTargetTPElem)) {

        if (currentTargetTPElem.haloCanBlur(this)) {

            this.blur();

            if (newTargetTPElem.haloCanFocus(this)) {
                this.focusOn(newTargetTPElem);

                //  This will 'unhide' the halo.
                this.setAttribute('hidden', false);
            }
        }
    } else {
        //  Otherwise, we just keep the same target.
        newTargetTPElem = currentTargetTPElem;
    }

    aspect = aspectPathParts.first();

    //  Currently, we support two aspects: structure and style
    if (aspect === 'Structure') {
        uri = newTargetTPElem.getType().getResourceURI('template');
    } else if (aspect === 'Style') {
        uri = newTargetTPElem.getType().getResourceURI('style');
    }

    if (!TP.isURI(uri)) {
        TP.alert('The halo\'ed element \'&lt;' +
                    currentTargetTPElem.getFullName() +
                    '/&gt;\' has no external URI for aspect: ' + aspect);

        return TP.TSH_NO_VALUE;
    }

    //  Quote the URL in case it has funny characters.
    virtualLoc = uri.getVirtualLocation().quoted('\'');

    //  NOTE we pass the --editor flag here since it can be changed in the
    //  client via Sherpa config panels and only the client will know user's
    //  current choice.
    editor = TP.sys.cfg('cli.open.editor');
    cmdVal = ':cli open' +
                (TP.isEmpty(editor) ? ' --editor=' + editor : '') +
                ' ' + virtualLoc;

    (function() {
        TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmdVal);
    }).queueForNextRepaint(this.getNativeWindow());

    return TP.TSH_NO_VALUE;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary Sets the 'hidden' attribute of the receiver. This causes the
     *     halo to show or hide itself independent of whether it's focused or
     *     not.
     * @param {Boolean} beHidden Whether or not the halo should be hidden.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var wasHidden,
        doc;

    wasHidden = TP.bc(this.getAttribute('hidden'));

    if (wasHidden === beHidden) {
        //  Exit here - no need to call up to our supertype to toggle the
        //  attribute, since it already has the value we desire.
        return this;
    }

    //  Grab the current UI canvas document.
    doc = TP.sys.uidoc(true);

    if (TP.isTrue(beHidden)) {
        this.ignore(this, 'TP.sig.DOMMouseMove');
        this.ignore(this, 'TP.sig.DOMMouseOver');
        this.ignore(this, 'TP.sig.DOMMouseOut');

        this.ignore(TP.core.Mouse, 'TP.sig.DOMMouseWheel');

        this.ignore(TP.sys.getUICanvas().getDocument(),
                    TP.ac('TP.sig.MutationAttach',
                            'TP.sig.MutationDetach',
                            'TP.sig.MutationStyleChange'));

        this.ignore(this.getDocument(),
                    TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));
        this.ignore(TP.sys.getUICanvas().getDocument(),
                    TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));

        this.ignore(TP.bySystemId('Sherpa'), 'CanvasChanged');

        this.set('haloRect', null);

        //  Remove the CSS class from the UI canvas's document element that
        //  qualifies elements in the injected style element
        TP.elementRemoveClass(doc.documentElement, 'sherpa-halo');

        TP.bySystemId('Sherpa').getToolsLayer().removeAttribute('activetool');

    } else {

        //  If we don't have a valid target element, then we exit here *without
        //  calling up to our supertype*. We don't want the attribute to be
        //  toggled, but we don't have valid target to show the halo on.
        if (TP.notValid(this.get('currentTargetTPElem'))) {
            return this;
        }

        this.observe(this, 'TP.sig.DOMMouseMove');
        this.observe(this, 'TP.sig.DOMMouseOver');
        this.observe(this, 'TP.sig.DOMMouseOut');

        this.observe(TP.core.Mouse, 'TP.sig.DOMMouseWheel');

        this.observe(TP.sys.getUICanvas().getDocument(),
                    TP.ac('TP.sig.MutationAttach',
                            'TP.sig.MutationDetach',
                            'TP.sig.MutationStyleChange'));

        this.observe(this.getDocument(),
                        TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));
        this.observe(TP.sys.getUICanvas().getDocument(),
                        TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));

        this.observe(TP.bySystemId('Sherpa'), 'CanvasChanged');

        this.moveAndSizeToTarget(this.get('currentTargetTPElem'));

        //  Add the CSS class to the UI canvas's document element that qualifies
        //  elements in the injected style element
        TP.elementAddClass(doc.documentElement, 'sherpa-halo');

        TP.bySystemId('Sherpa').getToolsLayer().setAttribute(
                                                'activetool', this.getLocalID());
    }

    //  Need to 'call up' to make sure the attribute value is actually captured.
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('setCurrentTargetTPElem',
function(aTPElem) {

    /**
     * @method setCurrentTargetTPElem
     * @summary Sets the current target element.
     * @param {TP.dom.ElementNode} aTPElem The element to set the current target
     *     to.
     * @returns {TP.sherpa.halo} The receiver.
     */

    this.$set('currentTargetTPElem', aTPElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var world,
        currentScreenTPWin;

    this.observe(TP.ANY, 'SherpaHaloToggle');

    //  Observe the current UI canvas document for click & context menu
    this.observe(TP.sys.uidoc(),
                    TP.ac('TP.sig.DOMClick', 'TP.sig.DOMContextMenu'));

    //  Grab the world's current screen TP.core.Window and observe it for when
    //  it's document unloads & loads so that we can manage our click & context
    //  menu observations.
    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());
    this.observe(world, 'ToggleScreen');

    currentScreenTPWin = world.get('selectedScreen').getContentWindow();
    this.observe(currentScreenTPWin,
                    TP.ac('DocumentLoaded', 'DocumentUnloaded'));

    this.observe(TP.byId('SherpaHUD', this.getNativeWindow()),
                    'ClosedChange');

    this.observe(TP.ANY, TP.ac('NodeWillRecast', 'NodeDidRecast'));

    //  Make sure to initialize this to whatever our 'pclass:hidden' value is
    //  initially.
    this.set('$wasShowing', false);

    //  Set up the halo corners.
    this.setupHaloCorners();

    this.setupInjectedStyleSheet();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('setupHaloCorners',
function() {

    /**
     * @method setupHaloCorners
     * @summary Performs the setup for all of the halo 'corners'.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var haloNECorner;

    haloNECorner = TP.byId('haloCorner-Northeast', this.getNativeWindow());
    haloNECorner.defineMethod(
                    'getDNDSource',
                    function() {
                        return this;
                    });

    haloNECorner.defineMethod(
                    'getDragItem',
                    function() {
                        return TP.byCSSPath(
                        'sherpa|workbench sherpa|dispenser sherpa|dispenseritem',
                            this.getNativeDocument(),
                            true);
                    }.bind(this));

    haloNECorner.setAttribute('dnd:vend', 'dom_node');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('setupInjectedStyleSheet',
function() {

    /**
     * @method setupInjectedStyleSheet
     * @summary Set up the stylesheet that will be 'injected' into the UI canvas
     *     so that the halo can affect visual changes in the UI canvas.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var doc,
        haloStyleElement;

    doc = TP.sys.uidoc(true);

    haloStyleElement = TP.byId('halo_injected_generated', doc, false);

    if (!TP.isElement(haloStyleElement)) {
        haloStyleElement = TP.documentAddCSSElement(
            doc,
            TP.uc('~TP.sherpa.halo/TP.sherpa.halo_injected.css').getLocation(),
            true,
            false);

        TP.elementSetAttribute(
                haloStyleElement, 'id', 'halo_injected_generated');

        //  Mark the sheet as 'TIBET_PRIVATE' so that it's style rules are not
        //  considered when the element's style rules are computed.
        haloStyleElement[TP.TIBET_PRIVATE] = true;

        //  Mark this element as one that was generated by TIBET and shouldn't be
        //  considered in CSS queries, etc.
        haloStyleElement[TP.GENERATED] = true;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('showHaloCorner',
function(aSignal) {

    /**
     * @method showHaloCorner
     * @summary Sets whether a particular halo corner should be shown.
     * @param {TP.sig.DOMSignal} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var currentTargetTPElem,

        angle,
        corner,
        lastCorner,
        elem;

    if (TP.isFalse(this.get('open'))) {
        return this;
    }

    currentTargetTPElem = this.get('currentTargetTPElem');

    if (TP.notValid(currentTargetTPElem)) {
        //  No existing target either - bail out.
        return this;
    }

    angle = TP.computeAngleFromEnds(
                    currentTargetTPElem.getHaloRect(this).getCenterPoint(),
                    aSignal.getEvent());

    corner = TP.computeCompassCorner(angle, 8);

    lastCorner = this.get('lastCorner');

    if (corner !== lastCorner) {
        if (TP.isElement(elem =
                            TP.byId('haloCorner-' + lastCorner,
                            this.get('$document'),
                            false))) {
            TP.elementHide(elem);
        }

        if (TP.isElement(elem =
                            TP.byId('haloCorner-' + corner,
                            this.get('$document'),
                            false))) {
            TP.elementShow(elem);
        }
    }

    this.set('lastCorner', corner);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
