//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('test.GUIDriver');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

/**
 * The Window context that this GUI driver is currently operating in. This is
 * the default context used to find elements, etc.
 * @type {TP.core.Window}
 */
TP.test.GUIDriver.Inst.defineAttribute('windowContext');

/**
 * An object that will provide an API to manage Promises for this driver. When
 * executing in the test harness, this will typically be the currently executing
 * test case.
 * @type {Object}
 */
TP.test.GUIDriver.Inst.defineAttribute('promiseProvider');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.test.GUIDriver.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    var newKeymap,

        xml,

        entries,
        i,

        entry,

        keyCode,
        val;

    //  The 'syn' library only loads if we're *not* running in PhantomJS.
    if (TP.sys.cfg('boot.context') !== 'phantomjs') {
        this.defineDependencies('TP.extern.syn');
    }

    this.defineDependencies('TP.extern.Promise');

    //  If Syn isn't loaded, then don't try to manipulate its keymap. Just
    //  return.
    if (TP.notValid(TP.extern.syn)) {
        return;
    }

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
    for (i = 0; i < entries.getSize(); i++) {
        entry = entries.at(i);

        //  Make sure that the entry has a key
        if (TP.isEmpty(keyCode = TP.elementGetAttribute(entry, 'keycode'))) {
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

    //  Map special keys from the W3C constants (which TIBET uses) to the Syn
    //  constants.
    newKeymap['\b'] = newKeymap.Backspace;
    newKeymap['\t'] = newKeymap.Tab;
    newKeymap['\r'] = newKeymap.Enter;

    newKeymap.num0 = newKeymap['0'];
    newKeymap.num1 = newKeymap['1'];
    newKeymap.num2 = newKeymap['2'];
    newKeymap.num3 = newKeymap['3'];
    newKeymap.num4 = newKeymap['4'];
    newKeymap.num5 = newKeymap['5'];
    newKeymap.num6 = newKeymap['6'];
    newKeymap.num7 = newKeymap['7'];
    newKeymap.num8 = newKeymap['8'];
    newKeymap.num9 = newKeymap['9'];

    newKeymap['*'] = newKeymap.Multiply;
    newKeymap['+'] = newKeymap.Add;
    newKeymap[';'] = newKeymap.Semicolon;
    newKeymap['='] = newKeymap.Equals;
    newKeymap[','] = newKeymap.Comma;
    newKeymap['`'] = newKeymap.Grave;

    //  Note: to get curly brackets, use a '[Shift]' sequence with one of these
    newKeymap['['] = newKeymap.LeftSquareBracket;
    newKeymap[']'] = newKeymap.RightSquareBracket;

    newKeymap['\\'] = newKeymap.Backslash;
    newKeymap['\''] = newKeymap.Apostrophe;

    newKeymap.alt = newKeymap.Alt;
    newKeymap.caps = newKeymap.CapsLock;
    newKeymap.ctrl = newKeymap.Control;
    newKeymap.dash = newKeymap.HyphenMinus;
    newKeymap['-'] = newKeymap.HyphenMinus;
    newKeymap.decimal = newKeymap.Decimal;
    newKeymap.delete = newKeymap.Del;
    newKeymap.divide = newKeymap.Divide;
    newKeymap.down = newKeymap.Down;
    newKeymap.end = newKeymap.End;
    newKeymap.escape = newKeymap.Esc;
    newKeymap.f1 = newKeymap.F1;
    newKeymap.f2 = newKeymap.F2;
    newKeymap.f3 = newKeymap.F3;
    newKeymap.f4 = newKeymap.F4;
    newKeymap.f5 = newKeymap.F5;
    newKeymap.f6 = newKeymap.F6;
    newKeymap.f7 = newKeymap.F7;
    newKeymap.f8 = newKeymap.F8;
    newKeymap.f9 = newKeymap.F9;
    newKeymap.f10 = newKeymap.F10;
    newKeymap.f11 = newKeymap.F11;
    newKeymap.f12 = newKeymap.F12;
    newKeymap['forward-slash'] = newKeymap.Solidus;
    newKeymap['/'] = newKeymap.Solidus;
    newKeymap.home = newKeymap.Home;
    newKeymap.insert = newKeymap.Insert;
    newKeymap.left = newKeymap.Left;
    newKeymap['left window key'] = newKeymap.Meta;
    newKeymap['num-lock'] = newKeymap.NumLock;
    newKeymap['page-down'] = newKeymap.PageDown;
    newKeymap['page-up'] = newKeymap.PageUp;
    newKeymap['pause-break'] = newKeymap.Pause;
    newKeymap.period = newKeymap.Period;
    newKeymap['.'] = newKeymap.Period;
    newKeymap.print = newKeymap.PrintScreen;
    newKeymap.right = newKeymap.Right;
    newKeymap['right window key'] = newKeymap.Meta;
    newKeymap['scroll-lock'] = newKeymap.Scroll;
    newKeymap.shift = newKeymap.Shift;
    newKeymap.subtract = newKeymap.Subtract;

    //  Reassign the Syn key map to what we just built
    TP.extern.syn.keycodes = newKeymap;

    //  Because there are hardcoded lookups in Syn (sigh...), we also have to
    //  provide a translation table for some special keys when using them in key
    //  sequence strings.
    TP.extern.syn.tibetSpecialKeyMap = {
        '[Shift]': '[shift]',
        '[Shift-Up]': '[shift-up]',
        '[Control]': '[ctrl]',
        '[Control-Up]': '[ctrl-up]',
        '[Alt]': '[alt]',
        '[Alt-Up]': '[alt-up]',
        '[Meta]': '[meta]',
        '[Meta-Up]': '[meta-up]',
        '[CapsLock]': '[caps]',
        '[CapsLock-Up]': '[caps-up]',

        '[Home]': '[home]',
        '[End]': '[end]',
        '[PageUp]': '[page-up]',
        '[PageDown]': '[page-down]',

        '[Left]': '[left]',
        '[Right]': '[right]',
        '[Up]': '[up]',
        '[Down]': '[down]',

        '[Backspace]': '\b',
        '[Insert]': '[insert]',
        '[Del]': '[delete]',
        '[Enter]': '\r',
        '[Tab]': '\t',

        '[F1]': '[f1]',
        '[F2]': '[f2]',
        '[F3]': '[f3]',
        '[F4]': '[f4]',
        '[F5]': '[f5]',
        '[F6]': '[f6]',
        '[F7]': '[f6]',
        '[F8]': '[f8]',
        '[F9]': '[f9]',
        '[F10]': '[f10]',
        '[F11]': '[f11]',
        '[F12]': '[f12]',

        '[Num0]': '[num0]',
        '[Num1]': '[num1]',
        '[Num2]': '[num2]',
        '[Num3]': '[num3]',
        '[Num4]': '[num4]',
        '[Num5]': '[num5]',
        '[Num6]': '[num6]',
        '[Num7]': '[num6]',
        '[Num8]': '[num8]',
        '[Num9]': '[num9]'
    };

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.GUIDriver.Inst.defineMethod('init',
function(windowContext) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {TP.core.Window} windowContext The initial window context to use
     *     to resolve GUI element references, etc.
     * @returns {TP.test.GUIDriver} A new instance.
     */

    this.callNextMethod();

    this.set('windowContext', windowContext);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUIDriver.Inst.defineMethod('fetchResource',
function(aURI, resultType) {

    /**
     * @method fetchResource
     * @summary Fetches the resource at the end of the URI. The result will be
     *     available as the value of the returned promise.
     * @param {TP.uri.URI} The URI to fetch the resource for.
     * @exception TP.sig.InvalidURI
     * @returns {Promise} A Promise which completes when the resource is
     *     available.
     */

    if (!TP.isKindOf(aURI, TP.uri.URI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    //  'Then' a Function onto our internal Promise that will itself return a
    //  Promise when called upon. That Promise will await the 'RequestSucceeded'
    //  signal and resolve the Promise with the result.
    return this.get('promiseProvider').chain(
        function() {
            var promise;

            promise = TP.extern.Promise.construct(
                        function(resolver, rejector) {
                            var subrequest;

                            subrequest = TP.request(
                                            TP.hc('resultType', resultType));

                            subrequest.defineHandler(
                                'RequestSucceeded',
                                function(aResponse) {
                                    //  We succeeded - call the Promise's
                                    //  resolver.
                                    resolver(aResponse.getResult());
                                });

                            subrequest.defineHandler(
                                'RequestFailed',
                                function(aResponse) {
                                    //  We failed - call the Promise's rejector.
                                    rejector(aResponse.getResult());
                                });

                            aURI.getResource(subrequest);
                        });

            return promise;
        }).chainCatch(
        function(err) {
            TP.ifError() ?
                TP.error('Error creating fetchResource Promise: ' +
                            TP.str(err)) : 0;
        });
});

//  ------------------------------------------------------------------------

TP.test.GUIDriver.Inst.defineMethod('getCurrentNativeDocument',
function() {

    /**
     * @method getCurrentNativeDocument
     * @summary Returns the native Document object associated with the current
     *     window context.
     * @returns {Document} The Document of the current window context.
     */

    var context;

    context = this.get('windowContext');

    return context.getNativeDocument();
});

//  ------------------------------------------------------------------------

TP.test.GUIDriver.Inst.defineMethod('getFocusedElement',
function() {

    /**
     * @method getFocusedElement
     * @summary Returns the Element that currently has focus in the current
     *     window context.
     * @returns {Element} The focused Element in the current window context.
     */

    var context;

    context = this.get('windowContext');

    return TP.documentGetFocusedElement(context.getNativeDocument());
});

//  ------------------------------------------------------------------------

TP.test.GUIDriver.Inst.defineMethod('setBodyContent',
function(aURI, aWindow) {

    /**
     * @method setBodyContent
     * @summary Sets the 'body' content of the (X)HTML document in the supplied
     *     Window to the content found at the end of the URI.
     * @param {TP.uri.URI} The URI to fetch content from.
     * @param {TP.core.Window} The Window to use the body of to load the content
     *     into. This will default to the current UI canvas.
     * @exception TP.sig.InvalidURI
     * @returns {TP.test.GUIDriver} The receiver.
     */

    if (!TP.isKindOf(aURI, TP.uri.URI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    //  Fetch the result and then set the Window's body to the result.
    this.fetchResource(aURI, TP.DOM).chain(
        function(result) {
            var tpWin,
                tpDoc,
                tpBody;

            if (TP.isValid(aWindow)) {
                tpWin = aWindow;
            } else {
                tpWin = this.get('windowContext');
            }

            tpDoc = tpWin.getDocument();
            tpBody = tpDoc.getBody();

            tpBody.setContent(result);
        }.bind(this),
        function(error) {
            TP.sys.logTest('Couldn\'t get resource: ' + aURI.getLocation(),
                            TP.Log.ERROR);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUIDriver.Inst.defineMethod('setLocation',
function(aURI, aWindow) {

    /**
     * @method setLocation
     * @summary Sets the location of the supplied Window to the content found
     *     at the end of the URI.
     * @param {TP.uri.URI} The URI to fetch content from.
     * @param {TP.core.Window} The Window to load the content into. This will
     *     default to the current UI canvas.
     * @exception TP.sig.InvalidURI
     * @returns {Promise} A Promise which completes when the resource is
     *     available.
     */

    var tpWin;

    if (!TP.isKindOf(aURI, TP.uri.URI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    //  Set the Window's location to the supplied URI. 'chain' a Function onto
    //  our internal Promise that will itself return a Promise when called upon.
    //  That Promise will await the 'onload' to fire from setting the location,
    //  wait 100ms (to give the GUI a chance to draw) and then resolve the
    //  Promise.

    if (TP.isValid(aWindow)) {
        tpWin = aWindow;
    } else {
        tpWin = this.get('windowContext');
    }

    return this.get('promiseProvider').chain(
        function() {
            var promise;

            promise = TP.extern.Promise.construct(
                            function(resolver, rejector) {
                                var request;

                                request = TP.request();

                                request.atPut(TP.ONLOAD, resolver);
                                request.atPut(TP.ONFAIL, rejector);

                                tpWin.setLocation(aURI, request);
                            });

            return promise;
        }).chainCatch(
        function(err) {
            TP.ifError() ?
                TP.error('Error creating setLocation Promise: ' +
                            TP.str(err)) : 0;
        });
});

//  ------------------------------------------------------------------------

TP.test.GUIDriver.Inst.defineMethod('showTestGUI',
function() {

    /**
     * @method showTestGUI
     * @summary Shows the 'test GUI'. The process by which it does this is
     *     environment dependent (i.e. what tool we're running in, etc).
     * @returns {TP.test.GUIDriver} The receiver.
     */

    /*
       TODO: The TDC is no longer with us - remove this when appropriate
    if (TP.sys.cfg('tibet.tdc') === true) {
        TP.elementHide(TP.byId('UIBOOT', top, false));
        TP.elementShow(TP.byId('UIROOT', top, false));
    } else if (TP.sys.cfg('sherpa.enabled') === true) {
        //  TODO: Make the appropriate GUI window show for the Sherpa, etc.
        void 0;
    }
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUIDriver.Inst.defineMethod('showTestLog',
function() {

    /**
     * @method showTestLog
     * @summary Shows the 'test log'. The process by which it does this is
     *     environment dependent (i.e. what tool we're running in, etc).
     * @returns {TP.test.GUIDriver} The receiver.
     */

    /*
       TODO: The TDC is no longer with us - remove this when appropriate
    if (TP.sys.cfg('tibet.tdc') === true) {
        TP.elementHide(TP.byId('UIROOT', top, false));
        TP.elementShow(TP.byId('UIBOOT', top, false));
    } else if (TP.sys.cfg('sherpa.enabled') === true) {
        //  TODO: Make the appropriate log window show for the Sherpa, etc.
        void 0;
    }
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUIDriver.Inst.defineMethod('constructSequence',
function() {

    /**
     * @method constructSequence
     * @summary Returns a new GUI sequence used to script actions.
     * @returns {TP.test.GUISequence} A new GUI sequence.
     */

    //  If Syn isn't loaded, then throw a TP.sig.UnsupportedOperation exception.
    //  We can't emulate events in that case.
    if (TP.notValid(TP.extern.syn)) {
        return this.raise('TP.sig.UnsupportedOperation');
    }

    return TP.test.GUISequence.construct(this);
});

//  ------------------------------------------------------------------------

TP.test.GUIDriver.Inst.defineMethod('takeScreenshotOf',
function(aNode) {

    /**
     * @method takeScreenshotOf
     * @summary Take a screenshot of either the whole window of the currently
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
     * @returns {TP.test.GUIDriver} The receiver.
     */

    if (TP.sys.cfg('boot.context') !== 'phantomjs') {
        return this.raise('TP.sig.UnsupportedOperation');
    }

    //  http://phantomjs.org/api/webpage/property/clip-rect.html

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('test.GUISequence');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineAttribute('sequenceEntries');
TP.test.GUISequence.Inst.defineAttribute('driver');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('init',
function(driver) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {TP.test.GUIDriver} driver The GUI driver which created this sequence
     *     and is being used in conjunction with it to drive the GUI.
     * @returns {TP.test.GUISequence} The receiver.
     */

    this.callNextMethod();

    this.set('sequenceEntries', TP.ac());
    this.set('driver', driver);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('altKeyDown',
function(aPath) {

    /**
     * @method altKeyDown
     * @summary Simulate the act of pressing the 'Alt' key down.
     * @param {TP.path.AccessPath} aPath The access path to the target element
     *     that should have the 'Alt' key pressed down over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @returns {TP.test.GUISequence} The receiver.
     */

    this.keyDown('Alt', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('altKeyUp',
function(aPath) {

    /**
     * @method altKeyUp
     * @summary Simulate the act of releasing the 'Alt' key up.
     * @param {TP.path.AccessPath} aPath The access path to the target element
     *     that should have the 'Alt' key released up over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @returns {TP.test.GUISequence} The receiver.
     */

    this.keyUp('Alt', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('click',
function(mouseLocation, mouseButton) {

    /**
     * @method click
     * @summary Simulates the act of clicking the mouse button.
     * @description Note that this method has a notion of a 'currently focused'
     *     element, but it is important to note that this will be the element
     *     that is currently focused *when the sequence that this method belongs
     *     to is executed* (which won't happen until run() is called).
     * @param {Element|TP.path.AccessPath|TP.gui.Point|Constant} mouseLocation
     *     The mouse target location, given as either a target Element, an
     *     AccessPath that can be used to find the element, a Point that will be
     *     used with the currently focused element or as a mouse button
     *     constant, in which case the currently focused element will be used.
     *     If this parameter is not supplied or null, the currently focused
     *     element will be used as well.
     * @param {Constant} mouseButton A mouse button constant. This parameter is
     *     usually used if the mouseLocation parameter has a real value and
     *     can't be used to specify the mouse button.
     * @returns {TP.test.GUISequence} The receiver.
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
    } else if (TP.isKindOf(mouseLocation, TP.dom.ElementNode)) {
        //  Otherwise, if a TP.dom.ElementNode has been supplied, unwrap and use
        //  that.
        target = TP.unwrap(mouseLocation);
    } else if (mouseLocation.isAccessPath()) {
        //  Otherwise, if a TP.path.AccessPath has been supplied, that will be
        //  used to determine the target element.
        target = mouseLocation;
    } else if (TP.isKindOf(mouseLocation, TP.gui.Point)) {
        //  Otherwise, if a TP.gui.Point has been supplied then we set the
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

    //  If we got a valid TP.gui.Point supplied as the mouse location, then we
    //  go ahead and supply it as the argument for this step in the sequence.
    //  Otherwise, it will have to be computed from the target in the sequence
    //  performing routine.
    if (TP.isValid(point)) {
        this.get('sequenceEntries').add(
                TP.ac(
                    eventName,
                    target,
                    {
                        pageX: point.getX(),
                        pageY: point.getY()
                    }));
    } else {
        this.get('sequenceEntries').add(
                TP.ac(eventName, target));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('ctrlKeyDown',
function(aPath) {

    /**
     * @method ctrlKeyDown
     * @summary Simulate the act of pressing the 'Control' key down.
     * @param {TP.path.AccessPath} aPath The access path to the target element
     *     that should have the 'Control' key pressed down over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @returns {TP.test.GUISequence} The receiver.
     */

    this.keyDown('Control', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('ctrlKeyUp',
function(aPath) {

    /**
     * @method ctrlKeyUp
     * @summary Simulate the act of releasing the 'Control' key up.
     * @param {TP.path.AccessPath} aPath The access path to the target element
     *     that should have the 'Control' key released up over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @returns {TP.test.GUISequence} The receiver.
     */

    this.keyUp('Control', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('doubleClick',
function(mouseLocation, mouseButton) {

    /**
     * @method doubleClick
     * @summary Simulates the act of double clicking the mouse button.
     * @description Note that this method has a notion of a 'currently focused'
     *     element, but it is important to note that this will be the element
     *     that is currently focused *when the sequence that this method belongs
     *     to is executed* (which won't happen until the 'run()' method is
     *     called).
     * @param {Element|TP.path.AccessPath|TP.gui.Point|Constant} mouseLocation
     *     The mouse target location, given as either a target Element, an
     *     AccessPath that can be used to find the element, a Point that will be
     *     used with the currently focused element or as a mouse button
     *     constant, in which case the currently focused element will be used.
     *     If this parameter is not supplied or null, the currently focused
     *     element will be used as well.
     * @param {Constant} mouseButton A mouse button constant. This parameter is
     *     usually used if the mouseLocation parameter has a real value and
     *     can't be used to specify the mouse button.
     * @returns {TP.test.GUISequence} The receiver.
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
    } else if (TP.isKindOf(mouseLocation, TP.dom.ElementNode)) {
        //  Otherwise, if a TP.dom.ElementNode has been supplied, unwrap and use
        //  that.
        target = TP.unwrap(mouseLocation);
    } else if (mouseLocation.isAccessPath()) {
        //  Otherwise, if a TP.path.AccessPath has been supplied, that will be
        //  used to determine the target element.
        target = mouseLocation;
    } else if (TP.isKindOf(mouseLocation, TP.gui.Point)) {
        //  Otherwise, if a TP.gui.Point has been supplied then we set the
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

    //  If we got a valid TP.gui.Point supplied as the mouse location, then we
    //  go ahead and supply it as the argument for this step in the sequence.
    //  Otherwise, it will have to be computed from the target in the sequence
    //  performing routine.
    if (TP.isValid(point)) {
        this.get('sequenceEntries').add(
                TP.ac(
                    eventName,
                    target,
                    {
                        pageX: point.getX(),
                        pageY: point.getY()
                    }));
    } else {
        this.get('sequenceEntries').add(
                TP.ac(eventName, target));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('exec',
function(aFunction) {

    /**
     * @method exec
     * @summary Executes the supplied Function as a step in the sequence.
     * @param {Function} aFunction The Function to execute.
     * @returns {TP.test.GUISequence} The receiver.
     */

    if (TP.isCallable(aFunction)) {
        this.get('sequenceEntries').add(TP.ac('exec', aFunction));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('$expandSequenceEntries',
function(entries) {

    /**
     * @method $expandSequenceEntries
     * @summary Expands the supplied Array of sequence entries into a set
     *     where, if an entry's 'target' reference expands into more than one
     *     target element, an individual entry is made for each one of those
     *     targets.
     * @param {Array} entries The initial set of sequence entries.
     * @returns {Array} The fully expanded Array of sequence entries.
     */

    var driver,

        newEntries,

        len,
        i,

        entry,

        targets;

    driver = this.get('driver');

    newEntries = TP.ac();

    //  Loop over each entry and expand it to more than one entry if it's target
    //  resolves to more than one target.

    len = entries.getSize();
    for (i = 0; i < len; i++) {
        entry = entries.at(i);

        targets = entry.at(1);

        if (TP.isNode(targets)) {
            //  The target is already a Node
            void 0;
        } else if (TP.isKindOf(targets, TP.dom.Node)) {
            targets = TP.unwrap(targets);
        } else if (targets.isAccessPath()) {
            targets = targets.executeGet(driver.getCurrentNativeDocument());
        }

        if (TP.isArray(targets)) {
            /* eslint-disable no-loop-func */
            targets.perform(
                function(aTarget) {
                    newEntries.push(TP.ac(entry.at(0), aTarget, entry.at(2)));
                });
            /* eslint-enable no-loop-func */
        } else {
            newEntries.push(TP.ac(entry.at(0), targets, entry.at(2)));
        }
    }

    return newEntries;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('keyDown',
function(keyLocation, aKey) {

    /**
     * @method keyDown
     * @summary Simulate the act of pressing the supplied key down.
     * @param {Element|TP.path.AccessPath|String} keyLocation
     *     The key target location, given as either a target Element or as an
     *     AccessPath that can be used to find the element. If this parameter is
     *     not supplied or null, the currently focused element will be used.
     * @param {String} aKey The key to simulate pressing down.
     * @returns {TP.test.GUISequence} The receiver.
     */

    var target,
        key;

    //  If there was no valid location supplied, then we just set the target to
    //  TP.CURRENT, which means to use the currently focused element whenever
    //  the sequence is executed.
    if (TP.notValid(keyLocation)) {
        target = TP.CURRENT;
    } else if (TP.isElement(keyLocation)) {
        //  Otherwise, if an Element has been supplied, use that.
        target = keyLocation;
    } else if (TP.isKindOf(keyLocation, TP.dom.ElementNode)) {
        //  Otherwise, if a TP.dom.ElementNode has been supplied, unwrap and use
        //  that.
        target = TP.unwrap(keyLocation);
    } else if (keyLocation.isAccessPath()) {
        //  Otherwise, if a TP.path.AccessPath has been supplied, that will be
        //  used to determine the target element.
        target = keyLocation;
    } else if (TP.isKindOf(keyLocation, String)) {
        //  Otherwise, if a String has been supplied then we set the target to
        //  TP.CURRENT, which tells the sequence performing routine to use
        //  whatever the currently focused element is at the time it is
        //  executing the sequence.
        key = keyLocation;
        target = TP.CURRENT;
    } else {
        //  TODO: Raise an exception
        return this;
    }

    if (TP.notValid(key)) {
        key = aKey;
    }

    this.get('sequenceEntries').add(TP.ac('keydown', target, key));

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('keyUp',
function(keyLocation, aKey) {

    /**
     * @method keyUp
     * @summary Simulate the act of releasing the supplied key up.
     * @param {Element|TP.path.AccessPath|String} keyLocation
     *     The key target location, given as either a target Element or as an
     *     AccessPath that can be used to find the element. If this parameter is
     *     not supplied or null, the currently focused element will be used.
     * @param {String} aKey The key to simulate releasing up.
     * @returns {TP.test.GUISequence} The receiver.
     */

    var target,
        key;

    //  If there was no valid location supplied, then we just set the target to
    //  TP.CURRENT, which means to use the currently focused element whenever
    //  the sequence is executed.
    if (TP.notValid(keyLocation)) {
        target = TP.CURRENT;
    } else if (TP.isElement(keyLocation)) {
        //  Otherwise, if an Element has been supplied, use that.
        target = keyLocation;
    } else if (TP.isKindOf(keyLocation, TP.dom.ElementNode)) {
        //  Otherwise, if a TP.dom.ElementNode has been supplied, unwrap and use
        //  that.
        target = TP.unwrap(keyLocation);
    } else if (keyLocation.isAccessPath()) {
        //  Otherwise, if a TP.path.AccessPath has been supplied, that will be
        //  used to determine the target element.
        target = keyLocation;
    } else if (TP.isKindOf(keyLocation, String)) {
        //  Otherwise, if a String has been supplied then we set the target to
        //  TP.CURRENT, which tells the sequence performing routine to use
        //  whatever the currently focused element is at the time it is
        //  executing the sequence.
        key = keyLocation;
        target = TP.CURRENT;
    } else {
        //  TODO: Raise an exception
        return this;
    }

    if (TP.notValid(key)) {
        key = aKey;
    }

    this.get('sequenceEntries').add(TP.ac('keyup', target, key));

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('metaKeyDown',
function(aPath) {

    /**
     * @method metaKeyDown
     * @summary Simulate the act of pressing the 'Meta' key down.
     * @param {TP.path.AccessPath} aPath The access path to the target element
     *     that should have the 'Meta' key pressed down over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @returns {TP.test.GUISequence} The receiver.
     */

    this.keyDown('Meta', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('metaKeyUp',
function(aPath) {

    /**
     * @method metaKeyUp
     * @summary Simulate the act of releasing the 'Meta' key up.
     * @param {TP.path.AccessPath} aPath The access path to the target element
     *     that should have the 'Meta' key released up over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @returns {TP.test.GUISequence} The receiver.
     */

    this.keyUp('Meta', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('mouseDown',
function(mouseLocation, mouseButton) {

    /**
     * @method mouseDown
     * @summary Simulates the act of pressing the mouse button down.
     * @description Note that this method has a notion of a 'currently focused'
     *     element, but it is important to note that this will be the element
     *     that is currently focused *when the sequence that this method belongs
     *     to is executed* (which won't happen until the 'run()' method is
     *     called).
     * @param {Element|TP.path.AccessPath|TP.gui.Point|Constant} mouseLocation
     *     The mouse target location, given as either a target Element, an
     *     AccessPath that can be used to find the element, a Point that will be
     *     used with the currently focused element or as a mouse button
     *     constant, in which case the currently focused element will be used.
     *     If this parameter is not supplied or null, the currently focused
     *     element will be used as well.
     * @param {Constant} mouseButton A mouse button constant. This parameter is
     *     usually used if the mouseLocation parameter has a real value and
     *     can't be used to specify the mouse button.
     * @returns {TP.test.GUISequence} The receiver.
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
    } else if (TP.isKindOf(mouseLocation, TP.dom.ElementNode)) {
        //  Otherwise, if a TP.dom.ElementNode has been supplied, unwrap and use
        //  that.
        target = TP.unwrap(mouseLocation);
    } else if (mouseLocation.isAccessPath()) {
        //  Otherwise, if a TP.path.AccessPath has been supplied, that will be
        //  used to determine the target element.
        target = mouseLocation;
    } else if (TP.isKindOf(mouseLocation, TP.gui.Point)) {
        //  Otherwise, if a TP.gui.Point has been supplied then we set the
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

    //  If we got a valid TP.gui.Point supplied as the mouse location, then we
    //  go ahead and supply it as the argument for this step in the sequence.
    //  Otherwise, it will have to be computed from the target in the sequence
    //  performing routine.
    if (TP.isValid(point)) {
        this.get('sequenceEntries').add(
                TP.ac(
                    eventName,
                    target,
                    {
                        pageX: point.getX(),
                        pageY: point.getY()
                    }));
    } else {
        this.get('sequenceEntries').add(
                TP.ac(eventName, target));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('mouseUp',
function(mouseLocation, mouseButton) {

    /**
     * @method mouseUp
     * @summary Simulates the act of releasing the mouse button up.
     * @description Note that this method has a notion of a 'currently focused'
     *     element, but it is important to note that this will be the element
     *     that is currently focused *when the sequence that this method belongs
     *     to is executed* (which won't happen until the 'run()' method is
     *     called).
     * @param {Element|TP.path.AccessPath|TP.gui.Point|Constant} mouseLocation
     *     The mouse target location, given as either a target Element, an
     *     AccessPath that can be used to find the element, a Point that will be
     *     used with the currently focused element or as a mouse button
     *     constant, in which case the currently focused element will be used.
     *     If this parameter is not supplied or null, the currently focused
     *     element will be used as well.
     * @param {Constant} mouseButton A mouse button constant. This parameter is
     *     usually used if the mouseLocation parameter has a real value and
     *     can't be used to specify the mouse button.
     * @returns {TP.test.GUISequence} The receiver.
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
    } else if (TP.isKindOf(mouseLocation, TP.dom.ElementNode)) {
        //  Otherwise, if a TP.dom.ElementNode has been supplied, unwrap and use
        //  that.
        target = TP.unwrap(mouseLocation);
    } else if (mouseLocation.isAccessPath()) {
        //  Otherwise, if a TP.path.AccessPath has been supplied, that will be
        //  used to determine the target element.
        target = mouseLocation;
    } else if (TP.isKindOf(mouseLocation, TP.gui.Point)) {
        //  Otherwise, if a TP.gui.Point has been supplied then we set the
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

    //  If we got a valid TP.gui.Point supplied as the mouse location, then we
    //  go ahead and supply it as the argument for this step in the sequence.
    //  Otherwise, it will have to be computed from the target in the sequence
    //  performing routine.
    if (TP.isValid(point)) {
        this.get('sequenceEntries').add(
                TP.ac(
                    eventName,
                    target,
                    {
                        pageX: point.getX(),
                        pageY: point.getY()
                    }));
    } else {
        this.get('sequenceEntries').add(
                TP.ac(eventName, target));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('run',
function() {

    /**
     * @method run
     * @summary Executes the sequence.
     * @description Note that the steps that comprise the sequence are all
     *     executed in a 'chained' manner, so that if there are asynchronous
     *     delays in certain actions, they will all be executed in the proper
     *     order. Also note that this method generates a Promise, which is then
     *     chained to the driver's Promise supplier's internal Promise, so that
     *     if there are other asynchronous actions that are using Promises from
     *     the receiver's driver's Promise supplier, this method will respect
     *     that.
     * @returns {TP.test.GUISequence} The receiver.
     */

    var provider,

        thisref;

    provider = this.get('driver').get('promiseProvider');

    thisref = this;

    //  'Then' a Function onto our internal Promise that will itself return a
    //  Promise when called upon. That Promise will execute set up a 'work'
    //  callback function that executes each entry in the sequence and then
    //  resolves the Promise after executing the last entry.
    provider.chain(
        function() {
            var promise;

            promise = TP.extern.Promise.construct(
                function(resolver, rejector) {

                    var sequenceEntries,

                        driver,

                        count,
                        workFunc;

                    sequenceEntries = thisref.get('sequenceEntries');
                    driver = thisref.get('driver');

                    //  'Expand' any event targets in the sequence entries
                    sequenceEntries = thisref.$expandSequenceEntries(
                                                        sequenceEntries);

                    //  Set up the work function that will process a single
                    //  entry and then supply a callback that will call back the
                    //  work function, but only after a delay to give the GUI a
                    //  chance to refresh.
                    count = 0;
                    workFunc = function() {

                        var seqEntry,
                            currentElement,

                            workCallback;

                        //  If the count equals the number of entries, then
                        //  we're done here and we can resolve the Promise.
                        if (count === sequenceEntries.getSize()) {

                            sequenceEntries = null;

                            return resolver();
                        }

                        seqEntry = sequenceEntries.at(count);
                        count++;

                        //  If it's an 'exec', then we're just executing a
                        //  Function. Execute it and then make sure to call the
                        //  resolver.
                        if (seqEntry.at(0) === 'exec') {
                            seqEntry.at(1)();

                            return workFunc();
                        } else {

                            //  If we can't determine a focused element, call
                            //  the error callback and exit.
                            if (!TP.isElement(
                                currentElement = driver.getFocusedElement())) {

                                sequenceEntries = null;

                                return rejector(
                                    'No current Element for the GUI Driver.');
                            }

                            //  We fork the work function here to give the GUI
                            //  a chance to refresh before we manipulate it.
                            //  Note the return value from setTimeout is the
                            //  timeout object - but the callback
                            //  handed to $performGUISequenceStep() expects a
                            //  Function object, therefore we have to wrap it.
                            workCallback =
                                function() {
                                    setTimeout(workFunc,
                                        TP.sys.cfg('test.anti_starve_timeout'));
                                };

                            //  Execute the individual sequence step entry.
                            thisref.$performGUISequenceStep(
                                seqEntry.at(1),
                                seqEntry.at(0),
                                seqEntry.at(2),
                                workCallback,
                                currentElement);
                        }
                    };

                    workFunc();
                });

            return promise;
        }).chainCatch(
        function(err) {
            TP.ifError() ?
                TP.error('Error creating GUI automation \'run\' Promise: ' +
                            TP.str(err)) : 0;
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('$performGUISequenceStep',
function(target, type, args, callback, currentElement) {

    /**
     * @method $performGUISequenceStep
     * @summary Actually performs the sequence step, firing an event at the
     *     supplied target element.
     * @param {Element} target The element to target the event at.
     * @param {String} type The type of event to generate.
     * @param {Object} args The configuration argument used by Syn to build the
     *     event.
     * @param {Function} callback The callback function to execute when the
     *     event dispatch is complete.
     * @param {Element} currentElement The currently focused Element.
     * @returns {TP.test.GUISequence} The receiver.
     */

    var populateSynArgs,

        syn,

        finalTarget,

        evtArgs,

        doc,
        newEvent;

    //  An 'args' normalization routine that makes sure that some of Syn's
    //  arguments are set properly to deal with the fact that Syn's defaults
    //  assume that the element is in the top-level window's document.
    populateSynArgs = function(initialArgs, elemTarget) {
        var synArgs;

        if (TP.notValid(synArgs = initialArgs)) {
            synArgs = {};
        }

        if (TP.isString(synArgs)) {
            synArgs = synArgs.replace(
                /\[[a-zA-Z0-9-]+?\]/g,
                function(tibetKey) {
                    var synKey;

                    if (TP.isValid(
                            synKey =
                            TP.extern.syn.tibetSpecialKeyMap[tibetKey])) {
                        return synKey;
                    }

                    return tibetKey;
                });

            return synArgs;
        } else if (TP.isArray(synArgs)) {

            synArgs = synArgs.collect(
                function(anItem) {
                    return anItem.replace(
                        /\[[a-zA-Z0-9-]+?\]/g,
                        function(tibetKey) {
                            var synKey;

                            if (TP.isValid(
                                synKey = TP.extern.syn.
                                            tibetSpecialKeyMap[tibetKey])) {
                                return synKey;
                            }

                            return tibetKey;
                        });
                });
        }

        synArgs.relatedTarget = null;
        synArgs.view = TP.nodeGetWindow(elemTarget);

        //  We must make sure that clientX & clientY are defined, otherwise Syn
        //  will crash with the setting we make above... it assumes that the
        //  document of the element is the top-level window... sigh.
        synArgs.clientX = synArgs.clientX || 0;
        synArgs.clientY = synArgs.clientY || 0;

        return synArgs;
    };

    syn = TP.extern.syn;

    if (!TP.isElement(finalTarget = target)) {
        finalTarget = currentElement;
    }

    //  The three parameters are:
    //      1. The type of operation, used in the switch below.
    //      2. The target of the operation. This could be an Element specified
    //      by the user, an Element derived from an access path given by the
    //      user (multiple Elements will have been expanded into multiple
    //      entries or the currently focused Element as supplied to this method.
    //      3. Operation-specific arguments.

    //  Invoke the Syn handler. If we're the last in the
    //  sequence, then hand in the event callback we generated
    //  above (and wrapped in the Promise).
    switch (type) {
        case 'click':

            evtArgs = populateSynArgs(args, finalTarget);

            syn.click(evtArgs, finalTarget, callback);

            break;

        case 'dblclick':

            evtArgs = populateSynArgs(args, finalTarget);

            syn.dblclick(evtArgs, finalTarget, callback);

            break;

        case 'rightclick':

            evtArgs = populateSynArgs(args, finalTarget);

            syn.rightClick(evtArgs, finalTarget, callback);

            break;

        case 'key':

            evtArgs = populateSynArgs(args, finalTarget);

            syn.key(evtArgs, finalTarget, callback);

            break;

        case 'keys':

            evtArgs = populateSynArgs(args, finalTarget);

            syn.type(evtArgs, finalTarget, callback);

            break;

        case 'mousedown':
        case 'mouseup':

            /* eslint-disable wrap-iife */
            (function() {
                var evtHandler;

                evtHandler = function(anEvt) {
                    finalTarget.removeEventListener(type, evtHandler, false);
                    evtHandler.callback();
                };

                evtHandler.callback = callback;
                finalTarget.addEventListener(type, evtHandler, false);
            })();
            /* eslint-enable wrap-iife */

            evtArgs = populateSynArgs(args, finalTarget);

            syn.trigger(
                type,
                //  TODO: Verify this:
                {},
                finalTarget);

            break;

        case 'keydown':
        case 'keyup':

            /* eslint-disable wrap-iife */
            (function() {
                var evtHandler;

                evtHandler = function(anEvt) {
                    finalTarget.removeEventListener(type, evtHandler, false);
                    evtHandler.callback();
                };

                evtHandler.callback = callback;
                finalTarget.addEventListener(type, evtHandler, false);
            })();
            /* eslint-enable wrap-iife */

            evtArgs = populateSynArgs(args, finalTarget);

            syn.trigger(
                type,
                TP.extern.syn.key.options(evtArgs, type),
                finalTarget);

            break;

        case 'sendevent':

            doc = TP.nodeGetDocument(finalTarget);
            newEvent = TP.documentConstructEvent(doc, args);

            /* eslint-disable wrap-iife */
            (function() {
                var evtHandler;

                evtHandler = function(anEvt) {
                    finalTarget.removeEventListener(args.at('type'),
                                                    evtHandler,
                                                    false);
                    evtHandler.callback();
                };

                evtHandler.callback = callback;
                finalTarget.addEventListener(args.at('type'),
                                                evtHandler,
                                                false);
            })();
            /* eslint-enable wrap-iife */

            finalTarget.dispatchEvent(newEvent);

            break;

        default:
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('sendEvent',
function(eventInfo, aPath) {

    /**
     * @method sendEvent
     * @summary Sends the event as described in the supplied eventInfo. See the
     *     TP.documentConstructEvent() call for more information on the fields
     *     recognized ere.
     * @param {TP.core.Hash|Object} eventInfo The event information used to
     *     create the event to send.
     * @param {TP.path.AccessPath} aPath The access path to the target element
     *     that should be the target of the event. If this isn't supplied,
     *     the currently focused element in the receiver's owning driver's
     *     window context will be used as the target for this event.
     * @returns {TP.test.GUISequence} The receiver.
     */

    var target;

    target = TP.ifInvalid(aPath, TP.CURRENT);

    this.get('sequenceEntries').add(TP.ac('sendevent', target, eventInfo));

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('sendKeys',
function(aString, aPath) {

    /**
     * @method sendKeys
     * @summary Simulate the act of pressing and releasing the sequence of keys
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
     * @param {TP.path.AccessPath} aPath The access path to the target element
     *     that should have the keys pressed down and released up over. If this
     *     isn't supplied, the currently focused element in the receiver's
     *     owning driver's window context will be used as the target for this
     *     event.
     * @returns {TP.test.GUISequence} The receiver.
     */

    var target;

    target = TP.ifInvalid(aPath, TP.CURRENT);

    this.get('sequenceEntries').add(TP.ac('keys', target, aString));

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('shiftKeyDown',
function(aPath) {

    /**
     * @method shiftKeyDown
     * @summary Simulate the act of pressing the 'Shift' key down.
     * @param {TP.path.AccessPath} aPath The access path to the target element
     *     that should have the 'Shift' key pressed down over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @returns {TP.test.GUISequence} The receiver.
     */

    this.keyDown('Shift', aPath);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.GUISequence.Inst.defineMethod('shiftKeyUp',
function(aPath) {

    /**
     * @method shiftKeyUp
     * @summary Simulate the act of releasing the 'Shift' key up.
     * @param {TP.path.AccessPath} aPath The access path to the target element
     *     that should have the 'Shift' key released up over. If this isn't
     *     supplied, the currently focused element in the receiver's owning
     *     driver's window context will be used as the target for this event.
     * @returns {TP.test.GUISequence} The receiver.
     */

    this.keyUp('Shift', aPath);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
