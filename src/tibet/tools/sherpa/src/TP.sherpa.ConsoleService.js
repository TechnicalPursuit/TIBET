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

//  the ID of the last 'non cmd output cell' - usually a logging cell that we
//  just want to append to.
TP.sherpa.ConsoleService.Inst.defineAttribute('lastNonCmdCellID');

//  a state machine handling keyboard states
TP.sherpa.ConsoleService.Inst.defineAttribute('keyboardStateMachine');

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
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request object or hash
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
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request object or hash
     *     containing parameters including: consoleWindow and consoleNode which
     *     name the window and node to use for the console. A consoleTabs
     *     parameter determines whether a tabset is used.
     * @returns {TP.sherpa.ConsoleService} A new instance.
     */

    var request,
        model,

        user,
        userName;

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
    this[TP.computeHandlerName('NextRequest')]();

    //  Not sure why we need this... probably some coordination in how observes
    //  get set up.
    this.shouldSignalChange(true);

    //  get started by scrolling to the end (causes the scroller to
    //  resize/reposition)
    this.get('$consoleGUI').scrollOutputToEnd();

    //  observe the console GUI for when it's shown/hidden
    this.observe(this.get('$consoleGUI'), 'HiddenChange');

    //  observe the halo for focus/blur

    this.observe(TP.byId('SherpaHalo', TP.win('UIROOT')),
                    'TP.sig.HaloDidFocus');

    this.observe(TP.byId('SherpaHalo', TP.win('UIROOT')),
                    'TP.sig.HaloDidBlur');

    //  if we're configured to auto-login, try to do that now.
    if (TP.sys.cfg('sherpa.auto_login') &&
        TP.isValid(user = TP.sys.getEffectiveUser()) &&
        TP.notEmpty(userName = user.get('vCard').get('shortname'))) {

        TP.sig.UserOutputRequest.construct(
            TP.hc('output', '\n' +
                            'Sherpa auto-login configured to log in current' +
                            ' effective user "' + userName + '"',
                    'cssClass', 'inbound_announce',
                    'cmdAsIs', true
                    )).fire(model);

        model.login();
    }

    //  Configure the keyboard state machine
    this.configureKeyboardStateMachine();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('configureKeyboardStateMachine',
function() {

    /**
     * @method configureKeyboardStateMachine
     * @summary Configures the keyboard state machine with key responders to
     *     handle the various console modes.
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    var keyboardSM,
        newResponder;

    keyboardSM = TP.core.StateMachine.construct();

    this.set('keyboardStateMachine', keyboardSM);

    keyboardSM.setTriggerSignals(TP.ac('TP.sig.DOMKeyDown', 'TP.sig.DOMKeyUp'));
    keyboardSM.setTriggerOrigins(TP.ac(TP.core.Keyboard));

    //  NB: In addition to being responders for state transition signals,
    //  KeyResponder objects also supply handlers for keyboard signals.

    //  ---  normal

    //  'normal' is the initial state

    newResponder = TP.sherpa.NormalKeyResponder.construct(keyboardSM);
    newResponder.set('$consoleService', this);
    newResponder.set('$consoleGUI', this.get('$consoleGUI'));

    //  ---  evalmarking

    //  'evalmarking' is the state used...

    newResponder = TP.sherpa.EvalMarkingKeyResponder.construct(keyboardSM);
    newResponder.set('$consoleService', this);
    newResponder.set('$consoleGUI', this.get('$consoleGUI'));

    //  ---  autocomplete

    //  'autocomplete' is the state used...

    newResponder = TP.sherpa.AutoCompletionKeyResponder.construct(keyboardSM);
    newResponder.set('$consoleService', this);
    newResponder.set('$consoleGUI', this.get('$consoleGUI'));

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
     * @summary Whether or not to conceal input by 'masking' it (i.e. with
     *     something like the '*' character). Returns false for now.
     * @param {Boolean} aFlag The new value to set.
     * @returns {Boolean} Whether or not we should conceal input.
     */

    return false;
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
     * @returns {Boolean} Whether or not the supplied event has a key binding
     *     that triggers command processing.
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

TP.sherpa.ConsoleService.Inst.defineHandler('CommandEvent',
function(anEvent) {

    /**
     * @method handleCommandEvent
     * @summary Handles incoming events from the view.
     * @param {Event} anEvent The native event that fired.
     */

    var keyname,
        consoleGUI;

    keyname = TP.domkeysigname(anEvent);
    consoleGUI = this.get('$consoleGUI');

    switch (keyname) {
        case 'DOM_Shift_Enter_Up':
            this[TP.computeHandlerName('RawInput')](anEvent);
            break;

        case 'DOM_Shift_Down_Up':
            if (consoleGUI.showingEvalMark()) {
                consoleGUI.shiftEvalMark(TP.DOWN, TP.ANCHOR);
            } else {
                this[TP.computeHandlerName('HistoryNext')](anEvent);
            }
            break;

        case 'DOM_Shift_Up_Up':
            if (consoleGUI.showingEvalMark()) {
                consoleGUI.shiftEvalMark(TP.UP, TP.ANCHOR);
            } else {
                this[TP.computeHandlerName('HistoryPrev')](anEvent);
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
            this[TP.computeHandlerName('ClearInput')](anEvent);
            break;

        case 'DOM_Ctrl_K_Up':
            this.clearConsole(true);
            break;

        case 'DOM_Shift_Esc_Up':
            this[TP.computeHandlerName('Cancel')](anEvent);
            break;

        default:
            break;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler(
{signal: 'HiddenChange', origin: 'SherpaConsole'},
function(aSignal) {

    /**
     * @method handleHiddenChangeFromSherpaConsole
     * @summary Handles notifications of when the 'hidden' state of the
     *     SherpaConsole object changes.
     * @param {TP.sig.Change} aSignal The TIBET signal which triggered this method.
     */

    var isHidden;

    isHidden = TP.bc(aSignal.getOrigin().getAttribute('hidden'));

    //  Install or remove event handlers based on whether the SherpaConsole is
    //  being shown or not.
    if (isHidden) {
        this.removeHandlers();
    } else {
        this.installHandlers();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     */

    //  Set the shell '$HALO' variable
    this.get('model').setVariable('HALO', aSignal.at('haloTarget'));

    this.get('$consoleGUI').focusInput();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     */

    //  Set the shell '$HALO' variable to null
    this.get('model').setVariable('HALO', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler('ConsoleCommand',
function(aSignal) {

    /**
     * @method handleConsoleCommand
     * @summary Handles signals that trigger console command execution.
     * @param {TP.sig.ConsoleCommand} aSignal The TIBET signal which triggered
     *     this method.
     */

    var cmdText;

    if (TP.notEmpty(cmdText = aSignal.at('cmdText'))) {

        this.sendConsoleRequest(cmdText);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Key Handling
//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('installHandlers',
function() {

    /**
     * @method installHandlers
     * @summary Installs key & mouse handlers to manage the console.
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    //  activate the keyboard state machine
    this.get('keyboardStateMachine').activate();

    //  set up other keyboard observations

    this.observe(TP.core.Keyboard, 'TP.sig.DOMModifierKeyChange');

    //  set up mouse observation for status updating

    this.observe(TP.core.Mouse, 'TP.sig.DOMMouseMove');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('removeHandlers',
function() {

    /**
     * @method removeHandlers
     * @summary Removes key & mouse handlers currently managing the console.
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    //  deactivate the keyboard state machine
    this.get('keyboardStateMachine').deactivate(true);

    //  remove other keyboard observations

    this.ignore(TP.core.Keyboard, 'TP.sig.DOMModifierKeyChange');

    //  remove mouse observation for status updating

    this.ignore(TP.core.Mouse, 'TP.sig.DOMMouseMove');

    return this;
});

//  ------------------------------------------------------------------------
//  Other Key Handling
//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler('DOMModifierKeyChange',
function(aSignal) {

    /**
     * @method handleDOMModifierKeyChange
     * @param {TP.sig.DOMModifierKeyChange} aSignal The TIBET signal which
     *     triggered this handler.
     */

    //  Update the 'keyboardInfo' part of the status.
    this.get('$consoleGUI').updateStatus(aSignal, 'keyboardInfo');

    return;
});

//  ------------------------------------------------------------------------
//  Mouse Handling
//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler('DOMMouseMove',
function(aSignal) {

    /**
     * @method handleDOMMouseMove
     * @param {TP.sig.DOMMouseMove} aSignal The TIBET signal which
     *     triggered this handler.
     */

    //  Update the 'mouseInfo' part of the status.

    //  If the event happened in our UI canvas, then update with real data from
    //  the signal, otherwise update with 'null' to clear the info.
    if (aSignal.getWindow() === TP.sys.getUICanvas(true)) {
        this.get('$consoleGUI').updateStatus(aSignal, 'mouseInfo');
    } else {
        this.get('$consoleGUI').updateStatus(null, 'mouseInfo');
    }

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

    //  process whatever might be sitting in the input request queue
    this[TP.computeHandlerName('NextRequest')]();

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler('ConsoleRequest',
function(aRequest) {

    /**
     * @method handleConsoleRequest
     * @summary Responds to a request for special console processing. These
     *     requests are used by models to request behavior from the view, if
     *     any, without having to hold a view reference. A good example of a
     *     console request is the ':clear' command.
     * @param {TP.sig.ConsoleRequest} aRequest The signal instance that
     *     triggered this call.
     * @returns {TP.sig.ConsoleResponse} The supplied request's response.
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

    //  If the command is one of the 'built ins' for the console, then perform
    //  the action. Otherwise, it's not one we recognize so we do nothing.
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

    //  Make sure to complete the request's response and return it.
    response = aRequest.getResponse();
    response.complete();

    return response;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler('NoMoreRequests',
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

TP.sherpa.ConsoleService.Inst.defineHandler('RequestCompleted',
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

        //  if the registered request was the last input request, then clear it,
        //  clear the console GUI and reset 'awaiting input' and 'should conceal
        //  input'
        if (request === this.get('lastInputRequest')) {

            this.set('lastInputRequest', null);

            consoleGUI.clearInput();

            this.isAwaitingInput(false);
            this.shouldConcealInput(false);
        }
    }

    this[TP.computeHandlerName('NextRequest')]();

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler('RequestModified',
function(aSignal) {

    /**
     * @method handleRequestModified
     * @summary Responds to notifications that a request has been altered or
     *     updated. These are typically fired by TP.sig.UserInputRequests such
     *     as the TP.sig.UserInputSeries subtype during intermediate stages of
     *     data capture.
     * @param {TP.sig.RequestModified} aSignal The signal instance that
     *     triggered this call.
     */

    //  NOTE:   we don't ignore() here since this signal can be repeated and
    //          we don't want to miss out on the followups
    this.refreshFromRequest(this.getRequestById(aSignal.getRequestID()));

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler('ShellRequestCompleted',
function(aSignal) {

    /**
     * @method handleShellRequestCompleted
     * @summary Responds to notifications that a shell request is complete. The
     *     typical response is to output the response via the view.
     * @param {TP.sig.ShellRequest} aSignal The signal instance that
     *     triggered this call.
     */

    this.get('$consoleGUI').updateStatus(aSignal.getRequest());
    this[TP.computeHandlerName('NextRequest')](aSignal);

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler('UserInputRequest',
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

    //  track whether we're concealing input too
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

TP.sherpa.ConsoleService.Inst.defineHandler('UserInputSeries',
function(aSignal) {

    /**
     * @method handleUserInputSeries
     * @summary Responds to user input series by either passing control of the
     *     input cell content to the request, or by queueing the request if the
     *     input cell is already spoken for.
     * @param {TP.sig.UserInputSeries} aSignal The signal instance which
     *     triggered this call.
     */

    return this[TP.computeHandlerName('UserInputRequest')](aSignal);
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler('UserOutputRequest',
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

TP.sherpa.ConsoleService.Inst.defineHandler('Cancel',
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

TP.sherpa.ConsoleService.Inst.defineHandler('Change',
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

TP.sherpa.ConsoleService.Inst.defineHandler('ClearInput',
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

TP.sherpa.ConsoleService.Inst.defineHandler('HistoryNext',
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

    consoleGUI = this.get('$consoleGUI');

    //  Move forward in the history index and, if there is a valid command, use
    //  it. Otherwise, clear the input.
    cmd = model.getHistory(model.incrementHistoryIndex());
    if (TP.isValid(cmd)) {
        consoleGUI.setInputContent(cmd);
    } else {
        consoleGUI.clearInput();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler('HistoryPrev',
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

    consoleGUI = this.get('$consoleGUI');

    //  Move backward in the history index and, if there is a valid command, use
    //  it. Otherwise, clear the input.
    cmd = model.getHistory(model.decrementHistoryIndex());
    if (TP.isValid(cmd)) {
        consoleGUI.setInputContent(cmd);
    } else {
        consoleGUI.clearInput();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineHandler('RawInput',
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

    //  Fire off the input content to the shell
    this.sendShellRequest(input);

    //  Make sure that the console GUI clears its eval mark
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

TP.sherpa.ConsoleService.Inst.defineMethod('sendConsoleRequest',
function(rawInput) {

    /**
     * @method sendConsoleRequest
     * @summary Sends a 'console request', which may be input to the shell or
     *     just command text that only the console itself processes.
     * @param {String} rawInput A String of raw input.
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    var text,
        req;

    if (TP.notEmpty(rawInput)) {

        text = rawInput.stripEnclosingQuotes();

        if (this.isShellCommand(text)) {
            this.sendShellRequest(text);
        } else {
            text = text.slice(1);

            req = TP.sig.ConsoleRequest.construct(
                                TP.hc('cmd', text,
                                        'cmdHistory', false,
                                        'cmdSilent', true));
            req.fire(this.get('model'));

            this.get('$consoleGUI').setPrompt(this.get('model').getPrompt());
        }

        this.get('$consoleGUI').focusInput();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('sendShellRequest',
function(rawInput) {

    /**
     * @method sendShellRequest
     * @summary Sends a 'shell request', which, unlike a ConsoleRequest, *must*
     *     be input to the shell.
     * @param {String} rawInput A String of raw input.
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    var res,
        req,
        model;

    if (TP.notEmpty(rawInput)) {

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
                        'cmd', rawInput,        //  The source text
                        'cmdAllowSubs', true,
                        'cmdEcho', true,        //  Send output to attached GUI
                        'cmdExecute', true,
                        'cmdHistory', true,     //  Generate history entry
                        'cmdBuildGUI', true,    //  Attached GUI should build UI
                        'cmdLogin', true,
                        'cmdPhases', 'nocache',
                        'cmdSilent', false,     //  Allow logging output
                        'cmdEcho', true
                ));

            req.set('requestor', this);
            TP.handle(model, req);
        } else {
            //  input request owns the response data...ask it to handle the
            //  response so it can manage what that means. effectively by
            //  calling handle directly we're simulating having fired the
            //  response without the overhead of actually doing the signaling.
            res = req.getResponse();
            res.set('result', rawInput);

            TP.handle(req, res);
        }
    }

    return this;
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
     * @returns {Number} The maximum width of an unbroken String in the console.
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

TP.sherpa.ConsoleService.Inst.defineMethod('isShellCommand',
function(aCommandText) {

    /**
     * @method isShellCommand
     * @summary Returns whether the supplied command text is a 'shell command'.
     *     Certain commands, like ':clear', are not.
     * @param {String} aCommandText A String of raw input.
     * @returns {Boolean} Whether or not the supplied command text is a shell
     *     command.
     */

    //  These are pure console commands, not shell commands
    if (aCommandText === ':clear' || aCommandText === ':input') {
        return false;
    }

    return true;
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
     * @returns {Boolean} Whether or not the receiver is a system console.
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

    //  watch model for events so we keep things loosely coupled
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
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    var model;

    if (TP.isValid(model = this.getModel())) {
        model.setVariable('WIDTH', TP.ifInvalid(aWidth, this.$get('width')));
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
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object with optional
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
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     */

    var request,
        err;

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
                     )) : 0;
    }

    //  Clear any 'multi results' that were getting batched
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
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.sherpa.ConsoleService} The receiver.
     */

    var request,

        cmdSequence,

        outObject,

        append;

    //  We should see multiple output calls, at least one of which is the
    //  cmdConstruct notifier which tells us to build our output cell.
    if (aRequest && aRequest.at('cmdConstruct') === true) {
        return;
    }

    request = TP.request(aRequest);

    outObject = anObject;

    //  If the supplied request is part of a command sequence and the sequence
    //  has more than one item in it, then we gather them all up in a 'multi
    //  result' set for flushing to the GUI all at once.
    if ((cmdSequence = request.at('cmdSequence')) &&
         cmdSequence.getSize() > 1) {

        this.get('$multiResults').push(outObject);

        //  If it's not the last one - return
        if (request !== cmdSequence.last()) {
            return this;
        } else {
            //  It's the last one - collapse the contents of the $multiResults
            //  Array as the thing to report. Having an Array here with one item
            //  is a common case - a piping sequence will generate a
            //  'cmdSequence' with a single 'out object'.
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
                     )) : 0;
    }

    //  Clear any 'multi results' that were getting batched
    this.get('$multiResults').empty();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('writeInputContent',
function(aRequest) {

    /**
     * @method writeInputContent
     * @summary Writes input content to the console GUI.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.tsh.ConsoleOutputCell} The receiver.
     */

    var request,
        rootRequest,

        hid,
        str,
        cssClass,

        inputData,

        cellID;

    request = TP.request(aRequest);

    //  Don't do this twice
    if (TP.isTrue(request.at('inputWritten'))) {
        return;
    }

    //  Let this request and its handlers know that its input has been written.
    request.atPut('inputWritten', true);

    //  If we're 'echo'ing the input, then build up data for the 'input
    //  readout'.
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

    //  We're either not configured to echo input content or we couldn't
    //  generate any - exit here.
    if (TP.isEmpty(str)) {
        return;
    }

    //  Compute the CSS class that we'll use to style the input readout.
    if (TP.isValid(request.at('messageLevel'))) {
        cssClass = request.at('messageLevel').getName().toLowerCase();
    }
    cssClass = TP.ifInvalid(cssClass, 'info');

    //  Build up the input data for the console GUI to template.
    inputData = TP.hc('hid', hid,
                        'cmdtext', str,
                        'cssClass', cssClass,
                        'request', request);

    //  Get the unique ID used for the overall output cell (containing both the
    //  input readout and the output from the command) for the supplied request.
    cellID = aRequest.at('cmdID');
    if (TP.isEmpty(cellID)) {
        //  Fail - shouldn't get here
        //  empty
    } else {
        //  Replace the '$' with a '_' to avoid X(HT)ML naming issues.
        cellID = cellID.replace(/\$/g, '_');
        this.get('$consoleGUI').createOutputEntry(cellID, inputData);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConsoleService.Inst.defineMethod('writeOutputContent',
function(anObject, aRequest) {

    /**
     * @method writeOutputContent
     * @summary Writes output content to the console GUI.
     * @param {Object} anObject The object to output in string form.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.sherpa.Console} The receiver.
     */

    var request,

        structuredOutput,

        tap,
        data,
        asIs,

        possibleElem,

        cssClass,
        outputData,

        cellID,

        consoleGUI;

    request = TP.request(aRequest);

    structuredOutput = false;

    //  If the request has structured output, then we blank out the data.
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
            } else if (TP.isElement(possibleElem = TP.unwrap(anObject)) &&
                        TP.w3.Xmlns.getNativeURIs().contains(
                                                possibleElem.namespaceURI)) {
                //  It's an element in a namespace that we support native
                //  rendering of. Just pass it through.
                data = anObject;
            } else {

                //  just use the raw object.
                data = anObject;

                //  make sure its always a String though.
                data = TP.str(data);

                //  and, since we're not feeding it through a formatter (who is
                //  normally responsible for this), make sure its escaped
                data = data.asEscapedXML();
            }
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

    //  Build up the output data for the console GUI to template.
    outputData = TP.hc('output', data,
                        'cssClass', cssClass,
                        'rawData', anObject,
                        'request', request,
                        'structuredOutput', structuredOutput);

    consoleGUI = this.get('$consoleGUI');

    //  If the request has no cmdID for us to use as a cell ID, then this was
    //  probably a call to stdout() that wasn't a direct result of a command
    //  being issued.
    if (TP.isEmpty(cellID = aRequest.at('cmdID'))) {

        //  See if there's a current 'non cmd' cell that we're using to write
        //  this kind of output. If there isn't one, then create one (but don't
        //  really hand it any data to write out - we'll take care of that
        //  below).
        if (TP.isEmpty(cellID = this.get('lastNonCmdCellID'))) {
            cellID = 'log' + TP.genID().replace('$', '_');
            consoleGUI.createOutputEntry(cellID, TP.hc());
            this.set('lastNonCmdCellID', cellID);
        }

        //  Stub in an empty String  for the stats and the word 'LOG' for the
        //  result data type information.
        outputData.atPut('stats', '');
        outputData.atPut('typeinfo', 'LOG');
    } else {
        cellID = cellID.replace(/\$/g, '_');
        this.set('lastNonCmdCellID', null);
    }

    //  Update the output entry cell with the output data.
    consoleGUI.updateOutputEntry(cellID, outputData);

    return this;
});

//  ========================================================================
//  TP.sig.ConsoleRequest
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

//  ========================================================================
//  TP.sherpa.ConsoleKeyResponder
//  ========================================================================

TP.core.KeyResponder.defineSubtype('TP.sherpa.ConsoleKeyResponder');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.ConsoleKeyResponder.Inst.defineAttribute('$consoleService');
TP.sherpa.ConsoleKeyResponder.Inst.defineAttribute('$consoleGUI');

//  ========================================================================
//  TP.sherpa.NormalKeyResponder
//  ========================================================================

TP.sherpa.ConsoleKeyResponder.defineSubtype('NormalKeyResponder');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ----------------------------------------------------------------------------

TP.sherpa.NormalKeyResponder.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Sets up the receiver. Note that any configuration that the
     *     receiver wants to do of the state machine it will be using should be
     *     done here before the receiver becomes a registered object and begins
     *     observing the state machine for enter/exit/input signals.
     * @returns {TP.core.NormalKeyResponder} The receiver.
     */

    var stateMachine;

    this.set('mainState', 'normal');

    stateMachine = this.get('stateMachine');

    //  The state machine will transition to 'normal' when it is activated.
    stateMachine.defineState(null, 'normal');         //  start-able state
    stateMachine.defineState('normal');               //  final-able state

    stateMachine.addTrigger('TP.sig.DOM_Shift_Up__TP.sig.DOM_Shift_Up');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.NormalKeyResponder.Inst.defineMethod('executeTriggerSignalHandler',
function(aSignal) {

    /**
     * @method executeTriggerSignalHandler
     * @summary Executes the handler on the receiver (if there is one) for the
     *     trigger signal (the underlying signal that caused a StateInput signal
     *     to be fired from the state machine to this object).
     * @param {TP.sig.StateInput} aSignal The signal that caused the state
     *     machine to get further input. The original triggering signal (most
     *     likely a keyboard-related signal) will be in this signal's payload
     *     under the key 'trigger'.
     * @returns {TP.core.NormalKeyResponder} The receiver.
     */

    var consoleGUI,
        evt,

        handlerName;

    if (TP.isKindOf(aSignal, TP.sig.DOMKeySignal)) {

        consoleGUI = this.get('$consoleGUI');

        if (aSignal.getSignalName() ===
            'TP.sig.DOM_Shift_Up__TP.sig.DOM_Shift_Up') {
            this[TP.computeHandlerName('DOMShiftUp__DOMShiftUp')](aSignal);
        } else {

            evt = aSignal.getEvent();

            //  Make sure that the key event happened in our document
            if (!consoleGUI.eventIsInInput(evt)) {
                return this;
            }

            //  Update the 'keyboardInfo' part of the status.
            consoleGUI.updateStatus(aSignal, 'keyboardInfo');

            handlerName = TP.computeHandlerName(aSignal.getKeyName());

            if (TP.canInvoke(this, handlerName)) {
                TP.eventPreventDefault(evt);
                TP.eventStopPropagation(evt);

                this[handlerName](aSignal);
            }
        }
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.NormalKeyResponder.Inst.defineHandler('DOM_Shift_Enter_Up',
function(aSignal) {
    this.get('$consoleService')[TP.computeHandlerName('RawInput')](aSignal);
});

//  ----------------------------------------------------------------------------

TP.sherpa.NormalKeyResponder.Inst.defineHandler('DOMShiftUp__DOMShiftUp',
function(aSignal) {
    var consoleGUI;

    consoleGUI = this.get('$consoleGUI');

    //  Focus the console GUI's input and set its cursor to the end.
    consoleGUI.focusInput();
    consoleGUI.setInputCursorToEnd();

    aSignal.stopPropagation();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.NormalKeyResponder.Inst.defineHandler('DOM_Shift_Down_Up',
function(aSignal) {
    this.get('$consoleService')[TP.computeHandlerName('HistoryNext')](aSignal);
});

//  ----------------------------------------------------------------------------

TP.sherpa.NormalKeyResponder.Inst.defineHandler('DOM_Shift_Up_Up',
function(aSignal) {
    this.get('$consoleService')[TP.computeHandlerName('HistoryPrev')](aSignal);
});

//  ----------------------------------------------------------------------------

TP.sherpa.NormalKeyResponder.Inst.defineHandler('DOM_Ctrl_U_Up',
function(aSignal) {
    this.get('$consoleService')[TP.computeHandlerName('ClearInput')](
            aSignal.getEvent());
});

//  ----------------------------------------------------------------------------

TP.sherpa.NormalKeyResponder.Inst.defineHandler('DOM_Ctrl_K_Up',
function(aSignal) {
    this.get('$consoleService').clearConsole(true);
});

//  ----------------------------------------------------------------------------

TP.sherpa.NormalKeyResponder.Inst.defineHandler('DOM_Shift_Esc_Up',
function(aSignal) {
    this.get('$consoleService')[TP.computeHandlerName('Cancel')](
            aSignal.getEvent());
});

//  ========================================================================
//  TP.sherpa.EvalMarkingKeyResponder
//  ========================================================================

TP.sherpa.NormalKeyResponder.defineSubtype('EvalMarkingKeyResponder');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ----------------------------------------------------------------------------

TP.sherpa.EvalMarkingKeyResponder.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Sets up the receiver. Note that any configuration that the
     *     receiver wants to do of the state machine it will be using should be
     *     done here before the receiver becomes a registered object and begins
     *     observing the state machine for enter/exit/input signals.
     * @returns {TP.core.EvalMarkingKeyResponder} The receiver.
     */

    var stateMachine,
        delayedShiftTimer;

    this.set('mainState', 'evalmarking');

    stateMachine = this.get('stateMachine');

    //  Define a faux type for the keyboard event that we will use for our 'long
    //  Shift down'
    TP.sig.DOMKeyDown.defineSubtype('LongShiftDown');

    //  Define a behavior for our faux type that will trigger it when the user
    //  has pressed the Shift key down for a certain amount of time (defaulting
    //  to 2000ms).
    /* eslint-disable no-extra-parens,indent */
    (function(aSignal) {
            delayedShiftTimer =
                setTimeout(function() {
                                TP.signal(TP.core.Keyboard,
                                            'TP.sig.LongShiftDown',
                                            aSignal.getPayload());
                            }, TP.sys.cfg('sherpa.eval_mark_time', 2000));
    }).observe(TP.core.Keyboard, 'TP.sig.DOM_Shift_Down');

    (function(aSignal) {
        clearTimeout(delayedShiftTimer);
    }).observe(TP.core.Keyboard, 'TP.sig.DOMKeyUp');
    /* eslint-enable no-extra-parens,indent */

    //  Now that we've defined our faux type, we can use it as a trigger to the
    //  state machine
    stateMachine.defineState('normal',
                                'evalmarking',
                                {trigger: 'TP.sig.LongShiftDown'});

    stateMachine.defineState('evalmarking',
                                'normal',
                                {trigger: 'TP.sig.DOM_Shift_Enter_Up'});

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.EvalMarkingKeyResponder.Inst.defineMethod('didEnter',
function(aSignal) {

    /**
     * @method didEnter
     */

    this.get('$consoleGUI').transitionToSeparateEvalMarker();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.EvalMarkingKeyResponder.Inst.defineMethod('didExit',
function(aSignal) {

    /**
     * @method didExit
     */

    this.get('$consoleGUI').teardownEvalMark();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.EvalMarkingKeyResponder.Inst.defineHandler('DOM_Shift_Down_Up',
function(anEvent) {
    this.get('$consoleGUI').shiftEvalMark(TP.DOWN, TP.ANCHOR);
});

//  ----------------------------------------------------------------------------

TP.sherpa.EvalMarkingKeyResponder.Inst.defineHandler('DOM_Shift_Up_Up',
function(anEvent) {
    this.get('$consoleGUI').shiftEvalMark(TP.UP, TP.ANCHOR);
});

//  ----------------------------------------------------------------------------

TP.sherpa.EvalMarkingKeyResponder.Inst.defineHandler('DOM_Shift_Right_Up',
function(anEvent) {
    this.get('$consoleGUI').shiftEvalMark(TP.RIGHT, TP.ANCHOR);
});

//  ----------------------------------------------------------------------------

TP.sherpa.EvalMarkingKeyResponder.Inst.defineHandler('DOM_Shift_Left_Up',
function(anEvent) {
    this.get('$consoleGUI').shiftEvalMark(TP.LEFT, TP.ANCHOR);
});

//  ----------------------------------------------------------------------------

TP.sherpa.EvalMarkingKeyResponder.Inst.defineHandler('DOM_Alt_Shift_Down_Up',
function(anEvent) {
    this.get('$consoleGUI').shiftEvalMark(TP.DOWN, TP.HEAD);
});

//  ----------------------------------------------------------------------------

TP.sherpa.EvalMarkingKeyResponder.Inst.defineHandler('DOM_Alt_Shift_Up_Up',
function(anEvent) {
    this.get('$consoleGUI').shiftEvalMark(TP.UP, TP.HEAD);
});

//  ----------------------------------------------------------------------------

TP.sherpa.EvalMarkingKeyResponder.Inst.defineHandler('DOM_Alt_Shift_Right_Up',
function(anEvent) {
    this.get('$consoleGUI').shiftEvalMark(TP.RIGHT, TP.HEAD);
});

//  ----------------------------------------------------------------------------

TP.sherpa.EvalMarkingKeyResponder.Inst.defineHandler('DOM_Alt_Shift_Left_Up',
function(anEvent) {
    this.get('$consoleGUI').shiftEvalMark(TP.LEFT, TP.HEAD);
});

//  ========================================================================
//  TP.sherpa.AutoCompletionKeyResponder
//  ========================================================================

TP.sherpa.NormalKeyResponder.defineSubtype('AutoCompletionKeyResponder');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.AutoCompletionKeyResponder.Inst.defineAttribute('$changeHandler');
TP.sherpa.AutoCompletionKeyResponder.Inst.defineAttribute('$finishedCompletion');
TP.sherpa.AutoCompletionKeyResponder.Inst.defineAttribute('$popupContainer');
TP.sherpa.AutoCompletionKeyResponder.Inst.defineAttribute('$showingHint');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ----------------------------------------------------------------------------

TP.sherpa.AutoCompletionKeyResponder.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Sets up the receiver. Note that any configuration that the
     *     receiver wants to do of the state machine it will be using should be
     *     done here before the receiver becomes a registered object and begins
     *     observing the state machine for enter/exit/input signals.
     * @returns {TP.core.AutoCompletionKeyResponder} The receiver.
     */

    var stateMachine,

        backgroundElem;

    this.set('mainState', 'autocompletion');

    stateMachine = this.get('stateMachine');

    stateMachine.defineState('normal',
                                'autocompletion',
                                {trigger: 'TP.sig.DOM_Ctrl_A_Up'});

    stateMachine.defineState('autocompletion',
                                'normal',
                                {trigger: 'TP.sig.DOM_Esc_Up'});

    backgroundElem = TP.byId('background', TP.win('UIROOT'), false);
    this.set('$popupContainer', backgroundElem);

    this.set('$showingHint', false);
    this.set('$finishedCompletion', false);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.AutoCompletionKeyResponder.Inst.defineMethod('didEnter',
function(aSignal) {

    /**
     * @method didEnter
     * @summary Invoked when the receiver enters it's 'main state'.
     * @param {TP.sig.StateEnter} aSignal The signal that caused the state
     *     machine to enter a state that matches the receiver's 'main state'.
     * @returns {TP.core.AutoCompletionKeyResponder} The receiver.
     */

    var consoleGUI,
        editorObj,

        backgroundElem,
        hintFunc,

        handler;

    consoleGUI = this.get('$consoleGUI');
    editorObj = consoleGUI.get('consoleInput').get('$editorObj');

    backgroundElem = this.get('$popupContainer');
    hintFunc = this.showHint.bind(this);

    //  We manually manage the showing of the autocomplete popup to get better
    //  control.
    editorObj.on(
        'change',
        handler = function(cm, evt) {

            var hintsElem;

            if (this.get('$finishedCompletion')) {
                this.set('$finishedCompletion', false);

                return;
            }

            hintsElem = TP.byCSSPath('.CodeMirror-hints',
                                        backgroundElem,
                                        true,
                                        false);

            if (!TP.isElement(hintsElem)) {
                this.set('$showingHint', false);
            } else {
                this.set('$showingHint', true);
            }

            if (this.get('$showingHint')) {
                return;
            }

            cm.showHint(
                {
                    hint: hintFunc,
                    container: backgroundElem,  //  undocumented property
                    completeSingle: false,
                    closeOnUnfocus: false
                });

        }.bind(this));

    this.set('$changeHandler', handler);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.AutoCompletionKeyResponder.Inst.defineMethod('didExit',
function(aSignal) {

    /**
     * @method didExit
     * @summary Invoked when the receiver exits it's 'main state'.
     * @param {TP.sig.StateExit} aSignal The signal that caused the state
     *     machine to exit a state that matches the receiver's 'main state'.
     * @returns {TP.sherpa.AutoCompletionKeyResponder} The receiver.
     */

    var consoleGUI,
        editorObj;

    consoleGUI = this.get('$consoleGUI');
    editorObj = consoleGUI.get('consoleInput').get('$editorObj');

    //  Remove the change handler that manages the autocomplete popup. We
    //  installed it when we entered this state.
    editorObj.off(
        'change',
        this.get('$changeHandler'));

    this.set('$changeHandler', null);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.AutoCompletionKeyResponder.Inst.defineMethod('showHint',
function(cm, options) {

    /**
     * @method showHint
     */

    var completions,

        consoleGUI,
        editorObj;

    completions = this.supplyCompletions(cm, options);

    consoleGUI = this.get('$consoleGUI');
    editorObj = consoleGUI.get('consoleInput').get('$editorObj');

    TP.extern.CodeMirror.on(
        completions,
        'select',
        function(completion) {
            var matcher,

                theText,

                cursor,
                range,
                marker;

            consoleGUI.teardownCompletionMark();

            matcher = TP.rc('^' + completion.input);

            if (matcher.test(completion.text)) {

                theText = completion.text.slice(completion.input.length);

                if (TP.notEmpty(theText)) {
                    cursor = editorObj.getCursor();

                    range = {anchor: {line: cursor.line, ch: cursor.ch},
                                head: {line: cursor.line, ch: cursor.ch}
                            };

                    marker = consoleGUI.generateCompletionMarkAt(range, theText);
                    consoleGUI.set('currentCompletionMarker', marker);
                }
            }
        });

    TP.extern.CodeMirror.on(
        completions,
        'pick',
        function(completion) {
            this.set('$finishedCompletion', true);

            consoleGUI.teardownCompletionMark();
        }.bind(this));

    TP.extern.CodeMirror.on(
        completions,
        'close',
        function() {
            this.set('$finishedCompletion', true);

            consoleGUI.teardownCompletionMark();
        }.bind(this));

    return completions;
});

//  ------------------------------------------------------------------------

TP.sherpa.AutoCompletionKeyResponder.Inst.defineMethod('supplyCompletions',
function(editor, options) {

    /**
     * @method supplyCompletions
     */

    var completions,

        inputContent,

        matchers,

        info,
        matchInput,
        fromIndex,

        resolvedObj,
        resolutionChunks,
        chunk,

        closestMatchIndex,
        closestMatchMatcher,

        cursor,

        fromPos,
        toPos,

        matches;

    inputContent = editor.getValue();

    completions = TP.ac();

    if (TP.notEmpty(inputContent)) {
        matchers = TP.ac();

        info = this.tokenizeForCompletions(inputContent);
        matchInput = info.at('fragment');
        fromIndex = info.at('index');

        switch (info.at('context')) {
            case 'KEYWORD':
            case 'JS':

                resolvedObj = TP.global;
                resolutionChunks = info.at('resolutionChunks');

                if (TP.notEmpty(resolutionChunks)) {

                    resolutionChunks = resolutionChunks.copy();

                    while (TP.isValid(resolvedObj) &&
                            TP.notEmpty(resolutionChunks)) {
                        chunk = resolutionChunks.shift();
                        resolvedObj = resolvedObj[chunk];
                    }

                    if (TP.notValid(resolvedObj) ||
                        TP.notEmpty(resolutionChunks)) {
                        //  TODO: Log a warning
                        break;
                    }

                    matchers.push(
                        TP.core.KeyedSourceMatcher.construct(resolvedObj));
                } else {

                    matchers.push(
                        TP.core.KeyedSourceMatcher.construct(resolvedObj),
                        TP.core.KeyedSourceMatcher.construct(
                            TP.core.TSH.getDefaultInstance().getExecutionInstance()),
                        TP.core.ListMatcher.construct(
                            TP.boot.$keywords.concat(
                                TP.boot.$futurereservedwords), 'match_keyword'));
                }

                break;

            case 'TSH':

                matchers.push(
                        TP.core.ListMatcher.construct(
                            TP.ac(
                                'about',
                                'alias',
                                'apropos',
                                'clear',
                                'flag',
                                'reflect',
                                'save',
                                'set')));

                break;

            case 'CFG':

                matchers.push(
                        TP.core.ListMatcher.construct(
                            TP.sys.cfg().getKeys()));

                break;

            case 'URI':

                matchers.push(
                        TP.core.URIMatcher.construct());

                break;

            default:
                break;
        }

        if (TP.notEmpty(matchers)) {

            //  Note that matchInput could be empty here... and that's ok.
            matchers.forEach(
                function(matcher) {
                    matcher.prepareForMatch();
                    matches = matcher.match(matchInput);

                    matches.forEach(
                            function(anItem, anIndex) {
                                var itemEntry;

                                if (TP.isArray(itemEntry = anItem.original)) {
                                    itemEntry = itemEntry.at(2);
                                }

                                completions.push(
                                    {
                                        input: matchInput,
                                        text: itemEntry,
                                        score: anItem.score,
                                        className: anItem.cssClass,
                                        displayText: anItem.string,
                                        render: function(elem, self, data) {
                                            elem.innerHTML = data.displayText;
                                        }
                                    });
                            });
                });

            if (TP.notEmpty(matchInput)) {

                //  Sort all of the completions together using a custom sorting
                //  function to go after parts of the completion itself.
                completions.sort(
                    function(completionA, completionB) {

                        var aLower,
                            bLower;

                        if (completionA.score === completionB.score) {

                            aLower = completionA.text.toLowerCase();
                            bLower = completionB.text.toLowerCase();

                            if (aLower < bLower) {
                                return -1;
                            } else if (aLower > bLower) {
                                return 1;
                            }

                            return 0;
                        }

                        return completionB.score - completionA.score;
                    });

                closestMatchIndex = TP.NOT_FOUND;
                closestMatchMatcher = TP.rc('^' + matchInput);

                //  Try to determine if we have a 'best match' here and set the
                //  'exact match' index to it.
                completions.forEach(
                        function(aCompletion, anIndex) {

                            //  Test each completion to see if it starts with
                            //  text matching matchInput. Note here that we stop
                            //  at the first one.
                            if (closestMatchMatcher.test(aCompletion.text) &&
                                closestMatchIndex === TP.NOT_FOUND) {
                                closestMatchIndex = anIndex;
                            }
                        });
            }
        }
    }

    cursor = editor.getCursor();

    if (TP.isEmpty(completions)) {
        fromIndex = cursor.ch;
    }

    fromPos = TP.extern.CodeMirror.Pos(cursor.line, fromIndex);
    toPos = TP.extern.CodeMirror.Pos(cursor.line, cursor.ch);

    //  CodeMirror doesn't like values less than 0
    if (closestMatchIndex === TP.NOT_FOUND) {
        closestMatchIndex = 0;
    }

    return {
        list: completions,
        from: fromPos,
        to: toPos,
        selectedHint: closestMatchIndex
    };
});

//  ------------------------------------------------------------------------

TP.sherpa.AutoCompletionKeyResponder.Inst.defineMethod('tokenizeForCompletions',
function(inputText) {

    /**
     * @method tokenizeForCompletions
     */

    var tokens,

        context,
        fragment,
        resolutionChunks,
        index,

        captureFragment,

        len,
        i,

        token,
        shouldExit,
        noMatches;

    //  Invoke the tokenizer
    tokens = TP.$condenseJS(inputText,
                            false, false, TP.tsh.cmd.Type.$tshOperators,
                            true, true, true);

    //  Reverse the tokens to start from the back
    tokens.reverse();

    context = 'JS';
    fragment = null;
    resolutionChunks = TP.ac();
    index = TP.NOT_FOUND;

    captureFragment = true;
    shouldExit = false;
    noMatches = false;

    len = tokens.getSize();
    for (i = 0; i < len; i++) {
        token = tokens.at(i);

        switch (token.name) {

            case 'comment':

                noMatches = true;
                shouldExit = true;

                break;

            case 'uri':

                context = 'URI';

                resolutionChunks = null;
                fragment = token.value;
                index = token.from;

                shouldExit = true;

                break;

            case 'space':
            case 'tab':
            case 'newline':

                if (i === 0) {
                    noMatches = true;
                }

                shouldExit = true;

                break;

            case 'keyword':

                context = 'KEYWORD';

                resolutionChunks = null;
                fragment = token.value;
                index = token.from;

                shouldExit = true;

                break;

            case 'operator':

                switch (token.value) {

                    case '[':

                        if (tokens.at(i - 1).value === '\'') {
                            if (captureFragment === true) {
                                index = token.from + 2;
                            }

                            fragment = '';
                            captureFragment = false;
                        } else {
                            noMatches = true;
                            shouldExit = true;
                        }

                        break;

                    case '.':
                        if (captureFragment === true) {
                            index = token.from + 1;
                        }

                        captureFragment = false;

                        break;

                    case ':':

                        if (i === len - 1) {
                            context = 'TSH';

                            resolutionChunks = null;

                            index = 1;
                            shouldExit = true;
                        }

                        break;

                    case '/':

                        if (i === len - 1) {
                            context = 'CFG';

                            resolutionChunks = null;

                            index = 1;
                            shouldExit = true;
                        }

                        break;

                    default:

                        noMatches = true;
                        shouldExit = true;

                        break;
                }

                break;

            default:
                //  'substitution'
                //  'reserved'
                //  'identifier'
                //  'number'
                //  'string'
                //  'regexp'
                if (captureFragment) {
                    fragment = token.value;
                    index = token.from;
                } else {
                    resolutionChunks.unshift(token.value);
                }
                break;
        }

        if (noMatches) {
            context = null;

            resolutionChunks = null;
            fragment = null;
            index = TP.NOT_FOUND;
        }

        if (shouldExit) {
            break;
        }
    }

    return TP.hc(
            'context', context,
            'fragment', fragment,
            'resolutionChunks', resolutionChunks,
            'index', index);
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
