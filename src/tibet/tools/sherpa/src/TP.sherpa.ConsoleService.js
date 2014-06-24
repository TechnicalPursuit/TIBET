//  ============================================================================
//  TP.core.ConsoleService
//  ============================================================================

/**
 * @type {TP.core.ConsoleService}
 * @synopsis
 */

//  ----------------------------------------------------------------------------

TP.core.UserIOService.defineSubtype('ConsoleService');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  whether or not the console is displayed
TP.core.ConsoleService.Inst.defineAttribute('consoleDisplayed', false);

//  hash of the last cell for each request/thread so append output to a
//  request's conversational thread has a reference
TP.core.ConsoleService.Inst.defineAttribute('$cellHash');

//  a linear reference to the list of cells allocated
TP.core.ConsoleService.Inst.defineAttribute('$cellList');

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
        model;

    this.callNextMethod();

    //  make sure we have a proper request object and a shell that can
    //  assist us with producing both our user interface and responses
    request = TP.request(aRequest);

    //  NB: We *must* use $set(...) here, instead of set(...), since
    //  setModel() is implemented and depends on a lot of this already
    //  being set up.
    this.set('model', request.at('consoleModel'));

    if (TP.notValid(model = this.getModel())) {
        this.raise('TP.sig.InvalidParameter', arguments,
            'Console configuration did not include a shell.');

        return;
    }

    //  hash of output nodes, keyed by request/thread ID. we keep only the
    //  last node from each thread so we can provide it (when append) or
    //  use it as the preceding node when building new nodes for that thread
    this.set('$cellHash', TP.hc());

    //  list of output nodes, in the order in which they were allocated
    this.set('$cellList', TP.ac());

    //  list of results from a 'command sequence' that can all be output at once
    this.set('$multiResults', TP.ac());

    //  get the console display elements ready for action
    this.configure(request);

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
    //this.focusInputCell();

    //  TODO:   add TP.sig.DocumentUnloaded logout hook observation/method

    //  Not sure why we need this... probably some coordination in how
    //  observes get set up.
    this.shouldSignalChange(true);

    //  set up keyboard toggle to show/hide us
    (function () {
            this.toggleConsole();

            /*
            (function () {
               TP.boot.$flushLog(true);
            }).fork(2000);
            */

        }.bind(this)).observe(
            TP.core.Keyboard, 'TP.sig.' + request.at('triggerKey'));

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

    //  configure the input cell
    this.configureInputCell();

    //  set up this object to manage stdin, stdout and stderr
    this.configureSTDIO();

    //  now that we have a viable input cell, configure the event handlers
    this.configureHandlers();

    //  register so we'll receiver UserIO signals
    //this.register();

    //  get started by scrolling to the end (causes the scroller to
    //  resize/reposition)
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

    outerWrapper.$minHeight = TP.elementGetHeight(outerWrapper, TP.CONTENT_BOX);

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

    //  set up root keyboard observations

    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyDown');
    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyPress');
    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyUp');

    this.observe(TP.core.Keyboard,
                    'TP.sig.DOM_Alt_Down_Up',
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

    //  configure the shell's output to pipe to us...
    if (TP.isValid(model = this.get('model'))) {
        model.attachSTDIO(this);
    }

    if (TP.isWindow(tibetWin = self.$$findTIBET(window)) &&
        this.get('vWin') !== tibetWin) {

        TP.tpwin(tibetWin).attachSTDIO(this);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Display Primitives
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('scrollContent',
function() {

    /**
     * @name scrollContent
     * @returns {TP.core.ConsoleService} The receiver.
     * @abstract
     * @todo
     */

    TP.info('fix TP.core.ConsoleService::scrollContent', TP.LOG, arguments);

    return this;

    var contentDiv,
        scrollGrip,
        scrollBar,
        scrollFactor;

    contentDiv = this.$get('contentDiv');

    if (contentDiv.scrollHeight === contentDiv.offsetHeight) {
        //  Nothing to do.
        return this;
    }

    //  Get the console scroll bar
    scrollGrip = this.$get('scrollGrip');
    scrollBar = TP.elementGetOffsetParent(scrollGrip);

    scrollFactor = (contentDiv.scrollHeight - contentDiv.offsetHeight) /
        (TP.elementGetHeight(scrollBar) - TP.elementGetHeight(scrollGrip));

    contentDiv.scrollTop = scrollGrip.offsetTop * scrollFactor;

    return this;
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
    height = height + cell.$perimeter;

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
//  Output Cell Methods
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('getCellFromSignal',
function(aSignal) {

    var targetElem,
        outElem,
        outCellIndex;

    if (!TP.isElement(targetElem = aSignal.getTarget())) {
        return null;
    }

    if (!TP.isElement(outElem = TP.nodeGetFirstElementAncestorByAttribute(
                                    targetElem, 'cellPosition'))) {
        return null;
    }

    outCellIndex = TP.elementGetAttribute(outElem, 'cellPosition').asNumber();

    if (TP.isNumber(outCellIndex)) {
        return this.get('$cellList').at(outCellIndex);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('removeOutputCell',
function(aCell) {

    var cellList,
        deletionIndex,
        i;

    //  First, remove it from the cellHash
    this.get('$cellHash').removeValue(aCell, TP.IDENTITY);

    //  Then, remove it from the cellList and shift the indexes
    cellList = this.get('$cellList');
    deletionIndex = cellList.getPosition(aCell, 0, TP.IDENTITY);
    cellList.removeAt(deletionIndex);

    if (TP.notEmpty(cellList)) {
        for (i = deletionIndex; i < cellList.getSize(); i++) {
            cellList.at(i).setCellPosition(i);
        }
    }

    aCell.removeFromCanvasElement();

    return this;
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

        case 'DOM_Shift_Del_Down':
        case 'DOM_Shift_Del_Press':
        case 'DOM_Shift_Del_Up':

        case 'DOM_Esc_Up':

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
//  Key Handling
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

    var evt,
        arr,
        str;

    //TP.info('fix TP.core.ConsoleService::handleDOMModifierKeyChange', TP.LOG, arguments);

    return;

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

    TP.debug('break.shell_completed');

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
        this.setPrompt(query, 'inbound_prompt');
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
//  Model Events
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
    this.clearInputCell();

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
//  Console Request Operations
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('clearConsole',
function() {

    /**
     * @name clearConsole
     * @synopsis Clears the receiver's content, removing all HTML elements and
     *     resetting the console to an empty input field.
     * @returns {TP.core.ConsoleService} The receiver.
     */

    //  clear the node search elements, there are no output nodes now
    this.get('$cellHash').empty();

    this.get('$cellList').perform(
        function(aCell) {
            aCell.uninstallFromParent();
        });

    this.get('$cellList').empty();

    this.set('$insertionNode', null);

    TP.boot.$clearLog();

    this.clearStatus();

    //  Refocus the input cell and set its cursor to the end.
    this.clearInputCell();
    this.focusInputCell();
    this.setCursorToEnd();

    return this;
});

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

    //TP.info('fix TP.core.ConsoleService::clearStatus', TP.LOG, arguments);

    return this;

    TP.status('');

    return this;
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

    //TP.info('fix TP.core.ConsoleService::updateStatus', TP.LOG, arguments);

    return this;

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

    str = '' + TP.boot.Log.getStringForLevel(TP.sys.getLogLevel());
    TP.htmlElementSetContent(TP.byId('status3', this.$get('vWin')),
        str, null, false);

    return;
});

//  ------------------------------------------------------------------------
//  General Purpose
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
        return this.raise('TP.sig.InvalidModel', arguments);
    }

    this.$set('model', aModel);

    //  this will default to either the model's prompt or our default
    this.setPrompt();

    //  watch model for events so we keep things loosly coupled
    this.observe(aModel, TP.ANY);

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

    var req,
        err;

    TP.debug('break.tdc_stderr');

    if (TP.isValid(aRequest)) {
        aRequest.atPutIfAbsent('messageType', 'failure');
        req = aRequest;
    } else {
        req = TP.hc('messageType', 'failure');
    }
    req.atPutIfAbsent('messageLevel', TP.ERROR);

    err = TP.isError(anError) ? TP.str(anError) : anError;
    this.stdout(err, req);

    return;
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

    TP.debug('break.tdc_stdin');

    this.setPrompt(anObject, 'inbound_prompt');
    this.setInputContent(aDefault);

    return;
});

//  ------------------------------------------------------------------------
//  STDOUT stuff
//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('getOutputCanvasElem',
function(aRequest) {

    return TP.boot.$getBootLogElement();
});

//  ------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('getOutputCell',
function(aRequest) {

    /**
     * @name getOutputCell
     * @synopsis Returns an output node appropriate for the request provided.
     * @description Parameters in the request help determine what kind of node
     *     is returned, and whether it's a new node or an existing one.
     *     Parameters of interest are:
     *
     *     reuse boolean true -> output is placed in the last node used,
     *     allowing a single cell to be used over a series of requests. when a
     *     thread ID is provided the last cell of that thread is reused. cmdID
     *     String A string which, when present, is used to keep cells from a
     *     common command buffer together so that all output from that buffer
     *     stays in a single block of cells. offset Number an offset which can
     *     be used to lock cells next to the input cell. default is 0.
     * @param {TP.sig.UserIORequest} aRequest The specific request instance.
     * @returns {Node} A DOM Node.
     * @todo
     */

    var cellList,
        canvasElem,
        openCells,
        closableCells,
        outCell,
        last,
        append,
        recycle,
        reuse,
        cellHash,
        tid,
        insertion,
        position,
        insertionIndex,
        i;

    cellList = this.get('$cellList');
    canvasElem = this.getOutputCanvasElem();
    openCells = TP.sys.cfg('tdc.expanded_cells');

    //  ---
    //  no-request node configuration
    //  ---

    //  no request? presume we want a new output cell at the end
    if (TP.notValid(aRequest)) {
        //  without a request to tell us differently we presume this cell
        //  is a standard output cell, meaning we insert it in the common
        //  content area at the tail.

        outCell = TP.tsh.ConsoleOutputCell.construct(
                    null, canvasElem,
                    canvasElem, TP.BEFORE_END);

        outCell.setCellPosition(cellList.getSize());
        cellList.add(outCell);

        closableCells = cellList.getSize() - openCells;

        for (i = 0; i < closableCells; i++) {
            cellList.at(i).collapse();
        }

        return outCell;
    }

    //  determine if we're being asked to either append content or reuse a
    //  prior command/thread node
    append = TP.ifInvalid(aRequest.at('cmdAppend'), false);
    recycle = TP.ifInvalid(aRequest.at('cmdRecycle'), false);
    reuse = append || recycle;

    //  commands are ID'd but they can be part of a larger "thread" in
    //  which case they're asking for their output to be part of that
    //  thread's container rather than one specific to the command ID
    tid = TP.ifInvalid(aRequest.at('cmdThread'), aRequest.at('cmdID'));

    cellHash = this.get('$cellHash');

    if (TP.isEmpty(tid)) {

        last = cellList.last();
        if (TP.isValid(last) && TP.isTrue(aRequest.at('cmdAppend'))) {
            //  we mark output nodes as logging nodes so we can properly
            //  append
            if (aRequest.at('messageType') === 'log') {
                if (last.isLogging()) {
                    return last;
                }
            } else {
                return last;
            }
        }

        //  if we're configured for reuse, even without a TID, then we'll
        //  reuse the last cell if we have one (unless we're a logging
        //  call).
        if (reuse &&
            TP.isValid(last) &&
            aRequest.at('messageType') !== 'log') {
            return last;
        }

        //  fall out to the "generic insertion logic" at the bottom
    } else {
        //  exiting command ID, we'll use any registered cell we have as our
        //  starting point
        insertion = cellHash.at(tid);
        if (TP.isValid(insertion)) {
            if (reuse) {
                return insertion;
            }

            //  we have a current node for this TID, but we're not going to
            //  reuse it in any way. that means we're going to be creating a
            //  new node and placing it after_end of the existing cell so
            //  that all cells related to that TID stay together.
            outCell = TP.tsh.ConsoleOutputCell.construct(
                        aRequest, canvasElem,
                        insertion.get('visualElem'), TP.AFTER_END);

            //  get the index of the thread's node. We'll insert just after
            //  it.
            insertionIndex = cellList.getPosition(insertion, 0, TP.IDENTITY);
            cellList.addAt(outCell, insertionIndex + 1);
            for (i = insertionIndex; i < cellList.getSize(); i++) {
                cellList.at(i).setCellPosition(i);
            }

            //  register the last cell for the thread as the new "insertion
            //  node" for that thread.
            cellHash.atPut(tid, outCell);

            closableCells = cellList.getSize() - openCells;
            for (i = 0; i < closableCells; i++) {
                if (cellList.at(i) === outCell) {
                    continue;
                }

                cellList.at(i).collapse();
            }

            return outCell;
        }

        //  fall out to the "generic insertion logic" at the bottom
    }

    //  we're not reusing, or there's no last cell to reuse. either way
    //  we need a new cell to use for output and a viable insertion node

    //  when insertion node is real then position is TP.BEFORE_BEGIN,
    //  otherwise we insert TP.BEFORE_END on the content div
    insertion = TP.ifInvalid(
                    aRequest.at('cmdInsertion'),
                    this.get('$insertionNode'));

    position = TP.isValid(insertion) ? TP.BEFORE_BEGIN : TP.BEFORE_END;
    insertion = TP.ifInvalid(insertion, canvasElem);

    outCell = TP.tsh.ConsoleOutputCell.construct(
                aRequest, canvasElem,
                insertion, position);

    outCell.setCellPosition(cellList.getSize());
    cellList.add(outCell);

    if (TP.notEmpty(tid)) {
        //  register this node by TID for lookup if we had one
        cellHash.atPut(tid, outCell);
    }

    closableCells = cellList.getSize() - openCells;
    for (i = 0; i < closableCells; i++) {
        cellList.at(i).collapse();
    }

    return outCell;
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

        append,
        outCell,
        visualElem;

    TP.debug('break.tdc_stdout');

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
        //  this call will either return a prior cell, or construct a new cell,
        //  based on the request's data values, in particular it's cmdID.
        outCell = this.getOutputCell(request);

        visualElem = outCell.get('visualElem');

        //  we mark output nodes as logging nodes so we can properly append
        if (request.at('messageType') === 'log') {
            TP.elementSetAttribute(
                            outCell.get('visualElem'),
                            'tsh:logging',
                            request.at('cmd'),
                            true);
        }

        //  set 'head' content
        outCell.setInputContent(request);

        //  set 'body' content
        outCell.setOutputContent(outObject, request);

        /*
        this.resizeOutputCell(
            outCell,
            !this.get('scrollViewOpen'),
            TP.ifKeyInvalid(request, 'cmdMinHeight', null));

        //  If we're not constructing the cell, but really printing the
        //  results, set it up to do the proper thing depending on whether
        //  we have the scroll view open or not.
        if (TP.notTrue(request.at('cmdConstruct'))) {
            //  make output cell 'float' if we're not showing the scroll
            //  view
            if (TP.isTrue(this.get('open')) &&
                TP.isFalse(this.get('scrollViewOpen'))) {
                floatDiv = this.get('floatDiv');

                TP.elementSetOpacity(floatDiv, 1.0);

                outCell.set('isFloating', true);

                (function() {

                    TP.effect(
                        floatDiv,
                        'Fade',
                        TP.hc('limit', 'PT0.35S',
                        'post',
                        function() {
                            this.switchOutputCellMode(outCell, false);
                        }.bind(this)));
                }.bind(this)).fork(TP.sys.cfg('tdc.bubble_fade_time', 2000));

            } else {
                this.switchOutputCellMode(outCell, false);
            }
        }
        */
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(
                        e,
                        TP.join('TP.core.ConsoleService.stdout(',
                                TP.str(outObject), ') generated error.')
                     ),
                TP.LOG, arguments) : 0;
    }

    this.scrollToEnd();

    this.get('$multiResults').empty();

    return this;
});

