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

/* global Q:true
*/

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('gui.Driver');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.Driver.Inst.defineAttribute('windowContext');

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

    if (!TP.isElement(currentElement)) {
        currentElement = this.get('driver').getFocusedElement();

        if (!TP.isElement(currentElement)) {
            //  TODO: Raise an exception
            return this;
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

    if (!TP.isElement(currentElement)) {
        currentElement = this.get('driver').getFocusedElement();

        if (!TP.isElement(currentElement)) {
            //  TODO: Raise an exception
            return this;
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

    if (!TP.isElement(currentElement)) {
        currentElement = this.get('driver').getFocusedElement();

        if (!TP.isElement(currentElement)) {
            //  TODO: Raise an exception
            return this;
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

    if (!TP.isElement(currentElement)) {
        currentElement = this.get('driver').getFocusedElement();

        if (!TP.isElement(currentElement)) {
            //  TODO: Raise an exception
            return this;
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

TP.gui.Sequence.Inst.defineMethod('sendKeysOld',
function(varargs) {

    /**
     * @name sendKeys
     * @synopsis
     * @returns
     * @todo
     */

    var hash,

        i,
        val,

        evt;

    //  driver.startSequence().sendKeys(
    //      'DOM_A_Down', 'DOM_B_Up').
    //      perform();

    //  Each argument should be something like:
    //      DOM_A_Down
    //      DOM_Alt_Shift_Up_Up
    //  Modifiers *are* order dependent and that the order is:
    //  Meta-Ctrl-Alt-Shift

    for (i = 0; i < arguments.length; i++) {

        hash = TP.hc('target', null, 'bubbles', true, 'cancelable', true);

        val = arguments[i].strip(/DOM_/);

        if (TP.regex.META.test(val)) {
            hash.atPut('metaKey', true);
            val = val.strip(TP.regex.META);
        }

        if (TP.regex.CTRL.test(val)) {
            hash.atPut('ctrlKey', true);
            val = val.strip(TP.regex.CTRL);
        }

        if (TP.regex.ALT.test(val)) {
            hash.atPut('altKey', true);
            val = val.strip(TP.regex.ALT);
        }

        if (TP.regex.SHIFT.test(val)) {
            hash.atPut('shiftKey', true);
            val = val.strip(TP.regex.SHIFT);
        }

        var type = TP.eventNameNativeValue(val);
        hash.atPut('type', type);

        val = val.strip(TP.regex.KEY_EVENT);

        val = val.toLowerCase();

        if (val.startsWith('u')) {
            val = '\\' + val;
        }

        hash.atPut('char', val);

        hash = TP.hc(
                'target', null, 
                'type', type,

                'key', 1,
                'keyCode', 49,
                'char', '!',

                'bubbles', true,
                'cancelable', true
                );

        var doc = TP.sys.getUICanvas().getNativeDocument();

        evt = TP.documentCreateEvent(doc, hash);

        this.get('sequenceEntries').add(TP.ac(TP.byId('testField'), evt));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
