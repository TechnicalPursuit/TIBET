//  ========================================================================
/*
NAME:   TP.tibet.cmdline.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        The contents of this file are subject to the terms and conditions of
        the Technical Pursuit License ("TPL") Version 1.5, or subsequent
        versions as allowed by the TPL, and You may not copy or use this
        file in either source code or executable form, except in compliance
        with the terms and conditions of the TPL.  You may obtain a copy of
        the TPL (the "License") from Technical Pursuit Inc. at
        http://www.technicalpursuit.com.

        All software distributed under the License is provided strictly on
        an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR
        IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS ALL SUCH
        WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT,
        OR NON-INFRINGEMENT. See the License for specific language governing
        rights and limitations under the License.
*/
//  ========================================================================

/**
 * @type {TP.tibet.cmdline}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('tibet:cmdline');

//  Mix in templating functionality, overwriting any prior implementations.
TP.tibet.cmdline.mixin(TP.core.TemplatedNode, true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tibet.cmdline.Type.defineMethod('initialize', function() {

    /**
     * @name initialize
     * @synopsis Complete any one-time initialization of the type.
     */

    if (this.isInitialized()) {
        return;
    }

    //  type schema to support access via get(aspect_name)

    this.installGetterFromSchema('cmdLine',
        TP.hc('path', 'tibet|cmdline',
        'pathType', TP.CSS_PATH_TYPE));

    this.installGetterFromSchema('outerWrapper',
        TP.hc('path', '.cmdline_outer_wrapper',
        'pathType', TP.CSS_PATH_TYPE));

    this.installGetterFromSchema('innerWrapper',
        TP.hc('path', '.cmdline_inner_wrapper',
        'pathType', TP.CSS_PATH_TYPE));

    //this.installGetterFromSchema('inputCell',
    //  TP.hc('path', '.cmdline_textarea',
    //  'pathType', TP.CSS_PATH_TYPE));

    this.installGetterFromSchema('inputCell',
        TP.hc('path', 'xctrls|codeeditor',
        'pathType', TP.CSS_PATH_TYPE));

    this.installGetterFromSchema('outputCell',
        TP.hc('path', 'div[tibet|sourcetag=tibet:output]',
        'pathType', TP.CSS_PATH_TYPE));

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    if (TP.isElement(elem = aRequest.at('node'))) {
        this.addStylesheetTo(TP.nodeGetDocument(elem));
    }

    TP.wrap(elem).configure();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineAttribute('model');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('configure', function() {

    /**
     * @name configure
     * @returns {TP.tibet.cmdline} The receiver.
     * @abstract
     * @todo
     */

    //  configure our 'model' (the shell)
    this.configureModel();

    //  configure the input cell
    this.configureInputCell();

    //  now that we have a viable input cell, configure the event handlers
    this.configureHandlers();

    //  set up this object to manage stdin, stdout and stderr
    this.configureSTDIO();

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('configureModel', function() {

    /**
     * @name configureModel
     * @returns {TP.tibet.cmdline} The receiver.
     * @abstract
     * @todo
     */

    this.$set('model', TP.core.TSH.getDefaultInstance());

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('configureInputCell', function() {

    /**
     * @name configureInputCell
     * @returns {TP.tibet.cmdline} The receiver.
     * @abstract
     * @todo
     */

    var outerWrapper,
        cell,
        fieldStyle,
        rowHeight,
        styleVals,
        offset,
        wrappedInputCell;

    wrappedInputCell = TP.wrap(this.get('inputCell'));

    fooFunc = function(aSignal) {
        fooFunc.ignore(aSignal.getSignalOrigin(),
            aSignal.getSignalName());

        wrappedInputCell.setKeyHandler(
            TP.core.Keyboard.$$handleKeyEvent);
    };

    fooFunc.observe(wrappedInputCell, 'TP.sig.DOMReady');

// TODO
return this;

    outerWrapper = this.get('outerWrapper');

    //  initialize a minHeight on the elem so we never shrink smaller than
    //  what the system laid out to start things off
    outerWrapper.$minHeight = TP.elementGetHeight(outerWrapper,
        TP.CONTENT_BOX);

    cell = this.get('inputCell');

    fieldStyle = TP.elementGetComputedStyleObj(cell);

    //  need to know the pixel-per line count for computations around input
    //  field sizing
    rowHeight = fieldStyle.lineHeight.asNumber();
    cell.$linepx = rowHeight;

    //  Grab the computed style of the cell and add in the border &
    //  padding, top & bottom, as an offset to our calculation.
    styleVals = TP.elementGetStyleValuesInPixels(
        cell,
        TP.ac('borderTopWidth', 'borderBottomWidth',
        'paddingTop', 'paddingBottom'));

    offset = styleVals.at('borderTopWidth') +
        styleVals.at('borderBottomWidth') +
        styleVals.at('paddingTop') +
        styleVals.at('paddingBottom');

    //  do a one-time computation of offsets we may need for size
    //  adjustment. here we're saying that the "chrome" around the cell
    //  is all the pixels that can't be attributed to showing one line
    cell.$chrome = outerWrapper.$minHeight - (rowHeight + offset);

    //  start off by making sure width/height are properly configured
    this.adjustInputCellSize();

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('configureHandlers', function(aRequest) {

    /**
     * @name configureHandlers
     * @synopsis Configures the receiver so it is ready for operation.
     * @returns {TP.tibet.cmdline} The receiver.
     */

    //  set up root keyboard observations

    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyDown');
    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyPress');
    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyUp');

    this.observe(TP.core.Keyboard, 'TP.sig.DOMModifierKeyChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('configureSTDIO', function(aRequest) {

    /**
     * @name configureSTDIO
     * @synopsis Configures TIBET's stdio hooks to look at the receiver. This
     *     method can be run to cause the receiver to 'own' stdio from the TIBET
     *     system and is usually invoked for system consoles.
     * @returns {TP.tibet.cmdline} The receiver.
     */

    var thisRef,
        stdout,
        stdin,
        stderr,
        notify,
        tWin,
        model;

    //  if TIBET is found, take control of stdin/out/err so they go to the
    //  console versions. also we have to capture the existing ones and be
    //  prepared to replace them when we're a separate window

    thisRef = this;

    stdout = function(anObject, aRequest) {
        thisRef.stdout(anObject, aRequest);
    };

    stderr = function(anObject, aRequest) {
        thisRef.stderr(anObject, aRequest);
    };

    stdin = function(aQuery, aDefault, aRequest) {
        thisRef.stdin(aQuery, aDefault, aRequest);
    };

    notify = function(anObject, aRequest) {
        thisRef.notify(anObject, aRequest);
    };

    //  configure the shell's output to pipe to us...
    if (TP.isValid(model = this.get('model'))) {
        model.notify = notify;
        model.stdin = stdin;
        model.stdout = stdout;
        model.stderr = stderr;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('hide', function() {

    /**
     * @name hide
     * @synopsis Hides the input cell so it isn't visible during output.
     * @returns {TP.tibet.cmdline} The receiver.
     */

    //  Blurring the input cell before we hide it lets the focus move such
    //  that new key presses will open a cell again.
    //this.get('inputCell').blur();

    TP.elementHide(this.get('outerWrapper'));

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('isShown', function() {

    /**
     * @name isShown
     * @synopsis Returns true if the input cell is currently visible.
     * @returns {TP.tibet.cmdline} The receiver.
     */

    var outerWrapper;

    outerWrapper = this.get('outerWrapper');

    return TP.elementIsVisible(outerWrapper) &&
        TP.elementIsDisplayed(outerWrapper);
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('show', function() {

    /**
     * @name show
     * @synopsis Displays the input cell.
     * @returns {TP.tibet.cmdline} The receiver.
     */

    var outerWrapper;

    outerWrapper = this.get('outerWrapper');
    TP.elementShow(outerWrapper);

    /*
    if (TP.notValid(outerWrapper.$minHeight)) {
        this.configure();
    };
    */

    (function() {
        this.focusInputCell();
        this.setCursorToEnd();
    }).bind(this).fork();

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('showAt', function(aPoint) {

    /**
     * @name showAt
     * @param {TP.core.Point} aPoint 
     * @abstract
     * @todo
     */

    var outerWrapper;

    outerWrapper = TP.wrap(this.get('outerWrapper'));
    outerWrapper.setPagePosition(aPoint);

    this.show();

    return;
});

//  ------------------------------------------------------------------------
//  STDIO Handling
//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('stderr', function(anObject, aRequest) {

    /**
     * @name stderr
     * @param {Object} anObject The error/content to output.
     * @param {TP.sig.Request} aRequest The request/parameters for the call.
     * @abstract
     * @todo
     */

    var output,
        input,
        node;

    //  We should see multiple output calls, at least one of which is the
    //  cmdConstruct notifier which tells us to build our output cell.
    if (aRequest && aRequest.at('cmdConstruct') === true) {
        return;
    }

    output = TP.byCSS('#outputCell').first();
    if (TP.notValid(output)) {
        output = TP.tpnode('<div id="outputCell"/>');
        input = TP.byCSS('tibet|cmdline').first();
        output = TP.tpnode(input).addContent(output);
    } else {
        output = TP.tpnode(output);
    }

    output.setContent(TP.str(anObject));
    output.removeClass('output_stdout');
    output.addClass('output_stderr');

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('stdin', function(anObject, aDefault, aRequest) {

    /**
     * @name stdin
     * @param {undefined} anObject
     * @param {undefined} aDefault
     * @param {undefined} aRequest
     * @abstract
     * @todo
     */

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('stdout', function(anObject, aRequest) {

    /**
     * @name stdout
     * @param {Object} anObject The content to output.
     * @param {TP.sig.Request} aRequest The request/parameters for the call.
     * @abstract
     * @todo
     */

    var request,
        output,
        world,
        node,
        rootRequest,
        hid,
        str,
        hidstr;

    //  We should see multiple output calls, at least one of which is the
    //  cmdConstruct notifier which tells us to build our output cell.
    if (aRequest && aRequest.at('cmdConstruct') === true) {
        return;
    }

    request = TP.request(aRequest);

    if (TP.isTrue(request.at('echoRequest')) ||
        TP.notEmpty(request.at('cmdTitle'))) {
        //  update the command title bar based on the latest output from
        //  the particular cmdID this request represents.
        if (TP.notValid(rootRequest = request.at('rootRequest'))) {
            hid = TP.ifKeyInvalid(request, 'cmdHistoryID', '');
            if (TP.isEmpty(str = TP.ifKeyInvalid(request, 'cmdTitle', ''))) {
                str = TP.ifKeyInvalid(request, 'cmd', '');
            }
        } else {
            hid = TP.ifKeyInvalid(rootRequest, 'cmdHistoryID', '');
            if (TP.isEmpty(str = TP.ifKeyInvalid(rootRequest, 'cmdTitle', ''))) {
                str = TP.ifKeyInvalid(rootRequest, 'cmd', '');
            }
        }
        hidstr = TP.isEmpty(hid) ? '' : '!' + hid;

        //  TP.elementSetContent(evtTextCell, hidstr);

        str = str.truncate(TP.sys.cfg('tdc.max_title', 70));
        str = TP.xmlLiteralsToEntities(str);

        //  TP.elementSetContent(cmdTextCell, str);
    }

    //output = TP.byCSS('#outputCell').first();
    //if (TP.notValid(output))
    //{
    //  output = TP.tpnode('<div id="outputCell"/>');

    output = TP.tpnode('<tibet:output id=""/>');

    world = TP.byCSS('tibet|world', this.getNativeDocument()).first();
    output = TP.tpnode(world).addContent(output, null, TP.hc()),

    result = request.get('result'),
    input = TP.byOID('cmdline_editor'),

    resultStr =
        '<span xmlns:dnd="http://www.technicalpursuit.com/2005/drag-and-drop">';

    input.executeMode(TP.str(result), 'javascript',
        function(value, type) {
            resultStr += TP.join('<span class="',
                type, '" dnd:vend="', type,
                '">', value, '</span>');
        });

    resultStr += '</span>';

    /*
        output.renderTemplate('inputTemplate', TP.hc('cmdTitle', str));
        output.renderTemplate('outputTemplate',
                                TP.hc('cmdResult', resultStr));
        output.renderTemplate('statusTemplate', TP.hc('foo', 'bar'));
        */

    output.addProcessedContent(resultStr);

    output.setPagePosition(TP.pc(100, 100));
    //}
    //else
    //{
    //  output = TP.tpnode(output);
    //};

    //output.setContent(TP.str(anObject));

    //output.removeClass('output_stderr');
    //output.addClass('output_stdout');

    return;
});

//  ------------------------------------------------------------------------
//  Key Handling
//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('handleDOMKeyDown', function(aSignal) {

    /**
     * @name handleDOMKeyDown
     * @synopsis Handles notifications of keydown events. If the key is one the
     *     console maps then the default action is overidden.
     * @param {DOMKeyDown} aSignal The TIBET signal which triggered this method.
     * @todo
     */

    var evt,
        cell;

    evt = aSignal.getEvent();
    cell = this.get('inputCell');

    //  Make sure that the key event happened in our input cell, otherwise
    //  we're not interested.
    //  if (TP.eventGetTarget(evt) === cell)
    //  {
    if (this.isCommandEvent(evt) || this.shouldConcealInput()) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);

        evt.stop();
    }
    //  };

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('handleTP_sig_DOMKeyPress', function(aSignal) {

    /**
     * @name handleTP_sig_DOMKeyPress
     * @synopsis Handles notifications of keypress events. If the key is one the
     *     console maps then the default action is overidden.
     * @param {DOMKeyPress} aSignal The TIBET signal which triggered this
     *     method.
     * @todo
     */

    var evt,
        cell;

    evt = aSignal.getEvent();
    cell = this.get('inputCell');

    //  Make sure that the key event happened in our input cell, otherwise
    //  we're not interested.
    //  if (TP.eventGetTarget(evt) === cell)
    //  {
    if (this.isCommandEvent(evt) || this.shouldConcealInput()) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);

        evt.stop();
    }
    //  };

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('handleDOMKeyUp', function(aSignal) {

    /**
     * @name handleDOMKeyUp
     * @synopsis Handles notifications of keyup events. If the key is one we
     *     care about then we forward the event to the shell for processing.
     * @param {DOMKeyUp} aSignal The TIBET signal which triggered this handler.
     * @returns {null.} 
     */

    var evt,
        cell;

    evt = aSignal.getEvent();
    //cell = this.get('inputCell');

    if (this.isCommandEvent(evt)) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);


        evt.stop();
        this.handleCommandEvent(evt);
    }

    return;

    //  Make sure that the key event happened in our input cell.
    if (TP.eventGetTarget(evt) === cell) {
        if (this.isCommandEvent(evt)) {
            TP.eventPreventDefault(evt);
            TP.eventStopPropagation(evt);

            this.handleCommandEvent(evt);
        }
    } else if (TP.eventGetWindow(evt).document === TP.nodeGetDocument(cell)) {
        if (this.isCommandEvent(evt)) {
            TP.eventPreventDefault(evt);
            TP.eventStopPropagation(evt);

            this.handleCommandEvent(evt);
        } else if (!this.isShown()) {
            this.showAt(TP.pc(
                (TP.windowGetInnerWidth(window) / 2) -
                TP.elementGetWidth(cell),
                TP.windowGetInnerHeight(window) / 2));
        }
    } else {
        return;
    }

    //  if we're here then we want to adjust the height, but not focus or
    //  otherwise alter where the cursor might be
    this.adjustInputCellSize();

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('handleTab', function(anEvent) {

    /**
     * @name handleTab
     * @synopsis Processes requests to insert a tab character at the current
     *     selection point.
     * @param {Event} anEvent A JS/DOM Event object.
     */

    this.insertInputContent('\t');

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('isCommandEvent', function(anEvent) {

    /**
     * @name isCommandEvent
     * @synopsis Returns true if the event represents a key binding used to
     *     trigger command processing of some kind for the console.
     * @param {Event} anEvent The native event that fired.
     */

    var keyname;

    keyname = TP.domkeysigname(anEvent);

    switch (keyname) {
        case 'DOM_Tab_Down':
        case 'DOM_Tab_Up':

        case 'DOM_Shift_Enter_Down':
        case 'DOM_Shift_Enter_Up':

        case 'DOM_Shift_Down_Up':
        case 'DOM_Shift_Up_Up':
        case 'DOM_Shift_Right_Up':
        case 'DOM_Shift_Left_Up':

        case 'DOM_Shift_Del_Down':
        case 'DOM_Shift_Del_Up':

        case 'DOM_Esc_Up':

            return true;

        default:
            return false;
    }
});

//  ------------------------------------------------------------------------
//  Input Cell Methods
//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('adjustInputCellSize', function() {

    /**
     * @name adjustInputCellSize
     * @synopsis Adjust the height of the input cell based on its contents.
     */

    var outerWrapper,
        cell,
        rows,
        scrollHeight,
        height;

// TODO
return;

    //  We adjust our outerWrapper, since our inner wrapper will auto-grow
    outerWrapper = this.get('outerWrapper');

    cell = this.get('inputCell');

    //  First we set the cell's height to 0. This will cause 'scrollHeight'
    //  to get its proper value.
    cell.style.height = '0px';

    //  Grab the cell's scrollHeight
    scrollHeight = cell.scrollHeight;

    //  The number of rows is the scrollHeight divided by the number of
    //  pixels for the lineHeight, rounded down.
    rows = (scrollHeight / cell.$linepx).floor();

    //  Make sure that we have at least one row.
    rows = rows.max(1);

    //  Set the cell's number of rows and put its height back to 'auto' so
    //  that it will draw properly.
    cell.rows = rows;
    cell.style.height = '';

    //  Now, resize the content surrounding the cell

    //  Grab the current height of the cell.
    height = TP.elementGetHeight(cell);

    //  Add the surrounding 'chrome' height.
    height = height + cell.$chrome;

    //  don't set outerWrapper height smaller than its initial height
    if (height > outerWrapper.$minHeight) {
        TP.elementSetHeight(outerWrapper, height);
    } else {
        TP.elementSetHeight(outerWrapper, outerWrapper.$minHeight);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('clearInput', function() {

    /**
     * @name clearInput
     * @synopsis Clears the input cell.
     * @returns {TP.tibet.cmdline} The receiver.
     */

    TP.wrap(this.get('inputCell')).clearValue();

    this.adjustInputCellSize();

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('focusInputCell', function(select) {

    /**
     * @name focusInputCell
     * @synopsis Focuses the input cell so the cursor is visible/blinking.
     * @param {Boolean} select True to select in addition.
     * @returns {TP.tibet.cmdline} The receiver.
     */

    //  We wrap this in a try...catch that does nothing because, on startup,
    //  it seems like the textfield isn't focusable on IE and this will
    //  throw an exception. It's not a big deal, except that this means that
    //  the text field will not focus on startup.
    try {
        if (select) {
            TP.wrap(this.get('inputCell')).select();
        } else {
            TP.wrap(this.get('inputCell')).focus();
        }
    } catch (e) {
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('getInputValue', function() {

    /**
     * @name getInputValue
     * @synopsis Returns the value of the current input cell.
     * @returns {String} The user's input.
     */

    var tpElem;

    tpElem = TP.wrap(this.get('inputCell'));
    if (TP.isValid(tpElem)) {
        return tpElem.get('value');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('insertInputContent', function(anObject) {

    /**
     * @name insertInputContent
     * @synopsis Inserts to the value of the input cell.
     * @param {Object} anObject The object defining the additional input.
     * @returns {TP.tibet.cmdline} The receiver.
     */

    var str;

    str = TP.str(anObject);
    TP.wrap(this.get('inputCell')).insertAfterSelection(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('setCursorToEnd', function() {

    /**
     * @name setCursorToEnd
     * @synopsis Moves the cursor to the end of the current input data.
     * @returns {TP.tibet.cmdline} The receiver.
     */

    TP.wrap(this.get('inputCell')).setCursorToEnd();

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('setInputContent',
function(anObject, shouldAppend) {

    /**
     * @name setInputContent
     * @synopsis Sets the value of the input cell, essentially 'pre-filling' the
     *     input area with content.
     * @description If shouldAppend is true, and the input cell already has
     *     content, a '.;\n' is appended to the front of the content.
     * @param {Object} anObject The object defining the input.
     * @param {Boolean} shouldAppend Whether or not to append the value of
     *     anObject to any existing content.
     * @returns {TP.tibet.cmdline} The receiver.
     * @todo
     */

    var inputCell,
        val;

    if (TP.isEmpty(anObject)) {
        this.clearInput();
        return this;
    }

    inputCell = TP.wrap(this.get('inputCell'));
    if (TP.isTrue(shouldAppend)) {
        if (TP.notEmpty(val = inputCell.get('value'))) {
            val += '.;\n';
        }

        inputCell.set('value', val + this.formatInput(anObject));
    } else {
        inputCell.set('value', this.formatInput(anObject));
    }

    this.adjustInputCellSize();

    (function() {
        this.focusInputCell();
        this.setCursorToEnd();
    }.bind(this)).afterUnwind();

    return this;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('shouldConcealInput', function(aFlag) {

    /**
     * @name shouldConcealInput
     * @synopsis Returns false for now.
     * @param {Boolean} aFlag The new value to set.
     * @returns {Boolean} 
     */

    return false;
});

//  ------------------------------------------------------------------------
//  String I/O Formatting
//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('formatInput', function(plainText) {

    /**
     * @name formatInput
     * @synopsis Converts text intended for the input cell so it's properly
     *     displayed.
     * @param {String} plainText The string to convert.
     * @returns {String} 
     */

    //  For now, we just return the plain text that was handed to us.
    return plainText;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('formatOutput', function(plainText) {

    /**
     * @name formatOutput
     * @synopsis Converts text so it can be displayed properly by the STDIO
     *     functions. This typically involves converting the standard 'problem
     *     characters' into their HTML entity equivalents.
     * @param {String} plainText The string to convert.
     * @returns {String} 
     */

    var str;

    if (TP.notValid(plainText) || (plainText == '')) {
        return '';
    }

    str = plainText.replace(
        /\&/g, '&amp;').replace(
        /</g, '&lt;').replace(
        />/g, '&gt;').replace(
        /\"/g, '&quot;').replace(
        /\'/g, '&apos;').replace(
        /\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

    return str;
});

//  ------------------------------------------------------------------------
//  Event Handling
//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('handleClearInput', function(anEvent) {

    /**
     * @name handleClearInput
     * @synopsis Processes requests to clear the input cell completely.
     * @param {Event} anEvent A JS/DOM Event object.
     */

    TP.eventPreventDefault(anEvent);
    this.clearInput();

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('handleCommandEvent', function(anEvent) {

    /**
     * @name handleCommandEvent
     * @synopsis Processes incoming events from the view.
     * @param {Event} anEvent The native event that fired.
     */

    var keyname;

    keyname = TP.domkeysigname(anEvent);

    switch (keyname) {
        case 'DOM_Tab_Up':
            this.handleTab(anEvent);
            break;

        case 'DOM_Shift_Enter_Up':
            this.handleRawInput(anEvent);
            break;

        case 'DOM_Shift_Down_Up':
            this.handleHistoryNext(anEvent);
            break;

        case 'DOM_Shift_Up_Up':
            this.handleHistoryPrev(anEvent);
            break;

        case 'DOM_Shift_Del_Up':
            this.handleClearInput(anEvent);
            break;

        case 'DOM_Esc_Up':
            this.handleCancel(anEvent);
            break;

        default:
            break;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('handleCancel', function(anEvent) {
    this.hide();
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('handleHistoryNext', function(anEvent) {

    /**
     * @name handleHistoryNext
     * @synopsis Processes requests to move the history index forward one
     *     position. Note that this operates on the current responder so that
     *     each responder can maintain its own history list.
     * @param {Event} anEvent A JS/DOM Event object.
     */

    var model,
        cmd;

    if (TP.notValid(model = this.get('model'))) {
        return;
    }

    TP.eventPreventDefault(anEvent);

    cmd = model.getHistory(model.incrementHistoryIndex());
    if (TP.isValid(cmd)) {
        this.setInputContent(cmd);
    } else {
        this.clearInput();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('handleHistoryPrev', function(anEvent) {

    /**
     * @name handleHistoryPrev
     * @synopsis Processes requests to move the history index back one position.
     *     Note that this operates on the current responder so that each
     *     responder can maintain its own history list.
     * @param {Event} anEvent A JS/DOM Event object.
     */

    var model,
        cmd;

    if (TP.notValid(model = this.get('model'))) {
        return;
    }

    TP.eventPreventDefault(anEvent);

    cmd = model.getHistory(model.decrementHistoryIndex());
    if (cmd != null) {
        this.setInputContent(cmd);
    } else {
        this.clearInput();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.cmdline.Inst.defineMethod('handleRawInput', function(anEvent) {

    /**
     * @name handleRawInput
     * @synopsis Handles raw input and converts it into an appropriate input
     *     response. Some console input is in response to some input request so
     *     we try to bind the result to the request where possible. If no
     *     request appears to be current then we assume a new shell request is
     *     being made.
     * @param {Event} anEvent A JS/DOM Event object.
     */

    var input,
        res,
        req,
        model;

    //  capture the text content of the input cell. we'll be passing this
    //  along to the responder if it's got any content
    input = this.getInputValue();
    if (TP.notValid(input)) {
        //  oops, not even an empty string value
        return;
    }

    //  always clear the cell to provide visual feedback that we've accepted
    //  the input and are working on it
    this.clearInput();

    //  two options here...one is we find an input request that caused
    //  display of the input cell (in which case that request "owns" the
    //  input and we forward to that input request) or we got new input in
    //  which case we build a shell request and forward it to the shell
    if (TP.notValid(req = this.get('lastInputRequest'))) {
        if (TP.notValid(model = this.get('model'))) {
            this.raise('TP.sig.InvalidModel', arguments,
                'Console has no attached shell instance');
            return;
        }

        req = TP.sig.ShellRequest.construct(
            TP.hc('async', true,
                    'cmd', input,
                    'cmdExecute', true,
                    'cmdHistory', true,
                    'cmdInteractive', true,
                    'cmdLogin', true,
                    'cmdPhases', 'nocache',
                    'echoRequest', true
            ));

        req.set('requestor', this);
        TP.handle(model, req);
    } else {
        //  input request owns the response data...ask it to handle the
        //  response so it can manage what that means. effectively by
        //  calling handle directly we're simulating having fired the
        //  response without the overhead of actually doing the signaling.
        res = req.constructResponse();
        res.set('result', input);

        TP.handle(req, res);
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
