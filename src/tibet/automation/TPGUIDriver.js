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
 */

/* global Q:true
*/

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('gui.Driver');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

/**
 * The Window context that this GUI driver is currently operating in. This is
 * the default context used to find elements, etc.
 * @type {TP.core.Window}
 */
TP.gui.Driver.Inst.defineAttribute('windowContext');

/**
 * An object that will provide an API to manage Promises for this driver. When
 * executing in the test harness, this will typically be the currently executing
 * test case.
 * @type {Object}
 */
TP.gui.Driver.Inst.defineAttribute('promiseProvider');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.gui.Driver.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Performs one-time setup for the type on startup/import.
     */

    var newKeymap,

        xml,

        entries,
        i,

        entry,

        keyCode,
        val,

        kinds,
        defaults;

    //  The 'Syn' library that we use has a hard-coded key configuration
    //  suitable for US ASCII 101 keyboards. We want a more flexible approach,
    //  driven by the W3C-defined keyboard values in our key map.
    //  Therefore, we build a new keymap for Syn by iterating through our
    //  keymap. Note that an added enhancement here is that we very well may
    //  generate multiple Syn key entries for a single key map entry.
    //  For instance, this entry:
    //
    //      <key id="_187" char="U003D" key="Equals" glyph="="/>
    //
    //  will generate the following entries:
    //
    //      newKeymap['Equals'] -> 187
    //      newKeymap['='] -> 187
    //      newKeymap['\u003D'] -> 187

    newKeymap = {};

    xml = TP.core.Keyboard.getCurrentKeyboard().get('mapxml');
    entries = TP.nodeEvaluateXPath(xml, '//*[local-name() = "key"]');
    for (i = 0; i< entries.getSize(); i++) {
        entry = entries.at(i);

        //  Make sure that the entry has a key
        if (TP.isEmpty(keyCode = TP.elementGetAttribute(entry, 'id'))) {
            continue;
        }

        //  If the entry has a 'platform' qualification, make sure that it
        //  matches the platform (i.e. operating system) we're currently on.
        if (TP.elementHasAttribute(entry, 'platform') &&
                TP.elementGetAttribute(entry, 'platform') !== TP.$platform) {
            continue;
        }

        //  If the entry has a 'browser' qualification, make sure that it
        //  matches the browser we're currently on.
        if (TP.elementHasAttribute(entry, 'browser') &&
                TP.elementGetAttribute(entry, 'browser') !== TP.$browser) {
            continue;
        }

        keyCode = keyCode.slice(1).asNumber();

        if (TP.notEmpty(val = TP.elementGetAttribute(entry, 'key'))) {
            newKeymap[val] = keyCode;
        }

        if (TP.notEmpty(val = TP.elementGetAttribute(entry, 'glyph'))) {
            newKeymap[val] = keyCode;
        }

        if (TP.notEmpty(val = TP.elementGetAttribute(entry, 'char'))) {
            val = val.replace('U', '\\u');
            newKeymap[val] = keyCode;
        }
    }

    TP.extern.syn.keycodes = newKeymap;

    //  Reprogram the various 'kinds' Arrays to contain our constants
    kinds = TP.extern.syn.key.kinds;

    kinds.special = TP.ac('Shift', 'Control', 'Alt', 'Meta', 'CapsLock');
    kinds.navigation = TP.ac('PageUp', 'PageDown', 'End', 'Home',
                                'Left', 'Up', 'Right', 'Down',
                                'Insert', 'Del');
    kinds['function'] = TP.ac('F1', 'F2', 'F3', 'F4',
                                'F5', 'F6', 'F7', 'F8',
                                'F9', 'F10', 'F11', 'F12');

    //  Reprogram the various 'defaults' Object to contain the equivalent
    //  Syn-defined actions and delete the corresponding Syn key.
    defaults = TP.extern.syn.key.defaults;

    defaults.Shift = defaults.shift;
    delete defaults.shift;
    defaults.Control = defaults.ctrl;
    delete defaults.ctrl;

    defaults.PageDown = defaults['page-down'];
    delete defaults['page-down'];
    defaults.PageUp = defaults['page-up'];
    delete defaults['page-up'];
    defaults.Home = defaults.home;
    delete defaults.home;
    defaults.End = defaults.end;
    delete defaults.end;

    defaults.Backspace = defaults['\b'];
    delete defaults['\b'];
    defaults.Enter = defaults['\r'];
    delete defaults['\r'];
    defaults.Tab = defaults['\t'];
    delete defaults['\t'];

    defaults.Del = defaults['delete'];
    delete defaults['delete'];

    defaults.Left = defaults.left;
    delete defaults.left;
    defaults.Right = defaults.right;
    delete defaults.right;
    defaults.Up = defaults.up;
    delete defaults.up;
    defaults.Down = defaults.down;
    delete defaults.down;

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('init',
function(windowContext) {

    /**
     * @name init
     * @synopsis Initialize the instance.
     * @param {TP.core.Window} windowContext The initial window context to use
     *     to resolve GUI element references, etc.
     * @return {TP.gui.Driver} A new instance.
     */

    this.callNextMethod();

    this.set('windowContext', windowContext);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('fetchResource',
function(aURI, resultType) {

    /**
     * @name fetchResource
     * @synopsis Fetches the resource at the end of the URI. The result will be
     *     available as the value of the returned promise.
     * @param {TP.core.URI} The URI to fetch the resource for.
     * @raises TP.sig.InvalidURI
     * @return {TP.gui.Driver} The receiver.
     */

    if (!TP.isKindOf(aURI, TP.core.URI)) {
        return this.raise('TP.sig.InvalidURI', arguments);
    }

    this.get('promiseProvider').thenPromise(
            function(resolver, rejector) {
                var subrequest;

                subrequest = TP.request(
                                TP.hc('resultType', resultType));

                subrequest.defineMethod(
                    'handleRequestSucceeded',
                    function(aResponse) {
                        resolver(aResponse.getResult());
                    });

                subrequest.defineMethod(
                    'handleRequestFailed',
                    function(aResponse) {
                        rejector(aResponse.getResult());
                    });

                aURI.getResource(subrequest);
            });

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('setBodyContent',
function(aURI, aWindow) {

    /**
     * @name setBodyContent
     * @synopsis Sets the 'body' content of the (X)HTML document in the supplied
     *     Window to the content found at the end of the URI.
     * @param {TP.core.URI} The URI to fetch content from.
     * @param {TP.core.Window} The Window to use the body of to load the content
     *     into. This will default to the current UI canvas.
     * @raises TP.sig.InvalidURI
     * @return {TP.gui.Driver} The receiver.
     */

    if (!TP.isKindOf(aURI, TP.core.URI)) {
        return this.raise('TP.sig.InvalidURI', arguments);
    }

    //  Fetch the result and then set the Window's body to the result.
    this.fetchResource(aURI, TP.DOM);

    this.get('promiseProvider').then(
        function(result) {
            var tpWin,
                tpDoc,
                tpBody;

            tpWin = TP.ifInvalid(aWindow, TP.sys.getUICanvas());

            tpDoc = tpWin.getDocument();
            tpBody = tpDoc.getBody();

            tpBody.setContent(result);
        },
        function(error) {
            TP.sys.logTest('Couldn\'t get resource: ' + aURI.getLocation(),
                            TP.ERROR);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('setLocation',
function(aURI, aWindow) {

    /**
     * @name setLocation
     * @synopsis Sets the location of the supplied Window to the content found
     *     at the end of the URI.
     * @param {TP.core.URI} The URI to fetch content from.
     * @param {TP.core.Window} The Window to load the content into. This will
     *     default to the current UI canvas.
     * @raises TP.sig.InvalidURI
     * @return {TP.gui.Driver} The receiver.
     */

    if (!TP.isKindOf(aURI, TP.core.URI)) {
        return this.raise('TP.sig.InvalidURI', arguments);
    }

    //  Fetch the result and then set the Window's body to the result.
    this.fetchResource(aURI, TP.DOM);

    this.get('promiseProvider').then(
        function(result) {
            var tpWin,
                tpDoc;

            tpWin = TP.ifInvalid(aWindow, TP.sys.getUICanvas());

            tpDoc = tpWin.getDocument();
            tpDoc.setContent(result);
        },
        function(error) {
            TP.sys.logTest('Couldn\'t get resource: ' + aURI.getLocation(),
                            TP.ERROR);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('getCurrentNativeDocument',
function() {

    /**
     * @name getCurrentNativeDocument
     * @synopsis Returns the native Document object associated with the current
     *     window context.
     * @return {Document} The Document of the current window context.
     */

    var context;

    context = this.get('windowContext');

    return context.getNativeDocument();
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('getFocusedElement',
function() {

    /**
     * @name getFocusedElement
     * @synopsis Returns the Element that currently has focus in the current
     *     window context.
     * @return {Element} The focused Element in the current window context.
     */

    var context;

    context = this.get('windowContext');

    return TP.documentGetFocusedElement(context.getNativeDocument());
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('startSequence',
function() {

    /**
     * @name startSequence
     * @synopsis Returns a new GUI sequence used to script actions.
     * @return {TP.gui.Sequence} A new GUI sequence.
     */

    return TP.gui.Sequence.construct(this);
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('takeScreenshotOf',
function(aNode) {

    /**
     * @name takeScreenshotOf
     * @synopsis Take a screenshot of either the whole window of the currently
     *     executing window context or some portion thereof as determined by the
     *     supplied Node.
     * @description If a Document node is supplied to this method, the whole
     *     Document will be snapshotted. If an Element is supplied, only that
     *     Element will be snapshotted. Note also that this method currently
     *     only works when this code is being executed in the PhantomJS
     *     environment.
     * @param {Node} aNode The Node used to determine which portion of the
     *     screen to take a snapshot of. Note that if this is not supplied, the
     *     whole window of the currently executing window context will be used.
     * @return {TP.gui.Driver} The receiver.
     */

    if (TP.sys.cfg('boot.context') !== 'phantomjs') {
        return this.raise('TP.sig.UnsupportedOperation', arguments);
    }

    //  http://phantomjs.org/api/webpage/property/clip-rect.html

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('gui.Sequence');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineAttribute('sequenceEntries');
TP.gui.Sequence.Inst.defineAttribute('driver');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('init',
function(driver) {

    /**
     * @name init
     * @synopsis Initialize the instance.
     * @param {TP.gui.Driver} driver The GUI driver which created this sequence
     *     and is being used in conjunction with it to drive the GUI.
     * @return {TP.gui.Driver} The receiver.
     */

    this.callNextMethod();

    this.set('sequenceEntries', TP.ac());
    this.set('driver', driver);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('altKeyDown',
function(aPath) {

    /**
     * @name altKeyDown
     * @synopsis Simulate the act of pressing the 'Alt' key down.
     * @param {TP.core.AccessPath} aPath The access path to the target element
     *     that should have the 'Alt' key pressed down over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @return {TP.gui.Driver} The receiver.
     */

    this.keyDown('Alt', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('altKeyUp',
function(aPath) {

    /**
     * @name altKeyUp
     * @synopsis Simulate the act of releasing the 'Alt' key up.
     * @param {TP.core.AccessPath} aPath The access path to the target element
     *     that should have the 'Alt' key released up over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @return {TP.gui.Driver} The receiver.
     */

    this.keyUp('Alt', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('click',
function(mouseLocation, mouseButton) {

    /**
     * @name click
     * @synopsis Simulates the act of clicking the mouse button.
     * @description Note that this method has a notion of a 'currently focused'
     *     element, but it is important to note that this will be the element
     *     that is currently focused *when the sequence that this method belongs
     *     to is executed* (which won't happen until the 'perform()' method is
     *     called).
     * @param {Element|TP.core.AccessPath|TP.core.Point|Constant} mouseLocation
     *     The mouse location, given as either a target Element, an AccessPath
     *     that can be used to find the element, a Point that will be used with
     *     the currently focused element or as a mouse button constant, in which
     *     case the currently focused element will be used. If this parameter is
     *     not supplied or null, the currently focused element will be used as
     *     well.
     * @param {Constant} mouseButton A mouse button constant. This parameter is
     *     usually used if the mouseLocation parameter has a real value and
     *     can't be used to specify the mouse button.
     * @return {TP.gui.Driver} The receiver.
     */

    var point,
        button,
        target,

        eventName;

    //  If there was no valid location supplied, then we just set the target to
    //  TP.CURRENT, which means to use the currently focused element whenever
    //  the sequence is executed.
    if (TP.notValid(mouseLocation)) {
        target = TP.CURRENT;
    } else if (TP.isElement(mouseLocation)) {
        //  Otherwise, if an Element has been supplied, use that.
        target = mouseLocation;
    } else if (mouseLocation.isAccessPath()) {
        //  Otherwise, if a TP.core.AccessPath has been supplied, that will be
        //  used to determine the target element.
        target = mouseLocation;
    } else if (TP.isKindOf(mouseLocation, TP.core.Point)) {
        //  Otherwise, if a TP.core.Point has been supplied then we set the
        //  target to TP.CURRENT, which tells the sequence performing routine to
        //  use whatever the currently focused element is at the time it is
        //  executing the sequence.
        point = mouseLocation;
        target = TP.CURRENT;
    } else if (mouseLocation === TP.LEFT || mouseLocation === TP.RIGHT) {
        //  Otherwise, if a button constant has been supplied then we set the
        //  target to TP.CURRENT, which tells the sequence performing routine to
        //  use whatever the currently focused element is at the time it is
        //  executing the sequence.
        button = mouseLocation;
        target = TP.CURRENT;
    } else {
        //  TODO: Raise an exception
        return this;
    }

    if (TP.notValid(button)) {
        button = mouseButton;
    }

    if (button === TP.RIGHT) {
        eventName = 'rightclick';
    } else {
        eventName = 'click';
    }

    //  If we got a valid TP.core.Point supplied as the mouse location, then we
    //  go ahead and supply it as the argument for this step in the sequence.
    //  Otherwise, it will have to be computed from the target in the sequence
    //  performing routine.
    if (TP.isValid(point)) {
        this.get('sequenceEntries').add(
                TP.ac(eventName,
                        target,
                        {pageX: point.getX(), pageY: point.getY()}));
    } else {
        this.get('sequenceEntries').add(
                TP.ac(eventName, target));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('ctrlKeyDown',
function(aPath) {

    /**
     * @name ctrlKeyDown
     * @synopsis Simulate the act of pressing the 'Control' key down.
     * @param {TP.core.AccessPath} aPath The access path to the target element
     *     that should have the 'Control' key pressed down over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @return {TP.gui.Driver} The receiver.
     */

    this.keyDown('Control', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('ctrlKeyUp',
function(aPath) {

    /**
     * @name ctrlKeyUp
     * @synopsis Simulate the act of releasing the 'Control' key up.
     * @param {TP.core.AccessPath} aPath The access path to the target element
     *     that should have the 'Control' key released up over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @return {TP.gui.Driver} The receiver.
     */

    this.keyUp('Control', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('doubleClick',
function(mouseLocation, mouseButton) {

    /**
     * @name doubleClick
     * @synopsis Simulates the act of double clicking the mouse button.
     * @description Note that this method has a notion of a 'currently focused'
     *     element, but it is important to note that this will be the element
     *     that is currently focused *when the sequence that this method belongs
     *     to is executed* (which won't happen until the 'perform()' method is
     *     called).
     * @param {Element|TP.core.AccessPath|TP.core.Point|Constant} mouseLocation
     *     The mouse location, given as either a target Element, an AccessPath
     *     that can be used to find the element, a Point that will be used with
     *     the currently focused element or as a mouse button constant, in which
     *     case the currently focused element will be used. If this parameter is
     *     not supplied or null, the currently focused element will be used as
     *     well.
     * @param {Constant} mouseButton A mouse button constant. This parameter is
     *     usually used if the mouseLocation parameter has a real value and
     *     can't be used to specify the mouse button.
     * @return {TP.gui.Driver} The receiver.
     */

    var point,
        button,
        target,

        eventName;

    //  If there was no valid location supplied, then we just set the target to
    //  TP.CURRENT, which means to use the currently focused element whenever
    //  the sequence is executed.
    if (TP.notValid(mouseLocation)) {
        target = TP.CURRENT;
    } else if (TP.isElement(mouseLocation)) {
        //  Otherwise, if an Element has been supplied, use that.
        target = mouseLocation;
    } else if (mouseLocation.isAccessPath()) {
        //  Otherwise, if a TP.core.AccessPath has been supplied, that will be
        //  used to determine the target element.
        target = mouseLocation;
    } else if (TP.isKindOf(mouseLocation, TP.core.Point)) {
        //  Otherwise, if a TP.core.Point has been supplied then we set the
        //  target to TP.CURRENT, which tells the sequence performing routine to
        //  use whatever the currently focused element is at the time it is
        //  executing the sequence.
        point = mouseLocation;
        target = TP.CURRENT;
    } else if (mouseLocation === TP.LEFT || mouseLocation === TP.RIGHT) {
        //  Otherwise, if a button constant has been supplied then we set the
        //  target to TP.CURRENT, which tells the sequence performing routine to
        //  use whatever the currently focused element is at the time it is
        //  executing the sequence.
        button = mouseLocation;
        target = TP.CURRENT;
    } else {
        //  TODO: Raise an exception
        return this;
    }

    if (TP.notValid(button)) {
        button = mouseButton;
    }

    /*
    TODO: Support right mouse button
    if (button === TP.RIGHT) {
        eventName = 'rightclick';
    } else {
        eventName = 'click';
    }
    */

    eventName = 'dblclick';

    //  If we got a valid TP.core.Point supplied as the mouse location, then we
    //  go ahead and supply it as the argument for this step in the sequence.
    //  Otherwise, it will have to be computed from the target in the sequence
    //  performing routine.
    if (TP.isValid(point)) {
        this.get('sequenceEntries').add(
                TP.ac(eventName,
                        target,
                        {pageX: point.getX(), pageY: point.getY()}));
    } else {
        this.get('sequenceEntries').add(
                TP.ac(eventName, target));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('keyDown',
function(aKey, aPath) {

    /**
     * @name keyDown
     * @synopsis Simulate the act of pressing the supplied key down.
     * @param {String} aKey The key to simulate pressing down.
     * @param {TP.core.AccessPath} aPath The access path to the target element
     *     that should have the keys pressed down over. If this isn't supplied,
     *     the currently focused element in the receiver's owning driver's
     *     window context will be used as the target for this event.
     * @return {TP.gui.Driver} The receiver.
     */

    var target;

    target = TP.ifInvalid(aPath, TP.CURRENT);

    this.get('sequenceEntries').add(TP.ac('keydown', target, aKey));

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('keyUp',
function(aKey, aPath) {

    /**
     * @name keyUp
     * @synopsis Simulate the act of releasing the supplied key up.
     * @param {String} aKey The key to simulate releasing up.
     * @param {TP.core.AccessPath} aPath The access path to the target element
     *     that should have the keys released up over. If this isn't supplied,
     *     the currently focused element in the receiver's owning driver's
     *     window context will be used as the target for this event.
     * @return {TP.gui.Driver} The receiver.
     */

    var target;

    target = TP.ifInvalid(aPath, TP.CURRENT);

    this.get('sequenceEntries').add(TP.ac('keyup', target, aKey));

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('metaKeyDown',
function(aPath) {

    /**
     * @name metaKeyDown
     * @synopsis Simulate the act of pressing the 'Meta' key down.
     * @param {TP.core.AccessPath} aPath The access path to the target element
     *     that should have the 'Meta' key pressed down over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @return {TP.gui.Driver} The receiver.
     */

    this.keyDown('Meta', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('metaKeyUp',
function(aPath) {

    /**
     * @name metaKeyUp
     * @synopsis Simulate the act of releasing the 'Meta' key up.
     * @param {TP.core.AccessPath} aPath The access path to the target element
     *     that should have the 'Meta' key released up over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @return {TP.gui.Driver} The receiver.
     */

    this.keyUp('Meta', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('mouseDown',
function(mouseLocation, mouseButton) {

    /**
     * @name mouseDown
     * @synopsis Simulates the act of pressing the mouse button down.
     * @description Note that this method has a notion of a 'currently focused'
     *     element, but it is important to note that this will be the element
     *     that is currently focused *when the sequence that this method belongs
     *     to is executed* (which won't happen until the 'perform()' method is
     *     called).
     * @param {Element|TP.core.AccessPath|TP.core.Point|Constant} mouseLocation
     *     The mouse location, given as either a target Element, an AccessPath
     *     that can be used to find the element, a Point that will be used with
     *     the currently focused element or as a mouse button constant, in which
     *     case the currently focused element will be used. If this parameter is
     *     not supplied or null, the currently focused element will be used as
     *     well.
     * @param {Constant} mouseButton A mouse button constant. This parameter is
     *     usually used if the mouseLocation parameter has a real value and
     *     can't be used to specify the mouse button.
     * @return {TP.gui.Driver} The receiver.
     */

    var point,
        button,
        target,

        eventName;

    //  If there was no valid location supplied, then we just set the target to
    //  TP.CURRENT, which means to use the currently focused element whenever
    //  the sequence is executed.
    if (TP.notValid(mouseLocation)) {
        target = TP.CURRENT;
    } else if (TP.isElement(mouseLocation)) {
        //  Otherwise, if an Element has been supplied, use that.
        target = mouseLocation;
    } else if (mouseLocation.isAccessPath()) {
        //  Otherwise, if a TP.core.AccessPath has been supplied, that will be
        //  used to determine the target element.
        target = mouseLocation;
    } else if (TP.isKindOf(mouseLocation, TP.core.Point)) {
        //  Otherwise, if a TP.core.Point has been supplied then we set the
        //  target to TP.CURRENT, which tells the sequence performing routine to
        //  use whatever the currently focused element is at the time it is
        //  executing the sequence.
        point = mouseLocation;
        target = TP.CURRENT;
    } else if (mouseLocation === TP.LEFT || mouseLocation === TP.RIGHT) {
        //  Otherwise, if a button constant has been supplied then we set the
        //  target to TP.CURRENT, which tells the sequence performing routine to
        //  use whatever the currently focused element is at the time it is
        //  executing the sequence.
        button = mouseLocation;
        target = TP.CURRENT;
    } else {
        //  TODO: Raise an exception
        return this;
    }

    if (TP.notValid(button)) {
        button = mouseButton;
    }

    /*
    TODO: Support right mouse button
    if (button === TP.RIGHT) {
        eventName = 'rightclick';
    } else {
        eventName = 'click';
    }
    */

    eventName = 'mousedown';

    //  If we got a valid TP.core.Point supplied as the mouse location, then we
    //  go ahead and supply it as the argument for this step in the sequence.
    //  Otherwise, it will have to be computed from the target in the sequence
    //  performing routine.
    if (TP.isValid(point)) {
        this.get('sequenceEntries').add(
                TP.ac(eventName,
                        target,
                        {pageX: point.getX(), pageY: point.getY()}));
    } else {
        this.get('sequenceEntries').add(
                TP.ac(eventName, target));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('mouseUp',
function(mouseLocation, mouseButton) {

    /**
     * @name mouseUp
     * @synopsis Simulates the act of releasing the mouse button up.
     * @description Note that this method has a notion of a 'currently focused'
     *     element, but it is important to note that this will be the element
     *     that is currently focused *when the sequence that this method belongs
     *     to is executed* (which won't happen until the 'perform()' method is
     *     called).
     * @param {Element|TP.core.AccessPath|TP.core.Point|Constant} mouseLocation
     *     The mouse location, given as either a target Element, an AccessPath
     *     that can be used to find the element, a Point that will be used with
     *     the currently focused element or as a mouse button constant, in which
     *     case the currently focused element will be used. If this parameter is
     *     not supplied or null, the currently focused element will be used as
     *     well.
     * @param {Constant} mouseButton A mouse button constant. This parameter is
     *     usually used if the mouseLocation parameter has a real value and
     *     can't be used to specify the mouse button.
     * @return {TP.gui.Driver} The receiver.
     */

    var point,
        button,
        target,

        eventName;

    //  If there was no valid location supplied, then we just set the target to
    //  TP.CURRENT, which means to use the currently focused element whenever
    //  the sequence is executed.
    if (TP.notValid(mouseLocation)) {
        target = TP.CURRENT;
    } else if (TP.isElement(mouseLocation)) {
        //  Otherwise, if an Element has been supplied, use that.
        target = mouseLocation;
    } else if (mouseLocation.isAccessPath()) {
        //  Otherwise, if a TP.core.AccessPath has been supplied, that will be
        //  used to determine the target element.
        target = mouseLocation;
    } else if (TP.isKindOf(mouseLocation, TP.core.Point)) {
        //  Otherwise, if a TP.core.Point has been supplied then we set the
        //  target to TP.CURRENT, which tells the sequence performing routine to
        //  use whatever the currently focused element is at the time it is
        //  executing the sequence.
        point = mouseLocation;
        target = TP.CURRENT;
    } else if (mouseLocation === TP.LEFT || mouseLocation === TP.RIGHT) {
        //  Otherwise, if a button constant has been supplied then we set the
        //  target to TP.CURRENT, which tells the sequence performing routine to
        //  use whatever the currently focused element is at the time it is
        //  executing the sequence.
        button = mouseLocation;
        target = TP.CURRENT;
    } else {
        //  TODO: Raise an exception
        return this;
    }

    if (TP.notValid(button)) {
        button = mouseButton;
    }

    /*
    TODO: Support right mouse button
    if (button === TP.RIGHT) {
        eventName = 'rightclick';
    } else {
        eventName = 'click';
    }
    */

    eventName = 'mouseup';

    //  If we got a valid TP.core.Point supplied as the mouse location, then we
    //  go ahead and supply it as the argument for this step in the sequence.
    //  Otherwise, it will have to be computed from the target in the sequence
    //  performing routine.
    if (TP.isValid(point)) {
        this.get('sequenceEntries').add(
                TP.ac(eventName,
                        target,
                        {pageX: point.getX(), pageY: point.getY()}));
    } else {
        this.get('sequenceEntries').add(
                TP.ac(eventName, target));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('perform',
function() {

    /**
     * @name perform
     * @synopsis Executes the sequence.
     * @description Note that the steps that comprise the sequence are all
     *     executed in a 'chained' manner, so that if there are asynchronous
     *     delays in certain actions, they will all be executed in the proper
     *     order. Also note that this method is executed within a Promise, so
     *     that if there are other asynchronous actions that are using Promises
     *     from the receiver's driver's Promise supplier, this method will
     *     respect that.
     * @return {TP.gui.Driver} The receiver.
     */

    var sequenceEntries,
        driver;

    sequenceEntries = this.get('sequenceEntries');
    driver = this.get('driver');

    driver.get('promiseProvider').then(
        function(value) {

            var eventCB,
                errorCB,

                newPromise,

                chain,

                currentElement,

                len,
                i,

                last,
                entry,

                type,
                targets,
                args,

                j,
                target,
                point;

            //  Generate a callback function to hand to the *last* invocation in
            //  the sequence and wrap a Promise around it. Therefore, when it is
            //  called (as the last thing for the Syn triggering functions to
            //  do), it will fulfill the Promise.
            newPromise = Q.Promise(
                function(resolver, rejector) {
                    eventCB = function() {
                        resolver();
                    };
                    errorCB = function() {
                        rejector();
                    };
                });

            chain = TP.extern.syn;

            //  If we can't determine a focused element, call the error callback
            //  and exit.
            if (!TP.isElement(currentElement = driver.getFocusedElement())) {
                return errorCB();
            }

            //  Loop over each entry in the sequence and execute the
            //  corresponding Syn trigger for that type of event.
            len = sequenceEntries.getSize();
            for (i = 0; i < len; i++) {

                //  Keep track if we're at the last entry in the sequence.
                last = (i === len - 1);

                entry = sequenceEntries.at(i);

                //  The three parameters are:
                //      1. The type of operation, used in the switch below.
                //      2. The targets of the operation. This could be 1...n
                //      Elements, an Access Path which will determine the
                //      Elements to be used or the value 'TP.CURRENT', in which
                //      case it will be whatever is the currently focused
                //      element.
                //      3. Operation-specific arguments.
                type = entry.at(0);
                targets = entry.at(1);
                args = entry.at(2);

                if (TP.isElement(targets)) {
                    //  The target is already an element
                } else if (target === TP.CURRENT) {
                    targets = currentElement;
                } else if (targets.isAccessPath()) {
                    targets = targets.executeGet(
                                driver.getCurrentNativeDocument());
                }

                if (!TP.isArray(targets)) {
                    targets = TP.ac(targets);
                }

                for (j = 0; j < targets.getSize(); j++) {
                    target = targets.at(j);

                    if (!TP.isElement(target)) {
                        return errorCB();
                    }

                    //  Invoke the Syn handler. If we're the last in the
                    //  sequence, then hand in the event callback we generated
                    //  above (and wrapped in the Promise).
                    switch(type) {
                        case 'click':

                            if (!TP.isValid(args)) {
                                point =
                                    TP.wrap(
                                        target).getPageRect().getCenterPoint();
                                args = {pageX: point.getX(),
                                        pageY: point.getY()};
                            }

                            last ?
                                chain = chain.click(args, target, eventCB) :
                                chain = chain.click(args, target);
                        break;

                        case 'dblclick':

                            if (!TP.isValid(args)) {
                                point =
                                    TP.wrap(
                                        target).getPageRect().getCenterPoint();
                                args = {pageX: point.getX(),
                                        pageY: point.getY()};
                            }

                            last ?
                                chain = chain.dblclick(args, target, eventCB) :
                                chain = chain.dblclick(args, target);
                        break;

                        case 'rightclick':

                            if (!TP.isValid(args)) {
                                point =
                                    TP.wrap(
                                        target).getPageRect().getCenterPoint();
                                args = {pageX: point.getX(),
                                        pageY: point.getY()};
                            }

                            last ?
                                chain = chain.rightClick(args, target, eventCB) :
                                chain = chain.rightClick(args, target);
                        break;

                        case 'key':
                            last ?
                                chain = chain.key(args, target, eventCB) :
                                chain = chain.key(args, target);
                        break;

                        case 'keys':
                            last ?
                                chain = chain.type(args, target, eventCB) :
                                chain = chain.type(args, target);
                        break;

                        case 'mousedown':

                            if (!TP.isValid(args)) {
                                point =
                                    TP.wrap(
                                        target).getPageRect().getCenterPoint();
                                args = {pageX: point.getX(),
                                        pageY: point.getY()};
                            }

                            chain.trigger(
                                'mousedown',
                                TP.extern.syn.key.options(args, 'mousedown'),
                                target);

                            if (last) {
                                eventCB();
                            }

                        break;

                        case 'mouseup':

                            if (!TP.isValid(args)) {
                                point =
                                    TP.wrap(
                                        target).getPageRect().getCenterPoint();
                                args = {pageX: point.getX(),
                                        pageY: point.getY()};
                            }

                            chain.trigger(
                                'mouseup',
                                TP.extern.syn.key.options(args, 'mouseup'),
                                target);

                            if (last) {
                                eventCB();
                            }
                        break;

                        case 'keydown':
                            chain.trigger(
                                'keydown',
                                TP.extern.syn.key.options(args, 'keydown'),
                                target);

                            if (last) {
                                eventCB();
                            }
                        break;

                        case 'keyup':
                            chain.trigger(
                                'keyup',
                                TP.extern.syn.key.options(args, 'keyup'),
                                target);

                            if (last) {
                                eventCB();
                            }
                        break;

                        default:
                        break;
                    }
                }
            }

            return newPromise;
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('sendKeys',
function(aString, aPath) {

    /**
     * @name sendKeys
     * @synopsis Simulate the act of pressing and releasing the sequence of keys
     *     necessary to reproduce the effect of the user typing what is
     *     specified in the String.
     * @description Note that it is possible to supply W3C-defined control
     *     keys surrounded with brackets ('[' and ']') in this String for ease
     *     of sending these control characters to the GUI:
     *          'ABC[Left][Backspace]D[Right]E'
     *
     *     This will produce 'ADCE' in the GUI.
     *
     *     Also note that appending '-up' to some of these keys, such as
     *     'Shift', 'Control', 'Alt' and 'Meta', will simulate the act of
     *     releasing the key:
     *          '[Alt]a[Alt-up]'
     *     Note that all of the possible keys that can be used here can be found
     *     in a TIBET keyboard map as 'key="..."' entries.
     * @param {String} String The String used to determine which keys will be
     *     pressed and released.
     * @param {TP.core.AccessPath} aPath The access path to the target element
     *     that should have the keys pressed down and released up over. If this
     *     isn't supplied, the currently focused element in the receiver's
     *     owning driver's window context will be used as the target for this
     *     event.
     * @return {TP.gui.Driver} The receiver.
     */

    var target;

    target = TP.ifInvalid(aPath, TP.CURRENT);

    this.get('sequenceEntries').add(TP.ac('keys', target, aString));

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('shiftKeyDown',
function(aPath) {

    /**
     * @name shiftKeyDown
     * @synopsis Simulate the act of pressing the 'Shift' key down.
     * @param {TP.core.AccessPath} aPath The access path to the target element
     *     that should have the 'Shift' key pressed down over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @return {TP.gui.Driver} The receiver.
     */

    this.keyDown('Shift', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('shiftKeyUp',
function(aPath) {

    /**
     * @name shiftKeyUp
     * @synopsis Simulate the act of releasing the 'Shift' key up.
     * @param {TP.core.AccessPath} aPath The access path to the target element
     *     that should have the 'Shift' key released up over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @return {TP.gui.Driver} The receiver.
     */

    this.keyUp('Shift', aPath);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
