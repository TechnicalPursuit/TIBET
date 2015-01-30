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
 * @
 * @todo
 */

/* JSHint checking */

/* jshint evil:true
*/

//  ------------------------------------------------------------------------
//  Shell Primitives
//  ------------------------------------------------------------------------

TP.definePrimitive('shell',
function(aRequest) {

    /**
     * @name shell
     * @synopsis A wrapper for constructing and firing a TP.sig.ShellRequest.
     *     This is often used in UI event handlers to avoid complex
     *     TP.dispatch() logic for triggering script execution. NOTE that this
     *     command makes use of the current TP.core.User instance to provide
     *     profile information, if any. This ties the TP.shell() command into
     *     TIBET's user-interface permission machinery.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest The request containing
     *     proper shell parameters. Those include:
     *
     *          {String|Node} cmdSrc The shell input content, either the sugared
     *          source text or a desugared XML node, ready to execute.
     *
     *          {Boolean} cmdEcho Should the input be sent to any UI attached
     *          to the shell. [false].
     *
     *          {Boolean} cmdHistory Should the input generate a history entry?
     *          [false].
     *
     *          {Object} cmdStdio The object type or ID to use for handling
     *          any stdio for the request. This object should implement notify,
     *          stdin, stdout, and stderr calls.
     *
     *          {Boolean} cmdSilent Should shell output be reserved only for
     *          the reponse (and not sent to any Logger) [true].
     *
     *          {String} shellID The ID or typename of the shell to target.
     *          When a typename is given the ultimate target is that type's
     *          default instance. [TSH].
     *
     *          {Function} success The Function that should run if the
     *          shell command successfully completes.
     *
     *          {Function} failure The Function that should run if the
     *          shell command does not successfully complete.
     *
     * @returns {TP.sig.ShellRequest} The request instance used.
     * @todo
     */

    var shell,
        params,

        cmdSrc,
        shellID,
        silent,
        stdio,

        request,

        stdioProvider,
        stdioResults,

        success,
        failure,
        successHandler,
        failureHandler;

    params = TP.ifInvalid(aRequest, TP.hc());

    cmdSrc = params.at('cmdSrc');
    if (TP.isEmpty(cmdSrc)) {
        TP.raise(this, 'InvalidInput');
        return;
    }

    //  Compute a shell to run the supplied command against.
    shellID = params.at('shellID');
    if (TP.isEmpty(shellID)) {

        //  By default, we run stuff against the TSH.
        shell = TP.core.TSH.getDefaultInstance();

    } else if (TP.isString(shellID)) {

        shell = TP.core.Resource.getResourceById(shellID);
        if (!TP.isKindOf(shell, 'TP.core.Shell')) {
            TP.raise(this, 'TP.sig.InvalidParameter',
                'Shell ID must be a valid string or shell instance.');
            return;
        }

    } else if (TP.isKindOf(shellID, 'TP.core.Shell')) {
        shell = shellID;
    } else {
        TP.raise(this, 'TP.sig.InvalidParameter',
                    'Shell ID must be a valid string or shell instance.');
        return;
    }

    // Configure the STDIO handler to be used for the request.
    stdio = TP.ifInvalid(params.at('cmdStdio'), '');
    if (TP.isString(stdio)) {
        stdio = TP.core.Resource.getResourceById(stdio);
    } else if (TP.canInvoke(stdio, ['notify', 'stdin', 'stdout', 'stderr'])) {
        void 0;
    }

    silent = TP.ifInvalid(params.at('cmdSilent'), false);

    request = TP.sig.ShellRequest.construct(
                    TP.hc(
                            //  Execute this command
                            'cmd', cmdSrc,

                            //  The STDIO provider to use.
                            'cmdStdio', stdio,

                            //  Don't format any stdout/stderr
                            'cmdAsIs', true,

                            //  We definitely want the shell to 'execute' as
                            //  well as 'process' this content :-)
                            'cmdExecute', true,

                            //  This won't be an interactive environment, so
                            //  don't allow prompting for it.
                            'cmdInteractive', false,

                            //  Because we turn off interactive environment, we
                            //  have to turn this flag on to allow the
                            //  environment to properly process command
                            //  substitutions (which can use 'eval()')
                            'cmdAllowSubs', true,

                            //  We definitely want expansion, desugaring, etc.
                            //  This will not be 'literal' content.
                            'cmdLiteral', false,

                            //  There is no more sophisticated processing than
                            //  just running the command - no caching of
                            //  processed output, etc.
                            'cmdPhases', 'nocache',

                            //  The shell that we're executing against
                            'cmdShell', shell,

                            //  Whether or not we should silence shell output.
                            'cmdSilent', silent
                    ));

    //  Whether or not to create history for this command
    request.atPut('cmdHistory', params.at('cmdHistory') === true);

    //  Whether or not to echo the request information
    request.atPut('cmdEcho', params.at('cmdEcho') === true);

    //  Build a hash that will hold stdio results for various commands.
    stdioResults = TP.ac();

    //  Configure STDIO on the shell to capture it for providing to the handler
    //  functions. Note that we push entries in the order they occur so callers
    //  get a time-ordered collection of all output from the request.
    stdioProvider = TP.lang.Object.construct();
    stdioProvider.defineMethod('notify',
                    function (anObject, aRequest) {
                        stdioResults.push({meta: 'notify', data: anObject});
                    });
    stdioProvider.defineMethod('stdin',
                    function (anObject, aDefault, aRequest) {
                        stdioResults.push({meta: 'stdin', data: anObject});
                    });
    stdioProvider.defineMethod('stdout',
                    function (anObject, aRequest) {
                        stdioResults.push({meta: 'stdout', data: anObject});
                    });
    stdioProvider.defineMethod('stderr',
                    function (anObject, aRequest) {
                        stdioResults.push({meta: 'stderr', data: anObject});
                    });

     stdioProvider.defineMethod('report',
         function(aSignal, stdioResults) {
            stdioResults.forEach(function(item) {
                if (TP.notValid(item)) {
                    return;
                }

                switch (item.meta) {
                    case 'notify':
                        top.console.info(TP.str(item.data));
                        break;
                    case 'stdin':
                        top.console.log(TP.str(item.data));
                        break;
                    case 'stdout':
                        top.console.log(TP.str(item.data));
                        break;
                    case 'stderr':
                        top.console.error(TP.str(item.data));
                        break;
                    default:
                        break;
                }
            });
        });

    //  Install our object as the STDIO provider
    shell.attachSTDIO(stdioProvider);

    //  Configure the success handler, or a default one to report any output.
    success = params.at('success');
    if (TP.notValid(success)) {
        if (request.at('cmdSilent') !== true) {
            success = stdioProvider.report;
        } else {
            success = function() {};
        }
    }
    successHandler = function (aSignal) {
        shell.detachSTDIO();

        //  Note that we have to ignore *both* of the handlers so that when one
        //  of them gets executed, the other one is removed and doesn't leak.
        successHandler.ignore(request, 'TP.sig.ShellRequestSucceeded');
        failureHandler.ignore(request, 'TP.sig.ShellRequestFailed');

        success(aSignal, stdioResults);
    };
    successHandler.observe(request, 'TP.sig.ShellRequestSucceeded');


    //  Configure the failure handler, or a default one to report any output.
    failure = params.at('failure');
    if (TP.notValid(failure)) {
        if (request.at('cmdSilent') !== true) {
            failure = stdioProvider.report;
        } else {
            failure = function() {};
        }
    }
    failureHandler = function (aSignal) {
        shell.detachSTDIO();

        //  Note that we have to ignore *both* of the handlers so that when one
        //  of them gets executed, the other one is removed and doesn't leak.
        successHandler.ignore(request, 'TP.sig.ShellRequestSucceeded');
        failureHandler.ignore(request, 'TP.sig.ShellRequestFailed');

        failure(aSignal, stdioResults);
    };
    failureHandler.observe(request, 'TP.sig.ShellRequestFailed');


    //  Go ahead and tell the shell to handle the shell request.
    shell.handleShellRequest(request);

    return request;
});

//  ------------------------------------------------------------------------
//  TP.core.Shell
//  ------------------------------------------------------------------------

TP.core.Service.defineSubtype('Shell');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  rough limits on how many entries we'll maintain in core data structures
TP.core.Shell.Type.defineConstant('HISTORY_MAX', 100);

//  the limit of the number of positional arguments
TP.core.Shell.Type.defineConstant('POSITIONAL_MAX', 25);

TP.core.Shell.Type.defineConstant('MIN_USERNAME_LEN', 2);
TP.core.Shell.Type.defineConstant('MIN_PASSWORD_LEN', 2);

TP.core.Shell.Type.defineConstant('INVALID_ARGUMENT_MATCHER',
    TP.rc('(xmlns|xmlns:\\w+|class|tibet:tag|tag|tsh:argv|argv)'));

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  TP.sig.ShellRequests are the service triggers, activating shell
//  processing
TP.core.Shell.Type.defineAttribute('triggerSignals',
                                'TP.sig.ShellRequest');

//  the default namespace prefix for unprefixed commands in this shell.
TP.core.Shell.Type.defineAttribute('commandPrefix', '');