//  ----------------------------------------------------------------------------
//  Console toggling
//  ----------------------------------------------------------------------------

TP.core.ConsoleService.Inst.defineMethod('toggleConsole',
function(aRequest) {

    /**
     * @name toggleConsole
     * @synopsis
     * @returns {TP.core.ConsoleService} The receiver.
     */

    var uiRootElem,
        bootFrameElem;

    uiRootElem = TP.byId('UIROOT', top);
    bootFrameElem = TP.byId('UIBOOT', top);

    if (this.get('consoleDisplayed')) {

        TP.elementHide(bootFrameElem);
        TP.elementShow(uiRootElem);

        this.set('consoleDisplayed', false);

        //  TODO: Put back reporter we stored.

    } else {

        TP.elementHide(uiRootElem);
        TP.elementShow(bootFrameElem);

        this.set('consoleDisplayed', true);

        (function() {
            this.focusInputCell();
            this.setCursorToEnd();
        }).bind(this).afterUnwind();
    }

    return this;
});

//  ========================================================================

/**
 * @type {TP.sig.ConsoleRequest}
 * @synopsis Request type specific to asking the console to perform some
 *     activity. Requests are used to avoid hard linkages between various
 *     requestors and the console itself. These requests can be made by shells
 *     when they can't be sure there even _is_ a console that's listening.
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
