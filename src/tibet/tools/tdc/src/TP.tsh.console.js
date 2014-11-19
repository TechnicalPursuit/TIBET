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
 * @type {TP.tsh.console}
 * @synopsis The tsh:console tag used to inject a TSH console into an
 *     application context.
 */

//  ----------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('tsh:console');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.tsh.console.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up the console tag's backing functionality once the tag
     *     has been attached.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        handlerFunc,
        triggerKey;

    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('InvalidElement');
    }

    // Capture the console toggle key off the element or cfg flag. Be sure to
    // update the flag value if we're working with a tag-supplied one.
    if (TP.isEmpty(triggerKey = TP.elementGetAttribute(elem, 'tdc:toggle'))) {
        triggerKey = TP.sys.cfg('tdc.toggle_on');
    } else {
        TP.sys.setcfg('tdc.toggle_on', triggerKey);
    }

    // Observe DocumentLoaded so we can augment the page with hook file and CSS.
    this.observe(
            'window_0.UIROOT',
            'TP.sig.DocumentLoaded',
            handlerFunc = function (aSignal) {
                var win,
                    doc,
                    elem,
                    head;

                // Only do this once, so stop listening.
                handlerFunc.ignore(aSignal.getOrigin(),
                    aSignal.getSignalName());

                win = TP.win('UIBOOT');
                doc = TP.doc(win);

                // Inject the hook file into the page so it has all the
                // necessary TIBET page elements.
                elem = TP.documentCreateScriptElement(doc,
                    TP.uc('~lib_build/tibet_hook.min.js').getLocation());
                head = TP.documentEnsureHeadElement(doc);
                TP.nodeAppendChild(head, elem, false);

                // Force an initialize to run to get event handlers etc. set up.
                TP.boot.initializeCanvas(win);

                // Add our console-specific styles to the document.
                TP.tsh.console.addStylesheetTo(doc);
            });

    // Observe AppStart so we can create our default instance and be ready for
    // console activation.
    this.observe(
            null,
            'TP.sig.AppDidStart',
            function (aSignal) {
                var handler,
                    count;

                count = 0;
                handler = function () {
                    var uiBoot,
                        tsh,
                        console;

                    // Retry up to 10 times at 50ms per try (a half-second)
                    // to see if we can get the console set up.
                    if (!TP.sys.hasStarted() && count < 10) {
                        count++;
                        handler.fork(50);
                        return;
                    }


                    uiBoot = TP.win('UIBOOT');
                    tsh = TP.core.TSH.getDefaultInstance();
                    console = TP.core.ConsoleService.construct(
                        'SystemConsole',
                        TP.hc('consoleWindow', uiBoot,
                                'consoleModel', tsh,
                                'triggerKey', triggerKey
                        ));

                    TP.byId('UIROOT', top).focus();
                };

                // Initiate the startup/config sequence.
                handler.fork(50);
            });

    return this.callNextMethod();
});

//  ----------------------------------------------------------------------------

TP.tsh.console.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @name tagCompile
     * @synopsis Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell process.
     * @returns {Element} The new element.
     */

    var elem,
        inputElemURI,
        inputElem,
        newElem;

    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('InvalidElement');
    }

    // Configure the query we'll use in URI form to get the input element.
    if (!TP.isString(inputElemURI = TP.elementGetAttribute(elem, 'stdin_ui'))) {
        inputElemURI = 'tibet://top.UIBOOT#css(\'#BOOT-PROGRESS #BOOT-PERCENT\')';
    }

    // Access the input element we're being tasked with converting.
    inputElem = TP.unwrap(TP.uc(inputElemURI).getResource());

    // Generate new content for the tag and replace the original.
    if (TP.isElement(inputElem)) {

        newElem = TP.xhtmlnode(
        '<div id="tdc_cmdline_wrapper" class="cmdline_wrapper">' +
            '<div id="tdc_cmdline_prompt" class="cmdline_prompt">tsh&#160;' +
            this.DEFAULT_PROMPT +
            '</div>' +
            '<div id="tdc_cmdline_input" class="cmdline_input">' +
                '<textarea id="consoleInput" class="cmdline_textarea" rows="1"></textarea>' +
            '</div>' +
        '</div>');

        TP.nodeReplaceChild(inputElem.parentNode, newElem, inputElem, false);
    }

    return;
});

//  ============================================================================
//  TP.core.ConsoleService
//  ============================================================================

/**
 * @type {TP.core.ConsoleService}
 * @synopsis The service which handles console requests, typically originating
 *     from a tsh:console-attached shell instance.
 */

//  ----------------------------------------------------------------------------

TP.core.UserIOService.defineSubtype('ConsoleService');

//  ----------------------------------------------------------------------------
//  Type Constants
//  ----------------------------------------------------------------------------

//  the default prompt separator/string (>>)
TP.core.ConsoleService.Type.defineConstant('DEFAULT_PROMPT', '&#160;&#187;');

//  the margin between the prompt and the input cell
TP.core.ConsoleService.Type.defineConstant('PROMPT_RIGHT_MARGIN', 4);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  whether or not the console is displayed
TP.core.ConsoleService.Inst.defineAttribute('consoleDisplayed', false);

//  the view window (i.e. the window containing the console)
TP.core.ConsoleService.Inst.defineAttribute('vWin');

//  the element which contains the input cell, prompt, etc.
TP.core.ConsoleService.Inst.defineAttribute('$outerWrapper');

//  the input cell textarea itself
TP.core.ConsoleService.Inst.defineAttribute('$inputCell');

//  an Array that is used to collect 'all results of a command sequence' (i.e
//  multiple shell statements separated by ';' or pipes, etc.)
TP.core.ConsoleService.Inst.defineAttribute('$multiResults');

//  how many characters wide should the output display be? too large a
//  number here will cause horizontal scrolling.
TP.core.ConsoleService.Inst.defineAttribute('width', 80);

//  the underlying TP.core.Shell instance serving as the model for this console
TP.core.ConsoleService.Inst.defineAttribute('model');

//  are we currently blocking on input from the user
TP.core.ConsoleService.Inst.defineAttribute('awaitingInput', false);

//  should IO be concealed? this is used to simulate "password" mode
TP.core.ConsoleService.Inst.defineAttribute('conceal', false);
TP.core.ConsoleService.Inst.defineAttribute('concealedInput');

//  the last input request processed by the receiver
TP.core.ConsoleService.Inst.defineAttribute('lastInputRequest');