//  any TIBET update info that was obtained on system startup.
TP.core.Shell.Type.defineAttribute('updateInfo');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Shell.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Prepares the type for operation by initializing any data
     *     structures or other components.
     */

    //  these are how virtually all incoming requests are made, but the
    //  shell will construct some of its own when redispatching commands
    TP.sys.require('TP.sig.ShellRequest');

    //  to communicate with the user we make use of these two, which are
    //  typically handled by a console instance serving as view/ctrlr
    TP.sys.require('TP.sig.UserOutputRequest');
    TP.sys.require('TP.sig.UserInputRequest');

    //  certain commands can attempt to affect a connected console. the
    //  console is responsible for filtering these to respond only when the
    //  origin is the shell the console is currently managing
    TP.sys.require('TP.sig.ConsoleRequest');

    //  observe the 'TP.sig.UpdateAvailable' call. If there's an update to
    //  TIBET available, the kernel will notify us and we can log a message
    //  to the user.
    this.observe(TP.sys, 'TP.sig.UpdateAvailable');

    return;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Type.defineMethod('handleUpdateAvailable',
function(aSignal) {

    /**
     * @name handleUpdateAvailable
     * @synopsis Handles when an 'TP.sig.UpdateAvailable' signal is thrown.
     * @param {TP.sig.UpdateAvailable} aSignal The signal that caused this
     *     handler to execute.
     * @returns {TP.lang.RootObject.<TP.core.Shell>} The TP.core.Shell type
     *     object.
     */

    var updateInfo,
        notifyFunc;

    //  We only do this once per launch. Make sure to ignore to avoid future
    //  notifications.
    this.ignore(TP.sys, 'TP.sig.UpdateAvailable');

    if (TP.isValid(updateInfo = aSignal.getPayload())) {
        this.set('updateInfo', updateInfo);

        notifyFunc =
            function() {
                var req;

                req = TP.sig.UserOutputRequest.construct(
                        TP.hc('cmdTitle', 'Version Update',
                                'cmdEcho', true,
                                'output',
                                TP.elem(
                                    TP.join(
                                    '<span xmlns="', TP.w3.Xmlns.XHTML, '">',
                                    'There is a new TIBET version: ',
                                    TP.sys.getLibVersion(updateInfo),
                                    '</span>')),
                            'cmdAsIs', true,
                            'cmdBox', false));
                req.fire(this);
            };

        //  Fork it so that, in case the shell isn't running, it gives it a
        //  chance to get up and running.
        notifyFunc.fork(2000);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the current list of aliases for this shell
TP.core.Shell.Inst.defineAttribute('aliases');

//  the default namespace prefix for unprefixed commands
TP.core.Shell.Inst.defineAttribute('commandPrefix');

//  the current prompt string. this is built from the command prefix
TP.core.Shell.Inst.defineAttribute('commandPrompt');

//  the object used as a variable scope for processing local variables
//  within the shell.
TP.core.Shell.Inst.defineAttribute('executionInstance');

//  history list support
TP.core.Shell.Inst.defineAttribute('history');
TP.core.Shell.Inst.defineAttribute('historyIndex', 0);

TP.core.Shell.Inst.defineAttribute('nextPID', 0);

//  whether the shell is currently running (has started)
TP.core.Shell.Inst.defineAttribute('running', false);

//  an optional initial request which triggered instance creation
TP.core.Shell.Inst.defineAttribute('request');

//  slots for the previous and current request's which are/have been
//  executed
TP.core.Shell.Inst.defineAttribute('current');
TP.core.Shell.Inst.defineAttribute('previous');

//  the current username (profile name) for the shell
TP.core.Shell.Inst.defineAttribute('username');

//  the shell's path stack, a set of paths which have been previously
//  manipulated via a path operation such as pushd or popd
TP.core.Shell.Inst.defineAttribute('pathStack');

//  the announcement used when a shell of this type starts up
TP.core.Shell.Inst.defineAttribute('announcement', null);

//  additional information presented when a shell of this type starts up
TP.core.Shell.Inst.defineAttribute('introduction', null);

//  the Server-Sent Event source for file watching events
TP.core.Shell.Inst.defineAttribute('watcherSSESource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('init',
function(aResourceID, aRequest) {

    /**
     * @name init
     * @synopsis Initializes a new instance, preparing it for command
     *     processing. The resource ID provided will be used to register the
     *     instance for later lookup/targeting logic.
     * @param {String} aResourceID The standard service identifier.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request or hash
     *     containing shell parameters etc.
     * @returns {TP.core.Shell} A new instance.
     * @todo
     */

    this.callNextMethod();

    //  capture our initiating request for reference to parameters etc.
    this.$set('request', aRequest);

    //  configure our internal list/lookup variables
    this.$set('aliases', TP.hc());
    this.$set('history', TP.ac());

    this.$set('pathStack', TP.ac());

    //  force prefix/prompt construction
    this.setPrefix();
    this.setPrompt(this.getPrefix() + '&#160;&#187;');

    //  observe the 'TP.sig.AppShutdown' call. If the system is about to be
    //  shut down, the kernel will notify us and we can follow proper shutdown
    //  procedures, like logging the current user out (which does things like
    //  saving their profile).
    this.observe(TP.sys, 'TP.sig.AppShutdown');

    //  register so we can be found by resourceID for shell etc
    TP.sys.registerObject(this, aResourceID);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @name $getEqualityValue
     * @synopsis Returns the value which should be used for testing equality for
     *     the receiver.
     * @returns {String} The test value, typically the shell's GID.
     */

    return this.getID();
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getNextPID',
function() {

    /**
     * @name getNextPID
     * @synopsis Returns the next available PID for requests made of this shell.
     * @returns {Number} The PID value.
     */

    var ndx;

    //  note use of $get to avoid recursion
    ndx = this.$get('nextPID');
    this.$set('nextPID', ndx + 1);

    return ndx;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getPrefix',
function() {

    /**
     * @name getPrefix
     * @synopsis Returns the current command prefix, including a trailing
     *     namespace separator (:). For example, this method typically returns
     *     tsh: in the TSH (TIBET Shell).
     * @returns {String} The command prefix plus NS separator.
     */

    return this.$get('commandPrefix');
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getPrompt',
function() {

    /**
     * @name getPrompt
     * @synopsis Returns the prompt a console or other UI should display for
     *     this shell.
     * @returns {String} The prompt.
     */

    return this.$get('commandPrompt');
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('setPrefix',
function(aPrefix) {

    /**
     * @name setPrefix
     * @synopsis Sets the default command prefix for any unprefixed commands.
     * @param {String} aPrefix The namespace prefix. This should typically be in
     *     lower case (tsh, yak, etc).
     * @returns {TP.core.Shell} The receiver.
     * @todo
     */

    var prefix;

    prefix = TP.ifEmpty(aPrefix, this.getType().get('commandPrefix'));
    this.$set('commandPrefix', prefix);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('setPrompt',
function(aPromptString) {

    /**
     * @name setPrompt
     * @synopsis Sets the prompt string, a string which will be transformed and
     *     used by this shell to signify command input.
     * @param {String} aPromptString The prompt.
     * @returns {TP.core.Shell} The receiver.
     */

    this.$set('commandPrompt', aPromptString);

    return this;
});

//  ------------------------------------------------------------------------
//  STARTUP/LOGIN/LOGOUT
//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('announce',
function(aRequest) {

    /**
     * @name announce
     * @synopsis Displays an announcement specific to the current shell and/or
     *     request being processed. This is typically invoked by the
     *     TP.tdp.Console to emulate how standard shells announce their version
     *     etc.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request or hash
     *     containing parameters.
     */

    var str,
        req;

    str = TP.ifInvalid(this.get('announcement'), '');
    str += TP.ifInvalid(this.get('introduction'), '');

    //  output any startup announcement for the shell
    req = TP.sig.UserOutputRequest.construct(
                    TP.hc('cmdTitle', '',
                            'cmdEcho', true,
                            'output', str,
                            'cssClass', 'inbound_announce',
                            'cmdAsIs', true,
                            'cmdBox', false));

    req.fire(this);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('handleAppShutdown',
function(aSignal) {

    /**
     * @name handleAppShutdown
     * @synopsis Handles when an 'TP.sig.AppShutdown' signal is thrown.
     * @param {TP.sig.AppShutdown} aSignal The signal that caused this
     *     handler to execute.
     * @returns {TP.lang.RootObject.<TP.core.Shell>} The TP.core.Shell type
     *     object.
     */

    this.logout(aSignal);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('isLoginShell',
function() {

    /**
     * @name isLoginShell
     * @synopsis Returns true if the receiver is a top-level login shell.
     * @returns {Boolean}
     */

    //  by default we presume that shells must log in
    return true;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('isRunning',
function(aFlag) {

    /**
     * @name isRunning
     * @synopsis Combined setter/getter for whether the shell is active.
     * @param {Boolean} aFlag Optional new value to set.
     * @returns {Boolean} The current value.
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('running', aFlag);
    }

    return this.$get('running');
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('login',
function(aRequest) {

    /**
     * @name login
     * @synopsis Performs any login sequence necessary for the receiver. The
     *     default is to take no action. Subtypes should override this to
     *     provide target-specific login/profile management features.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request or hash
     *     containing parameters.
     * @returns {TP.core.Shell} The receiver.
     * @todo
     */

    TP.override();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('logout',
function(aRequest) {

    /**
     * @name logout
     * @synopsis Logs out of the current login shell.
     * @description The shell uses several variables on logout to determine what
     *     values if any to save. These variables are SAVEVARS, SAVEALIAS,
     *     SAVEHIST, and SAVEDIRS. The DISCARD variable controls whether change
     *     set data should be discarded, the default is false.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request or hash
     *     containing parameters.
     * @returns {TP.core.Shell} The receiver.
     * @todo
     */

    //  can't log out of a non-login shell
    if (!this.isLoginShell(aRequest)) {
        return this;
    }

    if (this.isRunning()) {
        try {
            //  TODO:   configure "save profile" and then save those
            //  elements of the user's profile as efficiently as possible
            this.saveProfile();
        } catch (e) {
        } finally {
            //  update our running status
            this.isRunning(false);
        }
    }

    //  notify any observers that we've logged out
    this.signal('TP.sig.TSH_Logout');

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('start',
function(aRequest) {

    /**
     * @name start
     * @synopsis Performs common startup processing, including displaying an
     *     announcement specific to the current shell. The login() sequence is
     *     initiated as part of this method.
     * @returns {TP.sig.ShellRequest} The request.
     */

    if (this.isRunning()) {
        return aRequest;
    }

    //  login shells imply interactive user shells, so we announce the shell
    //  and start the login sequence in that case. otherwise we can simply
    //  flip the running state to true
    if (this.isLoginShell(aRequest)) {
        this.announce(aRequest);

        //  NOTE that we rely on successful login to manage running state
        //  when we're in a login shell
        //this.login(aRequest);
    } else {
        this.isRunning(true);
    }

    return aRequest;
});

//  ------------------------------------------------------------------------
//  PROFILE
//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('initProfile',
function() {

    /**
     * @name initProfile
     * @synopsis Initializes common and user-phase profile data.
     */

    var name,

        profileStorage,

        newHistory,

        userData,

        dataSet,

        historyEntries;

    if (TP.notEmpty(name = this.get('username'))) {
        profileStorage = TP.core.LocalStorage.construct();

        userData = profileStorage.at('user_' + name);

        newHistory = TP.ac();

        if (TP.notEmpty(userData)) {
            dataSet = TP.json2js(userData);

            if (TP.notEmpty(historyEntries = dataSet.at('history'))) {
                historyEntries.perform(
                    function(anEntry) {

                        var newReq;

                        newReq = TP.sig.ShellRequest.construct(
                            TP.hc(
                                'cmd',
                                    anEntry.at('cmd'),
                                'cmdAllowSubs',
                                    anEntry.at('cmdAllowSubs'),
                                'cmdAsIs',
                                    anEntry.at('cmdAsIs'),
                                'cmdExecute',
                                    anEntry.at('cmdExecute'),
                                //  We're not creating a history of
                                //  commands that restore history ;-).
                                'cmdHistory', false,
                                'cmdInteractive',
                                    anEntry.at('cmdInteractive'),
                                'cmdLiteral',
                                    anEntry.at('cmdLiteral'),
                                'cmdPhases',
                                    anEntry.at('cmdPhases'),
                                'cmdRecycle',
                                    anEntry.at('cmdRecycle'),
                                'cmdRoot',
                                    TP.elem(anEntry.at('cmdRoot')),
                                'cmdShell',
                                    anEntry.at('cmdShell'),
                                'cmdSilent',
                                    anEntry.at('cmdSilent')
                                ));

                        newReq.atPut('cmdPeer', newReq);

                        newHistory.add(newReq);
                    });

                this.set('history', newHistory);
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('saveProfile',
function() {

    /**
     * @name saveProfile
     * @synopsis Stores common and user-phase profile data.
     */

    var name,

        historyEntries,

        userData,
        profileStorage;

    if (TP.notEmpty(name = this.get('username'))) {
        //  Save the history

        historyEntries =
            this.get('history').collect(
                function(aShellReq) {

                    return TP.hc(
                        'cmd', aShellReq.at('cmd'),
                        'cmdAllowSubs', aShellReq.at('cmdAllowSubs'),
                        'cmdExecute', aShellReq.at('cmdExecute'),
                        'cmdInteractive', aShellReq.at('cmdInteractive'),
                        'cmdLiteral', aShellReq.at('cmdLiteral'),
                        'cmdPhases', aShellReq.at('cmdPhases'),
                        'cmdRecycle', aShellReq.at('cmdRecycle'),
                        'cmdRoot', TP.str(aShellReq.at('cmdRoot')),
                        'cmdSilent', aShellReq.at('cmdSilent'));
                });

        userData = TP.hc('history', historyEntries);

        profileStorage = TP.core.LocalStorage.construct();
        profileStorage.atPut('user_' + name, TP.js2json(userData));
    }

    return;
});

//  ------------------------------------------------------------------------
//  ALIASES
//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getAlias',
function(aName) {

    /**
     * @name getAlias
     * @synopsis Returns the value of the named alias, if found.
     * @param {String} aName The alias name to look up.
     * @returns {String} The string value entered.
     */

    var dict,
        val,

        parentShell;

    //  TODO:   map alias storage into local DB or local store, or
    //          cookie, or file, but store it somewhere.
    dict = TP.ifInvalid(this.get('aliases'), TP.hc());

    //  first we look locally, then we'll check parent. note that we test
    //  to see if the value is defined, which still allows it to be null so
    //  we can 'unset' locally
    if (TP.isDefined(val = dict.at(aName))) {
        return this.getAlias(val);
    }

    if (TP.isValid(parentShell = this.get('parent'))) {
        return parentShell.getAlias(aName);
    }

    //  fallback is to return the original value
    return aName;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('setAlias',
function(aName, aValue) {

    /**
     * @name setAlias
     * @synopsis Sets the string value of an alias.
     * @param {String} aName The alias name to set.
     * @param {String} aValue The string value to set. No object resolution is
     *     done on alias values so this will be used literally.
     * @returns {TP.core.Shell} The receiver.
     * @todo
     */

    var value;

    if (aValue.charAt(0) === '"') {
        value = this.resolveVariableSubstitutions(aValue.unquoted());
    } else {
        value = aValue.unquoted();
    }

    this.get('aliases').atPut(aName, value);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('unsetAlias',
function(aName) {

    /**
     * @name unsetAlias
     * @synopsis Removes an alias definition from the receiver.
     * @param {String} aName The alias name to remove.
     * @returns {TP.core.Shell} The receiver.
     */

    this.get('aliases').removeKey(aName);

    return this;
});

//  ------------------------------------------------------------------------
//  HISTORY
//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('addHistory',
function(aRequest) {

    /**
     * @name addHistory
     * @synopsis Adds a request to the command history for the receiver.
     * @description The variable HISTSIZE controls whether the list will be
     *     trimmed as a result, keeping a maximum number of entries. Also, the
     *     HISTDUP variable will determine if the entry is actually added. If
     *     HISTDUP is 'prev' the entry will only be added if its command text is
     *     not the same as the previous entry. If HISTDUP is 'all' the entry
     *     will only be added if its command text is unique across all history
     *     entries.
     * @param {TP.sig.ShellRequest} aRequest The request to add.
     * @returns {Number} The index at which the entry was placed.
     */

    var list,

        cmd,

        histmax,
        dups,

        i,

        offset;

    list = this.get('history');

    cmd = aRequest.at('cmd');
    cmd = cmd.trim();

    //  no matter what, we reset the history index to the end so any
    //  next/prev operations are reset
    this.set('historyIndex', list.getSize());

    histmax = TP.ifInvalid(this.getVariable('HISTSIZE'),
                            this.getType().HISTORY_MAX);

    dups = TP.ifInvalid(this.getVariable('HISTDUP'), 'prev');
    dups.toLowerCase();

    if ((dups === 'prev') && (list.getSize() > 0)) {
        if (list.last().at('cmd') === cmd) {
            return list.getSize() - 1;
        }
    } else if (dups === 'all') {
        for (i = list.getSize() - 1; i >= 0; i--) {
            if (list.at(i).at('cmd') === cmd) {
                return i;
            }
        }
    }

    list.add(aRequest);
    offset = list.getSize() - histmax;
    if (offset > 0) {
        list.atPut(offset - 1, null);
    }

    //  NOTE that we set this past the end of the list so the first request
    //  for history will see the last element in the list
    this.set('historyIndex', list.getSize());

    //  return the index of the command so it can be tracked/displayed later
    return list.getSize() - 1;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('decrementHistoryIndex',
function() {

    /**
     * @name decrementHistoryIndex
     * @synopsis Decreases the current history index by 1, unless the index is
     *     already at 0. This method shifts the 'current history' entry to point
     *     to the new index location.
     * @returns {Number} The new index.
     */

    this.set('historyIndex', (0).max(this.get('historyIndex') - 1));

    return this.get('historyIndex');
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getHistory',
function(anIndex, afterExpansion) {

    /**
     * @name getHistory
     * @synopsis Returns the history entry at the index provided, or the entire
     *     list if no index is provided.
     * @param {Number|String|RegExp} anIndex The history index to look up.
     * @param {Boolean} afterExpansion True to work against the expanded form
     *     rather than the original source command text.
     * @returns {String} The history entry's stored string content.
     * @todo
     */

    var expanded,

        hist,
        text,
        doc,

        histMatch,
        list,
        request;

    expanded = TP.ifInvalid(afterExpansion, false);

    //  no index means we want the entire history list
    if (TP.notValid(anIndex)) {
        return this.$get('history');
    }

    if (TP.isNumber(anIndex)) {
        hist = this.$get('history').at(anIndex);
        if (TP.isValid(hist)) {
            //  re-constituted history entries may be simple strings
            if (TP.isString(hist)) {
                return hist;
            } else if (expanded) {
                text = hist.getOriginalCmdText();

                return text;
            } else {
                return hist.at('cmd');
            }
        }
    } else {
        //  string or regular expression match for command text

        //  if its a RegExp, then the caller has already defined the matcher
        //  they're gonna use. If not, we build a RegExp from the String
        //  that it should've been. Note how the RegExp forces the String to
        //  be at the start of the match, but allows any trailing
        //  characters.
        if (!TP.isRegExp(histMatch = anIndex)) {
            histMatch = TP.rc('^' +
                                RegExp.escapeMetachars(anIndex) +
                                '[\\s\\S]*');
        }

        if (TP.notValid(histMatch)) {
            this.raise('TP.sig.InvalidParameter', anIndex);

            return;
        }

        //  have to skip the current command here...
        list = this.$get('history').slice(0, -1);
        request = list.reverse().detect(
                            function(req) {

                                var text;

                                text = expanded ?
                                        req.getOriginalCmdText() :
                                        req.at('cmd');

                                return histMatch.test(text);
                            });

        if (TP.isValid(request)) {
            text = expanded ?
                    request.getOriginalCmdText() :
                    request.at('cmd');
        } else {
            return;
        }

        //  strip common boilerplate
        if (TP.isDocument(doc = TP.documentFromString(text))) {
            text = TP.elementGetInnerContent(doc.documentElement);
        }

        return text;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('incrementHistoryIndex',
function() {

    /**
     * @name incrementHistoryIndex
     * @synopsis Increases the current history index by 1, unless the index is
     *     already at HISTSIZE. This method shifts the 'current history' entry
     *     to point to the new index location.
     * @returns {Number} The new index.
     */

    //  note that we let this push past the end of the list so we get an
    //  empty entry and are properly positioned for the next decrement call
    this.set('historyIndex', (this.get('historyIndex') + 1).min(
                                    this.get('history').getSize()));

    return this.get('historyIndex');
});

//  ------------------------------------------------------------------------
//  VARIABLES
//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getVariable',
function(aName) {

    /**
     * @name getVariable
     * @synopsis Returns the value of the named shell variable, if found.
     * @param {String} aName The variable name to look up.
     * @returns {String} The string value entered.
     */

    var dict,
        name,

        ourVar,
        parentShell;

    dict = this.getExecutionInstance();

    //  normalize name to $X
    name = aName.toUpperCase();
    if (name.charAt(0) !== '$') {
        name = '$' + name;
    }

    //  first we look locally, then we'll check parent. note that we test
    //  to see if the value is defined, which still allows it to be null so
    //  we can 'unset' locally
    if (TP.isDefined(ourVar = dict.at(name))) {
        return ourVar;
    }

    if (TP.isValid(parentShell = this.get('parent'))) {
        return parentShell.getVariable(name);
    }

    //  NOTE the fallback here, configuration variables and then environment
    //  variables set during boot...and note that these are not the
    //  converted values, but the original values as provided by the call.
    return TP.sys.cfg(aName) || TP.sys.env(aName);
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('setVariable',
function(aName, aValue) {

    /**
     * @name setVariable
     * @synopsis Sets the string value of a variable name. Note that variable
     *     names are normalized to uppercase $-prefixed values for storage in
     *     the $SCOPE object. For example, aName of 'focus' will become '$focus'
     *     for variable storage. The getVariable call follows this convention as
     *     well, so it is largely invisible except when examining the $SCOPE
     *     object.
     * @param {String} aName The variable name to set.
     * @param {String} aValue The string value to set. Note that when evaluated
     *     as part of command input this may still resolve to an object, but no
     *     resolution is done at the time of variable definition.
     * @returns {TP.core.Shell} The receiver.
     * @todo
     */

    var name;

    //  normalize name to $X
    name = aName.toUpperCase();
    if (name.charAt(0) !== '$') {
        name = '$' + name;
    }

    this.getExecutionInstance().atPut(name, aValue);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('unsetVariable',
function(aName) {

    /**
     * @name unsetVariable
     * @synopsis Removes a variable definition from the receiver.
     * @param {String} aName The variable name to remove.
     * @returns {TP.core.Shell} The receiver.
     */

    var name;

    //  normalize name to $X
    name = aName.toUpperCase();
    if (name.charAt(0) !== '$') {
        name = '$' + name;
    }

    this.getExecutionInstance().removeKey(name);

    return this;
});

//  ------------------------------------------------------------------------
//  REQUEST HANDLING
//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('handleShellRequest',
function(aRequest) {

    /**
     * @name handleShellRequest
     * @synopsis Constructs a response to the request provided.
     *     TP.sig.ShellRequest instances are the typical way commands are
     *     provided to the shell for processing.
     * @param {TP.sig.ShellRequest} aRequest The request to respond to.
     * @returns {TP.core.ShellResponse} A response to the request.
     */

    var response,
        cmd,
        constructOutInfo;

    aRequest.isActive(true);

    //  first make sure we can construct a valid response
    if (TP.notValid(response = aRequest.constructResponse())) {
        aRequest.fail('Couldn\'t construct response.');
        this.raise(
            'TP.sig.ProcessingException',
            'Couldn\'t construct response.');

        return;
    }

    //  sign up as the responder for the request so downstream objects can
    //  get a handle back to the shell instance.
    aRequest.set('responder', this);
    aRequest.atPut('cmdShell', this);

    this.$set('previous', this.$get('current'));
    this.$set('current', aRequest);

    //  If the request does not wish to run silently, we build a 'construct
    //  out UI' request and tie it back to the original request using the
    //  'cmdID'.
    if (TP.isTrue(aRequest.at('cmdInteractive')) &&
        TP.notTrue(aRequest.at('cmdSilent')) &&
        TP.notValid(aRequest.at('cmdPeer'))) {
        //  ensure we've got a unique ID for the overall request. this will
        //  be propagated down to all subrequests which help in processing.
        aRequest.atPutIfAbsent('cmdID', aRequest.getRequestID());

        //  Make sure that this request will try to recycle the output UI
        //  that we're constructing using the constructOutInfo.
        aRequest.atPut('cmdRecycle', true);

        cmd = aRequest.at('cmd');

        if (TP.notBlank(cmd)) {
            constructOutInfo =
                    TP.hc('cmd', cmd,
                            'cmdID', aRequest.at('cmdID'),
                            'cmdConstruct', true,
                            'cmdEcho', true);

            //  It's ok to pass a null here, since the console should be in
            //  'construct out UI' mode, given our 'cmdConstruct' flag
            //  above.
            this.stdout(null, constructOutInfo);
        }

        //  the last real work has to be the execute call so we can handle
        //  the possibility of asynchronous work going on underneath.

        //  Note here how we fork() the execution (but as quickly as
        //  possible so that it goes back on the stack ASAP) so that the GUI
        //  has the chance to draw the output cell before we run.
        this.execute.bind(this).fork(0, aRequest);
    } else {
        //  the last real work has to be the execute call so we can handle
        //  the possibility of asynchronous work going on underneath
        this.execute(aRequest);
    }

    //  in either case we return the response that will ultimately hold the
    //  results when the request is done processing.
    return response;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('handleUserInput',
function(aSignal) {

    /**
     * @name handleUserInput
     * @synopsis Responds to TP.sig.UserInput signals, which are sent in
     *     response to a previous TP.sig.UserInputRequest from the shell itself.
     * @description The implication is that this method is only invoked when the
     *     shell had a prior request in the queue. The request itself will have
     *     been bound to the input response. The shell's response is to invoke
     *     the input as if it were a standard shell request.
     *     TP.sig.UserInputRequests originated by commands or other objects are
     *     presumed to "do the right thing" in response to the input they are
     *     provided.
     * @param {TP.sig.UserInput} aSignal The signal instance that triggered this
     *     handler.
     * @returns {TPResult} The result produced when processing the
     *     TP.sig.ShellRequest constructed by this method.
     */

    var request,
        responder,

        req,
        result,

        response;

    //  capture the responder so we can let it know when we're done. this
    //  will typically be something like the TP.tdp.Console or a similar UI.
    request = aSignal.getRequest();
    request.isActive(true);

    responder = aSignal.getRequest().get('responder');

    //  construct a request we can process to accomplish the new task
    req = TP.sig.ShellRequest.construct(TP.hc('cmd', aSignal.getResult()));
    req.set('requestor', this);

    try {
        result = TP.handle(this, req);
    } catch (e) {
    } finally {
        //  if there was a responder let it know we're done
        if (TP.isValid(responder)) {
            aSignal.getRequestID().signal('TP.sig.RequestCompleted');
        }
    }

    response = aSignal.constructResponse();

    //  TODO:   why both?
    response.complete();
    request.complete();

    return response;
});

//  ------------------------------------------------------------------------
//  STDIO
//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('attachSTDIO',
function(aProvider) {

    /**
     * @name attachSTDIO
     * @synopsis Attaches the receiver's stdio hooks to a STDIO provider, an
     *     object which implements those hooks for reuse.
     * @param {Object} aProvider An object implementing stdin, stdout, and
     *     stderr hook functions.
     * @returns {TP.core.Shell} The receiver.
     */

    if (!TP.canInvoke(aProvider,
                        TP.ac('notify', 'stdin', 'stdout', 'stderr'))) {
        return this.raise(
            'TP.sig.InvalidProvider',
            'STDIO provider must implement stdin, stdout, and stderr');
    }

    this.notify = function(anObject, aRequest) {

                        return aProvider.notify(anObject, aRequest);
                    };

    this.stdin = function(aQuery, aDefault, aRequest) {

                        return aProvider.stdin(aQuery, aDefault, aRequest);
                    };

    this.stdout = function(anObject, aRequest) {

                        return aProvider.stdout(anObject, aRequest);
                    };

    this.stderr = function(anError, aRequest) {

                        return aProvider.stderr(anError, aRequest);
                    };

    // The first thing to attach "wins" in that it will be the one we default to
    // whenever we detach later.
    if (TP.notValid(this.$origStdin)) {
        this.$origNotify = this.notify;
        this.$origStdin = this.stdin;
        this.$origStdout = this.stdout;
        this.$origStderr = this.stderr;
    }


    return this;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('detachSTDIO',
function() {

    /**
     * @name detachSTDIO
     * @synopsis Detaches the receiver's stdio hooks from a STDIO provider,
     *     reverting them to their original settings.
     * @returns {TP.core.Shell} The receiver.
     */

    if (TP.notValid(this.$origStdin)) {
        return;
    }

    this.notify = this.$origNotify;
    this.stdin = this.$origStdin;
    this.stdout = this.$origStdout;
    this.stderr = this.$origStderr;

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('notify',
function(anObject, aRequest) {

    /**
     * @name notify
     * @synopsis Notifies the user outside of "stdout" of a message.
     * @description The default version of this method uses the low-level
     *     TP.boot.$alert() function. Shells which are connect to a Console or
     *     other UI will typically have this version overwritten so output is
     *     directed to the UI.
     * @param {Object} anObject The object to output.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object with optional
     *     values for 'cmdNotifier', 'cmdAsIs', 'messageType', etc.
     * @returns {TP.core.Shell} The receiver.
     * @todo
     */

    var message,

        name,
        raw;

    if (TP.isString(anObject)) {
        message = anObject;
    } else if (TP.isError(anObject)) {
        message = TP.ifInvalid(anObject.message, '');
    } else if (TP.canInvoke(anObject, 'at')) {
        message = anObject.at('message');
        if (TP.notValid(message) && TP.canInvoke(anObject, 'get')) {
            message = anObject.get('message');
        }

        if (TP.notValid(message) || !TP.isString(message)) {
            message = TP.str(anObject);
        }
    } else {
        message = TP.str(anObject);
    }

    name = TP.ifKeyInvalid(aRequest, 'cmdNotifier', null);
    raw = TP.ifKeyInvalid(aRequest, 'cmdAsIs', false);

    TP.boot.$alert(message);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('stderr',
function(anError, aRequest) {

    /**
     * @name stderr
     * @synopsis Outputs the error provided using any parameters in the request
     *     to assist with formatting etc. Parameters include messageType,
     *     cmdAsIs, etc.
     * @param {String} anError The error to output.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.core.Shell} The receiver.
     * @todo
     */

    var req;

    if (TP.notValid(aRequest)) {
        req = TP.sig.UserOutputRequest.construct();
        req.set('requestor', this);
    } else if (TP.isKindOf(aRequest, TP.sig.UserOutputRequest)) {
        req = aRequest;
    } else {
        //  convert from collection form to UOR form
        req = TP.sig.UserOutputRequest.construct(aRequest);
        req.set('requestor', this);
    }

    req.atPut('output', anError);
    req.atPut('messageType', 'failure');
    req.atPutIfAbsent('messageLevel', TP.ERROR);

    req.fire(this);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('stdin',
function(aQuery, aDefault, aRequest) {

    /**
     * @name stdin
     * @synopsis Requests input from the user.
     * @param {String} aQuery An optional query string to format as a question
     *     for the user.
     * @param {String} aDefault An optional string value to use as the default
     *     value.
     * @param {TP.sig.UserInputRequest} aRequest An input request containing
     *     processing instructions. The request should be capable of responding
     *     to TP.sig.UserInput signals so it can process the result when ready.
     * @todo
     */

    var req;

    if (TP.notValid(aRequest)) {
        req = TP.sig.UserInputRequest.construct();
        req.set('requestor', this);
    } else if (TP.isKindOf(aRequest, TP.sig.UserInputRequest)) {
        req = aRequest;
    } else {
        //  convert from collection form to UIR form
        req = TP.sig.UserInputRequest.construct(aRequest);
        req.set('requestor', this);
    }

    req.atPut('query', aQuery);
    req.atPut('default', aDefault);

    req.fire(this);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('stdout',
function(anObject, aRequest) {

    /**
     * @name stdout
     * @synopsis Outputs the object provided using any parameters in the request
     *     to assist with formatting etc. Parameters include messageType,
     *     cmdAsIs, etc.
     * @param {Object} anObject The object to output.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.core.Shell} The receiver.
     * @todo
     */

    var req;

    if (TP.notValid(aRequest)) {
        req = TP.sig.UserOutputRequest.construct();
        req.set('requestor', this);
    } else if (TP.isKindOf(aRequest, TP.sig.UserIORequest)) {
        req = aRequest;
    } else {
        // Need to repackage in the proper subtype for processing.
        req = TP.sig.UserOutputRequest.construct(aRequest);
        req.set('requestor', this);
    }

    req.atPut('output', anObject);
    req.fire(this);

    return;
});

//  ------------------------------------------------------------------------
//  Paths
//  ------------------------------------------------------------------------

/*
Methods relating to path expansion and path stack operation.
*/

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('addPath',
function(aPath) {

    /**
     * @name addPath
     * @synopsis Pushes a path on the path stack of the receiver. Paths in the
     *     path stack are used to support URI expansion operations. Paths are
     *     expanded when added so all paths in the stack are absolute paths once
     *     the add has completed.
     * @param {String} aPath The path description to add.
     * @returns {TP.core.Shell} The receiver.
     */

    var path,

        list,

        pathmax,

        dups,

        i,
        offset;

    if (TP.notValid(path = this.expandPath(aPath))) {
        this.stderr('Path expansion failed for ' + aPath);

        return;
    }

    list = this.get('pathStack');

    pathmax = TP.ifInvalid(this.getVariable('PATHSIZE'),
                            this.getType().PATH_MAX);

    dups = TP.ifInvalid(this.getVariable('PATHDUP'), 'prev');
    dups.toLowerCase();

    if (dups === 'prev') {
        if (list.last() === path) {
            return;
        }
    } else if (dups === 'all') {
        for (i = list.getSize() - 1; i >= 0; i--) {
            if (list.at(i) === path) {
                return;
            }
        }
    }

    list.add(path);
    offset = list.getSize() - pathmax;
    if (offset > 0) {
        list.atPut(offset - 1, null);
    }

    //  return the index of the path so it can be tracked/displayed later
    return list.getSize() - 1;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('clearPaths',
function() {

    /**
     * @name clearPaths
     * @synopsis Empties the path stack.
     * @returns {TP.core.Shell} The receiver.
     */

    this.get('pathStack').empty();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('execute',
function(aRequest) {

    /**
     * @name execute
     * @synopsis The main command execution method, responsible for parsing and
     *     processing shell input in a fashion suitable for the specific
     *     requirements of each shell and for the specific content being
     *     processed.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('expandPath',
function(aPath) {

    /**
     * @name expandPath
     * @synopsis Expands a path to absolute form using current path stack and
     *     environment information.
     * @description Expansion uses the following rules:
     *
     *     Absolute paths start with a scheme, either http(s) or file and are
     *     left unchanged by this process. All other paths are considered
     *     relative and are expanded as follows.
     *
     *     When a ~ is used as the start of a path the expansion is done
     *     relative to the current launch directory for the application, the
     *     default value of TP.sys.getAppRoot() for ~app, or the library root if
     *     ~lib is specified.
     *
     *     Paths starting with an = followed by either - or a digit will be
     *     resolved to an entry in the path stack and replaced with that entry's
     *     value.
     *
     *     Paths starting with '/', './' or '../' are expanded relative to the
     *     current path, which is represented by the top of the directory stack
     *     at the time of resolution.
     * @param {String} aPath The path to expand.
     * @returns {String} aPath The expanded path.
     * @todo
     */

    var home,
        url,

        isURI,

        subs,
        schemes,

        arr,
        ndx,

        path;

    if (TP.isEmpty(aPath)) {
        return this.getPath();
    }

    home = TP.ifInvalid(this.getVariable('HOME'), TP.sys.getAppRoot());

    //  ensure we strip any quotes the user may have used
    url = aPath.unquoted();

    isURI = false;

    subs = TP.core.URI.getSubtypes(true) || TP.ac();
    schemes = subs.collect(
                function(item) {

                    return item.get('SCHEME');
                });

    schemes.perform(
        function(item) {

            if (TP.isValid(item) && (item !== '') && url.startsWith(item)) {
                isURI = true;
            }
        });

    if (isURI) {
        return url;
    }

    //  handle leading characters a bit differently since they're special
    if (aPath.startsWith('~app/')) {
        //  NB: We slice off the slash here too, so that TP.uriJoinPaths()
        //  doesn't think its absolute.
        url = TP.uriJoinPaths(home, aPath.slice(5));
    } else if (aPath.toLowerCase().startsWith('~lib/')) {
        //  NB: We slice off the slash here too, so that TP.uriJoinPaths()
        //  doesn't think its absolute.
        url = TP.uriJoinPaths(TP.sys.getLibRoot(), aPath.slice(5));
    } else if (aPath.startsWith('~/')) {
        //  NB: We slice off the slash here too, so that TP.uriJoinPaths()
        //  doesn't think its absolute.
        url = TP.uriJoinPaths(TP.sys.getAppHead(), aPath.slice(2));
    } else if (aPath.first() === '=') {
        arr = aPath.split('/');
        ndx = arr.shift().slice(1);

        if (ndx.equalTo('-')) {
            path = this.getPath();
            url = TP.uriJoinPaths(path, arr.join('/'));
        } else {
            if (!TP.isNaN(parseInt(ndx, 10))) {
                path = this.get('pathStack').at(ndx);
                if (TP.isString(path)) {
                    //  peel off the =N part and join what's left
                    url = TP.uriJoinPaths(path, arr.join('/'));
                }
            }
        }

        if (TP.notValid(url)) {
            this.stderr('Unable to resolve "=' + ndx + '"');
        }
    } else {
        //  not alpha? probably '.' or '/' so resolve it here
        if (/^[a-zA-Z]/.test(aPath)) {
            url = TP.uriResolvePaths(this.getPath(), aPath);
        }
    }

    return url;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getPath',
function(anIndex) {

    /**
     * @name getPath
     * @synopsis Returns the path entry at the index provided, or at the current
     *     index if no value is provided.
     * @param {Number} anIndex The path index to look up.
     * @returns {String} The path entry.
     */

    var path;

    if (TP.isNumber(anIndex)) {
        path = this.$get('pathStack').at(anIndex);
    }

    //  tried to use an index, but it wasn't a number
    if (TP.isNumber(anIndex)) {
        this.raise('TP.sig.InvalidParameter', anIndex);

        return;
    }

    path = this.$get('pathStack').last();

    //  we use the lib root for defaults
    if (TP.notValid(path)) {
        return TP.sys.getLibRoot();
    }

    return path;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getLastPath',
function() {

    /**
     * @name getLastPath
     * @synopsis Returns the text of the last path entry.
     * @returns {String} The last path string.
     */

    return this.$get('pathStack').last();
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('removePath',
function(anIndex) {

    /**
     * @name removePath
     * @synopsis Removes the path at anIndex, or the last path in the list if no
     *     index is provided.
     * @param {Number} anIndex The index of the path to remove, if provided.
     * @returns {String} The path removed.
     */

    var list,
        item;

    list = this.$get('pathStack');
    if (list.getSize() === 0) {
        return;
    }

    if (TP.notValid(anIndex)) {
        item = this.getLastPath();
        list.removeLast();
    } else {
        if (list.getSize() > anIndex) {
            item = list.at(anIndex);
            list.removeAt(anIndex);
        } else {
            this.stderr('Path index not found for removal.');
        }
    }

    return item;
});

//  ------------------------------------------------------------------------
//  OBJECT RESOLUTION
//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getExecutionContext',
function(aRequest) {

    /**
     * @name getExecutionContext
     * @synopsis Returns the execution context for the receiver, the window or
     *     frame used for eval calls. This is typically the window in which the
     *     code was loaded, and therefore virtually always the top window in a
     *     standard installation.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request or hash
     *     containing parameters.
     * @returns {Window} The execution context.
     */

    var ctx,

        tWin,
        win;

    //  does the request have an execution context? If so, use it.
    if (TP.isValid(aRequest) &&
        TP.isValid(ctx = aRequest.at('execContext'))) {
        return ctx;
    }

    //  already set or cached? quick exit
    if (TP.isValid(ctx = this.$get('context'))) {
        return ctx;
    }

    //  default when not set is to map it to the TIBET code frame via a
    //  findTIBET call (which should return the current window actually)
    if (TP.isWindow(tWin = TP.global.$$findTIBET())) {
        win = tWin;
    }

    //  "shouldn't happen" ;), but just in case...
    if (TP.notValid(win)) {
        win = window;
    }

    //  cache for next time, and build contextual evaluator while were at it
    this.setExecutionContext(win);

    return this.$get('context');
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getExecutionInstance',
function(aRequest) {

    /**
     * @name getExecutionInstance
     * @synopsis Returns the execution instance, an object used to provide
     *     scoped variable support for the shell.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request or hash
     *     containing parameters.
     * @returns {Object} The execution instance.
     */

    var ctx,
        obj;

    //  does the request have an execution instance? If so, use it.
    if (TP.isValid(aRequest) &&
        TP.isValid(ctx = aRequest.at('execInstance'))) {
        return ctx;
    }

    if (TP.notValid(obj = this.$get('executionInstance'))) {

        //  NOTE! This *MUST* be an object that 'slots' can be placed directly
        //  on. In order for the shell to work properly, it will use a with(...)
        //  statement in conjunction with this object (which will become $SCOPE)
        //  to do things like resolve object references.
        obj = {};

        //  We do go ahead and instance program these methods onto this object
        //  for cleanliness in other places in the code. Note that we hide these
        //  methods so that they don't show up when we dump $SCOPE.
        TP.defineSlot(obj,
                        'at',
                        function(slotName) {
                            return this[slotName];
                        },
                        TP.METHOD, TP.LOCAL_TRACK, TP.HIDDEN_DESCRIPTOR);

        TP.defineSlot(obj,
                        'atPut',
                        function(slotName, slotValue) {
                            this[slotName] = slotValue;
                        },
                        TP.METHOD, TP.LOCAL_TRACK, TP.HIDDEN_DESCRIPTOR);

        TP.defineSlot(obj,
                        'hasKey',
                        function(slotName) {
                            return this[slotName] !== undefined;
                        },
                        TP.METHOD, TP.LOCAL_TRACK, TP.HIDDEN_DESCRIPTOR);

        TP.defineSlot(obj,
                        'removeKey',
                        function(slotName) {
                            delete this[slotName];
                        },
                        TP.METHOD, TP.LOCAL_TRACK, TP.HIDDEN_DESCRIPTOR);

        this.$set('executionInstance', obj);
    }

    return obj;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('resolveObjectReference',
function(anObjectSpec, aRequest) {

    /**
     * @name resolveObjectReference
     * @synopsis Returns an object based on the string specification provided.
     *     This method will attempt to evaluate the spec as an expression as
     *     well as treating it like a tibet://URI in an attempt to locate the
     *     object.
     * @param {String} anObjectSpec An object spec or TIBET URI.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request or hash
     *     containing parameters.
     * @returns {Object} The object, if found.
     */

    var execInstance,
        execContext,

        spec,

        url,
        $$inst,

        instType;

    //  We can't use non-Strings for object specifications anyway.
    if (!TP.isString(anObjectSpec)) {
        return anObjectSpec;
    }

    if (anObjectSpec === '{}') {
        return Object.construct();
    }

    if (anObjectSpec === '[]') {
        return TP.ac();
    }

    spec = anObjectSpec;

    //  The $SCOPE object (the local context object that shell variables have
    //  been set against)
    execInstance = this.getExecutionInstance();

    //  The $CONTEXT object (the global context shell code is being 'eval()ed'
    //  in)
    execContext = this.getExecutionContext();

    //  Convert any shell variable that starts with '${' and ends with '}' to
    //  it's plain form.
    //  NB: We do *not* want to use the TP.regex.TSH_VARSUB_EXTENDED replacement
    //  technique here, since we're only looking at the start and the end of the
    //  entire expression for variable conversion - leaving anything in the
    //  interior along.
    if (spec.startsWith('${') && spec.endsWith('}')) {
        spec = '$' + spec.slice(2, -1);
    }

    //  If 'spec' matches shell 'dereference sugar' (i.e. '@foo'), then we have
    //  to strip the leading '@'.
    if (TP.regex.TSH_DEREF_SUGAR.test(spec)) {
        spec = anObjectSpec.slice(1);
    }

    //  With most of our desugaring done can we just use getObjectById?
    $$inst = TP.sys.getObjectById(spec);
    if (TP.isValid($$inst)) {
        return $$inst;
    }

    try {
        if (TP.regex.URI_LIKELY.test(spec) &&
            !TP.regex.REGEX_LITERAL_STRING.test(spec)) {
            url = this.expandPath(spec);
            if (TP.isURI(url = TP.uc(url))) {
                $$inst = url.getResource(TP.hc('async', false));
            }
        } else if (execInstance.hasKey(spec)) {
            $$inst = execInstance.at(spec);
        } else {

            //  eval() has problems with Object and Function literals, but
            //  wrapping them in parentheses helps...

            //  Object literals
            if (spec.charAt(0) === '{' &&
                spec.charAt(spec.length - 1) === '}') {
                spec = '(' + spec + ')';
            }

            //  Function literals
            //  Note that this RegExp is normally used for extracting the name,
            //  but works well here to just detect Function literals...
            if (Function.$$getNameRegex.test(spec)) {
                spec = '(' + spec + ')';
            }

            try {
                $$inst = execContext.eval(spec);
                if (TP.notValid($$inst)) {
                    if (TP.regex.NS_QUALIFIED.test(spec)) {
                        $$inst = execContext.eval(
                                    '\'' + spec + '\'.asType()');
                    }
                }
            } catch (e2) {
                if (TP.regex.NS_QUALIFIED.test(spec)) {
                    $$inst = execContext.eval(
                                '\'' + spec + '\'.asType()');
                }
            }

        }

        //  If the original object spec was some 'dereference sugar', then, as a
        //  final step, we need to call 'cmdGetContent' on it (or it's type if
        //  it doesn't respond). This is to keep the same semantics that the
        //  rest of the shell has around dereference sugar.
        if (TP.regex.TSH_DEREF_SUGAR.test(anObjectSpec)) {
          if (TP.canInvoke($$inst, 'cmdGetContent')) {
              $$inst = $$inst.cmdGetContent(aRequest);
          } else if (TP.canInvoke($$inst, 'getType')) {
              instType = $$inst.getType();
              if (TP.canInvoke(instType, 'cmdGetContent')) {
                  $$inst = instType.cmdGetContent(aRequest);
              }
          }
        }

    } catch (e) {
        $$inst = undefined;
    }

    return $$inst;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('resolveVariableSubstitutions',
function(aString) {

    /**
     * @name resolveVariableSubstitutions
     * @synopsis Handles variable substitution syntax, typically in values
     *     provided as command tag attributes or content.
     * @param {String} aString A string requiring resolution.
     * @returns {String} The string with resolved variable substitutions.
     * @todo
     */

    var str;

    TP.stop('break.tsh_substitutions');

    str = aString;

    //  We special case the standard "stdin" variable $_ so it doesn't have
    //  to be mentioned in an enclosing ${...} construct (${_}).
    if (str === '$_') {
        return this.getExecutionInstance().at('$_');
    }

    //  Don't expand variables being used as part of a dereferencing operation.
    if (/\@\$/.test(str)) {
        return str;
    }

    if (TP.regex.TSH_VARSUB.test(str)) {
        str = str.replace(
                TP.regex.TSH_VARSUB,
                function (wholeMatch, varName) {
                    var value;
                    value = this.getExecutionInstance().at('$' + varName);

                    // If the variable isn't defined in scope return it so the
                    // string value "exposes" that variable as being unresolved.
                    if (TP.notDefined(value)) {
                        return wholeMatch;
                    }

                    return value;
                }.bind(this));
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('setExecutionContext',
function(aWindow) {

    /**
     * @name setExecutionContext
     * @synopsis Sets the execution context, the window or frame used for eval
     *     calls. A side-effect of this call is that a local method for
     *     executing native JS is installed which uses the context
     *     window/frame's eval call for processing.
     * @param {Window|String} aWindow The window or frame to target, either as a
     *     reference or a string ID.
     * @returns {Window} The new context.
     */

    var win;

    win = TP.ifInvalid(aWindow, window);
    if (!TP.isWindow(win)) {
        if (TP.isString(win)) {
            win = TP.byOID(win);
            if (TP.notValid(win)) {
                return this.raise('TP.sig.InvalidWindow');
            } else if (!TP.isWindow(win)) {
                if (!TP.isFunction(win.getNativeWindow)) {
                    return this.raise('TP.sig.InvalidWindow');
                } else {
                    win = win.getNativeWindow();
                }
            }
        } else if (TP.isFunction(win.getNativeWindow)) {
            if (!TP.isWindow(win = win.getNativeWindow())) {
                return this.raise('TP.sig.InvalidWindow');
            }
        } else {
            return this.raise('TP.sig.InvalidWindow');
        }
    }

    this.$set('context', win);

    return win;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('updateCommandNode',
function(aRequest, shouldReport) {

    /**
     * @name updateCommandNode
     * @synopsis Handles variable substitution syntax, typically in values
     *     provided as command tag attributes or content, specifically expanding
     *     attribute values on the request's command node.
     * @param {TP.sig.Request} aRequest A TP.sig.TSHRunRequest in most cases.
     * @param {Boolean} shouldReport Whether to report missing substitutions or
     *     not. Default is true.
     * @returns {Node} The fully interpolated command node.
     * @todo
     */

    var node,
        len,
        i;

    TP.stop('break.tsh_substitutions');

    if (TP.notValid(node = aRequest.at('cmdNode'))) {
        return aRequest.fail();
    }

    if (!TP.isElement(node)) {
        return aRequest.fail();
    }

    len = node.attributes.length;
    for (i = 0; i < len; i++) {
        node.attributes[i].value =
            this.resolveVariableSubstitutions(node.attributes[i].value);
    }

    return node;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('updateExecutionInstance',
function(aRequest) {

    /**
     * @name updateExecutionInstance
     * @synopsis Updates the execution instance ($SCOPE object) with the data
     *     from the request to help ensure that variable substitution and other
     *     data access references are current.
     * @param {TP.sig.Request} aRequest A TP.sig.TSHRunRequest in most cases.
     * @returns {Object} The updated execution instance ($SCOPE object).
     */

    var scope,

        len,
        i,

        stdin;

    TP.stop('break.tsh_substitutions');

    scope = this.getExecutionInstance();

    len = this.getType().POSITIONAL_MAX;

        //  clear any existing positional arguments in the scope...
        for (i = 0; i < len; i++) {
        if (TP.notDefined(scope.at('$' + i))) {
            break;
        }

        delete scope['$' + i];
    }

    //  update the $INPUT value to point to the first available data.
    stdin = aRequest.stdin();
    scope.atPut('$INPUT', stdin.at(0));

    if (aRequest.at('cmdIterate')) {
        //  Looping/iteration has to be handled by individual tags.
        scope.atPut('$_', null);
    } else {
        scope.atPut('$_', scope.at('$INPUT'));

        //  populate any new positional parameters for the request.
        for (i = 0; i < stdin.length; i++) {
            scope.atPut('$' + i, stdin.at(i));
        }
    }

    return scope;
});

//  ------------------------------------------------------------------------
//  REQUEST SUGARS
//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getArgument',
function(aRequest, argumentName, defaultValue, searchAll, wantsOriginal) {

    /**
     * @name getArgument
     * @synopsis Returns a single value acquired from the current command node's
     *     primary argument, argv, or the node's content.
     * @description A number of tags have a single argument which defines the
     *     target of the tag's operation. For sugaring purposes it's not
     *     uncommon for that argument's name to be left off so that the argument
     *     value ends up in the argv vector. Alternatively the argument content
     *     can end up in the tag's content. This method will search them all
     *     when searchAll is true, or will stop the search with the argument
     *     hash if not.
     * @param {TP.sig.ShellRequest} aRequest The request to query.
     * @param {String} argumentName The name of the argument to get the value
     *     for.
     * @param {Object} defaultValue The default value for the argument if a
     *     value can't be found.
     * @param {Boolean} searchAll Whether or not to search all places an
     *     argument could be (by name, by argv '0' or by content). The default
     *     is false.
     * @param {Boolean} wantsOriginal Whether or not to return the 'original
     *     value' of the argument (i.e. the value actually given by the script
     *     author, before any substitution was performed). The default is false.
     * @returns {String} The argument value.
     * @todo
     */

    var args,
        value,
        node,
        vals;

    //  Because we supply true as the second parameter here, this method returns
    //  a pair of values per argument name: [original, expanded]
    if (TP.notValid(args = this.getArguments(aRequest, true))) {
        //  This might be null or undefined - that's ok
        return defaultValue;
    }

    //  Did we get any results for this argument (i.e. was it supplied at all?)
    if (TP.isValid(value = args.at(argumentName))) {
        //  Usually the user wants the expanded value, but they might have
        //  specified otherwise.
        if (argumentName === 'ARGV') {
            if (wantsOriginal) {
                value = value.collect(
                        function (item) {
                            return item.first();
                        });
            } else {
                value = value.collect(
                        function (item) {
                            return item.last();
                        });
            }

            return value;
        } else {
            value = wantsOriginal ? value.first() : value.last();
            if (TP.isValid(value)) {
                return value;
            }
        }
    }

    //  if a simple name check failed we fall back to position 0, and then
    //  to the element's content when searching for a "primary argument"
    if (searchAll) {

        //  If there's something in position 0, look there
        if (TP.isValid(value = args.at('ARG0'))) {
            value = wantsOriginal ? value.first() : value.last();
            if (TP.isValid(value)) {
                return value;
            }
        }

        //  NOTE that when we use content we have to process it and cache
        //  the resulting value to keep overhead down
        node = aRequest.at('cmdNode');
        if (TP.isElement(node)) {
            if (TP.notEmpty(value = TP.nodeGetTextContent(node))) {
                vals = TP.ac(value,
                                this.resolveVariableSubstitutions(
                                    TP.xmlEntitiesToLiterals(value)));

                //  cache it
                args.atPut(argumentName, vals);

                value = wantsOriginal ? vals.first() : vals.last();

                return value;
            }
        }
    }

    //  Couldn't find any value, even after 'searching all' - return default
    //  value.
    return defaultValue;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getArguments',
function(aRequest, allForms) {

    /**
     * @name getArguments
     * @synopsis Returns a hash of key/value pairs where the keys are the
     *     request command node's attribute names and the values are the
     *     attribute values. These represent the named parameters and flags
     *     provided to the command. Positional arguments are named ARG0 through
     *     ARG[n] within this hash and the key ARGV contains an array of those.
     * @param {TP.sig.ShellRequest} aRequest The request to query.
     * @param {Boolean} allForms Whether or not to include 'all forms' of the
     *     argument value. If this is true, then this method returns an Array
     *     for each key that contains both the 'original value' (what the script
     *     author actually authored, before any substitution was performed) and
     *     the 'expanded value' (what that value might have 'expanded' into).
     *     Otherwise, it just returns the expanded value itself under each key.
     *     The default is false.
     * @returns {TP.lang.Hash} The hash of named arguments with either
     *     individual expanded values or an Array of values for each entry,
     *     depending on the setting of 'allForms'.
     */

    var newDict,
        node,
        shell,
        args,
        dict;

    if (TP.isValid(dict = aRequest.get('ARGUMENTS'))) {

        //  If the caller specified that they wanted all forms of the value,
        //  then just hand back the full dictionary.
        if (allForms) {
            return dict;
        }

        //  Otherwise, only return the 'expanded' value in a TP.lang.Hash
        newDict = TP.hc();
        dict.perform(
            function(kvPair) {
                var key,
                    val,
                    arr;

                key = kvPair.first();
                val = kvPair.last();

                if (key !== 'ARGV') {
                    //  Remember value is an array of original, expanded.
                    newDict.atPut(key, val.last());
                } else {
                    //  ARGV is special. It's the only nested structure.
                    arr = val.collect(
                                function(item) {
                                    return item.last();
                                });

                    newDict.atPut(key, arr);
                }
            });
        return newDict;
    }

    node = aRequest.at('cmdNode');
    if (!TP.isElement(node)) {
        TP.raise(this,
                    'TP.sig.InvalidElement',
                    'Command node not an element.');

        return;
    }

    shell = this;

    args = TP.elementGetAttributes(node);
    dict = TP.hc();

    //  convert string values into their equivalent boolean forms and
    //  process any interpolations within attribute values
    args.perform(
        function(item) {
            var first,
                last,
                argv,
                parts,
                val,
                expandedVal,
                reParts;

            first = item.first();
            last = TP.xmlEntitiesToLiterals(item.last().trim());

            //  Make sure to null out val and expandedVal
            val = null;
            expandedVal = null;

            if (first === 'tsh:argv') {
                argv = TP.ac();

                // Watch for dot-separated identifiers like TP.sys.* etc. and
                // skip the tokenizer in those cases.
                parts = last.split('.');
                if (parts.detect(function(part) {
                    return !part.isJSIdentifier();
                })) {
                    //  Note here how we pass 'true' as the sixth argument, telling
                    //  the tokenize routine that we're parsing for shell arguments.
                    parts = TP.$tokenize(last,
                                        TP.tsh.script.$tshOperators,
                                        true, false, false, true);
                } else {
                    //  One special case here is any argument which appears to
                    //  be a valid JS identifier but which is, in fact, a TSH
                    //  variable value.
                    expandedVal = shell.getVariable(last);
                    if (TP.isDefined(expandedVal)) {
                        dict.atPut('ARG0', TP.ac(last, expandedVal));
                        argv.push(TP.ac(last, expandedVal));
                    } else {
                        dict.atPut('ARG0', TP.ac(last, last));
                        argv.push(TP.ac(last, last));
                    }
                    return;
                }

                //  throw away spaces and tabs
                parts = parts.select(
                            function(item) {
                                return ((item.name !== 'space') &&
                                        (item.name !== 'tab'));
                            });

                //  resolve substitutions for double-quoted strings, but
                //  note that we preserve values as literal when single
                //  quoted strings were used.
                parts = parts.collect(
                        function(item) {

                            //  Make sure to null out val and expandedVal
                            val = null;
                            expandedVal = null;

                            //  If it's a Number or RegExp literal string, then
                            //  try to turn it into one of those objects
                            if (item.name === 'number') {
                                //  Handle Numbers
                                expandedVal = item.value.asNumber();
                            } else if (item.name === 'regexp') {
                                //  Handle RegExps
                                reParts = item.value.split('/');
                                expandedVal = TP.rc(reParts.at(1),
                                                    reParts.at(2));
                            } else if (item.name === 'keyword' &&
                                        (item.value === 'true' ||
                                         item.value === 'false')) {
                                //  Handle Booleans
                                expandedVal = TP.bc(item.value);
                            } else if (item.name === 'string') {
                                //  Handle Strings
                                if (item.value.charAt(0) === '"') {
                                    val = item.value.unquoted();
                                } else if (item.value.charAt(0) === '\'') {
                                    expandedVal = item.value;
                                } else {
                                    expandedVal = item.value.unquoted();
                                }
                            } else if ((item.name === 'substitution') ||
                                        (item.name === 'identifier')) {
                                val = item.value.unquoted();
                                if (val.startsWith('${') && val.endsWith('}')) {
                                    // This might not find a value, but if it
                                    // does we essentially are resolving the
                                    // identifier.
                                    expandedVal = shell.getVariable(
                                        '$' + val.slice(2, -1));
                                }
                            } else {
                                expandedVal = item.value;
                            }

                            //  If we don't have an 'expanded value', then call
                            //  upon the TP.tsh.cmd type to expand this content
                            //  for us. Content expansion includes command
                            //  substitution (i.e. `...` constructs) and
                            //  template rendering but *not* variable
                            //  substitution and/or object resolution.
                            if (TP.isValid(val) && TP.notValid(expandedVal)) {
                                expandedVal = TP.tsh.cmd.expandContent(
                                                val, shell, aRequest);

                                if (expandedVal === 'null') {
                                    expandedVal = null;
                                } else if (expandedVal === 'undefined') {
                                    expandedVal = undefined;
                                }
                            }

                            return TP.ac(item.value, expandedVal);
                        });

                parts.perform(
                    function(item, index) {
                        dict.atPut('ARG' + index, item);
                        argv.push(item);
                    });

                dict.atPut('ARGV', argv);
            } else if (!TP.core.Shell.INVALID_ARGUMENT_MATCHER.test(first)) {
                val = last;
                expandedVal = null;

                //  Filter all of the 'internal' keys that aren't really
                //  arguments.
                if (val === 'true' || val === 'false') {
                    //  Handle Booleans
                    expandedVal = TP.bc(val);
                } else if (TP.regex.REGEX_LITERAL_STRING.test(val)) {
                    //  Handle RegExps
                    reParts = val.split('/');
                    expandedVal = TP.rc(reParts.at(1), reParts.at(2));
                } else if (TP.regex.ANY_NUMBER.test(val) ||
                            TP.regex.PERCENTAGE.test(val)) {
                    expandedVal = val.asNumber();
                } else {
                    //  Handle Strings

                    if (val.charAt(0) === '"') {
                        val = val.unquoted();
                    } else if (val.charAt(0) === '\'') {
                        expandedVal = val;
                    } else if (val.charAt(0) === '`') {
                        //  We leave 'val' alone here and let it get expanded.
                        void 0;
                    } else {
                        val = val.unquoted();
                    }

                    //  If we don't have an 'expanded value', then call upon the
                    //  TP.tsh.cmd type to expand this content for us. Content
                    //  expansion includes command substitution (i.e. `...`
                    //  constructs) and template rendering but *not* variable
                    //  substitution and/or object resolution.
                    if (TP.isValid(val) && TP.notValid(expandedVal)) {
                        expandedVal = TP.tsh.cmd.expandContent(
                                                val, shell, aRequest);

                        if (expandedVal === 'null') {
                            expandedVal = null;
                        } else if (expandedVal === 'undefined') {
                            expandedVal = undefined;
                        }
                    }
                }

                dict.atPut(first, TP.ac(last, expandedVal));
            }
    });

    //  Make sure there's at least an empty ARGV, if one hasn't been populated
    //  above.
    dict.atPutIfAbsent('ARGV', TP.ac());

    aRequest.set('ARGUMENTS', dict);

    if (TP.isTrue(allForms)) {
        return dict;
    } else {
        return this.getArguments(aRequest);
    }
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('hasTrueArgument',
function(aRequest, anArgument) {

    /**
     * Returns true if the incoming request has a value for the argument which
     * shows that argument as "true" in a TIBET sense (i.e. TIBET's boolean
     * checks would say the value represents true if it's a string) or the
     * value is consistent with markup-based existence attributes such as
     * --checked="checked".
     * @param {TP.sig.ShellRequest} aRequest The request to query.
     * @param {String} The argument name to check.
     * @return {Boolean} True if the argument exists.
     */

    var arg;

    arg = this.getArguments(aRequest, anArgument);



});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('hasArguments',
function(aRequest) {

    /**
     * Returns true if the incoming request has at least one usable argument.
     * @param {TP.sig.ShellRequest} aRequest The request to query.
     * @return {Boolean} True for non-zero argument lists.
     */

    var args,
        keys;

    args = this.getArguments(aRequest, true);
    keys = args.getKeys();

    if (keys.getSize() > 1) {
        return true;
    }

    return TP.notEmpty(args.at('ARGV'));
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getParam',
function(aRequest, parameterName) {

    /**
     * @name getParam
     * @synopsis Returns a single value acquired from the current command node's
     *     child <param> tags, if any.
     * @param {TP.sig.ShellRequest} aRequest The request to query.
     * @param {String} parameterName The parameter to look up.
     * @returns {String} The parameter value.
     * @todo
     */

    var params;

    params = this.getParams(aRequest);

    return params.at(parameterName);
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getParams',
function(aRequest) {

    /**
     * @name getParams
     * @synopsis Returns a hash of key/value pairs where the keys are the
     *     request command node's child <param> names and the values are the
     *     <param> values.
     * @param {TP.sig.ShellRequest} aRequest The request to query.
     * @returns {TP.lang.Hash} The hash of named parameters.
     */

    var dict,

        node,

        shell;

    TP.stop('break.tsh_params');

    if (TP.isValid(dict = aRequest.get('PARAMS'))) {
        return dict;
    }

    node = aRequest.at('cmdNode');
    if (!TP.isElement(node)) {
        TP.raise(this,
                    'TP.sig.InvalidElement',
                    'Command node not an element.');

        return;
    }

    shell = this;
    dict = TP.hc();

    //  TODO:   restructure what's here to simply ask the tsh:param tag
    //  (which isn't a real type at this point) to getName/getValue so we
    //  can override and add other behavior (like "trigger action on
    //  refresh" or something so bound param/name/value tags can cause a
    //  service invocation when their source data causes a new parameter
    //  value to be assigned).

    //  iterate over child elements and process those whose local name is
    //  param (we don't worry about alternative namespaces here).
    TP.nodeChildElementsPerform(
        node,
        function(item) {

            var name,

                child,

                value;

            if (TP.elementGetFullName(item) !== 'tsh:param') {
                return;
            }

            //  three options for param tags, either name/value on the
            //  tag, or name on the tag, value in the child content, or
            //  both in the param tag as child content.
            if (TP.isEmpty(name = TP.elementGetAttribute(item,
                                                            'tsh:name',
                                                            true))) {
                name = TP.nodeGetChildTextContent(item, 'tsh:name');
                if (TP.isEmpty(name)) {
                    if ((child = TP.nodeGetFirstElementChildByTagName(
                                                        item, 'tsh:name'))) {
                        name = TP.wrap(child).getBoundInput();
                    }

                    if (TP.isEmpty(name)) {
                        TP.raise(item, 'TP.sig.InvalidElement',
                            '<param> tag has no name property or child.');

                        return TP.BREAK;
                    }
                }
            }

            if (TP.isEmpty(value = TP.elementGetAttribute(item,
                                                            'tsh:value',
                                                            true))) {
                value = TP.nodeGetChildTextContent(item, 'tsh:value');
                if (TP.isEmpty(value)) {
                    if ((child = TP.nodeGetFirstElementChildByTagName(
                                                        item, 'tsh:value'))) {
                        value = TP.wrap(child).getBoundInput();
                    }

                    if (TP.isEmpty(value)) {
                        TP.raise(item,
                                    'TP.sig.InvalidElement',
                                    '<param> tag has no value property' +
                                    ' or child.');

                        return TP.BREAK;
                    }
                }
            }

            dict.atPut(name, value);
        });

    aRequest.set('PARAMS', dict);

    return dict;
});

//  ------------------------------------------------------------------------
//  COMMON BUILT-INS
//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('executeAbout',
function(aRequest) {

    /**
     * @name executeAbout
     * @synopsis Displays information about the current shell.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request or hash
     *     containing parameters.
     */

    var str;

    str = TP.ifInvalid(this.get('announcement'), '');
    str += TP.ifInvalid(this.get('introduction'), '');

    return aRequest.complete(str);
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('executeAlias',
function(aRequest) {

    /**
     * @name executeAlias
     * @synopsis Processes alias-related commands which can list all aliases,
     *     list the value of a specific alias, define an alias, or remove an
     *     alias (by setting its value to null or to the key).
     * @param {TP.sig.ShellRequest} aRequest The request which triggered this
     *     command.
     * @returns {TP.sig.Request} The request.
     */

    var shell,
        argv,

        name,
        value,

        node;

    TP.stop('break.tsh_alias');

    shell = aRequest.at('cmdShell');
    argv = this.getArgument(aRequest, 'ARGV');

    switch (argv.getSize()) {
        case 0:

            //  listing
            aRequest.stdout(shell.get('aliases'));
            break;

        case 1:

            //  list single value
            name = argv.at(0);

            aRequest.stdout(shell.getAlias(name));
            break;

        case 2:

            //  set/unset value
            name = argv.at(0);
            value = argv.at(1);

            if (value === 'null' || value === name) {
                shell.unsetAlias(name);
            } else {
                //  When we set an alias from the command line we have to
                //  be sensitive to the quoting rules for variable
                //  interpolation. Double-quoted values get interpolated
                //  while single quoted values are preserved "as-is".
                shell.setAlias(name, value);
            }

            aRequest.stdout(shell.getAlias(name));
            break;

        default:

            //  syntax error
            node = aRequest.at('cmdNode');
            return aRequest.fail(
                        'Too many arguments: ' + TP.str(node));
    }

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('executeClear',
function(aRequest) {

    /**
     * @name executeClear
     * @synopsis Clears any receiver-related console display by issuing a
     *     TP.sig.ConsoleRequest. If there is no associated console then the
     *     signal is simply ignored.
     * @param {TP.sig.ShellRequest} aRequest The request which triggered this
     *     command.
     * @returns {TP.sig.Request} The request.
     */

    var req;

    req = TP.sig.ConsoleRequest.construct(
                        TP.hc('cmd', 'clear',
                                'cmdSilent', true));
    req.fire(this);

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('executeFlag',
function(aRequest) {

    /**
     * @name executeFlag
     * @synopsis Processes configuration flag commands, allowing the user to
     *     view a list of all flags, flags with a specific prefix, a specific
     *     flag, or allowing a flag value to be set.
     * @param {TP.sig.ShellRequest} aRequest The request which triggered this
     *     command.
     * @returns {TP.sig.Request} The request.
     */

    var node,

        name,
        value,

        hash;

    node = aRequest.at('cmdNode');

    name = this.getArgument(aRequest, 'ARG0');
    value = this.getArgument(aRequest, 'ARG1');

    if (TP.isEmpty(name)) {
        //  listing....here we combine both env and cfg data
        hash = TP.hc();
        hash.addAll(TP.sys.cfg());
        hash.addAll(TP.sys.env());
        hash.sort();

        aRequest.stdout(hash);
    } else if (TP.isEmpty(value)) {
        //  list single value
        if (name.indexOf('.') > -1) {
            aRequest.stdout(name + ',' + TP.sys.cfg(name));
        } else {
            aRequest.stdout(TP.hc(TP.sys.cfg(name)).sort());
        }
    } else {
        //  set a config value...note that the value of argv is actually all
        //  positional parameters collected, so it works like "auto-quoting"
        if (TP.notDefined(TP.sys.get('configuration').at(name))) {
            TP.ifWarn() ?
                TP.warn('Unknown flag: ' + name,
                        TP.LOG) : 0;
        }

        TP.sys.setcfg(name, value);
        aRequest.stdout(TP.sys.cfg(name));
    }

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('executeSave',
function(aRequest) {

    /**
     * @name executeSave
     * @param {TP.sig.ShellRequest} aRequest The request which triggered this
     *     command.
     * @returns {TP.sig.Request} The request.
     * @abstract
     * @todo
     */

    this.saveProfile();

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('executeSet',
function(aRequest) {

    /**
     * @name executeSet
     * @synopsis Sets a shell variable in response to a command request.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var argv,

        dict,

        arg1,

        str,
        val;

    argv = this.getArgument(aRequest, 'ARGV');

    if (argv.getSize() === 0) {
        dict = TP.hc(this.getExecutionInstance());
        aRequest.stdout(dict);

        return aRequest.complete();
    }

    arg1 = argv.at(0);
    if (TP.isEmpty(arg1)) {
        dict = TP.hc(this.getExecutionInstance());
        aRequest.stdout(dict);

        return aRequest.complete();
    }

    //  one arg means clear value
    if (argv.getSize() === 1) {
        this.unsetVariable(argv.at(0));

        return aRequest.complete();
    }

    str = argv.slice(1).join(' ');
    if (TP.isNaN(val = parseFloat(str))) {
        if (str.toLowerCase() === 'false') {
            val = false;
        } else if (str.toLowerCase() === 'true') {
            val = true;
        } else {
            val = str;
        }
    }

    this.setVariable(arg1, val);

    aRequest.stdout(this.getVariable(arg1));

    return aRequest.complete();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
