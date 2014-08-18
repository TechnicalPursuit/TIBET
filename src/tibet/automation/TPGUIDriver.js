//  ========================================================================
/**
 * @file TPGUIDriver.js
 * @overview Support for an automated way of driving a GUI.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */
//  ------------------------------------------------------------------------

/**
 */

/* global Q:true,
          Syn:true
*/

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('gui.Driver');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineAttribute('windowContext');

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

    kinds.special = TP.ac('Shift', 'Control', 'Alt', 'CapsLock');
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
     * Creates a new instance.
     * @param {windowContext} TP.core.Window
     * @return {TP.gui.Driver} A new instance.
     */

    this.callNextMethod();

    this.set('windowContext', windowContext);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('byClassName',
function(className) {

    /**
     */

    return this.byCSS('.' + className);
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('byCSS',
function(cssExpr) {

    /**
     */

    var context,
    
        result;

    context = this.get('windowContext');

    result = TP.byCSS(cssExpr, context, true);

    return TP.wrap(result);
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('byId',
function(anID) {

    /**
     */

    var context,
    
        result;

    context = this.get('windowContext');

    result = TP.byId(anID, context);

    return TP.wrap(result);
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('byJS',
function(aFunc) {

    /**
     */

    var result;

    if (!TP.isCallable(aFunc)) {
        return null;
    }

    if (TP.isEmpty(result = aFunc())) {
        return null;
    }

    return TP.wrap(result);
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('byLinkText',
function(text) {

    /**
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('byName',
function(aName) {

    /**
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('byPartialLinkText',
function(text) {

    /**
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('byTagName',
function(aName) {

    /**
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('byXPath',
function(aPath) {

    /**
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('fetchResource',
function(aURI, resultType) {

    var newPromise;

    newPromise = Q.Promise(
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

    return newPromise;
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('getFocusedElement',
function() {

    /**
     */

    var context;
    
    context = this.get('windowContext');

    return TP.documentGetFocusedElement(context.getNativeDocument());
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('startSequence',
function() {

    /**
     */

    return TP.gui.Sequence.construct(this);
});

//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineMethod('takeScreenshotOf',
function(aNode) {

    /**
     */

    if (TP.sys.cfg('boot.context') !== 'phantomjs') {
        //  TODO: Log a warning
        return this;
    }

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('gui.Sequence');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineAttribute('driver');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('init',
function(driver) {

    /**
     */

    this.callNextMethod();

    this.set('sequenceEntries', TP.ac());
    this.set('driver', driver);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('click',
function(aLocation, mouseButton) {

    /**
     * @name click
     * @synopsis
     * @returns
     * @todo
     */

    var point,
        button,
        currentElement,
    
        eventName;

    if (TP.isElement(aLocation)) {
        currentElement = aLocation;
    } else if (TP.isKindOf(aLocation, TP.core.Point)) {
        point = aLocation;
    } else if (aLocation === TP.LEFT || aLocation === TP.RIGHT) {
        button = aLocation;
    } else {
        //  TODO: Raise an exception
        return this;
    }

    if (!TP.isValid(point)) {

        if (!TP.isElement(currentElement)) {
            currentElement = this.get('driver').getFocusedElement();

            if (!TP.isElement(currentElement)) {
                //  TODO: Raise an exception
                return this;
            }
        }

        point = TP.wrap(currentElement).getPagePoint().getCenterPoint();
    }

    if (TP.notValid(button)) {
        button = mouseButton;
    }

    if (button === TP.RIGHT) {
        eventName = 'rightclick';
    } else {
        eventName = 'click';
    }

    this.get('sequenceEntries').add(
            TP.ac(eventName,
                    currentElement,
                    {pageX: point.getX(), pageY: point.getY()}));

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('doubleClick',
function(aLocation, mouseButton) {

    /**
     * @name doubleClick
     * @synopsis
     * @returns
     * @todo
     */

    var point,
        button,
        currentElement,
    
        eventName;

    if (TP.isElement(aLocation)) {
        currentElement = aLocation;
    } else if (TP.isKindOf(aLocation, TP.core.Point)) {
        point = aLocation;
    } else if (aLocation === TP.LEFT || aLocation === TP.RIGHT) {
        button = aLocation;
    } else {
        //  TODO: Raise an exception
        return this;
    }

    if (!TP.isValid(point)) {

        if (!TP.isElement(currentElement)) {
            currentElement = this.get('driver').getFocusedElement();

            if (!TP.isElement(currentElement)) {
                //  TODO: Raise an exception
                return this;
            }
        }

        point = TP.wrap(currentElement).getPagePoint().getCenterPoint();
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

    this.get('sequenceEntries').add(
            TP.ac(eventName,
                    currentElement,
                    {pageX: point.getX(), pageY: point.getY()}));

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('keyDown',
function(aKey) {

    /**
     * @name keyDown
     * @synopsis
     * @returns
     * @todo
     */

    var currentElement;

    if (!TP.isElement(
            currentElement = this.get('driver').getFocusedElement())) {
        //  TODO: Raise an exception
        return this;
    }
    
    this.get('sequenceEntries').add(TP.ac('keydown', currentElement, aKey));

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('keyUp',
function(aKey) {

    /**
     * @name keyUp
     * @synopsis
     * @returns
     * @todo
     */

    var currentElement;

    if (!TP.isElement(
            currentElement = this.get('driver').getFocusedElement())) {
        //  TODO: Raise an exception
        return this;
    }
    
    this.get('sequenceEntries').add(TP.ac('keyup', currentElement, aKey));

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('mouseDown',
function(aLocation, mouseButton) {

    /**
     * @name mouseDown
     * @synopsis
     * @returns
     * @todo
     */

    var point,
        button,
        currentElement,
    
        eventName;

    if (TP.isElement(aLocation)) {
        currentElement = aLocation;
    } else if (TP.isKindOf(aLocation, TP.core.Point)) {
        point = aLocation;
    } else if (aLocation === TP.LEFT || aLocation === TP.RIGHT) {
        button = aLocation;
    } else {
        //  TODO: Raise an exception
        return this;
    }

    if (!TP.isValid(point)) {

        if (!TP.isElement(currentElement)) {
            currentElement = this.get('driver').getFocusedElement();

            if (!TP.isElement(currentElement)) {
                //  TODO: Raise an exception
                return this;
            }
        }

        point = TP.wrap(currentElement).getPagePoint().getCenterPoint();
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

    this.get('sequenceEntries').add(
            TP.ac(eventName,
                    currentElement,
                    {pageX: point.getX(), pageY: point.getY()}));

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('mouseUp',
function(aLocation, mouseButton) {

    /**
     * @name mouseUp
     * @synopsis
     * @returns
     * @todo
     */

    var point,
        button,
        currentElement,
    
        eventName;

    if (TP.isElement(aLocation)) {
        currentElement = aLocation;
    } else if (TP.isKindOf(aLocation, TP.core.Point)) {
        point = aLocation;
    } else if (aLocation === TP.LEFT || aLocation === TP.RIGHT) {
        button = aLocation;
    } else {
        //  TODO: Raise an exception
        return this;
    }

    if (!TP.isValid(point)) {

        if (!TP.isElement(currentElement)) {
            currentElement = this.get('driver').getFocusedElement();

            if (!TP.isElement(currentElement)) {
                //  TODO: Raise an exception
                return this;
            }
        }

        point = TP.wrap(currentElement).getPagePoint().getCenterPoint();
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

    this.get('sequenceEntries').add(
            TP.ac(eventName,
                    currentElement,
                    {pageX: point.getX(), pageY: point.getY()}));

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('perform',
function() {

    /**
     */

    var sequenceEntries;

    sequenceEntries = this.get('sequenceEntries');

    sequenceEntries.perform(
        function(entry) {
            var type,
                target,
                args;

            type = entry.at(0);

            target = entry.at(1);
            args = entry.at(2);

            switch(type) {
                case 'click':
                    TP.extern.syn.click(args, target);
                break;

                case 'dblclick':
                    TP.extern.syn.dblclick(args, target);
                break;

                case 'rightclick':
                    TP.extern.syn.rightClick(args, target);
                break;

                case 'key':
                    TP.extern.syn.key(args, target);
                break;

                case 'keys':
                    TP.extern.syn.type(args, target);
                break;

                case 'mousedown':
                    TP.extern.syn.trigger(
                            'mousedown',
                            TP.extern.syn.key.options(args, 'mousedown'),
                            target);
                break;

                case 'mouseup':
                    TP.extern.syn.trigger(
                            'mouseup',
                            TP.extern.syn.key.options(args, 'mouseup'),
                            target);
                break;

                case 'keydown':
                    TP.extern.syn.trigger(
                            'keydown',
                            TP.extern.syn.key.options(args, 'keydown'),
                            target);
                break;

                case 'keyup':
                    TP.extern.syn.trigger(
                            'keyup',
                            TP.extern.syn.key.options(args, 'keyup'),
                            target);
                break;

                default:
                break;
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Sequence.Inst.defineMethod('sendKeys',
function(aString) {

    /**
     * @name sendKeys
     * @synopsis
     * @returns
     * @todo
     */

    var currentElement;

    if (!TP.isElement(
            currentElement = this.get('driver').getFocusedElement())) {
        //  TODO: Raise an exception
        return this;
    }

    this.get('sequenceEntries').add(TP.ac('keys', currentElement, aString));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