//  is this a system console, i.e. should it have logging?
TP.core.ConsoleService.Inst.defineAttribute('systemConsole', false);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Type.defineMethod('construct',
function(aResourceID, aRequest) {

    /**
     * @name construct
     * @synopsis Constructs a new console instance.
     * @description The primary purpose of this custom constructor is to provide
     *     defaulting for the resource ID so we can ensure that a default
     *     SystemConsole instance can be constructed. By leaving the resource ID
     *     null when creating console instances you can ensure that the first
     *     such instance is the SystemConsole.
     * @param {String} aResourceID The unique resource ID for this resource
     *     instance.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request object or hash
     *     containing parameters including: consoleWindow and consoleNode which
     *     name the window and node to use for the console. A consoleTabs
     *     parameter determines whether a tabset is used.
     * @returns {TP.core.ConsoleService} A new instance.
     * @todo
     */

    var name;

    if (TP.isEmpty(aResourceID)) {
        if (TP.notValid(TP.core.Resource.getResourceById('SystemConsole'))) {
            name = 'SystemConsole';
        } else {
            name = 'Console' + Date.now();
        }
    } else {
        name = aResourceID;
    }

    return this.callNextMethod(name, aRequest);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('init',
function(aResourceID, aRequest) {

    /**
     * @name init
     * @synopsis Constructor for new instances.
     * @param {String} aResourceID The unique resource ID for this resource
     *     instance.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request object or hash
     *     containing parameters including: consoleWindow and consoleNode which
     *     name the window and node to use for the console. A consoleTabs
     *     parameter determines whether a tabset is used.
     * @returns {TP.core.ConsoleService} A new instance.
     * @todo
     */

    var request,
        model,
        key;

    this.callNextMethod();

    //  make sure we have a proper request object and a shell that can
    //  assist us with producing both our user interface and responses
    request = TP.request(aRequest);

    //  set up our window
    this.set('vWin', request.at('consoleWindow'));

    //  set up our model -- the shell
    this.set('model', request.at('consoleModel'));

    if (TP.notValid(model = this.getModel())) {
        this.raise('TP.sig.InvalidParameter',
            'Console configuration did not include a shell.');

        return;
    }

    //  list of results from a 'command sequence' that can all be output at once
    this.set('$multiResults', TP.ac());

    //  get the console display elements ready for action
    this.configure(request);

    //  this will default to either the model's prompt or our default
    this.setPrompt();

    //  get our shell to start by triggering its start method
    model.start(request);

    //  update our overall status
    this.updateStatus();

    //  put our project identifier in place in the notifier bar
    this.notify(TP.sys.cfg('project.ident'));

    //  Process whatever initial request(s) might be sitting in the queue
    this.handleNextRequest();

    //  Note that we do *not* focus the input cell here because there is further
    //  setup to do and we don't want the browser to think that the cell has
    //  already been focused.
    //  -- do not uncomment :)
    //  this.focusInputCell();

    //  TODO:   add TP.sig.DocumentUnloaded logout hook observation/method

    //  Not sure why we need this... probably some coordination in how
    //  observes get set up.
    this.shouldSignalChange(true);

    // Make sure we're using a properly specified signal name.
    key = request.at('triggerKey');
    if (!key.startsWith('TP.sig.')) {
        key = 'TP.sig.' + key;
    }

    /* eslint-disable no-wrap-func */
    //  set up keyboard toggle to show/hide us
    (function () {
            this.toggleConsole();

            (function () {
               TP.boot.$flushLog(true);
            }).fork(2000);

    }.bind(this)).observe(TP.core.Keyboard, key);
    /* eslint-enable no-wrap-func */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('configure',
function() {

    /**
     * @name configure
     * @returns {TP.core.ConsoleService} The receiver.
     * @abstract
     * @todo
     */

    // Get the input area ready for user input.
    this.configureInputCell();

    // Connect our IO functions.
    this.configureSTDIO();

    // Set up our keyboard handler observations.
    this.configureHandlers();

    // Move to the end of any console data.
    this.scrollToEnd();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('configureInputCell',
function() {

    /**
     * @name configureInputCell
     * @returns {TP.core.ConsoleService} The receiver.
     * @abstract
     * @todo
     */

    var cell,
        outerWrapper,
        fieldStyle,
        rowHeight,
        styleVals,
        offset;

    cell = TP.byCSS('#consoleInput', TP.win('UIBOOT'), true);
    this.set('$inputCell', cell);

    //  initialize a minHeight on the elem so we never shrink smaller than
    //  what the system laid out to start things off
    outerWrapper = TP.byCSS('#BOOT-PROGRESS', TP.win('UIBOOT'), true);
    this.set('$outerWrapper', outerWrapper);

    outerWrapper.$minHeight = TP.elementGetHeight(outerWrapper, TP.BORDER_BOX);

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
    //  adjustment. here we're saying that the "perimeter" around the cell
    //  is all the pixels that can't be attributed to showing one line
    cell.$perimeter = outerWrapper.$minHeight - (rowHeight + offset);

    //  for later height adjustment we need to know the offsets for the overall
    //  input wrapper so we don't make the wrapper too tall.
    styleVals = TP.elementGetStyleValuesInPixels(
        outerWrapper,
        TP.ac('borderTopWidth', 'borderBottomWidth',
                'paddingTop', 'paddingBottom'));

    offset = styleVals.at('borderTopWidth') +
                styleVals.at('borderBottomWidth') +
                styleVals.at('paddingTop') +
                styleVals.at('paddingBottom');

    outerWrapper.$perimeter = offset - 1;
    outerWrapper.$minHeight -= offset;

    //  start off by making sure width/height are properly configured
    this.adjustInputCellSize();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('configureHandlers',
function() {

    /**
     * @name configureHandlers
     * @synopsis Configures the receiver so it is ready for operation.
     * @returns {TP.core.ConsoleService} The receiver.
     */

    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyDown');
    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyPress');
    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyUp');

    this.observe(this.get('$inputCell'), 'TP.sig.DOMCut');
    this.observe(this.get('$inputCell'), 'TP.sig.DOMPaste');

    this.observe(this.get('$inputCell'), 'TP.sig.DOMUndo');

    this.observe(TP.core.Keyboard, TP.sys.cfg('tdc.toggle_off'),
                    function(evt) {
                        evt.preventDefault();
                        this.focusInputCell();
                    }.bind(this));

    this.observe(TP.core.Keyboard, 'TP.sig.DOMModifierKeyChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('configureSTDIO',
function() {

    /**
     * @name configureSTDIO
     * @synopsis Configures TIBET's stdio hooks to look at the receiver. This
     *     method can be run to cause the receiver to 'own' stdio from the TIBET
     *     system and is usually invoked for system consoles.
     * @returns {TP.core.ConsoleService} The receiver.
     */

    var model,
        tibetWin;

    //  configure the shell's stdio routines to forward to us...
    if (TP.isValid(model = this.get('model'))) {
        model.attachSTDIO(this);
    }

    if (TP.isWindow(tibetWin = TP.global.$$findTIBET(window)) &&
        this.get('vWin') !== tibetWin) {

        TP.tpwin(tibetWin).attachSTDIO(this);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Display Primitives
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('getInputStats',
function(aSignal) {

    /**
     * @name updateStats
     * @param {TP.sig.ShellRequest} aSignal The request that the status is being
     *     updated for.
     * @returns {TP.tsh.ConsoleOutputCell} The receiver.
     * @abstract
     * @todo
     */

    var val,
        str;

    //  TODO: Isn't aSignal the same as our signal and, if not, is that an
    //  error?

    //  ---
    //  execution statistics, when available
    //  ---

    //  update the last command execution time
    val = aSignal.get('evaltime');
    str = TP.ifInvalid(val, '0');

    val = aSignal.get('tagtime');
    str += ' | ' + TP.ifInvalid(val, '0');

    val = aSignal.get('exectime');
    str += ' | ' + TP.ifInvalid(val, '0');

    return str;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('getInputTypeInfo',
function(aSignal) {

    /**
     * @name updateStats
     * @param {TP.sig.ShellRequest} aSignal The request that the status is being
     *     updated for.
     * @returns {TP.tsh.ConsoleOutputCell} The receiver.
     * @abstract
     * @todo
     */

    var val,
        str,
        values,
        len,
        startTN,
        wasSame,
        i;

    //  TODO: Isn't aSignal the same as our signal and, if not, is that an
    //  error?

    //  if no action pending then display current result type/id
    if (TP.canInvoke(aSignal, 'getResult')) {
        val = aSignal.getResult();
    }

    if (TP.notValid(val)) {
        return '';
    }

    if (TP.isValid(val)) {

        str = '' + TP.tname(val);

        if (TP.isCollection(val) && TP.sys.cfg('tdc.type_collections', true)) {
            if (TP.isEmpty(val)) {
                str += '()';
            } else {
                values = val.getValues();
                len = values.getSize();
                startTN = TP.tname(values.at(0));
                wasSame = true;

                for (i = 1; i < len; i++) {
                    if (TP.tname(values.at(i)) !== startTN) {
                        wasSame = false;
                        break;
                    }
                }

                if (TP.isTrue(wasSame)) {
                    str += '(' + startTN + ')';
                } else {
                    str += '(Object)';
                }

                str += ' (' + len + ')';
            }
        }

        if (TP.isEmpty(str) || (str === 'ready')) {
            str = 'Object';
        }
    } else if (TP.isNull(val)) {
        str = 'null';
    } else {
        str = 'undefined';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('scrollToEnd',
function() {

    /**
     * @name scrollToEnd
     * @synopsis Scrolls the console to the end of the content area.
     * @returns {TP.core.ConsoleService} The receiver.
     */

    TP.boot.$scrollLog();

    return this;
});

//  ------------------------------------------------------------------------
//  Input Cell Methods
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('adjustInputCellSize',
function() {

    /**
     * @name adjustInputCellSize
     * @synopsis Adjust the height of the input cell based on its contents.
     */

    var outerWrapper,
        cell,
        rows,
        scrollHeight,
        height;

    //  We adjust our outerWrapper, since our inner wrapper will auto-grow
    outerWrapper = this.get('$outerWrapper');

    cell = this.get('$inputCell');

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
    height = height - outerWrapper.$perimeter + cell.$perimeter;

    //  don't set outerWrapper height smaller than its initial height
    if (height > outerWrapper.$minHeight) {
        TP.elementSetHeight(outerWrapper, height);
    } else {
        TP.elementSetHeight(outerWrapper, outerWrapper.$minHeight);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('clearInputCell',
function() {

    /**
     * @name clearInputCell
     * @synopsis Clears the input cell.
     * @returns {TP.core.ConsoleService} The receiver.
     */

    TP.wrap(this.get('$inputCell')).clearValue();

    this.adjustInputCellSize();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('focusInputCell',
function(select) {

    /**
     * @name focusInputCell
     * @synopsis Focuses the input cell so the cursor is visible/blinking.
     * @param {Boolean} select True to select in addition.
     * @returns {TP.core.ConsoleService} The receiver.
     */

    //  We wrap this in a try...catch that does nothing because, on startup,
    //  it seems like the textfield isn't focusable on IE and this will
    //  throw an exception. It's not a big deal, except that this means that
    //  the text field will not focus on startup.
    try {
        if (select) {
            TP.wrap(this.get('$inputCell')).select();
        } else {
            TP.wrap(this.get('$inputCell')).focus();
        }
    } catch (e) {
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('getInputValue',
function() {

    /**
     * @name getInputValue
     * @synopsis Returns the value of the current input cell.
     * @returns {String} The user's input.
     */

    var tpElem;

    tpElem = TP.wrap(this.get('$inputCell'));
    if (TP.isValid(tpElem)) {
        return tpElem.get('value');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('insertInputContent',
function(anObject) {

    /**
     * @name insertInputContent
     * @synopsis Inserts to the value of the input cell.
     * @param {Object} anObject The object defining the additional input.
     * @returns {TP.core.ConsoleService} The receiver.
     */

    var str;

    str = TP.str(anObject);
    TP.wrap(this.get('$inputCell')).insertAfterSelection(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('isAwaitingInput',
function(aFlag) {

    /**
     * @name isAwaitingInput
     * @synopsis Combined setter/getter for whether the receiver is waiting for
     *     input. This method will interrogate the input cell as part of the
     *     process.
     * @param {Boolean} aFlag An optional new setting.
     * @returns {Boolean} The current input state.
     * @todo
     */

    var inputCell;

    inputCell = this.get('$inputCell');

    if (TP.isBoolean(aFlag)) {
        this.$set('awaitingInput', aFlag);
    }

    return (this.$get('awaitingInput') || (TP.notEmpty(inputCell.value)));
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('setCursorToEnd',
function() {

    /**
     * @name setCursorToEnd
     * @synopsis Moves the cursor to the end of the current input data.
     * @returns {TP.core.ConsoleService} The receiver.
     */

    TP.wrap(this.get('$inputCell')).setCursorToEnd();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('setInputContent',
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
     * @returns {TP.core.ConsoleService} The receiver.
     * @todo
     */

    var wrappedInputCell,
        val;

    if (TP.isEmpty(anObject)) {
        this.clearInputCell();
        return this;
    }

    wrappedInputCell = TP.wrap(this.get('$inputCell'));

    if (TP.isTrue(shouldAppend)) {
        if (TP.notEmpty(val = wrappedInputCell.get('value'))) {
            val += '.;\n';
        }

        wrappedInputCell.set('value', val + this.formatInput(anObject));
    } else {
        wrappedInputCell.set('value', this.formatInput(anObject));
    }

    this.adjustInputCellSize();

    (function() {
        this.focusInputCell();
        this.setCursorToEnd();
    }.bind(this)).afterUnwind();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('shouldConcealInput',
function(aFlag) {

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

TP.core.ConsoleService.Inst.defineMethod('formatInput',
function(plainText) {

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
//  Event Handling
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('isCommandEvent',
function(anEvent) {

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
        case 'DOM_Tab_Press':
        case 'DOM_Tab_Up':

        case 'DOM_Shift_Enter_Down':
        case 'DOM_Shift_Enter_Press':
        case 'DOM_Shift_Enter_Up':

        case 'DOM_Shift_Down_Up':
        case 'DOM_Shift_Up_Up':
        case 'DOM_Shift_Right_Up':
        case 'DOM_Shift_Left_Up':

        case 'DOM_Shift_Backspace_Down':
        case 'DOM_Shift_Backspace_Press':
        case 'DOM_Shift_Backspace_Up':

        case 'DOM_Shift_Esc_Down':
        case 'DOM_Shift_Esc_Up':

            return true;

        default:
            return false;
    }
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleCommandEvent',
function(anEvent) {

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

        case 'DOM_Shift_Backspace_Up':
            this.handleClearInput(anEvent);
            break;

        case 'DOM_Shift_Esc_Up':
            this.handleCancel(anEvent);
            break;

        default:
            break;
    }

    return;
});

//  ------------------------------------------------------------------------
//  Key Handling
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleDOMKeyDown',
function(aSignal) {

    /**
     * @name handleDOMKeyDown
     * @synopsis Handles notifications of keydown events. If the key is one the
     *     console maps then the default action is overidden.
     * @param {DOMKeyDown} aSignal The TIBET signal which triggered this method.
     * @todo
     */

    var evt,
        inputCell;

    evt = aSignal.getEvent();
    inputCell = this.get('$inputCell');

    //  Make sure that the key event happened in our document
    if (TP.eventGetWindow(evt).document !== TP.nodeGetDocument(inputCell)) {
        return;
    }

    if (this.isCommandEvent(evt) || this.shouldConcealInput()) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleDOMKeyPress',
function(aSignal) {

    /**
     * @name handleTP_sig_DOMKeyPress
     * @synopsis Handles notifications of keypress events. If the key is one the
     *     console maps then the default action is overidden.
     * @param {DOMKeyPress} aSignal The TIBET signal which triggered this
     *     method.
     * @todo
     */

    var evt,
        inputCell;

    evt = aSignal.getEvent();
    inputCell = this.get('$inputCell');

    //  Make sure that the key event happened in our document
    if (TP.eventGetWindow(evt).document !== TP.nodeGetDocument(inputCell)) {
        return;
    }

    if (this.isCommandEvent(evt) || this.shouldConcealInput()) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleDOMKeyUp',
function(aSignal) {

    /**
     * @name handleDOMKeyUp
     * @synopsis Handles notifications of keyup events. If the key is one we
     *     care about then we forward the event to the shell for processing.
     * @param {DOMKeyUp} aSignal The TIBET signal which triggered this handler.
     */

    var evt,
        inputCell,
        input,
        keyname,
        code;

    evt = aSignal.getEvent();
    inputCell = this.get('$inputCell');

    //  Make sure that the key event happened in our document
    if (TP.eventGetWindow(evt).document !== TP.nodeGetDocument(inputCell)) {
        return;
    }

    if (this.isCommandEvent(evt)) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);

        this.handleCommandEvent(evt);
    } else if (this.shouldConcealInput()) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);

        input = TP.ifInvalid(this.$get('concealedInput'), '');
        keyname = TP.domkeysigname(evt);

        if (keyname === 'DOM_Backspace_Up') {
            if (input.getSize() > 0) {
                this.$set('concealedInput', input.slice(0, -1));
            }
        } else if (TP.core.Keyboard.isPrintable(evt)) {
            code = TP.eventGetKeyCode(evt);
            this.$set('concealedInput', input + String.fromCharCode(code));
        }

        this.setInputContent('*'.times(
                this.$get('concealedInput').getSize()));
    } else {
        keyname = TP.domkeysigname(evt);

        if (keyname === 'DOM_Enter_Up' || keyname === 'DOM_Backspace_Up') {
            this.adjustInputCellSize();
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleDOMUndo',
function(aSignal) {

    /**
     * @name handleDOMUndo
     * @synopsis Handles notifications of undo signals (a synthetic TIBET
     * event).
     * @param {DOMUndo} aSignal The TIBET signal which triggered this handler.
     */

    //  Invoked by fork()ing because of browser reflow...
    /* eslint-disable no-wrap-func */
    (function() {
        this.adjustInputCellSize();
    }).bind(this).fork();
    /* eslint-enable no-wrap-func */

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleDOMCut',
function(aSignal) {

    /**
     * @name handleDOMCut
     * @synopsis Handles notifications of cut signals.
     * @param {DOMCut} aSignal The TIBET signal which triggered this handler.
     */

    //  Invoked by fork()ing because of browser reflow...
    /* eslint-disable no-wrap-func */
    (function() {
        this.adjustInputCellSize();
    }).bind(this).fork();
    /* eslint-enable no-wrap-func */

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleDOMPaste',
function(aSignal) {

    /**
     * @name handleDOMUndo
     * @synopsis Handles notifications of paste signals.
     * @param {DOMPaste} aSignal The TIBET signal which triggered this handler.
     */

    //  Invoked by fork()ing because of browser reflow...
    /* eslint-disable no-wrap-func */
    (function() {
        this.adjustInputCellSize();
    }).bind(this).fork();
    /* eslint-enable no-wrap-func */

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleDOMModifierKeyChange',
function(aSignal) {

    /**
     * @name handleDOMModifierKeyChange
     * @param {TP.sig.DOMModifierKeyChange} aSignal The TIBET signal which
     *     triggered this handler.
     * @abstract
     * @todo
     */

    return;
/*
    var evt,
        arr,
        str;

    //TP.info('fix TP.core.ConsoleService::handleDOMModifierKeyChange', TP.LOG);

    evt = aSignal.getEvent();

    arr = TP.ac();
    arr.push(aSignal.getCtrlKey() ? 'Ctrl' : null);
    arr.push(aSignal.getAltKey() ? 'Alt' : null);
    arr.push(aSignal.getMetaKey() ? 'Meta' : null);
    arr.push(aSignal.getShiftKey() ? 'Shift' : null);
    arr.compact();

    str = arr.join(':');
    TP.htmlElementSetContent(TP.byId('status1', this.$get('vWin')),
        str, null, false);

    if (TP.isTrue(this.get('open')) &&
        aSignal.getAltKey() &&
        aSignal.getShiftKey()) {
        this.toggleScrollViewOpen();
    }
*/
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleTab',
function(anEvent) {

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
//  Request Handling
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('cancelUserInputRequest',
function(aRequest) {

    /**
     * @name cancelUserInputRequest
     * @synopsis Cancels a pending user input request, returning control to the
     *     console. The next pending queued request is processed if any are
     *     queued. If no request is provided the last input request is
     *     cancelled.
     * @param {TP.sig.UserInputRequest} aRequest The request to cancel.
     */

    var req;

    //  operate on the request provided, unless we're being asked to default
    //  to the current input request
    if (TP.notValid(req =
            TP.ifInvalid(aRequest, this.get('lastInputRequest')))) {

        return;
    }

    //  clear our input wait flag so any new input request can be processed
    this.isAwaitingInput(false);

    //  hide the input cell if the request was our current input request
    if (this.get('lastInputRequest') === req) {
        this.set('lastInputRequest', null);
        //this.hideInputCell();
    } else {
        this.get('requestQueue').remove(req);
    }

    //  cancel the request and let the user know that we did.
    req.cancel();
    this.stdout('Request cancelled.');

    //  reset the prompt and input cell
    this.clearInputCell();

    //  this will default to either the model's prompt or our default
    this.setPrompt();

    //this.showInputCell();

    //  process whatever might be sitting in the input request queue
    this.handleNextRequest();

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleConsoleRequest',
function(aRequest) {

    /**
     * @name handleConsoleRequest
     * @synopsis Responds to a request for special console processing. These
     *     requests are used by models to request behavior from the view, if
     *     any, without having to hold a view reference. A good example of a
     *     console request is the ':clear' command.
     * @param {TP.sig.ConsoleRequest} aRequest The signal instance that
     *     triggered this call.
     */

    var cmd,
        response;

    //  consoles only work in response to their model's ID
    if ((aRequest.get('requestor') !== this.getModel()) &&
        (aRequest.getOrigin() !== this.getModel())) {

        return;
    }

    if (TP.notValid(cmd = aRequest.at('cmd'))) {
        return;
    }

    switch (cmd) {
        case 'clear':
            this.clearConsole();
            break;

        case 'input':
            this.setInputContent(aRequest.at('body'));
            break;

        default:
            break;
    }

    response = aRequest.constructResponse();
    response.complete();

    return response;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleNoMoreRequests',
function(aRequest) {

    /**
     * @name handleNoMoreRequests
     * @synopsis Performs any processing required when all queued requests have
     *     been processed. For the console the proper response is typically to
     *     clear the input cell to ensure it's ready for input.
     * @param {TP.sig.Request} aRequest The last request, which sometimes will
     *     need to provide information to this process.
     */

    if (!this.isSystemConsole()) {
        if (TP.isValid(aRequest) && (!aRequest.at('cmdInput'))) {
            this.clearInputCell();

            //  this will default to either the model's prompt or our
            //  default
            this.setPrompt();
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleRequestCompleted',
function(aSignal) {

    /**
     * @name handleRequestCompleted
     * @synopsis Responds to notifications that a request is complete, most
     *     often when the receiver was the requestor for the signal.
     * @param {TP.sig.RequestCompleted} aSignal The signal instance that
     *     triggered this call.
     */

    var id,
        request;

    TP.stop('break.shell_completed');

    if (TP.canInvoke(aSignal, 'getRequestID')) {
        id = aSignal.getRequestID();
    } else {
        id = aSignal.getOrigin();
    }

    //  if the request is a registered one then we were the responder
    request = this.getRequestById(id);
    if (TP.isValid(request)) {
        //  turn off observation of this origin. NOTE that we ignore both
        //  signal types here since we don't want to assume we should ignore
        //  the update signals during an event sequence
        this.ignore(aSignal.getOrigin(), 'TP.sig.RequestCompleted');
        this.ignore(aSignal.getOrigin(), 'TP.sig.RequestModified');

        //  this will default to either the model's prompt or our default
        this.setPrompt();

        //  if the registered request was the last input request, then clear it
        //  and reset 'awaiting input' and 'should conceal input'
        if (request === this.get('lastInputRequest')) {
            this.set('lastInputRequest', null);

            this.isAwaitingInput(false);
            this.shouldConcealInput(false);
        }
    }

    this.handleNextRequest();

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleRequestModified',
function(aSignal) {

    /**
     * @name handleRequestModified
     * @synopsis Responds to notifications that a request has been altered or
     *     updated. These are typically fired by TP.sig.UserInputRequests such
     *     as the TP.sig.UserInputSeries subtype during intermediate stages of
     *     data capture.
     * @param {RequestModified} aSignal The signal instance that triggered this
     *     call.
     */

    //  NOTE:   we don't ignore() here since this signal can be repeated and
    //          we don't want to miss out on the followups
    this.refreshFromRequest(this.getRequestById(aSignal.getRequestID()));

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleShellRequestCompleted',
function(aSignal) {

    /**
     * @name handleShellRequestCompleted
     * @synopsis Responds to notifications that a shell request is complete. The
     *     typical response is to output the response via the view.
     * @param {TP.sig.ShellResponse} aSignal
     */

    this.updateStatus(aSignal.getRequest());
    this.handleNextRequest(aSignal);

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleUserInputRequest',
function(aSignal) {

    /**
     * @name handleUserInputRequest
     * @synopsis Responds to user input requests by either passing control of
     *     the input cell content to the request, or by queueing the request if
     *     the input cell is already spoken for.
     * @param {TP.sig.UserInputRequest} aSignal The signal instance which
     *     triggered this call.
     */

    var model;

    model = this.getModel();

    //  consoles only work in response to their model's ID as either the
    //  origin or the requestor
    if ((aSignal.get('requestor') !== model) &&
        (aSignal.getOrigin() !== model)) {
        return;
    }

    if (aSignal.get('responder') !== this) {
        aSignal.set('responder', this);
    }

    this.observe(aSignal.getRequestID(), 'TP.sig.RequestCompleted');
    this.observe(aSignal.getRequestID(), 'TP.sig.RequestModified');

    //  note that if we're busy we have to queue it
    if (this.isAwaitingInput()) {
        this.queueIORequest(aSignal);

        //  when we queue we don't complete the signal so things don't get
        //  ahead of themselves
        return;
    }

    //  track the last request so when input is provided we can bind the
    //  response to the last request and make sure any new requests that
    //  come in will get queued
    this.set('lastInputRequest', aSignal);
    this.isAwaitingInput(true);

    this.shouldConcealInput(TP.isTrue(aSignal.at('hideInput')));

    //  it's important to note the use of stdin to do the real work. by
    //  doing it this way we unify the signal and direct-call methods of
    //  getting input
    if (aSignal.isError()) {
        this.stderr(aSignal.at('query'), aSignal);
        this.stdin(null, aSignal.at('default'), aSignal);
    } else {
        if (TP.notValid(aSignal.at('messageType'))) {
            aSignal.atPut('messageType', 'prompt');
        }

        this.stdin(aSignal.at('query'), aSignal.at('default'), aSignal);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleUserInputSeries',
function(aSignal) {

    /**
     * @name handleUserInputSeries
     * @synopsis Responds to user input series by either passing control of the
     *     input cell content to the request, or by queueing the request if the
     *     input cell is already spoken for.
     * @param {TP.sig.UserInputSeries} aSignal The signal instance which
     *     triggered this call.
     */

    return this.handleUserInputRequest(aSignal);
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleUserOutputRequest',
function(aRequest) {

    /**
     * @name handleUserOutputRequest
     * @synopsis Responds to user output requests by either displaying the
     *     output or queuing the request if necessary.
     * @param {TP.sig.UserOutputRequest} aRequest The signal instance which
     *     triggered this call.
     */

    //  consoles only work in response to their model's ID as either the
    //  origin or the requestor
    if ((aRequest.get('requestor') !== this.getModel()) &&
        (aRequest.getOrigin() !== this.getModel())) {
        return;
    }

    aRequest.set('responder', this);

    if (aRequest.isError()) {
        if (TP.notEmpty(aRequest.at('message'))) {
            this.stderr(aRequest.at('message'), aRequest);
        } else {
            this.stderr(aRequest.at('output'), aRequest);
        }
    } else {
        this.stdout(aRequest.at('output'), aRequest);
    }

    aRequest.complete();

    //  NOTE that some shell execution pathways use a
    //  TP.sig.UserOutputRequest as their way of doing all the work, so we
    //  update from that request
    this.updateStatus(aRequest);
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('refreshFromRequest',
function(aRequest) {

    /**
     * @name refreshFromRequest
     * @synopsis Refreshes the input cell, along with optional prompt and
     *     default data.
     * @param {TP.sig.UserInputRequest} aRequest An input request containing
     *     processing instructions.
     * @todo
     */

    var query,
        def,
        hide;

    if (TP.notEmpty(query = aRequest.at('query'))) {
        this.setPrompt(query, 'cmdline_prompt');
    }

    if (TP.notEmpty(def = aRequest.at('default'))) {
        this.setInputContent(def);
    }

    if (TP.isValid(hide = aRequest.at('hideInput'))) {
        this.shouldConcealInput(hide);
    }

    return;
});

//  ------------------------------------------------------------------------
//  Model Signals
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleCancel',
function(anEvent) {

    /**
     * @name handleCancel
     * @synopsis Processes requests to cancel the current job and return control
     *     of the input cell to the shell.
     * @param {Event} anEvent A JS/DOM Event object.
     */

    TP.eventPreventDefault(anEvent);

    //  NOTE:   the implication here is that the input cell in the console is
    //          currently waiting for user input, and the user has decided to
    //          'Esc' the prior request. In that state the command itself has
    //          made an input request and hasn't gotten notification of input
    //          being ready, so we can cancel it.
    this.cancelUserInputRequest();

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleChange',
function(aSignal) {

    /**
     * @name handleChange
     * @synopsis Responds to signals the the model has changed state. This is
     *     typically reflected in the tool/status bar.
     * @param {Change} aSignal The change signal which triggered this method.
     */

    if (aSignal.get('origin') === this.getModel()) {

        //  avoid inheritance firing's dispatch to shell hierarchy
        aSignal.stopPropagation();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleClearInput',
function(anEvent) {

    /**
     * @name handleClearInput
     * @synopsis Processes requests to clear the input cell completely.
     * @param {Event} anEvent A JS/DOM Event object.
     */

    TP.eventPreventDefault(anEvent);
    this.clearInputCell();

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleHistoryNext',
function(anEvent) {

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
        this.clearInputCell();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleHistoryPrev',
function(anEvent) {

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
    if (TP.isValid(cmd)) {
        this.setInputContent(cmd);
    } else {
        this.clearInputCell();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('handleRawInput',
function(anEvent) {

    /**
     * @name handleRawInput
     * @synopsis Handles raw input and converts it into an appropriate input
     *     response. Some console input is in response to some input request so
     *     we try to bind the result to the request where possible. If no
     *     request appears to be current then we assume a new shell request is
     *     being made.
     * @param {Event} anEvent A JS/DOM Event object.
     */

    var input;

    //  capture the text content of the input cell. we'll be passing this
    //  along to the responder if it's got any content
    input = this.getInputValue();
    if (TP.notValid(input)) {
        //  oops, not even an empty string value
        return;
    }

    //  always clear the cell to provide visual feedback that we've accepted
    //  the input and are working on it
    this.clearInputCell();

    this.execRawInput(input);

    return;
});

//  ------------------------------------------------------------------------
//  Console Request Handling
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('clearConsole',
function() {

    /**
     * @name clearConsole
     * @synopsis Clears the receiver's content, removing all HTML elements and
     *     resetting the console to an empty input field.
     * @returns {TP.core.ConsoleService} The receiver.
     */

    TP.boot.$clearLog();

    this.clearStatus();

    //  Refocus the input cell and set its cursor to the end.
    this.clearInputCell();
    this.focusInputCell();
    this.setCursorToEnd();

    return this;
});

//  ------------------------------------------------------------------------
//  Status bar management
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('clearStatus',
function() {

    /**
     * @name clearStatus
     * @synopsis Clears any status information such as window.status and/or any
     *     status bar content, resetting it to the default state.
     * @returns {TP.core.ConsoleService} The receiver.
     * @todo
     */

    //TP.info('fix TP.core.ConsoleService::clearStatus', TP.LOG);

    return this;
/*
    TP.status('');

    return this;
*/
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('updateStatus',
function(aSignal) {

    /**
     * @name updateStatus
     * @synopsis Updates the status bar with information which is drawn from the
     *     current environment and the signal provided. The signal is typically
     *     a TP.sig.UserIOResponse containing information about the processing
     *     which just occurred.
     * @param {TP.sig.ShellRequest} aSignal The request that the status is being
     *     updated for.
     */

    //TP.info('fix TP.core.ConsoleService::updateStatus', TP.LOG);

    return this;
/*
    var model,
        doc,
        outCell,
        str,
        canvasWin;

    model = this.getModel();
    doc = this.get('vWin').document;

    //  Make sure that we have a valid signal and that we actually have
    //  cells to update the status of.
    if (TP.isValid(aSignal) && TP.notEmpty(this.get('$cellHash'))) {
        //  fake "reuse" here so we get back the original command cell
        aSignal.atPut('cmdAppend', true);
        outCell = this.getOutputCell(aSignal);

        if (TP.isValid(outCell)) {
            outCell.updateStats(aSignal);
        }
    }

    //  ---
    //  status context ID (execution window's global ID)
    //  ---

    str = '';
    if (TP.isWindow(canvasWin = TP.sys.getUICanvas(true))) {
        str = '' + TP.gid(canvasWin).sliceFrom('.', false, true);

        TP.htmlElementSetContent(TP.byId('status2', this.$get('vWin')),
            str, null, false);
    }

    //  ---
    //  logging level
    //  ---

    str = '' + TP.getLogLevel().getName() + '::' + APP.getLogLevel().getName();
    TP.htmlElementSetContent(TP.byId('status3', this.$get('vWin')),
        str, null, false);

    return;
*/
});

//  ------------------------------------------------------------------------
//  General Purpose
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('execRawInput',
function(rawInput) {

    /**
     * @name execRawInput
     * @synopsis
     * @param {String} rawInput A String of raw input
     */

    var input,
        res,
        req,
        model;

    if (TP.notValid(input = rawInput)) {
        //  oops, not even an empty string value
        return;
    }

    //  two options here...one is we find an input request that caused
    //  display of the input cell (in which case that request "owns" the
    //  input and we forward to that input request) or we got new input in
    //  which case we build a shell request and forward it to the shell
    if (TP.notValid(req = this.get('lastInputRequest'))) {
        if (TP.notValid(model = this.get('model'))) {
            this.raise('TP.sig.InvalidModel',
                        'Console has no attached shell instance');

            return;
        }

        req = TP.sig.ShellRequest.construct(
            TP.hc('async', true,
                    'cmd', input,
                    'cmdAllowSubs', true,
                    'cmdExecute', true,
                    'cmdHistory', true,
                    'cmdInteractive', true,
                    'cmdLogin', true,
                    'cmdPhases', 'nocache',
                    'cmdEcho', true
            ));

        req.set('requestor', this);

        // Trigger commmand echo prior to starting execution.
        //this.stdout(req);

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

TP.core.ConsoleService.Inst.defineMethod('getModel',
function() {

    /**
     * @name getModel
     * @synopsis Returns the model which this view is displaying IO for.
     * @returns {TP.core.Shell} The shell instance serving out output.
     */

    return this.$get('model');
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('getPrompt',
function() {

    /**
     * @name getPrompt
     * @synopsis Returns the prompt content of the current input element.
     * @returns {String} The prompt string to display.
     */

    var elem;

    if (TP.isElement(elem = TP.byId('tdc_cmdline_prompt', this.get('vWin')))) {
        return elem.innerHTML;
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('getWidth',
function() {

    /**
     * @name getWidth
     * @synopsis Returns the maximum width of unbroken strings in the console.
     *     This value will default to the WIDTH variable setting.
     * @returns {Number}
     * @todo
     */

    var model,
        val;

    if (TP.isValid(model = this.getModel())) {
        if (TP.isValid(val = model.getVariable('WIDTH'))) {
            return val;
        }
    }

    if (TP.notValid(val)) {
        val = this.$get('width');
    }

    //  push value to model if it exists
    if (TP.isValid(model)) {
        model.setVariable('WIDTH', val);
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('isSystemConsole',
function(aFlag) {

    /**
     * @name isSystemConsole
     * @synopsis Returns true if the receiver is a system console. The system
     *     console 'owns' the TIBET stdio hooks allowing it to display log
     *     output etc.
     * @param {Boolean} aFlag An optional flag to set as the new system console
     *     status.
     * @returns {Boolean}
     * @todo
     */

    //  TODO:   use this flag to control which console has stdio ownership
    if (TP.isBoolean(aFlag)) {
        this.$set('systemConsole', aFlag);
    }

    return this.$get('systemConsole');
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('setModel',
function(aModel) {

    /**
     * @name setModel
     * @synopsis Sets the model (shell) the console is interacting with.
     * @param {TP.core.Shell} aModel The model instance.
     * @returns {TP.core.ConsoleService} The receiver.
     */

    var model;

    //  clear observations of any prior model
    if (TP.isValid(model = this.getModel())) {
        this.ignore(model);
    }

    //  TODO:   do we want to default to a system-level TSH instance here?
    if (TP.notValid(aModel)) {
        return this.raise('TP.sig.InvalidModel');
    }

    this.$set('model', aModel);

    //  this will default to either the model's prompt or our default
    this.setPrompt();

    //  watch model for events so we keep things loosly coupled
    this.observe(aModel, TP.ANY);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('setPrompt',
function(aPrompt, aCSSClass) {

    /**
     * @name setPrompt
     * @synopsis Sets the text prompt used for the input cell.
     * @param {String} aPrompt The prompt to define.
     * @param {String} aCSSClass An optional CSS class name to use for display
     *     of the prompt string.
     * @returns {TP.core.ConsoleService} The receiver.
     * @todo
     */

    var cssClass,
        model,
        promptStr,

        elem,
        contentWidth,
        promptRightMargin;

    cssClass = TP.ifInvalid(aCSSClass, 'cmdline_prompt');

    //  prompt can get thrown off sometimes, so we attempt to keep it
    //  consistent with the model here unless otherwise specified
    if (TP.isValid(model = this.getModel())) {
        promptStr = TP.ifInvalid(aPrompt,
            TP.ifInvalid(model.getPrompt(),
                this.getType().DEFAULT_PROMPT));
    } else {
        promptStr = TP.ifInvalid(promptStr, this.getType().DEFAULT_PROMPT);
    }

    if (TP.isElement(elem = TP.byId('tdc_cmdline_prompt', this.get('vWin')))) {
        TP.elementSetClass(elem, cssClass);

        promptStr = TP.xmlEntitiesToLiterals(promptStr);
        TP.elementSetContent(elem, promptStr, null, false);

    } else {
        //  TODO:   what do we want to do here?
        void(0);
    }

    //  Set the left of the cmdline's input div to the width of the prompt div
    contentWidth = TP.elementGetContentWidth(elem);
    elem.style.left = contentWidth + 'px';

    promptRightMargin = this.getType().PROMPT_RIGHT_MARGIN;

    TP.byId('tdc_cmdline_input', this.get('vWin')).style.left =
        (contentWidth + promptRightMargin) + 'px';

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('setWidth',
function(aWidth) {

    /**
     * @name setWidth
     * @synopsis Sets the maximum width of unbroken strings in the console. Note
     *     that this only affects newly constructed cells, older cells are not
     *     reflowed.
     * @param {Number} aWidth The character count to use.
     * @returns {Number}
     */

    var model;

    if (TP.isValid(model = this.getModel())) {
        model.setVariable('WIDTH',
                TP.ifInvalid(aWidth, this.$get('width')));
    } else {
        this.$set('width');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  STDIO Handling
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('notify',
function(anObject, aRequest) {

    /**
     * @name notify
     * @synopsis Updates the console notice bar using data from the object. A
     *     few common object types are handled specifically including
     *     TP.sig.Requests, Error/Exceptions, and Strings. Other objects are
     *     converted as well as possible and use the optional level parameter
     *     when they can't provide one.
     * @param {Object} anObject The message and level source.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @todo
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('stderr',
function(anError, aRequest) {

    /**
     * @name stderr
     * @synopsis Outputs the error provided using any parameters in the request
     *     to assist with formatting etc. Parameters include messageType,
     *     messageLevel, cmdAsIs, etc.
     * @param {String} anError The error to output.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.core.ConsoleService} The receiver.
     * @todo
     */

    var request,
        err;

    TP.stop('break.tdc_stderr');
    TP.stop('break.tdc_stdio');

    if (TP.isValid(aRequest)) {
        aRequest.atPutIfAbsent('messageType', 'failure');
        request = aRequest;
    } else {
        request = TP.hc('messageType', 'failure');
    }
    request.atPutIfAbsent('messageLevel', TP.ERROR);

    err = TP.isError(anError) ? TP.str(anError) : anError;

    try {

        //  Write input content if we haven't already written it.
        if (TP.notTrue(request.at('inputWritten'))) {
            this.writeInputContent(request);
        }

        //  Make sure to mark the request as having had it's 'input content'
        //  written once - we only do this once.
        request.atPut('inputWritten', true);

        //  Write output content
        this.writeOutputContent(err, request);

    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(
                        e,
                        TP.join('TP.core.ConsoleService.stderr(',
                                TP.str(err), ') generated error.')
                     ),
                TP.LOG) : 0;
    }

    this.scrollToEnd();

    this.get('$multiResults').empty();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('stdin',
function(anObject, aDefault, aRequest) {

    /**
     * @name stdin
     * @synopsis Displays the input cell, along with optional prompt and default
     *     data. This method must be called at least once to provide an input
     *     cell for the user.
     * @param {String} aQuery An optional query string to format as a question
     *     for the user.
     * @param {String} aDefault An optional string value to insert into the
     *     input cell.
     * @param {TP.sig.UserInputRequest} aRequest An input request containing
     *     processing instructions.
     * @todo
     */

    TP.stop('break.tdc_stdin');
    TP.stop('break.tdc_stdio');

    this.setPrompt(anObject, 'cmdline_prompt');
    this.setInputContent(aDefault);

    return;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('stdout',
function(anObject, aRequest) {

    /**
     * @name stdout
     * @synopsis Outputs the object provided using any parameters in the request
     *     to assist with formatting etc. Parameters include messageType,
     *     cmdAsIs, etc.
     * @param {Object} anObject The object to output in string form.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.core.ConsoleService} The receiver.
     * @todo
     */

    var request,

        cmdSequence,

        outObject,

        append;

    TP.stop('break.tdc_stdout');
    TP.stop('break.tdc_stdio');

    //  We should see multiple output calls, at least one of which is the
    //  cmdConstruct notifier which tells us to build our output cell.
    if (aRequest && aRequest.at('cmdConstruct') === true) {
        return;
    }

    request = TP.request(aRequest);

    outObject = anObject;

    if ((cmdSequence = request.at('cmdSequence')) &&
         cmdSequence.getSize() > 1) {

        this.get('$multiResults').push(outObject);

        if (request !== cmdSequence.last()) {
            //  It's not the last one - return
            return this;
        } else {
            //  It's the last one - collapse the contents of the $multiResults
            //  Array as the thing to report. Having an Array here with one item
            //  is a common case - a piping sequence will generate a
            //  'cmdSequence' will a single 'out object'.
            outObject = TP.collapse(this.get('$multiResults'));
        }
    }

    //  when a command is set as silent it means we don't do console output
    if (request.at('cmdSilent') || TP.sys.cfg('tdc.silent')) {
        if (request.atIfInvalid('messageLevel', 0) <= TP.ERROR) {
            return this;
        }
    }

    //  logging output defaults 'append' to true
    if (request.at('messageType') === 'log') {
        append = TP.ifKeyInvalid(request, 'cmdAppend', true);
        request.atPutIfAbsent('cmdAppend', append);
    }

    try {

        //  Write input content if we haven't already written it.
        if (TP.notTrue(request.at('inputWritten'))) {
            this.writeInputContent(request);
        }

        //  Make sure to mark the request as having had it's 'input content'
        //  written once - we only do this once.
        request.atPut('inputWritten', true);

        //  Write output content
        this.writeOutputContent(outObject, request);

    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(
                        e,
                        TP.join('TP.core.ConsoleService.stdout(',
                                TP.str(outObject), ') generated error.')
                     ),
                TP.LOG) : 0;
    }

    this.scrollToEnd();

    this.get('$multiResults').empty();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('writeInputContent',
function(aRequest) {

    /**
     * @name writeInputContent
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.tsh.ConsoleOutputCell} The receiver.
     * @abstract
     * @todo
     */

    var request,
        rootRequest,
        hid,
        str,
        hidstr,
        cssClass,

        inputData,
        inputStr;

    request = TP.request(aRequest);

    if (TP.isTrue(request.at('cmdEcho'))) {

        //  update the command title bar based on the latest output from
        //  the particular cmdID this request represents.
        if (TP.notValid(rootRequest = request.at('rootRequest'))) {
            hid = TP.ifKeyInvalid(request, 'cmdHistoryID', '');
            if (TP.isEmpty(str = TP.ifKeyInvalid(request, 'cmdTitle', ''))) {
                str = TP.ifKeyInvalid(request, 'cmd', '');
            }
        } else {
            hid = TP.ifKeyInvalid(rootRequest, 'cmdHistoryID', '');
            if (TP.isEmpty(str =
                            TP.ifKeyInvalid(rootRequest, 'cmdTitle', ''))) {
                str = TP.ifKeyInvalid(rootRequest, 'cmd', '');
            }
        }
        hidstr = TP.isEmpty(hid) ? '&#160;&#160;' : '!' + hid;

        str = str.truncate(TP.sys.cfg('tdc.max_title', 70));
        str = TP.xmlLiteralsToEntities(str);
    }

    if (TP.isEmpty(str)) {
        return;
    }

    if (TP.isValid(request.at('messageLevel'))) {
        cssClass = request.at('messageLevel').getName().toLowerCase();
    }
    cssClass = TP.ifInvalid(cssClass, 'info');

    inputData = TP.hc('hid', hidstr,
                        'cmdtext', str,
                        'inputclass', cssClass);

    inputStr = TP.uc(TP.sys.cfg('TP.tsh.console.xhtml_uri') +
                        '#xpath1(//*[@name="inputText"])').transform(
                            inputData);

    if (/\{\{/.test(inputStr)) {
        return;
    }

    TP.boot.$displayMessage(inputStr, true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('writeOutputContent',
function(anObject, aRequest) {

    /**
     * @name writeOutputContent
     * @param {Object} anObject The object to output in string form.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.tdp.Console} The receiver.
     * @abstract
     * @todo
     */

    var request,
        data,
        asIs,

        cssClass,
        outputData,
        outputStr;

    request = TP.request(aRequest);

    //  ---
    //  Produce valid XHTML node to test string content, otherwise do our best
    //  to get an XHTML node we can serialize and inject. There are two flags
    //  that drive the logic here: the 'cmdAsIs' flag and the 'cmdBox' flag.
    //  If the 'cmdAsIs' flag is set, then no further operation will be
    //  performed on the output.

    //  ---
    //  asIs() processing
    //  ---

    //  a "common flag" is the asIs flag telling us to skip formatting
    asIs = TP.ifInvalid(request.at('cmdAsIs'), false);

    //  if 'asIs' is not true, we format the data.
    if (TP.notTrue(asIs)) {
        request.atPutIfAbsent('shouldWrap', false);

        data = TP.format(
                anObject,
                TP.sys.cfg('tdc.default_format', 'tsh:pp').asType(),
                request);

    } else {
        //  Otherwise it's 'as is' - take it as it is.

        //  For 'as is' content, we typically are 'rendering markup'. If we
        //  got an Array (a distinct possibility, given the nature of pipes,
        //  etc.), we don't want separators such as commas (',') showing up
        //  in the rendered output. So we set the Array's delimiter to ''
        //  perform an 'asString()' on it.
        if (TP.isArray(anObject)) {
            anObject.set('delimiter', '');
            data = anObject.asString();
        } else {
            data = anObject;
        }

        //  make sure its always a String though.
        data = TP.str(data);
    }

    if (TP.isValid(request.at('messageLevel'))) {
        cssClass = request.at('messageLevel').getName().toLowerCase();
    }
    cssClass = TP.ifInvalid(cssClass, 'info');

    outputData = TP.hc('output', data,
                        'outputclass', cssClass,
                        'empty', '',
                        'stats',
                            TP.ifInvalid(this.getInputStats(request), ''),
                        'resulttype',
                            TP.ifInvalid(this.getInputTypeInfo(request), ''));

    if (outputData.at('stats').match(/0 | 0 | 0/)) {
        outputData.atPut('stats', '');
    }

    if (TP.isEmpty(outputData.at('stats')) && TP.isEmpty(outputData.at('resulttype'))) {
        outputData.atPut('empty', 'empty');
    }

    outputStr = TP.uc(TP.sys.cfg('TP.tsh.console.xhtml_uri') +
                        '#xpath1(//*[@name="outputText"])').transform(
                            outputData);

    TP.boot.$displayMessage(outputStr, true);

    return this;
});

//  ----------------------------------------------------------------------------
//  Console toggling
//  ----------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('toggleConsole',
function(aRequest) {

    /**
     * @name toggleConsole
     * @synopsis Toggles visibility of the console.
     * @returns {TP.core.ConsoleService} The receiver.
     */

    if (this.get('consoleDisplayed')) {
        this.hideConsole(aRequest);
    } else {
        this.showConsole(aRequest);
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('hideConsole',
function() {

    /**
     * @name hideConsole
     * @synopsis Hides the console regardless of its current visibility.
     * @returns {TP.core.ConsoleService} The receiver.
     */

    var uiRootElem,
        bootFrameElem;

    uiRootElem = TP.byId('UIROOT', top);
    bootFrameElem = TP.byId('UIBOOT', top);

    TP.elementHide(bootFrameElem);
    TP.elementShow(uiRootElem);
    uiRootElem.focus();

    this.set('consoleDisplayed', false);

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('showConsole',
function() {

    /**
     * @name showConsole
     * @synopsis Shows the console.
     * @returns {TP.core.ConsoleService} The receiver.
     */

    var uiRootElem,
        bootFrameElem;

    uiRootElem = TP.byId('UIROOT', top);
    bootFrameElem = TP.byId('UIBOOT', top);

    TP.elementHide(uiRootElem);
    TP.elementShow(bootFrameElem);
    bootFrameElem.focus();

    this.set('consoleDisplayed', true);

    /* eslint-disable no-wrap-func */
    (function() {
        //  We set the prompt here to reset the left position of the div
        //  wrapping the textarea, which won't get set when the console is first
        //  displayed on some browsers (e.g. Firefox).
        this.setPrompt();

        this.focusInputCell();
        this.setCursorToEnd();
    }).bind(this).afterUnwind();
    /* eslint-enable no-wrap-func */

    return this;
});

//  ========================================================================

/**
 * @type {TP.sig.ToggleConsole}
 * @synopsis
 */

//  ----------------------------------------------------------------------------

TP.sig.Signal.defineSubtype('ToggleConsole');

//  ========================================================================

/**
 * @type {TP.sig.ConsoleRequest}
 * @synopsis Request type specific to asking the console to perform some
 *     activity. Requests are used to avoid hard linkages between various
 *     requestors and the console itself. These requests can be made by shells
 *     when they can't be sure there even _is_ a console that's listening.
 */

//  ------------------------------------------------------------------------

TP.sig.Request.defineSubtype('ConsoleRequest');

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
