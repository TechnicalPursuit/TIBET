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
 * @type {TP.sherpa.ConsoleService}
 */

//  ----------------------------------------------------------------------------

TP.core.UserIOService.defineSubtype('sherpa.ConsoleService');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the input cell textarea itself
TP.sherpa.ConsoleService.Inst.defineAttribute('$consoleGUI');

//  an Array that is used to collect 'all results of a command sequence' (i.e
//  multiple shell statements separated by ';' or pipes, etc.)
TP.sherpa.ConsoleService.Inst.defineAttribute('$multiResults');

//  how many characters wide should the output display be? too large a
//  number here will cause horizontal scrolling.
TP.sherpa.ConsoleService.Inst.defineAttribute('width', 80);

//  the underlying TP.core.Shell instance serving as the model for this console
TP.sherpa.ConsoleService.Inst.defineAttribute('model');

//  are we currently blocking on input from the user
TP.sherpa.ConsoleService.Inst.defineAttribute('awaitingInput', false);

//  should IO be concealed? this is used to simulate "password" mode
TP.sherpa.ConsoleService.Inst.defineAttribute('conceal', false);
TP.sherpa.ConsoleService.Inst.defineAttribute('concealedInput');

//  the last input request processed by the receiver
TP.sherpa.ConsoleService.Inst.defineAttribute('lastInputRequest');

//  is this a system console, i.e. should it have logging?
TP.sherpa.ConsoleService.Inst.defineAttribute('systemConsole', false);

//  a timer that runs to mark the current text to be processed after a certain
//  key is held down for a particular amount of time
TP.sherpa.ConsoleService.Inst.defineAttribute('markingTimer');

