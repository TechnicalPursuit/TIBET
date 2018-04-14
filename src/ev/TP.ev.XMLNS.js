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
 * @type {ev:}
 * @summary This type represents the XML Events namespace
 *     (http://www.w3.org/2001/xml-events) in the tag processing system.
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('ev.XMLNS');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.ev.XMLNS.Type.defineMethod('$generateHandlerEntriesFor',
function(anElement, aSignalName, anObserver, aTarget, aHandler) {

    /**
     * @method $generateHandlerEntriesFor
     * @summary Generates handler entries for the supplied element and other
     *     parameters.
     * @param {Element} anElement The element containing the XML Events
     *     information.
     * @param {String} aSignalName The names of the events to arm the observers
     *     with. Note that this can be a space-separated list of events to
     *     register multiple events for the same set of observers. Note that
     *     this parameter assumes fully-expanded signal names (i.e.
     *     'TP.sig.'...).
     * @param {String} anObserver The ID(s) of the elements to set up as
     *     observers of the event(s) specified. Note that this can be a
     *     space-separated list of IDs to register multiple observers for the
     *     same event(s) and handler.
     * @param {String} aTarget The names of the target elements to arm as
     *     signalers of the supplied events. Note that this can be a
     *     space-separated list of IDs to register multiple targets for the same
     *     event(s) and observer(s).
     * @param {String} aHandler The ID of the handler element that will be
     *     activated when the event(s) (is/are) fired from the target(s) and is
     *     observed by the observer(s).
     */

    var doc,

        signalName,
        observer,
        target,
        handler,

        win,

        armingTarget,

        uri,

        ancestor,
        obsElement,

        id,

        sigDispatchType,

        elem,

        arr,

        phase,
        propagate,
        defaultAction,

        entries;

    doc = TP.nodeGetDocument(anElement);

    signalName = aSignalName;
    observer = anObserver;
    target = aTarget;
    handler = aHandler;

    //  by default we plan to arm the element itself, but this will
    //  ultimately end up being adjusted to either the target or the
    //  observer based on XML Event's defaulting rules (and possibly the
    //  nature of the origin/signal themselves)
    armingTarget = anElement;

    //  observer defaults to the element, except when the handler is also
    //  not available, in which case observer becomes the element's parent
    if (TP.isEmpty(observer)) {
        //  if the handler is empty, then the observer is the element's
        //  parent element
        if (TP.isEmpty(handler)) {
            ancestor = anElement.parentNode;

            //  both the observing element and the arming target are the
            //  ancestor element
            obsElement = ancestor;
            armingTarget = ancestor;
        } else {
            //  otherwise, its the element itself

            //  both the observing element and the arming target are the
            //  element
            obsElement = anElement;
            armingTarget = anElement;
        }

        //  make sure that the observing element has an 'id'. This will be
        //  needed when registering the listener with TIBET
        if (TP.isEmpty(TP.elementGetAttribute(obsElement, 'id'))) {
            //  Pass true to assign the new ID after generating it.
            id = TP.elemGenID(obsElement, true);
        }

        //  The observer (ID) is the global ID of the observing element.
        observer = TP.gid(obsElement, true);
    } else if (observer === '*') {
        //  NOTE:   observer="*" means any origin whatsoever. it's a global
        //          observation that has no direct XMLEvents corollary. for
        //          this to work within the scope of the document we have to
        //          arm the entire document
        observer = TP.ANY;
        armingTarget = doc;
    } else if (observer === '#document') {
        //  If the observer was set to be the 'document', then just use the
        //  TP.gid() of the document.
        observer = TP.gid(doc, true);
        armingTarget = doc;
    } else if (TP.isString(observer) && TP.isURI(uri = TP.uc(observer))) {
        //  it's a URI we want to observe
        observer = uri.getLocation();
    } else {
        //  the observing element is that element in the document.
        obsElement = TP.nodeGetElementById(doc, observer);

        //  couldn't find a valid observing element - maybe it wasn't an
        //  'id' after all, but a set of space-separated ids.
        if (TP.notValid(obsElement)) {
            arr = observer.split(' ');

            //  if the observer contains multiple ids
            if (arr.getSize() > 1) {
                //  multiple values, let arming handle it as IDREFS
                armingTarget = observer;

                //  we need to convert the individual observer
                //  references to the global ID of the observing element
                arr.convert(
                    function(observerID) {

                        if (observerID === '#document') {
                            return TP.gid(doc, true);
                        } else if (TP.isElement(obsElement =
                                    TP.nodeGetElementById(doc, observerID))) {
                            return TP.gid(obsElement, true);
                        } else {
                            TP.ifWarn() && TP.$DEBUG ?
                                TP.warn('Specified ev:observer ' +
                                                observerID +
                                                ' not found for: ' +
                                                TP.nodeAsString(anElement)) : 0;

                            return observerID;
                        }
                    });

                observer = arr.join(' ');
            } else {
                TP.ifWarn() && TP.$DEBUG ?
                    TP.warn('Specified ev:observer not found for: ' +
                                    TP.nodeAsString(anElement)) : 0;
            }
        } else {
            //  otherwise, the observer is the global ID of the
            //  observing element and the arming target is the observing
            //  element
            observer = TP.gid(obsElement, true);
            armingTarget = obsElement;
        }
    }

    //  handler should default to the element if it's empty. so that we can
    //  keep things dynamic we work from IDs and we'll actually install one
    //  on the element if it doesn't have one
    if (TP.isEmpty(handler)) {
        if (TP.isEmpty(TP.elementGetAttribute(anElement, 'id'))) {
            //  we compute a local ID here, but don't bother having this
            //  routine assign it, because it will not use 'element()'
            //  scheme, which is what we want here. So we'll let 'TP.lid()'
            //  compute it, but then set it ourself.
            id = TP.lid(anElement);
            TP.elementSetAttribute(anElement, 'id', id);
        }

        //  if the element has a 'tibet:signame' and no 'handler' (and its not
        //  itself a 'tibet:sigdispatch' type of element) then that's shorthand
        //  for 'dispatch that signal' as the handler, so we make up a
        //  'javascript:' handler to do just that. Note how we generate code
        //  that uses the *resolved* target, so that in case parent elements
        //  capture the signal, we're signaling from the correct place.
        if (TP.elementHasAttribute(anElement, 'tibet:signame', true) &&
            TP.isType(sigDispatchType =
                        TP.sys.getTypeByName('tibet:sigdispatch')) &&
            TP.dom.ElementNode.getConcreteType(anElement) !==
                        sigDispatchType) {
            /* eslint-disable no-script-url */
            //  TODO: The 'sig' namespace is no longer used for this. Figure out
            //  the alternative that should be used here now.
            //  handler = TP.join('javascript:',
            //                      'TP.sig.XMLNS.dispatchSignal(',
            //                      'triggerSignal.getResolvedTarget());');
            /* eslint-enable no-script-url */
        } else {
            handler = TP.gid(anElement, true);
        }
    } else {
        //  if not empty we need to know if it's an element reference so we
        //  can expand. note that the value ends up being the target of an
        //  TP.byId() call so it doesn't have to be a local element.

        //  one thing we need to watch out for are barenames prefixed with a
        //  # to help us see that they're local IDs. If we don't respect
        //  that prefix the element won't be found properly later
        if (/^#/.test(handler)) {
            //  The handler had a '#' prefix, so we slice that off and use
            //  the result as an 'id' to getElementById().

            handler = handler.slice(1);
            if (TP.isElement(elem = TP.nodeGetElementById(doc, handler))) {
                //  An element was found with that id, so we use its global
                //  ID.
                handler = TP.gid(elem, true);
            } else {
                //  Otherwise, we use the window's global id, put the '#'
                //  back on the handler id and use the handler id to compute
                //  the overall handler id.
                win = TP.nodeGetWindow(doc);
                if (TP.notValid(win)) {
                    win = TP.sys.uiwin(true);
                }
                handler = TP.gid(win) + '#' + handler;
            }
        } else if (TP.isElement(elem = TP.nodeGetElementById(doc, handler))) {
            handler = TP.gid(elem, true);
        } else {
            //  not empty, but not found. perhaps "external" so we'll allow
            void 0;
        }
    }

    //  also have to resolve target to an ID, and adjust the armingTarget so
    //  that proper DOM semantics can be modeled
    if (TP.isEmpty(target)) {
        //  default target based on XML Events spec rules. in this case our
        //  armingTarget will remain as defined during observer setup (it'll
        //  be the observer element or a list of observer IDs)
        target = observer;
    } else if (target === '*') {
        //  NOTE:   target="*" means any origin whatsoever. it's a global
        //          observation that has no direct XMLEvents corollary. for
        //          this to work within the scope of the document we have to
        //          arm the entire document
        target = TP.ANY;
        armingTarget = doc;
    } else if (target === '#document') {
        //  NOTE that observer isn't particularly relevant here since the
        //  document element represents the only element in the event "V"
        target = TP.gid(doc, true);
        armingTarget = doc;
    } else if (TP.isString(target) && TP.isURI(uri = TP.uc(target))) {
        //  it's a URI we want to observe
        target = uri.getLocation();
    } else if (TP.isElement(elem = TP.nodeGetElementById(doc, target))) {
        //  the target was a specific element, so find that element so we
        //  can arm it instead of the observer. the tricky part here is that
        //  by having an observer differ from the target we arm one element
        //  but observe another...
        target = TP.gid(elem, true);
        armingTarget = elem;
    } else {
        arr = target.split(' ');

        //  if the target contains multiple ids
        if (TP.notEmpty(arr)) {
            arr.convert(
                function(targetID) {

                    if (TP.isElement(
                            elem = TP.nodeGetElementById(doc, targetID))) {
                        return TP.gid(elem, true);
                    }
                });

            armingTarget = arr.join(' ');

            //  update target so both are consistent
            target = armingTarget;
        } else {
            //  not unusual when pointing over to TIBET instead of local so
            //  only log this one when VERBOSE is true and only as a warning
            TP.ifWarn() && TP.$DEBUG && TP.$VERBOSE ?
                            TP.warn('Specified ev:target not found for: ' +
                                            TP.nodeAsString(anElement)) : 0;
        }
    }

    //  The signal now consists of one or more signal type names, joined by
    //  a space. The problem is that '$registerHandlerInfo' below doesn't go
    //  through the normal observe() machinery which converts signal type
    //  names into signal 'signal' names. So we need to do that here and
    //  join them back together.
    signalName = signalName.split(' ');
    signalName = signalName.collect(
                function(signame) {

                    var sigType;

                    if (TP.isType(sigType = TP.sys.getTypeByName(signame))) {
                        return sigType.getSignalName();
                    }

                    return signame;
                });
    signalName = signalName.join(' ');

    //  The remaining information isn't processed until run time so we just
    //  collect it so it's handy. We could collect the target at this point
    //  but by leaving it as a string we allow the system to be a bit more
    //  dynamic so elements can be altered in the DOM
    phase = TP.elementGetAttribute(anElement, 'ev:phase', true);
    propagate = TP.elementGetAttribute(anElement, 'ev:propagate', true);
    defaultAction = TP.elementGetAttribute(anElement,
                                            'ev:defaultAction',
                                            true);

    //  At this point the various parameters have been defaulted and/or
    //  expanded to their full IDs. The 'true' as the last parameter here tells
    //  the registration call that we want to enforce XMLEvents semantics so
    //  the observer will take on the role of origin instead of target.
    entries = TP.sig.SignalMap.$constructHandlerEntries(
                            target, signalName, handler,
                            phase, propagate, defaultAction, observer,
                            true);
    return entries;
});

//  ------------------------------------------------------------------------

TP.ev.XMLNS.Type.defineMethod('$manageEventEntries',
function(anElement, shouldRegister) {

    /**
     * @method $manageEventEntries
     * @summary Manages the registration or unregistration of event entries in
     *     TIBET's notification system.
     * @param {Element} anElement The element to manage entries for.
     * @param {Boolean} shouldRegister Whether to register or remove the
     *     handlers that can be computed from anElement.
     * @returns {null}
     */

    var eventAttrValue,

        signalName,
        signame,
        defaultType,

        observer,
        target,
        handler,

        entries,
        len,
        i,

        signalType,

        signalNames,

        domFirers,
        nondomFirers;

    //  if no ev:event attribute value then there are no events bound to
    //  this element and it's not a listener either
    if (TP.isEmpty(eventAttrValue = TP.elementGetAttribute(anElement,
                                                            'ev:event',
                                                            true))) {
        return;
    }

    signalName = eventAttrValue.trim();

    //  in XML Events this would be an error, but we allow * in both
    //  signalName and observer to support the full range of TIBET dispatch
    //  options
    if (signalName === '*') {
        signalName = TP.ANY;
    }

    observer = TP.elementGetAttribute(anElement, 'ev:observer', true);
    target = TP.elementGetAttribute(anElement, 'ev:target', true);
    handler = TP.elementGetAttribute(anElement, 'ev:handler', true);

    //  We special case to see if there is just one signal name defined as
    //  the signal. This is the common case.
    if (!/ /.test(signalName)) {
        //  If the expanded signal name resolves to a real type, then use
        //  that expanded signal name as the signal name. Otherwise, it's a
        //  spoofed signal so just use the supplied signal name.
        signalName = TP.isType(
                        TP.sys.getTypeByName(
                            signame = TP.expandSignalName(signalName))) ?
                            signame :
                            signalName;

        //  Now we check to see if:

        //  a)  we can resolve the signal name to a TIBET type which is a
        //      subtype of TP.sig.Signal, and
        //  b)  if that type's 'default firing policy' is TP.DOM_FIRING.

        //  If its not, then some of the semantics around XML Events
        //  'targets' don't really fit (since there is no capturing /
        //  bubbling).
        //  In this case, we do two things:
        //      1.  If a target is defined but an observer is not, we copy
        //          the target over to the observer
        //      2.  We clear whatever value the target had

        //  First though, compute a 'default type' that should be used in
        //  case the signal type cannot be found for the supplied signal
        //  name (this happens in the case of spoofed signals - in
        //  particular, keyboard signals that are specific, i.e.
        //  TP.sig.DOM_A_Up)
        defaultType = TP.regex.KEY_EVENT.test(signalName) ?
                        TP.sys.getTypeByName('TP.sig.DOMKeySignal') :
                        TP.sig.Signal;

        if (TP.isType(signalType = TP.sig.SignalMap.$getSignalType(
                                        signalName, defaultType)) &&
            TP.canInvoke(signalType, 'getDefaultPolicy') &&
            signalType.getDefaultPolicy() !== TP.DOM_FIRING) {
            //  a target is defined
            if (TP.notEmpty(target)) {
                //  but not an observer, so we copy it.
                if (TP.isEmpty(observer)) {
                    observer = target;
                }

                //  now, we null the value since 'target' doesn't really
                //  mean anything in a world where there is no
                //  capture / bubble. The logic below will set the target to
                //  be the observer.
                target = null;
            }
        }

        //  Go ahead and register or unregister it.
        entries = this.$generateHandlerEntriesFor(
                        anElement, signalName,
                        observer, target, handler);

        len = entries.getSize();
        if (shouldRegister) {
            for (i = 0; i < len; i++) {
                TP.sig.SignalMap.$registerHandlerEntry(entries.at(i), true);
            }
        } else {
            for (i = 0; i < len; i++) {
                TP.sig.SignalMap.$removeHandlerEntry(entries.at(i), true);
            }
        }
    } else {
        //  Otherwise this is more complex, because we have multiple signal
        //  names that we're registering for. We may have some signals that
        //  have a 'default firing policy' of TP.DOM_FIRING and some who
        //  don't. We must sort them into the two groups (using the same
        //  logic that we used above), and register them with different
        //  values for the observer and target.
        signalNames = signalName.split(' ');

        domFirers = TP.ac();
        nondomFirers = TP.ac();

        signalNames.perform(
            function(aSignalName) {

                var theSignalType,
                    theSignalName,
                    thesigname;

                //  If the expanded signal name resolves to a real type,
                //  then use that expanded signal name as the signal name.
                //  Otherwise, it's a spoofed signal so just use the
                //  supplied signal name.
                theSignalName = TP.isType(
                    TP.sys.getTypeByName(
                        thesigname = TP.expandSignalName(aSignalName))) ?
                        thesigname :
                        aSignalName;

                if (TP.isType(theSignalType =
                                TP.sig.SignalMap.$getSignalType(
                                        theSignalName, TP.sig.Signal)) &&
                    TP.canInvoke(theSignalType, 'getDefaultPolicy') &&
                    theSignalType.getDefaultPolicy() !== TP.DOM_FIRING) {
                    nondomFirers.push(theSignalName);
                } else {
                    domFirers.push(theSignalName);
                }
            });

        //  Register the domFirers (if there were any) first before we mess
        //  with the target and observer.
        if (TP.notEmpty(domFirers)) {

            //  Go ahead and register or unregister the domFirers.
            entries = this.$generateHandlerEntriesFor(
                        anElement, domFirers.join(' '),
                        observer, target, handler);

            len = entries.getSize();
            if (shouldRegister) {
                for (i = 0; i < len; i++) {
                    TP.sig.SignalMap.$registerHandlerEntry(entries.at(i), true);
                }
            } else {
                for (i = 0; i < len; i++) {
                    TP.sig.SignalMap.$removeHandlerEntry(entries.at(i), true);
                }
            }
        }

        //  Now, mess with the target and observer for the nondomFirers

        //  a target is defined
        if (TP.notEmpty(target)) {
            //  but not an observer, so we copy it.
            if (TP.isEmpty(observer)) {
                observer = target;
            }

            //  now, we null the value since 'target' doesn't really mean
            //  anything in a world where there is no capture / bubble. The
            //  logic below will set the target to be the observer.
            target = null;
        }

        //  Now register the nondomFirers (if there were any).
        if (TP.notEmpty(nondomFirers)) {

            //  Go ahead and register or unregister the nondomFirers.
            entries = this.$generateHandlerEntriesFor(
                        anElement, nondomFirers.join(' '),
                        observer, target, handler);

            len = entries.getSize();
            if (shouldRegister) {
                for (i = 0; i < len; i++) {
                    TP.sig.SignalMap.$registerHandlerEntry(entries.at(i), true);
                }
            } else {
                for (i = 0; i < len; i++) {
                    TP.sig.SignalMap.$removeHandlerEntry(entries.at(i), true);
                }
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.ev.XMLNS.Type.defineMethod('setup',
function(anElement) {

    /**
     * @method setup
     * @summary Sets up anElement in the event notification system. This method
     *     is a key element of how TIBET supports XML Events. The various
     *     ev:listeners and elements containing ev: prefixed attributes are
     *     configured during this process so that the proper elements are armed
     *     in the UI and the proper observations are configured within TIBET.
     * @param {Element} anElement The element to set up.
     * @returns {null}
     */

    this.$manageEventEntries(anElement, true);

    return;
});

//  ------------------------------------------------------------------------

TP.ev.XMLNS.Type.defineMethod('teardown',
function(anElement) {

    /**
     * @method teardown
     * @summary Tears down anElement from the event notification system.
     *     Basically this method does the inverse of the 'setup' method above.
     * @param {Element} anElement The element to tear down.
     * @returns {null}
     */

    this.$manageEventEntries(anElement, false);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