//  the ID of the last 'non cmd output tile' - usually a logging tile that we
//  just want to append to.
TP.sherpa.ConsoleService.Inst.defineAttribute('lastNonCmdTileID');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Type.defineMethod('construct',
function(aResourceID, aRequest) {

    /**
     * @method construct
     * @summary Constructs a new console service instance.
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
     * @returns {TP.sherpa.ConsoleService} A new instance.
     */

    var name;

    if (TP.isEmpty(aResourceID)) {
        if (TP.notValid(
                TP.core.Resource.getResourceById('SherpaConsoleService'))) {
            name = 'SherpaConsoleService';
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

TP.sherpa.ConsoleService.Inst.defineMethod('init',
function(aResourceID, aRequest) {

    /**
     * @method init
     * @summary Constructor for new instances.
     * @param {String} aResourceID The unique resource ID for this resource
     *     instance.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request object or hash
     *     containing parameters including: consoleWindow and consoleNode which
     *     name the window and node to use for the console. A consoleTabs
     *     parameter determines whether a tabset is used.
     * @returns {TP.sherpa.ConsoleService} A new instance.
     */

    var request,
        model;

    this.callNextMethod();

    //  make to register ourself before we start signing up for signals... this
    //  way, our registration is not considered a 'handler' registration and
    //  won't be GC'ed when we ignore those signals. This observe/ignore cycle
    //  happens frequently throughout the run of this service.
    this.register();

    //  make sure we have a proper request object and a shell that can
    //  assist us with producing both our user interface and responses
    request = TP.request(aRequest);

    this.set('$consoleGUI', request.at('consoleView'));

    //  set up our model -- the shell
    this.set('model', request.at('consoleModel'));

    //  Make sure that we have a real model
    if (TP.notValid(model = this.getModel())) {
        this.raise('TP.sig.InvalidParameter',
            'Console configuration did not include a shell.');

        return;
    }

    //  list of results from a 'command sequence' that can all be output at once
    this.set('$multiResults', TP.ac());

    //  set up this object to manage stdin, stdout and stderr
    this.configureSTDIO();

    //  get our shell to start by triggering its start method
    model.start(request);

    //  update our overall status
    this.get('$consoleGUI').updateStatus();

    //  put our project identifier in place in the notifier bar
    this.notify(TP.sys.cfg('project.ident'));

    //  Process whatever initial request(s) might be sitting in the queue
    this.handleNextRequest();

    //  TODO:   add TP.sig.DocumentUnloaded logout hook observation/method

    //  Not sure why we need this... probably some coordination in how observes
    //  get set up.
    this.shouldSignalChange(true);

    //  get started by scrolling to the end (causes the scroller to
    //  resize/reposition)
    this.get('$consoleGUI').scrollOutputToEnd();

    this.observe(TP.byOID('SherpaConsole', TP.win('UIROOT')),
                    'HiddenChange');

    this.observe(TP.byOID('SherpaHalo', TP.win('UIROOT')),
                    'TP.sig.HaloDidFocus');

    this.observe(TP.byOID('SherpaHalo', TP.win('UIROOT')),
                    'TP.sig.HaloDidBlur');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('configureSTDIO',
function() {

    /**
     * @method configureSTDIO
     * @summary Configures TIBET's stdio hooks to look at the receiver. This
     *     method can be run to cause the receiver to 'own' stdio from the TIBET
     *     system and is usually invoked for system consoles.
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    var model;

    //  configure the shell's output to pipe to us...
    if (TP.isValid(model = this.get('model'))) {
        model.attachSTDIO(this);
    }

    if (TP.isWindow(self.$$TIBET) &&
        this.get('$consoleGUI').getNativeWindow() !== self.$$TIBET) {

        TP.tpwin(self.$$TIBET).attachSTDIO(this);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('sendShellCommand',
function(cmdText) {

    /**
     * @method sendShellCommand
     * @summary
     * @returns
     */

    return TP.shell(
                TP.hc(
                    'cmdSrc', cmdText,
                    'cmdEcho', true,
                    'cmdHistory', true,
                    'cmdSilent', false,
                    'cmdBuildGUI', true,
                    'cmdStdio', this
                    ));
});

//  ------------------------------------------------------------------------
//  Display Primitives
//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('isAwaitingInput',
function(aFlag) {

    /**
     * @method isAwaitingInput
     * @summary Combined setter/getter for whether the receiver is waiting for
     *     input. This method will interrogate the input cell as part of the
     *     process.
     * @param {Boolean} aFlag An optional new setting.
     * @returns {Boolean} The current input state.
     */

    var val;

    val = this.get('$consoleGUI').getInputContent();

    if (TP.isBoolean(aFlag)) {
        this.$set('awaitingInput', aFlag);
    }

    /* eslint-disable no-extra-parens */
    return (this.$get('awaitingInput') || TP.notEmpty(val));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('shouldConcealInput',
function(aFlag) {

    /**
     * @method shouldConcealInput
     * @summary Returns false for now.
     * @param {Boolean} aFlag The new value to set.
     * @returns {Boolean}
     */

    return false;
});

//  ------------------------------------------------------------------------
//  String I/O Formatting
//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('formatInput',
function(plainText) {

    /**
     * @method formatInput
     * @summary Converts text intended for the input cell so it's properly
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

TP.sherpa.ConsoleService.Inst.defineMethod('isCommandEvent',
function(anEvent) {

    /**
     * @method isCommandEvent
     * @summary Returns true if the event represents a key binding used to
     *     trigger command processing of some kind for the console.
     * @param {Event} anEvent The native event that fired.
     */

    var keyname;

    keyname = TP.domkeysigname(anEvent);

    switch (keyname) {
        case 'DOM_Shift_Enter_Down':
        case 'DOM_Shift_Enter_Press':
        case 'DOM_Shift_Enter_Up':

        case 'DOM_Shift_Down_Down':
        case 'DOM_Shift_Down_Up':
        case 'DOM_Shift_Up_Down':
        case 'DOM_Shift_Up_Up':
        case 'DOM_Shift_Right_Down':
        case 'DOM_Shift_Right_Up':
        case 'DOM_Shift_Left_Down':
        case 'DOM_Shift_Left_Up':

        case 'DOM_Alt_Shift_Down_Down':
        case 'DOM_Alt_Shift_Down_Up':
        case 'DOM_Alt_Shift_Up_Down':
        case 'DOM_Alt_Shift_Up_Up':
        case 'DOM_Alt_Shift_Right_Down':
        case 'DOM_Alt_Shift_Right_Up':
        case 'DOM_Alt_Shift_Left_Down':
        case 'DOM_Alt_Shift_Left_Up':

        case 'DOM_Ctrl_U_Down':
        case 'DOM_Ctrl_U_Press':
        case 'DOM_Ctrl_U_Up':

        case 'DOM_Ctrl_K_Down':
        case 'DOM_Ctrl_K_Press':
        case 'DOM_Ctrl_K_Up':

        case 'DOM_Shift_Esc_Down':
        case 'DOM_Shift_Esc_Up':

        case 'DOM_Ctrl_Enter_Down':
        case 'DOM_Ctrl_Enter_Press':
        case 'DOM_Ctrl_Enter_Up':

            return true;

        default:
            return false;
    }
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleCommandEvent',
function(anEvent) {

    /**
     * @method handleCommandEvent
     * @summary Processes incoming events from the view.
     * @param {Event} anEvent The native event that fired.
     */

    var keyname,
        consoleGUI;

    keyname = TP.domkeysigname(anEvent);
    consoleGUI = this.get('$consoleGUI');

    switch (keyname) {
        case 'DOM_Shift_Enter_Up':
            this.handleRawInput(anEvent);
            break;

        case 'DOM_Shift_Down_Up':
            if (consoleGUI.showingEvalMark()) {
                consoleGUI.shiftEvalMark(TP.DOWN, TP.ANCHOR);
            } else {
                this.handleHistoryNext(anEvent);
            }
            break;

        case 'DOM_Shift_Up_Up':
            if (consoleGUI.showingEvalMark()) {
                consoleGUI.shiftEvalMark(TP.UP, TP.ANCHOR);
            } else {
                this.handleHistoryPrev(anEvent);
            }
            break;

        case 'DOM_Shift_Right_Up':
            if (consoleGUI.showingEvalMark()) {
                consoleGUI.shiftEvalMark(TP.RIGHT, TP.ANCHOR);
            }
            break;

        case 'DOM_Shift_Left_Up':
            if (consoleGUI.showingEvalMark()) {
                consoleGUI.shiftEvalMark(TP.LEFT, TP.ANCHOR);
            }
            break;

        case 'DOM_Alt_Shift_Down_Up':
            if (consoleGUI.showingEvalMark()) {
                consoleGUI.shiftEvalMark(TP.DOWN, TP.HEAD);
            }
            break;

        case 'DOM_Alt_Shift_Up_Up':
            if (consoleGUI.showingEvalMark()) {
                consoleGUI.shiftEvalMark(TP.UP, TP.HEAD);
            }
            break;

        case 'DOM_Alt_Shift_Right_Up':
            if (consoleGUI.showingEvalMark()) {
                consoleGUI.shiftEvalMark(TP.RIGHT, TP.HEAD);
            }
            break;

        case 'DOM_Alt_Shift_Left_Up':
            if (consoleGUI.showingEvalMark()) {
                consoleGUI.shiftEvalMark(TP.LEFT, TP.HEAD);
            }
            break;

        case 'DOM_Ctrl_U_Up':
            this.handleClearInput(anEvent);
            break;

        case 'DOM_Ctrl_K_Up':
            this.clearConsole(true);
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

TP.sherpa.ConsoleService.Inst.defineMethod(
'handleHiddenChangeFromSherpaConsole',
function(aSignal) {

    /**
     * @method handleHiddenChange
     */

    var isHidden;

    isHidden = TP.bc(aSignal.getOrigin().getAttribute('hidden'));

    if (isHidden) {
        this.removeHandlers();
    } else {
        this.installHandlers();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleHaloDidFocus',
function(aSignal) {

    //this.show();

    TP.info('got to halo did focus', TP.LOG);

    this.get('model').setVariable('HALO', aSignal.at('haloTarget'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleHaloDidBlur',
function(aSignal) {

    //this.hide();

    TP.info('got to halo did blur', TP.LOG);

    this.get('model').setVariable('HALO', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleConsoleCommand',
function(aSignal) {

    var cmdText,
        req;

    if (TP.notEmpty(cmdText = aSignal.at('cmdText'))) {

        cmdText = cmdText.stripEnclosingQuotes();

        if (this.isShellCommand(cmdText)) {

            this.sendShellCommand(cmdText);
        } else {
            cmdText = cmdText.slice(1);

            req = TP.sig.ConsoleRequest.construct(
                                TP.hc('cmd', cmdText,
                                        'cmdSilent', true));
            req.fire(this.get('model'));

            this.get('$consoleGUI').setPrompt(this.get('model').getPrompt());
        }

        this.get('$consoleGUI').focusInput();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('isShellCommand',
function(aCommand) {

    if (aCommand === ':clear') {
        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------
//  Key Handling
//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('installHandlers',
function() {

    /**
     * @method installHandlers
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    //  set up root keyboard observations

    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyDown');
    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyPress');
    this.observe(TP.core.Keyboard, 'TP.sig.DOMKeyUp');

    //  set up other keyboard observations

    this.observe(TP.core.Keyboard, 'TP.sig.DOMModifierKeyChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('removeHandlers',
function() {

    /**
     * @method removeHandlers
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    //  remove root keyboard observations

    this.ignore(TP.core.Keyboard, 'TP.sig.DOMKeyDown');
    this.ignore(TP.core.Keyboard, 'TP.sig.DOMKeyPress');
    this.ignore(TP.core.Keyboard, 'TP.sig.DOMKeyUp');

    //  set up other keyboard observations

    this.ignore(TP.core.Keyboard, 'TP.sig.DOMModifierKeyChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleDOMKeyDown',
function(aSignal) {

    /**
     * @method handleDOMKeyDown
     * @summary Handles notifications of keydown events. If the key is one the
     *     console maps then the default action is overidden.
     * @param {DOMKeyDown} aSignal The TIBET signal which triggered this method.
     */

    var evt,
        consoleGUI,

        keyname,

        markingTimer;

    evt = aSignal.getEvent();
    consoleGUI = this.get('$consoleGUI');

    //  Make sure that the key event happened in our document
    if (!consoleGUI.eventIsInInput(evt)) {
        return;
    }

    if (TP.isValid(markingTimer = this.get('markingTimer'))) {
        clearTimeout(markingTimer);
        this.set('markingTimer', null);
    }

    keyname = TP.domkeysigname(evt);
    if (keyname === 'DOM_Shift_Down') {
        markingTimer = setTimeout(
                            function() {
                                consoleGUI.setupEvalMark();
                            }, TP.sys.cfg('sherp.edit_mark_time', 2000));
        this.set('markingTimer', markingTimer);
    }

    if (this.isCommandEvent(evt) || this.shouldConcealInput()) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleDOMKeyPress',
function(aSignal) {

    /**
     * @method handleDOMKeyPress
     * @summary Handles notifications of keypress events. If the key is one the
     *     console maps then the default action is overidden.
     * @param {DOMKeyPress} aSignal The TIBET signal which triggered this
     *     method.
     */

    var evt;

    evt = aSignal.getEvent();

    //  Make sure that the key event happened in our document
    if (!this.get('$consoleGUI').eventIsInInput(evt)) {
        return;
    }

    if (this.isCommandEvent(evt) || this.shouldConcealInput()) {
        TP.eventPreventDefault(evt);
        TP.eventStopPropagation(evt);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleDOMKeyUp',
function(aSignal) {

    /**
     * @method handleDOMKeyUp
     * @summary Handles notifications of keyup events. If the key is one we
     *     care about then we forward the event to the shell for processing.
     * @param {DOMKeyUp} aSignal The TIBET signal which triggered this handler.
     */

    var evt,
        consoleGUI,

        markingTimer,

        keyname,
        input,
        code;

    evt = aSignal.getEvent();
    consoleGUI = this.get('$consoleGUI');

    //  Make sure that the key event happened in our document
    if (!consoleGUI.eventIsInInput(evt)) {
        return;
    }

    if (TP.isValid(markingTimer = this.get('markingTimer'))) {
        clearTimeout(markingTimer);
        this.set('markingTimer', null);
    }

    keyname = TP.domkeysigname(evt);

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

        consoleGUI.setInputContent(
                '*'.times(this.$get('concealedInput').getSize()));
    }

    return;
});

//  ------------------------------------------------------------------------
//  Other Key Handling
//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleDOMModifierKeyChange',
function(aSignal) {

    /**
     * @method handleDOMModifierKeyChange
     * @param {TP.sig.DOMModifierKeyChange} aSignal The TIBET signal which
     *     triggered this handler.
     */

    this.get('$consoleGUI').updateStatus(aSignal);

    return;
});

//  ------------------------------------------------------------------------
//  Request Handling
//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('cancelUserInputRequest',
function(aRequest) {

    /**
     * @method cancelUserInputRequest
     * @summary Cancels a pending user input request, returning control to the
     *     console. The next pending queued request is processed if any are
     *     queued. If no request is provided the last input request is
     *     cancelled.
     * @param {TP.sig.UserInputRequest} aRequest The request to cancel.
     */

    var req,
        consoleGUI;

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

    consoleGUI = this.get('$consoleGUI');

    //  reset the prompt and input cell
    consoleGUI.clearInput();

    //  this will default to the GUI's prompt if the model (TSH) doesn't have
    //  one.
    consoleGUI.setPrompt(this.get('model').getPrompt());

    //this.showInputCell();

    //  process whatever might be sitting in the input request queue
    this.handleNextRequest();

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleConsoleRequest',
function(aRequest) {

    /**
     * @method handleConsoleRequest
     * @summary Responds to a request for special console processing. These
     *     requests are used by models to request behavior from the view, if
     *     any, without having to hold a view reference. A good example of a
     *     console request is the ':clear' command.
     * @param {TP.sig.ConsoleRequest} aRequest The signal instance that
     *     triggered this call.
     */

    var cmd,
        response;

    //  consoles only work in response to their model's ID
    if (aRequest.get('requestor') !== this.getModel() &&
        aRequest.getOrigin() !== this.getModel()) {

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
            this.get('$consoleGUI').setInputContent(aRequest.at('body'));
            break;

        default:
            break;
    }

    response = aRequest.constructResponse();
    response.complete();

    return response;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleNoMoreRequests',
function(aRequest) {

    /**
     * @method handleNoMoreRequests
     * @summary Performs any processing required when all queued requests have
     *     been processed. For the console the proper response is typically to
     *     clear the input cell to ensure it's ready for input.
     * @param {TP.sig.Request} aRequest The last request, which sometimes will
     *     need to provide information to this process.
     */

    if (!this.isSystemConsole()) {
        if (TP.isValid(aRequest) && !aRequest.at('cmdInput')) {

            //  this will default to the GUI's prompt if the model (TSH) doesn't
            //  have one.
            this.get('$consoleGUI').setPrompt(this.get('model').getPrompt());
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleRequestCompleted',
function(aSignal) {

    /**
     * @method handleRequestCompleted
     * @summary Responds to notifications that a request is complete, most
     *     often when the receiver was the requestor for the signal.
     * @param {TP.sig.RequestCompleted} aSignal The signal instance that
     *     triggered this call.
     */

    var id,
        consoleGUI,
        request;

    TP.stop('break.shell_completed');

    if (TP.canInvoke(aSignal, 'getRequestID')) {
        id = aSignal.getRequestID();
    } else {
        id = aSignal.getOrigin();
    }

    consoleGUI = this.get('$consoleGUI');

    //  if the request is a registered one then we were the responder
    request = this.getRequestById(id);
    if (TP.isValid(request)) {
        //  turn off observation of this origin. NOTE that we ignore both
        //  signal types here since we don't want to assume we should ignore
        //  the update signals during an event sequence
        this.ignore(aSignal.getOrigin(), 'TP.sig.RequestCompleted');
        this.ignore(aSignal.getOrigin(), 'TP.sig.RequestModified');

        //  this will default to the GUI's prompt if the model (TSH) doesn't
        //  have one.
        consoleGUI.setPrompt(this.get('model').getPrompt());

        //  if the registered request was the last input request, then clear it
        //  and reset 'awaiting input' and 'should conceal input'
        if (request === this.get('lastInputRequest')) {

            consoleGUI.clearInput();

            this.set('lastInputRequest', null);

            this.isAwaitingInput(false);
            this.shouldConcealInput(false);
        }
    }

    this.handleNextRequest();

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleRequestModified',
function(aSignal) {

    /**
     * @method handleRequestModified
     * @summary Responds to notifications that a request has been altered or
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

TP.sherpa.ConsoleService.Inst.defineMethod('handleShellRequestCompleted',
function(aSignal) {

    /**
     * @method handleShellRequestCompleted
     * @summary Responds to notifications that a shell request is complete. The
     *     typical response is to output the response via the view.
     * @param {TP.sig.ShellResponse} aSignal
     */

    this.get('$consoleGUI').updateStatus(aSignal.getRequest());
    this.handleNextRequest(aSignal);

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleUserInputRequest',
function(aSignal) {

    /**
     * @method handleUserInputRequest
     * @summary Responds to user input requests by either passing control of
     *     the input cell content to the request, or by queueing the request if
     *     the input cell is already spoken for.
     * @param {TP.sig.UserInputRequest} aSignal The signal instance which
     *     triggered this call.
     */

    var model;

    model = this.getModel();

    //  consoles only work in response to their model's ID as either the
    //  origin or the requestor
    if (aSignal.get('requestor') !== model &&
        aSignal.getOrigin() !== model) {
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

TP.sherpa.ConsoleService.Inst.defineMethod('handleUserInputSeries',
function(aSignal) {

    /**
     * @method handleUserInputSeries
     * @summary Responds to user input series by either passing control of the
     *     input cell content to the request, or by queueing the request if the
     *     input cell is already spoken for.
     * @param {TP.sig.UserInputSeries} aSignal The signal instance which
     *     triggered this call.
     */

    return this.handleUserInputRequest(aSignal);
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleUserOutputRequest',
function(aRequest) {

    /**
     * @method handleUserOutputRequest
     * @summary Responds to user output requests by either displaying the
     *     output or queuing the request if necessary.
     * @param {TP.sig.UserOutputRequest} aRequest The signal instance which
     *     triggered this call.
     */

    //  consoles only work in response to their model's ID as either the
    //  origin or the requestor
    if (aRequest.get('requestor') !== this.getModel() &&
        aRequest.getOrigin() !== this.getModel()) {
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

    //  NOTE that some shell execution pathways use a TP.sig.UserOutputRequest
    //  as their way of doing all the work, so we update from that request
    this.get('$consoleGUI').updateStatus(aRequest);
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('refreshFromRequest',
function(aRequest) {

    /**
     * @method refreshFromRequest
     * @summary Refreshes the input cell, along with optional prompt and
     *     default data.
     * @param {TP.sig.UserInputRequest} aRequest An input request containing
     *     processing instructions.
     */

    var query,
        consoleGUI,
        def,
        hide;

    consoleGUI = this.get('$consoleGUI');

    if (TP.notEmpty(query = aRequest.at('query'))) {
        consoleGUI.setPrompt(query);
    }

    if (TP.notEmpty(def = aRequest.at('default'))) {
        consoleGUI.setInputContent(def);
    }

    if (TP.isValid(hide = aRequest.at('hideInput'))) {
        this.shouldConcealInput(hide);
    }

    return;
});

//  ------------------------------------------------------------------------
//  Model Signals
//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleCancel',
function(anEvent) {

    /**
     * @method handleCancel
     * @summary Processes requests to cancel the current job and return control
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

TP.sherpa.ConsoleService.Inst.defineMethod('handleChange',
function(aSignal) {

    /**
     * @method handleChange
     * @summary Responds to signals the the model has changed state. This is
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

TP.sherpa.ConsoleService.Inst.defineMethod('handleClearInput',
function(anEvent) {

    /**
     * @method handleClearInput
     * @summary Processes requests to clear the input cell completely.
     * @param {Event} anEvent A JS/DOM Event object.
     */

    TP.eventPreventDefault(anEvent);
    this.get('$consoleGUI').clearInput();

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleHistoryNext',
function(anEvent) {

    /**
     * @method handleHistoryNext
     * @summary Processes requests to move the history index forward one
     *     position. Note that this operates on the current responder so that
     *     each responder can maintain its own history list.
     * @param {Event} anEvent A JS/DOM Event object.
     */

    var model,
        consoleGUI,
        cmd;

    if (TP.notValid(model = this.get('model'))) {
        return;
    }

    TP.eventPreventDefault(anEvent);

    consoleGUI = this.get('$consoleGUI');

    cmd = model.getHistory(model.incrementHistoryIndex());
    if (TP.isValid(cmd)) {
        consoleGUI.setInputContent(cmd);
    } else {
        consoleGUI.clearInput();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleHistoryPrev',
function(anEvent) {

    /**
     * @method handleHistoryPrev
     * @summary Processes requests to move the history index back one position.
     *     Note that this operates on the current responder so that each
     *     responder can maintain its own history list.
     * @param {Event} anEvent A JS/DOM Event object.
     */

    var model,
        consoleGUI,
        cmd;

    if (TP.notValid(model = this.get('model'))) {
        return;
    }

    TP.eventPreventDefault(anEvent);

    consoleGUI = this.get('$consoleGUI');

    cmd = model.getHistory(model.decrementHistoryIndex());
    if (TP.isValid(cmd)) {
        consoleGUI.setInputContent(cmd);
    } else {
        consoleGUI.clearInput();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('handleRawInput',
function(anEvent) {

    /**
     * @method handleRawInput
     * @summary Handles raw input and converts it into an appropriate input
     *     response. Some console input is in response to some input request so
     *     we try to bind the result to the request where possible. If no
     *     request appears to be current then we assume a new shell request is
     *     being made.
     * @param {Event} anEvent A JS/DOM Event object.
     */

    var consoleGUI,
        input;

    consoleGUI = this.get('$consoleGUI');

    //  capture the text content of the input cell. we'll be passing this
    //  along to the responder if it's got any content
    input = consoleGUI.getInputContent();
    if (TP.notValid(input)) {
        //  oops, not even an empty string value - the value must not be 'ready'
        return;
    }

    //  always clear the cell to provide visual feedback that we've accepted
    //  the input and are working on it
    consoleGUI.clearInput();

    this.execRawInput(input);

    consoleGUI.teardownEvalMark();

    return;
});

//  ------------------------------------------------------------------------
//  Console Request Handling
//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('clearConsole',
function(resetPrompt) {

    /**
     * @method clearConsole
     * @summary Clears the receiver's content, removing all HTML elements and
     *     resetting the console to an empty input field.
     * @param {Boolean} [resetPrompt=false] Whether or not to reset the prompt.
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    var consoleGUI;

    consoleGUI = this.get('$consoleGUI');

    //  Refocus the input cell and set its cursor to the end.
    consoleGUI.clearAllContent();

    consoleGUI.focusInput();
    consoleGUI.setInputCursorToEnd();

    if (resetPrompt) {
        this.get('$consoleGUI').setPrompt(this.get('model').getPrompt());
    }

    return this;
});

//  ------------------------------------------------------------------------
//  General Purpose
//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('execRawInput',
function(rawInput) {

    /**
     * @method execRawInput
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
                    'cmdBuildGUI', true,
                    'cmdLogin', true,
                    'cmdPhases', 'nocache',
                    'cmdEcho', true
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

TP.sherpa.ConsoleService.Inst.defineMethod('getModel',
function() {

    /**
     * @method getModel
     * @summary Returns the model which this view is displaying IO for.
     * @returns {TP.core.Shell} The shell instance serving out output.
     */

    return this.$get('model');
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('getWidth',
function() {

    /**
     * @method getWidth
     * @summary Returns the maximum width of unbroken strings in the console.
     *     This value will default to the WIDTH variable setting.
     * @returns {Number}
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

TP.sherpa.ConsoleService.Inst.defineMethod('isSystemConsole',
function(aFlag) {

    /**
     * @method isSystemConsole
     * @summary Returns true if the receiver is a system console. The system
     *     console 'owns' the TIBET stdio hooks allowing it to display log
     *     output etc.
     * @param {Boolean} aFlag An optional flag to set as the new system console
     *     status.
     * @returns {Boolean}
     */

    //  TODO:   use this flag to control which console has stdio ownership
    if (TP.isBoolean(aFlag)) {
        this.$set('systemConsole', aFlag);
    }

    return this.$get('systemConsole');
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('setModel',
function(aModel) {

    /**
     * @method setModel
     * @summary Sets the model (shell) the console is interacting with.
     * @param {TP.core.Shell} aModel The model instance.
     * @returns {TP.sherpa.ConsoleService} The receiver.
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

    //  this will default to the GUI's prompt if the model (TSH) doesn't have
    //  one.
    this.get('$consoleGUI').setPrompt(aModel.getPrompt());

    //  watch model for events so we keep things loosly coupled
    this.observe(aModel, TP.ANY);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('setWidth',
function(aWidth) {

    /**
     * @method setWidth
     * @summary Sets the maximum width of unbroken strings in the console. Note
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

TP.sherpa.ConsoleService.Inst.defineMethod('notify',
function(anObject, aRequest) {

    /**
     * @method notify
     * @summary Updates the console notice bar using data from the object. A
     *     few common object types are handled specifically including
     *     TP.sig.Requests, Error/Exceptions, and Strings. Other objects are
     *     converted as well as possible and use the optional level parameter
     *     when they can't provide one.
     * @param {Object} anObject The message and level source.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('stderr',
function(anError, aRequest) {

    /**
     * @method stderr
     * @summary Outputs the error provided using any parameters in the request
     *     to assist with formatting etc. Parameters include messageType,
     *     messageLevel, cmdAsIs, etc.
     * @param {String} anError The error to output.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.sherpa.ConsoleService} The receiver.
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

    err = TP.isError(anError) ? anError : new Error(anError);
    request.set('result', err);

    try {

        //  Write input content if we haven't already written it.
        if (TP.notTrue(request.at('inputWritten'))) {
            this.writeInputContent(request);
        }

        //  Write output content
        this.writeOutputContent(err, request);

    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(
                        e,
                        TP.join('TP.sherpa.ConsoleService.stderr(',
                                TP.str(err), ') generated error.')
                     ),
                TP.LOG) : 0;
    }

    this.get('$consoleGUI').scrollOutputToEnd();

    this.get('$multiResults').empty();

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('stdin',
function(anObject, aDefault, aRequest) {

    /**
     * @method stdin
     * @summary Displays the input cell, along with optional prompt and default
     *     data. This method must be called at least once to provide an input
     *     cell for the user.
     * @param {String} aQuery An optional query string to format as a question
     *     for the user.
     * @param {String} aDefault An optional string value to insert into the
     *     input cell.
     * @param {TP.sig.UserInputRequest} aRequest An input request containing
     *     processing instructions.
     */

    var consoleGUI;

    TP.stop('break.tdc_stdin');
    TP.stop('break.tdc_stdio');

    consoleGUI = this.get('$consoleGUI');

    consoleGUI.setPrompt(anObject);
    consoleGUI.setInputContent(aDefault);

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('stdout',
function(anObject, aRequest) {

    /**
     * @method stdout
     * @summary Outputs the object provided using any parameters in the request
     *     to assist with formatting etc. Parameters include messageType,
     *     cmdAsIs, etc.
     * @param {Object} anObject The object to output in string form.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.sherpa.ConsoleService} The receiver.
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
    if (request.at('cmdSilent') || TP.sys.cfg('sherpa.silent')) {
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

        //  Write output content
        this.writeOutputContent(outObject, request);

    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(
                        e,
                        TP.join('TP.sherpa.ConsoleService.stdout(',
                                TP.str(outObject), ') generated error.')
                     ),
                TP.LOG) : 0;
    }

    this.get('$consoleGUI').scrollOutputToEnd();

    this.get('$multiResults').empty();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('writeInputContent',
function(aRequest) {

    /**
     * @method writeInputContent
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.tsh.ConsoleOutputCell} The receiver.
     * @abstract
     */

    var request,
        rootRequest,

        hid,
        str,
        cssClass,

        inputData,

        tileID,

        consoleGUI;

    request = TP.request(aRequest);

    //  Don't do this twice
    if (TP.isTrue(request.at('inputWritten'))) {
        return;
    }

    request.atPut('inputWritten', true);

    if (TP.notFalse(request.at('cmdEcho'))) {

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
    }

    if (TP.isEmpty(str)) {
        return;
    }

    if (TP.isValid(request.at('messageLevel'))) {
        cssClass = request.at('messageLevel').getName().toLowerCase();
    }
    cssClass = TP.ifInvalid(cssClass, 'info');

    inputData = TP.hc('hid', hid,
                        'cmdtext', str,
                        'cssClass', cssClass,
                        'request', request);

    tileID = aRequest.at('cmdID');

    consoleGUI = this.get('$consoleGUI');

    if (TP.isEmpty(tileID)) {
        //  Fail - shouldn't get here
        void 0;
    } else {
        tileID = tileID.replace(/\$/g, '_');

        consoleGUI.createOutputEntry(tileID, inputData);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('writeOutputContent',
function(anObject, aRequest) {

    /**
     * @method writeOutputContent
     * @param {Object} anObject The object to output in string form.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.sherpa.Console} The receiver.
     * @abstract
     */

    var request,

        structuredOutput,

        tap,
        data,
        asIs,

        cssClass,
        outputData,

        tileID,

        consoleGUI;

    request = TP.request(aRequest);

    structuredOutput = false;

    if (TP.isTrue(request.at('structuredOutput'))) {
        data = '';
        structuredOutput = true;
    } else {

        //  TODO: replace this hack with an update to direct to the proper
        //  Logger/Appender so we get the output we want via layout/appender.
        tap = request.at('cmdTAP');

        //  ---
        //  Produce valid XHTML node to test string content, otherwise do our
        //  best to get an XHTML node we can serialize and inject. There are two
        //  flags that drive the logic here: the 'cmdAsIs' flag and the 'cmdBox'
        //  flag. If the 'cmdAsIs' flag is set, then no further operation will
        //  be performed on the output.

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
                    TP.sys.cfg('sherpa.default_format', 'sherpa:pp').asType(),
                    TP.hc('level', 1,
                            'shouldWrap', false));
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

            //  and, since we're not feeding it through a formatter (who is
            //  normally responsible for this), make sure its escaped
            data = data.asEscapedXML();
        }

        if (TP.isTrue(tap)) {
            if (/^ok /.test(data) || /# PASS/i.test(data)) {
                cssClass = 'tap-pass';
            } else if (/^not ok /.test(data) || /# FAIL/i.test(data)) {
                cssClass = 'tap-fail';
            } else if (/^#/.test(data)) {
                cssClass = 'tap-comment';
            } else {
                cssClass = 'tap-unknown';
            }
        } else {
            if (TP.isValid(request.at('messageLevel'))) {
                cssClass = request.at('messageLevel').getName().toLowerCase();
            }
            cssClass = TP.ifInvalid(cssClass, 'info');
        }
    }

    outputData = TP.hc('output', data,
                        'cssClass', cssClass,
                        'rawData', anObject,
                        'request', request,
                        'structuredOutput', structuredOutput);

    consoleGUI = this.get('$consoleGUI');

    //  If the request has no cmdID for us to use as a tile ID, then this was
    //  probably a call to stdout() that wasn't a direct result of a command
    //  being issued.
    if (TP.isEmpty(tileID = aRequest.at('cmdID'))) {

        //  See if there's a current 'non cmd' tile that we're using to write
        //  this kind of output. If there isn't one, then create one (but don't
        //  really hand it any data to write out - we'll take care of that
        //  below).
        if (TP.isEmpty(tileID = this.get('lastNonCmdTileID'))) {
            tileID = 'log' + TP.genID().replace('$', '_');
            consoleGUI.createOutputEntry(tileID, TP.hc());
            this.set('lastNonCmdTileID', tileID);
        }

        //  Stub in a blank space for the stats and the word 'Log' for the
        //  result data type information.
        outputData.atPut('stats', ' ');
        outputData.atPut('typeinfo', 'Log');
    } else {
        tileID = tileID.replace(/\$/g, '_');
        this.set('lastNonCmdTileID', null);
    }

    //  Update the output entry tile with the output data.
    consoleGUI.updateOutputEntry(tileID, outputData);

    return this;
});

//  ========================================================================

/**
 * @type {TP.sig.ConsoleRequest}
 * @summary Request type specific to asking the console to perform some
 *     activity. Requests are used to avoid hard linkages between various
 *     requestors and the console itself. These requests can be made by shells
 *     when they can't be sure there even _is_ a console that's listening.
 */

//  ------------------------------------------------------------------------

TP.sig.Request.defineSubtype('ConsoleRequest');

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
