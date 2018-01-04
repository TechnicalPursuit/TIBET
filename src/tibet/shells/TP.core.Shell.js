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
 *
 */

//  ------------------------------------------------------------------------
//  Shell Primitives
//  ------------------------------------------------------------------------

TP.definePrimitive('shell',
function(aRequest) {

    /**
     * @method shell
     * @summary A wrapper for constructing and firing a TP.sig.ShellRequest.
     *     This is often used in UI event handlers to avoid complex
     *     TP.dispatch() logic for triggering script execution. NOTE that this
     *     command makes use of the current TP.core.User instance to provide
     *     profile information, if any. This ties the TP.shell() command into
     *     TIBET's user-interface permission machinery.
     * @param {String|TP.sig.Request|TP.core.Hash} aRequest The String of TSH
     *     content to execute or a request containing proper shell parameters.
     *     Those include:
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
     *          stdin, stdout, and stderr calls. This call with install a
     *          standard version that uses the standard TIBET logs for these.
     *
     *          {Boolean} cmdSilent Should shell output be reserved only for
     *          the response (and not sent to any Logger) [false].
     *
     *          {String} shellID The ID or typename of the shell to target.
     *          When a typename is given the ultimate target is that type's
     *          default instance. [TSH].
     *
     *          {Function} TP.ONSUCCESS The Function that should run if the
     *          shell command successfully completes.
     *
     *          {Function} TP.ONFAIL The Function that should run if the
     *          shell command does not successfully complete.
     *
     * @returns {TP.sig.ShellRequest} The request instance used.
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

    if (TP.isString(aRequest)) {
        params = TP.hc('cmdSrc', aRequest);
    } else {
        params = aRequest;
        if (TP.notValid(params)) {
            params = TP.hc();
        }
    }

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

    //  Configure the STDIO handler to be used for the request.
    stdio = TP.ifInvalid(params.at('cmdStdio'), '');
    if (TP.isString(stdio)) {
        stdio = TP.core.Resource.getResourceById(stdio);
    } else if (TP.canInvokeInterface(
                stdio, TP.ac('notify', 'stdin', 'stdout', 'stderr'))) {
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

                            //  Because we turn off interactive environment, we
                            //  have to turn this flag on to allow the
                            //  environment to properly process command
                            //  substitutions (which can use eval)
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

    //  Whether or not to build a GUI output for this command
    request.atPut('cmdBuildGUI', params.at('cmdBuildGUI') === true);

    if (!params.hasKey('cmdStdio')) {
        //  Build a hash that will hold stdio results for various commands.
        stdioResults = TP.ac();

        //  Configure STDIO on the shell to capture it for providing to the
        //  handler functions. Note that we push entries in the order they occur
        //  so callers get a time-ordered collection of all output from the
        //  request.
        stdioProvider = TP.lang.Object.construct();
        stdioProvider.defineMethod('notify',
                        function(anObject, req) {
                            stdioResults.push(
                                {
                                    meta: 'notify',
                                    data: anObject
                                });
                        });
        stdioProvider.defineMethod('stdin',
                        function(anObject, aDefault, req) {
                            stdioResults.push(
                                {
                                    meta: 'stdin',
                                    data: anObject
                                });
                        });
        stdioProvider.defineMethod('stdout',
                        function(anObject, req) {
                            stdioResults.push(
                                {
                                    meta: 'stdout',
                                    data: anObject
                                });
                        });
        stdioProvider.defineMethod('stderr',
                        function(anObject, req) {
                            stdioResults.push(
                                {
                                    meta: 'stderr',
                                    data: anObject
                                });
                        });

        stdioProvider.defineMethod('report',
             function(aSignal, results) {
                 results.forEach(
                        function(item) {
                            if (TP.notValid(item)) {
                                return;
                            }

                            switch (item.meta) {
                                case 'notify':
                                    TP.info(TP.str(item.data));
                                    break;
                                case 'stdin':
                                    TP.info(TP.str(item.data));
                                    break;
                                case 'stdout':
                                    TP.info(TP.str(item.data));
                                    break;
                                case 'stderr':
                                    TP.error(TP.str(item.data));
                                    break;
                                default:
                                    break;
                            }
                        });
             });
    } else {
        stdioProvider = aRequest.at('cmdStdio');
    }

    //  Install our object as the STDIO provider
    shell.attachSTDIO(stdioProvider);

    //  Configure the success handler, or a default one to report any output.
    success = params.at(TP.ONSUCCESS);
    if (TP.notValid(success)) {
        if (request.at('cmdSilent') !== true) {
            success = TP.isCallable(stdioProvider.report) ?
                                                stdioProvider.report :
                                                TP.RETURN_NULL;
        } else {
            success = TP.RETURN_NULL;
        }
    }
    successHandler = function(aSignal) {
        shell.detachSTDIO();
        success(aSignal, stdioResults);
    };

    request.defineHandler('RequestSucceeded', successHandler);

    //  Configure the failure handler, or a default one to report any output.
    failure = params.at(TP.ONFAIL);
    if (TP.notValid(failure)) {
        if (request.at('cmdSilent') !== true) {
            failure = TP.isCallable(stdioProvider.report) ?
                                                stdioProvider.report :
                                                TP.RETURN_NULL;
        } else {
            failure = TP.RETURN_NULL;
        }
    }
    failureHandler = function(aSignal) {
        shell.detachSTDIO();
        failure(aSignal, stdioResults);
    };

    request.defineHandler('RequestFailed', failureHandler);

    //  Go ahead and tell the shell to handle the shell request.
    shell[TP.composeHandlerName('ShellRequest')](request);

    return request;
});

//  ------------------------------------------------------------------------
//  TP.core.Shell
//  ------------------------------------------------------------------------

TP.core.Service.defineSubtype('Shell');

//  The core shell type is abstract.
TP.core.Shell.isAbstract(true);

//  ------------------------------------------------------------------------
//  Local Attributes
//  ------------------------------------------------------------------------

//  container for help information
TP.core.Shell.defineAttribute('helpTopics');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  rough limits on how many entries we'll maintain in core data structures
TP.core.Shell.Type.defineConstant('HISTORY_MAX', 250);

//  the limit of the number of positional arguments
TP.core.Shell.Type.defineConstant('POSITIONAL_MAX', 25);

TP.core.Shell.Type.defineConstant('MIN_USERNAME_LEN', 2);
TP.core.Shell.Type.defineConstant('MIN_PASSWORD_LEN', 2);

TP.core.Shell.Type.defineConstant('INVALID_ARGUMENT_MATCHER',
    TP.rc('(xmlns|xmlns:\\w+|class|tibet:tag|tag|tsh:argv|argv)'));

//  'starter' snippet list used for new accounts. a list of pairs:
//  ([[command, user text], ...])
TP.core.Shell.Type.defineAttribute(
                'STARTER_SNIPPETS',
                TP.ac(
                        TP.ac(':clear', 'Clear'),
                        TP.ac(':flag', 'Config flags'),
                        TP.ac('TP.sys.getBootLog()', 'Write Boot Log')
                ));

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  TP.sig.ShellRequests are the service triggers, activating shell
//  processing
TP.core.Shell.Type.defineAttribute(
    'triggers', TP.ac(TP.ac(TP.ANY, 'TP.sig.ShellRequest')));

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
     * @method initialize
     * @summary Prepares the type for operation by initializing any data
     *     structures or other components.
     */

    //  these are how virtually all incoming requests are made, but the
    //  shell will construct some of its own when redispatching commands
    TP.sys.getTypeByName('TP.sig.ShellRequest');

    //  to communicate with the user we make use of these two, which are
    //  typically handled by a console instance serving as view/ctrlr
    TP.sys.getTypeByName('TP.sig.UserOutputRequest');
    TP.sys.getTypeByName('TP.sig.UserInputRequest');

    //  certain commands can attempt to affect a connected console. the
    //  console is responsible for filtering these to respond only when the
    //  origin is the shell the console is currently managing
    TP.sys.getTypeByName('TP.sig.ConsoleRequest');

    //  observe the 'TP.sig.UpdateAvailable' call. If there's an update to
    //  TIBET available, the kernel will notify us and we can log a message
    //  to the user.
    this.observe(TP.sys, 'TP.sig.UpdateAvailable');

    return;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Type.defineHandler('UpdateAvailable',
function(aSignal) {

    /**
     * @method handleUpdateAvailable
     * @summary Handles when an 'TP.sig.UpdateAvailable' signal is thrown.
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
        setTimeout(notifyFunc, TP.sys.cfg('shell.update.delay', 2000));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  HELP TOPICS
//  ------------------------------------------------------------------------

TP.core.Shell.Type.defineMethod('addHelpTopic',
function(command, method, abstract, usage, description) {

    /**
     * @method addHelpTopic
     * @summary Adds a help usage/abstract for a particular shell command. The
     *     resulting text is output by the built-in :help command.
     * @param {String} command The command name ([ns]:[tag]) for the topic.
     * @param {String} usage The usage string for the command.
     * @param {String} abstract The abstract of the command. Should be a single
     *     line of text maximum.
     * @param {Function} method The method object that implements the command.
     * @returns {TP.core.Shell} The receiver.
     */

    var topics;

    if (TP.isEmpty(command) || !TP.isMethod(method)) {
        return this.raise('InvalidParameter');
    }

    if (TP.isEmpty(usage) || TP.isEmpty(abstract)) {
        TP.warn('Empty usage or abstract string for help topic: ' + command);
    }

    topics = TP.core.Shell.get('helpTopics');
    if (TP.notValid(topics)) {
        topics = TP.hc();
        topics.setSortFunction(TP.sort.CASE_INSENSITIVE);
        TP.core.Shell.$set('helpTopics', topics);
    }

    //  tuck usage/abstract onto method itself. we'll retreive from there.
    //  use slot access here since we don't define these as 'attributes'.
    method.$$usage = usage;
    method.$$abstract = abstract;
    method.$$description = abstract;

    //  save the command name and the implementation. when we retrieve this we
    //  can use the method to access the abstract and its comment text for docs.
    topics.atPut(command, method);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  whether or not we just loaded the profile. Used as a flag between
//  initProfile() and saveProfile()
TP.core.Shell.Inst.defineAttribute('$justLoadedProfile');

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

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('init',
function(aResourceID, aRequest) {

    /**
     * @method init
     * @summary Initializes a new instance, preparing it for command
     *     processing. The resource ID provided will be used to register the
     *     instance for later lookup/targeting logic.
     * @param {String} aResourceID The standard service identifier.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request or hash
     *     containing shell parameters etc.
     * @returns {TP.core.Shell} A new instance.
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

TP.core.Shell.Inst.defineMethod('getCommandMethod',
function(aCommandName) {

    /**
     * @method getCommandMethod
     * @summary Returns the method corresponding to the command name that is
     *     supplied.
     * @description This method will search the 'tsh' namespace and the
     *     currently executing shells, looking for a method that corresponds to
     *     the command name, according to the naming convention.
     * @returns {Function|null} The method corresponding to the supplied method
     *     name.
     */

    var cmdName,
        cmdPrefix,
        cmdParts,

        namespace,
        type,

        method,

        shells,
        i;

    cmdName = aCommandName;

    //  If the command name has a leading ':', slice it off
    if (cmdName.startsWith(':')) {

        cmdName = cmdName.slice(1);

        //  Grab the shell's default namespace prefix
        cmdPrefix = this.getPrefix();

        //  If it's empty, bail out
        if (TP.isEmpty(cmdPrefix)) {
            TP.error('Can\'t find a command prefix for this shell.');

            return null;
        }
    } else if (cmdName.contains(':')) {

        cmdParts = cmdName.split(':');

        cmdPrefix = cmdParts.first();
        cmdName = cmdParts.last();
    }

    //  First, we see if the 'tsh:' namespace has a type that corresponds to the
    //  command name
    namespace = TP[cmdPrefix];

    if (TP.isNamespace(namespace)) {

        type = TP[cmdPrefix][cmdName];
        if (TP.isType(type)) {

            //  Need to check to make sure that the type's prototype *owns* the
            //  slot - we'll see the inherited one otherwise.
            if (TP.owns(type.Type, 'cmdRunContent')) {

                method = type.Type.getMethod('cmdRunContent');

                //  Found a 'cmdRunContent' method on the target type.
                if (TP.isMethod(method)) {
                    return method;
                }
            }

            //  Need to check to make sure that the type's prototype *owns* the
            //  slot - we'll see the inherited one otherwise.
            if (TP.owns(type.Type, 'tshExecute')) {

                method = type.Type.getMethod('tshExecute');

                //  Found a 'tshExecute' method on the target type.
                if (TP.isMethod(method)) {
                    return method;
                }
            }
        }
    } else {
        TP.error('Can\'t find a namespace for prefix: ' + cmdPrefix);

        return null;
    }

    //  Then we see if the shell itself has the method for the command. The core
    //  shell types have some built-in methods modeled this way.

    //  TODO: Iterate over the currently installed shells
    shells = TP.ac(TP.core.TSH);
    for (i = 0; i < shells.getSize(); i++) {
        method = shells.at(i).Inst.getMethod(
                                    'execute' + TP.makeStartUpper(cmdName));

        //  Found an 'execute<cmdName>' method on the target type.
        if (TP.isMethod(method)) {
            return method;
        }
    }

    TP.error('Can\'t find a command method for command: ' + aCommandName);

    return null;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @method $getEqualityValue
     * @summary Returns the value which should be used for testing equality for
     *     the receiver.
     * @returns {String} The test value, typically the shell's GID.
     */

    return this.getID();
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getNextPID',
function() {

    /**
     * @method getNextPID
     * @summary Returns the next available PID for requests made of this shell.
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
     * @method getPrefix
     * @summary Returns the current command prefix, not including a trailing
     *     namespace separator (:). For example, this method typically returns
     *     'tsh' in the TSH (TIBET Shell).
     * @returns {String} The command prefix plus NS separator.
     */

    return this.$get('commandPrefix');
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getPrompt',
function() {

    /**
     * @method getPrompt
     * @summary Returns the prompt a console or other UI should display for
     *     this shell.
     * @returns {String} The prompt.
     */

    return this.$get('commandPrompt');
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('setPrefix',
function(aPrefix) {

    /**
     * @method setPrefix
     * @summary Sets the default command prefix for any unprefixed commands.
     * @param {String} aPrefix The namespace prefix. This should typically be in
     *     lower case (tsh, yak, etc).
     * @returns {TP.core.Shell} The receiver.
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
     * @method setPrompt
     * @summary Sets the prompt string, a string which will be transformed and
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
     * @method announce
     * @summary Displays an announcement specific to the current shell and/or
     *     request being processed. This is typically invoked by the
     *     TP.tdp.Console to emulate how standard shells announce their version
     *     etc.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request or hash
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

TP.core.Shell.Inst.defineHandler('AppShutdown',
function(aSignal) {

    /**
     * @method handleAppShutdown
     * @summary Handles when an 'TP.sig.AppShutdown' signal is thrown.
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
     * @method isLoginShell
     * @summary Returns true if the receiver is a top-level login shell.
     * @returns {Boolean}
     */

    //  by default we presume that shells must log in
    return true;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('isRunning',
function(aFlag) {

    /**
     * @method isRunning
     * @summary Combined setter/getter for whether the shell is active.
     * @param {Boolean} aFlag Optional new value to set.
     * @returns {Boolean} The current value.
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
     * @method login
     * @summary Performs any login sequence necessary for the receiver. The
     *     default is to take no action. Subtypes should override this to
     *     provide target-specific login/profile management features.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request or hash
     *     containing parameters.
     * @returns {TP.core.Shell} The receiver.
     */

    TP.override();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('logout',
function(aRequest) {

    /**
     * @method logout
     * @summary Logs out of the current login shell.
     * @description The shell uses several variables on logout to determine what
     *     values if any to save. These variables are SAVEVARS, SAVEALIAS,
     *     SAVEHIST, and SAVEDIRS. The DISCARD variable controls whether change
     *     set data should be discarded, the default is false.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request or hash
     *     containing parameters.
     * @returns {TP.core.Shell} The receiver.
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
     * @method start
     * @summary Performs common startup processing, including displaying an
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
     * @method initProfile
     * @summary Initializes common and user-phase profile data.
     */

    var name,

        profileStorage,

        newHistory,

        userData,

        dataSet,

        historyEntries,
        snippetEntries,
        bookmarkEntries; // ,
        // screenEntries;

    if (TP.notEmpty(name = this.get('username'))) {

        profileStorage = TP.core.LocalStorage.construct();

        userData = profileStorage.at('user_' + name);

        if (TP.notEmpty(userData)) {

            dataSet = TP.json2js(userData);

            //  ---
            //  History
            //  ---

            if (TP.notEmpty(historyEntries = dataSet.at('history'))) {

                newHistory = TP.ac();

                historyEntries.perform(
                    function(anEntry, anIndex) {

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
                                //  Assign ID based on iteration when
                                //  rebuilding. This will reset to 0-histmax but
                                //  that's better than nothing.
                                'cmdHistoryID', anIndex,
                                    // TP.ifInvalid(anEntry.at('cmdHistoryID'),
                                    // anIndex),
                                'cmdBuildGUI',
                                    anEntry.at('cmdBuildGUI'),
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
                if (TP.notEmpty(newHistory)) {
                    this.set('historyIndex',
                        newHistory.last().at('cmdHistoryID') + 1);
                } else {
                    this.set('historyIndex', 1);
                }
            }

            //  ---
            //  Snippets
            //  ---

            snippetEntries = dataSet.at('snippets');

            if (TP.isEmpty(snippetEntries)) {
                snippetEntries = this.getType().STARTER_SNIPPETS.copy();
            }

            TP.uc('urn:tibet:tsh_snippets').setResource(
                                            snippetEntries,
                                            TP.hc('observeResource', true,
                                                    'signalChange', true));
            //  ---
            //  Bookmarks
            //  ---

            bookmarkEntries = dataSet.at('bookmarks');

            if (TP.isEmpty(bookmarkEntries)) {
                bookmarkEntries = TP.ac();
            }

            TP.uc('urn:tibet:sherpa_bookmarks').setResource(
                                            bookmarkEntries,
                                            TP.hc('observeResource', true,
                                                    'signalChange', true));
            //  ---
            //  Screens
            //  ---
/*
            screenEntries = dataSet.at('screens');

            if (TP.notEmpty(screenEntries)) {
                TP.byId('SherpaWorld', TP.win('UIROOT')).setScreenLocations(
                                                                screenEntries);
            }
*/

        } else {

            //  ---
            //  Snippets
            //  ---

            snippetEntries = this.getType().STARTER_SNIPPETS.copy();
            TP.uc('urn:tibet:tsh_snippets').setResource(
                                            snippetEntries,
                                            TP.hc('observeResource', true,
                                                    'signalChange', true));

            //  ---
            //  Bookmarks
            //  ---

            bookmarkEntries = TP.ac();
            TP.uc('urn:tibet:sherpa_bookmarks').setResource(
                                            bookmarkEntries,
                                            TP.hc('observeResource', true,
                                                    'signalChange', true));
        }
    }

    this.set('$justLoadedProfile', true);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('saveProfile',
function() {

    /**
     * @method saveProfile
     * @summary Stores common and user-phase profile data.
     */

    var name,

        historyEntries,
        snippetEntries,
        bookmarkEntries,
//        screenEntries,

        userData,
        profileStorage;

    if (this.get('$justLoadedProfile') === true) {
        this.set('$justLoadedProfile', false);
        return;
    }

    if (TP.notEmpty(name = this.get('username'))) {

        //  ---
        //  History
        //  ---

        historyEntries =
            this.get('history').collect(
                function(aShellReq) {

                    return TP.hc(
                        'cmd', aShellReq.at('cmd'),
                        'cmdAllowSubs', aShellReq.at('cmdAllowSubs'),
                        'cmdExecute', aShellReq.at('cmdExecute'),
                        'cmdBuildGUI', aShellReq.at('cmdBuildGUI'),
                        'cmdHistoryID', aShellReq.at('cmdHistoryID'),
                        'cmdLiteral', aShellReq.at('cmdLiteral'),
                        'cmdPhases', aShellReq.at('cmdPhases'),
                        'cmdRecycle', aShellReq.at('cmdRecycle'),
                        'cmdRoot', TP.str(aShellReq.at('cmdRoot')),
                        'cmdSilent', aShellReq.at('cmdSilent'));
                });

        //  ---
        //  Snippets
        //  ---

        snippetEntries =
            TP.uc('urn:tibet:tsh_snippets').getResource().get('result');
        if (TP.isEmpty(snippetEntries)) {
            snippetEntries = TP.ac();
        }

        //  ---
        //  Bookmarks
        //  ---

        bookmarkEntries =
            TP.uc('urn:tibet:sherpa_bookmarks').getResource().get('result');
        if (TP.isEmpty(bookmarkEntries)) {
            bookmarkEntries = TP.ac();
        }

        //  ---
        //  Screens
        //  ---
/*
        screenEntries =
            TP.byId('SherpaWorld', TP.win('UIROOT')).getScreenLocations();

        if (TP.isEmpty(screenEntries)) {
            screenEntries = TP.ac();
        }
*/
        //  ---
        //  Save it all
        //  ---

        userData = TP.hc(
                    'history', historyEntries,
                    'snippets', snippetEntries,
                    'bookmarks', bookmarkEntries); // ,
                    // 'screens', screenEntries);

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
     * @method getAlias
     * @summary Returns the value of the named alias, if found.
     * @param {String} aName The alias name to look up.
     * @returns {String} The string value entered.
     */

    var dict,
        val,

        parentShell;

    //  TODO:   map alias storage into local DB or local store, or
    //          cookie, or file, but store it somewhere.
    dict = this.get('aliases');
    if (TP.notValid(dict)) {
        dict = TP.hc();
    }

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
     * @method setAlias
     * @summary Sets the string value of an alias.
     * @param {String} aName The alias name to set.
     * @param {String} aValue The string value to set. No object resolution is
     *     done on alias values so this will be used literally.
     * @returns {TP.core.Shell} The receiver.
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
     * @method unsetAlias
     * @summary Removes an alias definition from the receiver.
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
     * @method addHistory
     * @summary Adds a request to the command history for the receiver.
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
        root,
        cmd,
        index,
        histmax,
        dups,

        i,

        offset;

    list = this.get('history');

    root = aRequest.at('rootRequest');
    if (TP.notValid(root)) {
        root = aRequest;
    }

    cmd = root.at('cmd');
    cmd = cmd.trim();

    //  no matter what, we reset the history index to the end so any
    //  next/prev operations are reset
    histmax = this.getVariable('HISTSIZE');
    if (TP.notValid(histmax)) {
        histmax = this.getType().HISTORY_MAX;
    }

    dups = TP.ifInvalid(this.getVariable('HISTDUP'), 'prev');
    dups.toLowerCase();

    if (dups === 'prev' && list.getSize() > 0) {
        if (list.last().at('cmd') === cmd) {
            index = list.last().at('cmdHistoryID');
            this.set('historyIndex', index + 1);
            return index;
        }
    } else if (dups === 'all') {
        for (i = list.getSize() - 1; i >= 0; i--) {
            if (list.at(i).at('cmd') === cmd) {
                this.set('historyIndex', i + 1);
                return i;
            }
        }
    }

    //  compute the index and store it with the root request
    if (TP.notEmpty(list)) {
        index = list.last().at('cmdHistoryID') + 1;
    } else {
        index = 1;
    }

    root.atPut('cmdHistoryID', index);
    list.add(root);

    offset = list.getSize() - histmax;
    if (offset > 0) {
        //  We're over the history maximum. Since history is LRU, we shift off
        //  the first item.
        list.shift();
    }

    this.set('historyIndex', index + 1);

    return index;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('decrementHistoryIndex',
function() {

    /**
     * @method decrementHistoryIndex
     * @summary Decreases the current history index by 1, unless the index is
     *     already at 0. This method shifts the 'current history' entry to point
     *     to the new index location.
     * @returns {Number} The new index.
     */

    var index,
        first,
        min;

    //  Current index value?
    index = this.get('historyIndex');

    //  Index value at the start of the list. Can't get smaller than this.
    first = this.get('history').first();
    min = TP.notValid(first) ? 0 : first.at('cmdHistoryID');

    //  Whichever's smaller, the current index value or one at the head of the
    //  list, offset by one to allow clean input result and increment to work.
    this.set('historyIndex', index.max(min) - 1);

    return this.get('historyIndex');
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getHistory',
function(anIndex, afterExpansion) {

    /**
     * @method getHistory
     * @summary Returns the history entry at the index provided, or the entire
     *     list if no index is provided.
     * @param {Number|String|RegExp} anIndex The history index to look up.
     * @param {Boolean} afterExpansion True to work against the expanded form
     *     rather than the original source command text.
     * @returns {String} The history entry's stored string content.
     */

    var expanded,
        entry,
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
        hist = this.$get('history');

        //  If the index provided is a negative number (usually -1) then we're
        //  not being asked for a specific item by "id" we're being asked based
        //  on offset.
        if (anIndex < 0) {
            //  NOTE offset here is -2 because currently executing command is
            //  the last one (aka -1).
            entry = hist.at(-2);
        } else {
            entry = hist.detect(function(item) {
                return item.at('cmdHistoryID') === anIndex;
            });
        }

        if (TP.isValid(entry)) {
            //  re-constituted history entries may be simple strings
            if (TP.isString(entry)) {
                return entry;
            } else if (expanded) {
                text = entry.getOriginalCmdText();

                return text;
            } else {
                return entry.at('cmd');
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

        //  have to skip the current command here or we'll just find that.
        list = this.$get('history').slice(0, -1);
        request = list.reverse().detect(
                            function(req) {

                                var histText;

                                histText = expanded ?
                                        req.getOriginalCmdText() :
                                        req.at('cmd');

                                return histMatch.test(histText);
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
     * @method incrementHistoryIndex
     * @summary Increases the current history index by 1, unless the index is
     *     already at HISTSIZE. This method shifts the 'current history' entry
     *     to point to the new index location.
     * @returns {Number} The new index.
     */

    var index,
        last,
        max;

    //  Current index value?
    index = this.get('historyIndex');

    //  Index value of the entry at the tail of the list. Can't get bigger than
    //  this + 1;
    last = this.get('history').last();
    max = TP.notValid(last) ? 0 : last.at('cmdHistoryID');

    //  note that we let this push past the end of the list so we get an
    //  empty entry and are properly positioned for the next decrement call
    this.set('historyIndex', index.min(max) + 1);

    return this.get('historyIndex');
});

//  ------------------------------------------------------------------------
//  VARIABLES
//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getVariable',
function(aName) {

    /**
     * @method getVariable
     * @summary Returns the value of the named shell variable, if found.
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
    return TP.sys.cfg(aName) || TP.sys.env(aName) || window[aName];
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('setVariable',
function(aName, aValue) {

    /**
     * @method setVariable
     * @summary Sets the string value of a variable name. Note that variable
     *     names are normalized to uppercase $-prefixed values for storage in
     *     the $SCOPE object. For example, aName of 'focus' will become '$FOCUS'
     *     for variable storage. The getVariable call follows this convention as
     *     well, so it is largely invisible except when examining the $SCOPE
     *     object.
     * @param {String} aName The variable name to set.
     * @param {String} aValue The string value to set. Note that when evaluated
     *     as part of command input this may still resolve to an object, but no
     *     resolution is done at the time of variable definition.
     * @returns {TP.core.Shell} The receiver.
     */

    var name;

    //  normalize name to $X
    name = aName.toUpperCase();
    if (name.charAt(0) !== '$') {
        name = '$' + name;
    }

    this.getExecutionInstance().atPut(name, aValue);
    window[name] = aValue;

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('unsetVariable',
function(aName) {

    /**
     * @method unsetVariable
     * @summary Removes a variable definition from the receiver.
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

TP.core.Shell.Inst.defineHandler('ShellRequest',
function(aRequest) {

    /**
     * @method handleShellRequest
     * @summary Constructs a response to the request provided.
     *     TP.sig.ShellRequest instances are the typical way commands are
     *     provided to the shell for processing.
     * @param {TP.sig.ShellRequest} aRequest The request to respond to.
     * @returns {TP.core.ShellResponse} A response to the request.
     */

    var response,
        cmd,
        thisref,
        constructOutInfo;

    aRequest.isActive(true);

    //  first make sure we can construct a valid response
    if (TP.notValid(response = aRequest.getResponse())) {
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

    //  If there is a GUI and the request does not wish to run silently, we
    //  build a 'construct out UI' request and tie it back to the original
    //  request using the 'cmdID'.
    if (TP.isTrue(aRequest.at('cmdBuildGUI')) &&
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

        //  Note here how we fork the execution (but as quickly as
        //  possible so that it goes back on the stack ASAP) so that the GUI
        //  has the chance to draw the output cell before we run.
        thisref = this;
        setTimeout(
            function() {
                thisref.execute(aRequest);
            }, 0);
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

TP.core.Shell.Inst.defineHandler('UserInput',
function(aSignal) {

    /**
     * @method handleUserInput
     * @summary Responds to TP.sig.UserInput signals, which are sent in
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
        TP.handle(this, req);
    } finally {
        //  if there was a responder let it know we're done
        if (TP.isValid(responder)) {
            aSignal.getRequestID().signal('TP.sig.RequestCompleted');
        }
    }

    response = aSignal.getResponse();

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
     * @method attachSTDIO
     * @summary Attaches the receiver's stdio hooks to a STDIO provider, an
     *     object which implements those hooks for reuse.
     * @param {Object} aProvider An object implementing stdin, stdout, and
     *     stderr hook functions.
     * @returns {TP.core.Shell} The receiver.
     */

    if (!TP.canInvokeInterface(
                    aProvider,
                    TP.ac('notify', 'stdin', 'stdout', 'stderr'))) {
        return this.raise(
            'TP.sig.InvalidProvider',
            'STDIO provider must implement stdin, stdout, and stderr');
    }

    this.notify =
            function(anObject, aRequest) {

                return aProvider.notify(anObject, aRequest);
            };

    this.stdin =
            function(aQuery, aDefault, aRequest) {

                return aProvider.stdin(aQuery, aDefault, aRequest);
            };

    this.stdout =
            function(anObject, aRequest) {

                return aProvider.stdout(anObject, aRequest);
            };

    this.stderr =
            function(anError, aRequest) {
                return aProvider.stderr(anError, aRequest);
            };

    //  The first thing to attach "wins" in that it will be the one we default
    //  to whenever we detach later.
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
     * @method detachSTDIO
     * @summary Detaches the receiver's stdio hooks from a STDIO provider,
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
     * @method notify
     * @summary Notifies the user outside of "stdout" of a message.
     * @description The default version of this method uses the low-level
     *     TP.boot.$alert() function. Shells which are connect to a Console or
     *     other UI will typically have this version overwritten so output is
     *     directed to the UI.
     * @param {Object} anObject The object to output.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object with optional
     *     values for 'cmdNotifier', 'cmdAsIs', 'messageType', etc.
     * @returns {TP.core.Shell} The receiver.
     */

    var message;

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

    // name = TP.ifKeyInvalid(aRequest, 'cmdNotifier', null);
    // raw = TP.ifKeyInvalid(aRequest, 'cmdAsIs', false);

    TP.boot.$alert(message);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('stderr',
function(anError, aRequest) {

    /**
     * @method stderr
     * @summary Outputs the error provided using any parameters in the request
     *     to assist with formatting etc. Parameters include messageType,
     *     cmdAsIs, etc.
     * @param {String} anError The error to output.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.core.Shell} The receiver.
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

    req.atPutIfAbsent('messageLevel', 'error');

    req.fire(this);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('stdin',
function(aQuery, aDefault, aRequest) {

    /**
     * @method stdin
     * @summary Requests input from the user.
     * @param {String} aQuery An optional query string to format as a question
     *     for the user.
     * @param {String} aDefault An optional string value to use as the default
     *     value.
     * @param {TP.sig.UserInputRequest} aRequest An input request containing
     *     processing instructions. The request should be capable of responding
     *     to TP.sig.UserInput signals so it can process the result when ready.
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
     * @method stdout
     * @summary Outputs the object provided using any parameters in the request
     *     to assist with formatting etc. Parameters include messageType,
     *     cmdAsIs, etc.
     * @param {Object} anObject The object to output.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object with optional
     *     values for messageType, cmdAsIs, etc.
     * @returns {TP.core.Shell} The receiver.
     */

    var req;

    if (TP.notValid(aRequest)) {
        req = TP.sig.UserOutputRequest.construct();
        req.set('requestor', this);
    } else if (TP.isKindOf(aRequest, TP.sig.UserIORequest)) {
        req = aRequest;
    } else {
        //  Need to repackage in the proper subtype for processing.
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
     * @method addPath
     * @summary Pushes a path on the path stack of the receiver. Paths in the
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

    pathmax = this.getVariable('PATHSIZE');
    if (TP.notValid(pathmax)) {
        pathmax = this.getType().PATH_MAX;
    }

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
     * @method clearPaths
     * @summary Empties the path stack.
     * @returns {TP.core.Shell} The receiver.
     */

    this.get('pathStack').empty();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('execute',
function(aRequest) {

    /**
     * @method execute
     * @summary The main command execution method, responsible for parsing and
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
     * @method expandPath
     * @summary Expands a path to absolute form using current path stack and
     *     environment information.
     * @description Expansion uses the following rules:
     *
     *     Absolute paths start with a scheme, either http(s) or file and are
     *     left unchanged by this process. All other paths are considered
     *     relative and are expanded as follows.
     *
     *     When a ~ is used as the start of a path the expansion is done
     *     relative to the current launch directory for the application, the
     *     default value of TP.getAppRoot() for ~app, or the library root if
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

    home = this.getVariable('HOME');
    if (TP.notValid(home)) {
        home = TP.getAppRoot();
    }

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
            if (TP.isValid(item) && item !== '' && url.startsWith(item)) {
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
        url = TP.uriJoinPaths(TP.getLibRoot(), aPath.slice(5));
    } else if (aPath.startsWith('~/')) {
        //  NB: We slice off the slash here too, so that TP.uriJoinPaths()
        //  doesn't think its absolute.
        url = TP.uriJoinPaths(TP.getAppHead(), aPath.slice(2));
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
     * @method getPath
     * @summary Returns the path entry at the index provided, or at the current
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
        return TP.getLibRoot();
    }

    return path;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getLastPath',
function() {

    /**
     * @method getLastPath
     * @summary Returns the text of the last path entry.
     * @returns {String} The last path string.
     */

    return this.$get('pathStack').last();
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('removePath',
function(anIndex) {

    /**
     * @method removePath
     * @summary Removes the path at anIndex, or the last path in the list if no
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
     * @method getExecutionContext
     * @summary Returns the execution context for the receiver, the window or
     *     frame used for eval calls. This is typically the window in which the
     *     code was loaded, and therefore virtually always the top window in a
     *     standard installation.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request or hash
     *     containing parameters.
     * @returns {Window} The execution context.
     */

    var ctx,
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

    //  default when not set is to map it to the TIBET code frame.
    if (TP.isWindow(TP.global.$$TIBET)) {
        win = TP.global.$$TIBET;
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
     * @method getExecutionInstance
     * @summary Returns the execution instance, an object used to provide
     *     scoped variable support for the shell.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request or hash
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
function(anObjectSpec, aRequest, forArguments) {

    /**
     * @method resolveObjectReference
     * @summary Returns an object based on the string specification provided.
     *     This method will attempt to evaluate the spec as an expression as
     *     well as treating it like a tibet://URI in an attempt to locate the
     *     object.
     * @param {String} anObjectSpec An object spec or TIBET URI.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request or hash
     *     containing parameters.
     * @param {Boolean} [forArguments=false] Optional signifier that the
     *     resolution is occurring for a command argument rather than a pure
     *     reference. This largely matters only when using dereferencing.
     * @returns {Object} The object, if found.
     */

    var execInstance,
        execContext,

        spec,
        deref,

        url,
        resp,
        $$inst,

        instType,

        isIdentifier,
        i,
        specs;

    //  We can't use non-Strings for object specifications anyway.
    if (!TP.isString(anObjectSpec)) {
        return anObjectSpec;
    }

    if (anObjectSpec.charAt(0) === '{' || anObjectSpec.charAt(0) === '[') {
        return TP.$tokenizedConstruct(anObjectSpec);
    }

    spec = anObjectSpec;

    //  The $SCOPE object (the local context object that shell variables have
    //  been set against)
    execInstance = this.getExecutionInstance();

    //  The $CONTEXT object (the global context shell code is being eval'ed in)
    execContext = this.getExecutionContext();

    //  If 'spec' matches shell 'dereference sugar' (i.e. '@foo'), then we have
    //  to strip the leading '@'.
    if (TP.regex.TSH_DEREF_SUGAR.test(spec)) {
        spec = spec.slice(1);
        //  Can only dereference a variable, not a standard value.
        if (spec.charAt(0) !== '$') {
            spec = '$' + spec;
        }
        deref = true;
    }

    //  Convert any shell variable that starts with '${' and ends with '}' to
    //  it's plain form.
    //  NB: We do *not* want to use the TP.regex.TSH_VARSUB_EXTENDED replacement
    //  technique here, since we're only looking at the start and the end of the
    //  entire expression for variable conversion - leaving anything in the
    //  interior along.
    if (spec.startsWith('${') && spec.endsWith('}')) {
        spec = '$' + spec.slice(2, -1);
    }

    //  Convert 'Meta*' references to their true internal names.
    if (spec.indexOf('MetaInst') === 0) {
        spec = spec.replace(/^MetaInst/, 'TP.META_INST_OWNER');
        //  Remove any 'track' reference. It won't resolve (or help).
        spec = spec.replace(/\.MetaInst/, '');
    } else if (spec.indexOf('MetaType') === 0) {
        spec = spec.replace(/^MetaType/, 'TP.META_TYPE_OWNER');
        //  Remove any 'track' reference. It won't resolve (or help).
        spec = spec.replace(/\.MetaType/, '');
    }

    //  With most of our desugaring done can we just use getObjectById? Let's
    //  see if the spec is a JS identifer (or dot-separated JS identifier).
    isIdentifier = false;
    specs = spec.split('.');
    for (i = 0; i < specs.getSize(); i++) {
        if (!TP.regex.JS_IDENTIFIER.test(specs.at(i))) {
            //  Not a JS identifier - can't use it as such.
            isIdentifier = false;
            break;
        }
        isIdentifier = true;
    }

    if (isIdentifier) {
        $$inst = TP.sys.getObjectById(spec);
        if (TP.isValid($$inst)) {
            if (deref && TP.notTrue(forArguments)) {
                //  TODO:   check forArguments flag and act accordingly
                if (TP.canInvoke($$inst, 'cmdGetContent')) {
                    $$inst = $$inst.cmdGetContent(aRequest);
                } else if (TP.canInvoke($$inst, 'getType')) {
                    instType = $$inst.getType();
                    if (TP.canInvoke(instType, 'cmdGetContent')) {
                        $$inst = instType.cmdGetContent(aRequest);
                    }
                }
            }

            return $$inst;
        }
    }

    try {
        if (TP.regex.URI_LIKELY.test(spec) &&
            !TP.regex.REGEX_LITERAL_STRING.test(spec)) {
            url = this.expandPath(spec);
            if (TP.isURI(url = TP.uc(url))) {
                resp = url.getResource(TP.hc('async', false));
                $$inst = resp.get('result');
            }
        } else if (execInstance.hasKey(spec)) {
            $$inst = execInstance.at(spec);
        } else {

            //  eval has problems with Object and Function literals, but
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

    } catch (e) {
        $$inst = undefined;
    }

    //  We don't "dive in" to cmd* method references for simple argument usage,
    //  only for sink processing.
    if (TP.isTrue(deref) && TP.notTrue(forArguments)) {
        if (TP.canInvoke($$inst, 'cmdGetContent')) {
            $$inst = $$inst.cmdGetContent(aRequest);
        } else if (TP.canInvoke($$inst, 'getType')) {
            instType = $$inst.getType();
            if (TP.canInvoke(instType, 'cmdGetContent')) {
                $$inst = instType.cmdGetContent(aRequest);
            }
        }
    }

    return $$inst;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('resolveVariableSubstitutions',
function(aString) {

    /**
     * @method resolveVariableSubstitutions
     * @summary Handles variable substitution syntax, typically in values
     *     provided as command tag attributes or content.
     * @param {String} aString A string requiring resolution.
     * @returns {String} The string with resolved variable substitutions.
     */

    var str;

    str = aString;

    //  We special case the standard "stdin" variable $_ so it doesn't have
    //  to be mentioned in an enclosing ${...} construct (${_}).
    if (str === '$_') {
        return this.getExecutionInstance().at('$_');
    }

    //  Don't expand variables being used as part of a dereferencing operation.
    if (/@\$/.test(str)) {
        return str;
    }

    //  Don't expand strings that are single-quoted.
    if (str.unquoted().quoted('\'') === str) {
        return str;
    }

    if (TP.regex.TSH_VARSUB.test(str)) {
        str = str.replace(
                TP.regex.TSH_VARSUB,
                function(wholeMatch, varName) {
                    var value;

                    value = this.getExecutionInstance().at('$' + varName);

                    //  If the variable isn't defined in scope return it so the
                    //  string value "exposes" that variable as being
                    //  unresolved.
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
     * @method setExecutionContext
     * @summary Sets the execution context, the window or frame used for eval
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
            win = TP.bySystemId(win);
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
     * @method updateCommandNode
     * @summary Handles variable substitution syntax, typically in values
     *     provided as command tag attributes or content, specifically expanding
     *     attribute values on the request's command node.
     * @param {TP.sig.Request} aRequest A TP.sig.TSHRunRequest in most cases.
     * @param {Boolean} shouldReport Whether to report missing substitutions or
     *     not. Default is true.
     * @returns {Node} The fully interpolated command node.
     */

    var node,
        len,
        i;

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
     * @method updateExecutionInstance
     * @summary Updates the execution instance ($SCOPE object) with the data
     *     from the request to help ensure that variable substitution and other
     *     data access references are current.
     * @param {TP.sig.Request} aRequest A TP.sig.TSHRunRequest in most cases.
     * @returns {Object} The updated execution instance ($SCOPE object).
     */

    var scope,

        len,
        i,

        stdin;

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
     * @method getArgument
     * @summary Returns a single value acquired from the current command node's
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
     */

    var args,
        value,
        node,
        vals;

    //  Because we supply true as the second parameter here, this method returns
    //  a pair of values per argument name: [original, expanded]
    if (TP.notValid(args = this.getArguments(aRequest, TP.ALLFORMS))) {
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
                        function(item) {
                            return item.first();
                        });
            } else {
                value = value.collect(
                        function(item) {
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
function(aRequest, forms) {

    /**
     * @method getArguments
     * @summary Returns a hash of key/value pairs where the keys are the
     *     request command node's attribute names and the values are the
     *     attribute values. These represent the named parameters and flags
     *     provided to the command. Positional arguments are named ARG0 through
     *     ARG[n] within this hash and the key ARGV contains an array of those.
     * @param {TP.sig.ShellRequest} aRequest The request to query.
     * @param {String} [forms=TP.EXPANDED] Which forms (TP.ORIGINAL,
     *     TP.EXPANDED, or TP.ALLFORMS) should be returned.
     * @returns {TP.core.Hash} The hash of named arguments with either
     *     individual expanded values, individual original values, or an Array
     *     of values for each entry (original, expanded).
     */

    var newDict,
        aspect,
        node,
        shell,
        args,
        index,
        dict,
        format,

        prefix,
        keyTester,

        argKeys,
        len,
        i,
        argKey;

    format = TP.ifInvalid(forms, TP.EXPANDED);

    if (TP.isValid(dict = aRequest.get('ARGUMENTS'))) {

        //  If the caller specified that they wanted all forms of the value,
        //  then just hand back the full dictionary.
        if (format === TP.ALLFORMS) {
            return dict;
        }

        aspect = format === TP.ORIGINAL ? 'first' : 'last';

        //  Collect the values (original or expanded) being requested.
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
                    newDict.atPut(key, val[aspect]());
                } else {
                    //  ARGV is special. It's the only nested structure.
                    arr = val.collect(
                                function(item) {
                                    return item[aspect]();
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

    /* eslint-disable consistent-this */
    shell = this;

    args = TP.elementGetAttributes(node);
    dict = TP.hc();
    index = 0;

    //  convert string values into their equivalent boolean forms and
    //  process any interpolations within attribute values
    args.perform(
        function(item) {
            var name,
                value,
                argv,
                argvParts,
                parts,
                val,
                j,
                lenj,
                argvPart,
                chunk,
                stop,
                part,
                partName,
                expandedVal,
                reParts,
                reText;

            name = item.first();
            value = TP.xmlEntitiesToLiterals(item.last().trim());

            if (name === 'tsh:argv') {

                argv = TP.ac();
                dict.atPut('ARGV', argv);

                argvParts = TP.$tokenizedSplit(value);

                lenj = argvParts.getSize();
                for (j = 0; j < lenj; j++) {
                    argvPart = argvParts.at(j);

                    //  Make sure to null out val and expandedVal
                    val = null;
                    expandedVal = null;
                    chunk = null;

                    //  Substitution/expansion logic below will require a token
                    //  to inspect so we retokenize the individual argument. If
                    //  that results in something that's not "atomic" we treat
                    //  it as a string token.
                    parts = TP.$tokenize(
                                argvPart,
                                TP.tsh.script.$tshAndJSOperators,
                                true, false, false, true);

                    if (parts.length > 1) {
                        partName = parts.at(0).name;
                        part = {
                            name: partName,
                            value: argvPart
                        };
                    } else {
                        part = parts.at(0);
                    }

                    //  If it's a Number or RegExp literal string, then
                    //  try to turn it into one of those objects
                    if (part.name === 'number') {
                        //  Handle Numbers
                        expandedVal = part.value.asNumber();
                    } else if (part.name === 'regexp') {
                        //  Handle RegExps
                        reParts = part.value.split('/');
                        reText = TP.tsh.eval.expandContent(
                                        reParts.at(1), shell, aRequest);
                        expandedVal = TP.rc(reText, reParts.at(2));
                    } else if (part.name === 'keyword' &&
                                (part.value === 'true' ||
                                 part.value === 'false')) {
                        //  Handle Booleans
                        expandedVal = TP.bc(part.value);
                    } else if (part.name === 'string') {
                        //  Handle Strings
                        if (part.value.charAt(0) === '"') {
                            //  Strip the quotes and let the expanded value be
                            //  produced down below during value expansion.
                            val = part.value.unquoted();
                        } else if (part.value.charAt(0) === '\'') {
                            //  Strip the quotes but also set the expanded value
                            //  so no further expansion happens down below.
                            expandedVal = part.value.unquoted();
                            val = part.value.unquoted();
                        }
                    } else if (part.name === 'substitution' ||
                                part.name === 'template' ||
                                part.name === 'identifier') {
                        //  Before we unquote check for `substitution`. If
                        //  we find those we need to expand content, then
                        //  optionally resolve object references to see if we
                        //  evaluated to a number, boolean, etc.
                        if (part.value.charAt(0) === '`') {
                            val = TP.tsh.eval.expandContent(part.value,
                                shell, aRequest);
                            expandedVal = shell.resolveObjectReference(val);
                            expandedVal = TP.ifUndefined(expandedVal, val);
                        } else {
                            val = part.value.unquoted();
                        }

                        if (val.startsWith('${') && val.endsWith('}')) {
                            //  This might not find a value, but if it does we
                            //  essentially are resolving the identifier.
                            expandedVal = shell.getVariable(
                                '$' + val.slice(2, -1));
                        } else if (part.name === 'identifier') {
                            expandedVal = shell.resolveObjectReference(
                                part.value);
                            expandedVal = TP.ifUndefined(expandedVal,
                                part.value);
                        }
                    } else if (part.name === 'operator' &&
                        (part.value.charAt(0) === '[' ||
                         part.value.charAt(0) === '{')) {

                        //  The trick here is that we're working with an array
                        //  of parts split on whitespace, so we can have things
                        //  like '[1' or 'a:' etc. We have to essentially scan
                        //  for the closing token and then cause our index to
                        //  adjust beyond the range of the object.
                        if (argvPart === '[]') {
                            expandedVal = [];
                        } else if (argvPart === '{}') {
                            expandedVal = {};
                        } else {
                            stop = part.value.charAt(0) === '[' ? ']' : '}';
                            chunk = '';
                            while (argvPart && argvPart.last() !== stop) {
                                chunk += argvPart;
                                j++;
                                argvPart = argvParts[j];
                            }

                            if (argvPart && argvPart.last() === stop) {
                                chunk += argvPart;
                            }

                            expandedVal = TP.$tokenizedConstruct(chunk);
                        }
                    } else {
                        expandedVal = part.value;
                    }

                    //  If we don't have an 'expanded value', then call upon the
                    //  TP.tsh.eval type to expand / resolve the value. Which
                    //  one depends on quoting and whether the value is an
                    //  atomic variable reference or not.
                    if (TP.isValid(val) && TP.notValid(expandedVal)) {
                        if (TP.regex.TSH_VARIABLE.test(val) ||
                                TP.regex.TSH_VARIABLE_DEREF.test(val)) {

                            expandedVal = shell.resolveObjectReference(
                                                                val, true);

                            //  Requote if original references were
                            //  string-based.
                            if (part.value.charAt(0) === '"') {
                                expandedVal = TP.str(expandedVal);
                            }
                        } else {
                            expandedVal = TP.tsh.eval.expandContent(
                                            val, shell, aRequest);

                            if (expandedVal === 'null') {
                                expandedVal = null;
                            } else if (expandedVal === 'undefined') {
                                expandedVal = undefined;
                            }
                        }
                    }

                    //  The value we use for the 'original' value depends on
                    //  whether the initial value was quoted. When we get
                    //  unquoted arguments (42, true, etc) we consider the
                    //  original to be that value, not the string version.
                    if (TP.regex.TSH_QUOTECHAR.test(part.value.charAt(0))) {
                        part = TP.ac(part.value, expandedVal);
                    } else if (format !== TP.EXPANDED) {
                        //  requestor asked for original values as part of
                        //  return value so we explicitly don't convert here.
                        part = TP.ac(chunk || part.value, expandedVal);
                    } else {
                        part = TP.ac(expandedVal, expandedVal);
                    }

                    dict.atPut('ARG' + index, part);
                    argv.push(part);

                    index++;
                }

            } else if (!TP.core.Shell.INVALID_ARGUMENT_MATCHER.test(name)) {
                val = value;
                expandedVal = null;

                //  Filter all of the 'internal' keys that aren't really
                //  arguments.
                if (val === 'true' || val === 'false') {
                    //  Handle Booleans
                    expandedVal = TP.bc(val);
                } else if (TP.regex.REGEX_LITERAL_STRING.test(val)) {
                    //  Handle RegExps
                    reParts = val.split('/');
                    reText = TP.tsh.eval.expandContent(
                                reParts.at(1), shell, aRequest);
                    expandedVal = TP.rc(reText, reParts.at(2));
                } else if (TP.regex.ANY_NUMBER.test(val) ||
                            TP.regex.PERCENTAGE.test(val)) {
                    expandedVal = val.asNumber();
                } else {
                    //  Handle Strings

                    //  We have three forms of "quoting" using either single,
                    //  double, or backtick for different semantic meanings.
                    if (val.charAt(0) === '"') {
                        val = val.unquoted();
                    } else if (val.charAt(0) === '\'') {
                        expandedVal = val.unquoted();
                        val = val.unquoted();
                    } else if (val.charAt(0) === '`') {
                        val = TP.tsh.eval.expandContent(value, shell, aRequest);
                        expandedVal = shell.resolveObjectReference(val);
                        expandedVal = TP.ifUndefined(expandedVal, val);
                    }

                    //  If we don't have an 'expanded value', then call upon the
                    //  TP.tsh.eval type to expand this content for us. Content
                    //  expansion includes command substitution (i.e. `...`
                    //  constructs) and template rendering but *not* variable
                    //  substitution and/or object resolution.
                    if (TP.isValid(val) && TP.notValid(expandedVal)) {
                        if (TP.regex.TSH_VARIABLE.test(val) ||
                                TP.regex.TSH_VARIABLE_DEREF.test(val)) {

                            expandedVal = shell.resolveObjectReference(
                                                                val, true);

                            //  Requote if original references were
                            //  string-based.
                            if (value.charAt(0) === '"') {
                                expandedVal = TP.str(expandedVal);
                            }
                        } else {
                            expandedVal = TP.tsh.eval.expandContent(
                                val, shell, aRequest);
                            if (expandedVal === 'null') {
                                expandedVal = null;
                            } else if (expandedVal === 'undefined') {
                                expandedVal = undefined;
                            }
                        }
                    }
                }

                //  The value we use for the 'original' value depends on whether
                //  the initial value was quoted. When we get unquoted arguments
                //  (42, true, etc) we consider the original to be that value,
                //  not the string version.
                if (TP.regex.TSH_QUOTECHAR.test(value.charAt(0))) {
                    dict.atPut(name, TP.ac(value, expandedVal));
                } else if (format !== TP.EXPANDED) {
                    //  requestor asked for original values as part of return
                    //  value so we explicitly don't convert here.
                    dict.atPut(name, TP.ac(value, expandedVal));
                } else {
                    dict.atPut(name, TP.ac(expandedVal, expandedVal));
                }
            }
        });

    /* eslint-enable consistent-this */

    //  Make sure there's at least an empty ARGV, if one hasn't been populated
    //  above.
    dict.atPutIfAbsent('ARGV', TP.ac());

    aRequest.set('ARGUMENTS', dict);

    //  Iterate over all of the arguments and, if they don't have any prefix
    //  and they're not the ARGV argument, make a prefixed version of the
    //  argument using that prefix with the same value.
    prefix = TP.w3.Xmlns.getCanonicalPrefix(
                            aRequest.at('cmdNode').namespaceURI);
    keyTester = /^(\w+:|ARGV)/;

    argKeys = TP.keys(dict);
    len = argKeys.getSize();
    for (i = 0; i < len; i++) {
        argKey = argKeys.at(i);
        if (!keyTester.test(argKey)) {
            dict.atPut(prefix + ':' + argKey, dict.at(argKey));
        }
    }

    if (this.getVariable('LOGARGS')) {
        TP.info('TSH args: ' + TP.dump(dict));
    }

    if (format === TP.ALLFORMS) {
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
     * @returns {Boolean} True if the argument exists.
     */

    this.todo();

    return false;
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('hasArguments',
function(aRequest) {

    /**
     * Returns true if the incoming request has at least one usable argument.
     * @param {TP.sig.ShellRequest} aRequest The request to query.
     * @returns {Boolean} True for non-zero argument lists.
     */

    var args,
        keys;

    args = this.getArguments(aRequest, TP.ALLFORMS);
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
     * @method getParam
     * @summary Returns a single value acquired from the current command node's
     *     child <param> tags, if any.
     * @param {TP.sig.ShellRequest} aRequest The request to query.
     * @param {String} parameterName The parameter to look up.
     * @returns {String} The parameter value.
     */

    var params;

    params = this.getParams(aRequest);

    return params.at(parameterName);
});

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('getParams',
function(aRequest) {

    /**
     * @method getParams
     * @summary Returns a hash of key/value pairs where the keys are the
     *     request command node's child <param> names and the values are the
     *     <param> values.
     * @param {TP.sig.ShellRequest} aRequest The request to query.
     * @returns {TP.core.Hash} The hash of named parameters.
     */

    var dict,

        node;

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
                    if (TP.isElement(
                                child = TP.nodeGetFirstElementChildByTagName(
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
                    if (TP.isElement(
                                child = TP.nodeGetFirstElementChildByTagName(
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
     * @method executeAbout
     * @summary Displays information about the current shell.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request or hash
     *     containing parameters.
     */

    var str;

    str = TP.ifInvalid(this.get('announcement'), '');
    str += TP.ifInvalid(this.get('introduction'), '');

    return aRequest.complete(str);
});

TP.core.Shell.addHelpTopic('about',
    TP.core.Shell.Inst.getMethod('executeAbout'),
    'Outputs a simple identification string.',
    ':about',
    'Identifies the current TIBET environment.');

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('executeAlias',
function(aRequest) {

    /**
     * @method executeAlias
     * @summary Processes alias-related commands which can list all aliases,
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

TP.core.Shell.addHelpTopic('alias',
    TP.core.Shell.Inst.getMethod('executeAlias'),
    'Define or display a command alias.',
    ':alias [name] [value]',
    'Displays all aliases, a single alias or creates/deletes an alias (to' +
    ' delete, supply null as the alias value)');

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('executeClear',
function(aRequest) {

    /**
     * @method executeClear
     * @summary Clears any receiver-related console display by issuing a
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

TP.core.Shell.addHelpTopic('clear',
    TP.core.Shell.Inst.getMethod('executeClear'),
    'Clears the console output.',
    ':clear',
    'Clears the entire console output region.');

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('executeFlag',
function(aRequest) {

    /**
     * @method executeFlag
     * @summary Processes configuration flag commands, allowing the user to
     *     view a list of all flags, flags with a specific prefix, a specific
     *     flag, or allowing a flag value to be set.
     * @param {TP.sig.ShellRequest} aRequest The request which triggered this
     *     command.
     * @returns {TP.sig.Request} The request.
     */

    var name,
        value,

        hash;

    name = this.getArgument(aRequest, 'name');
    value = this.getArgument(aRequest, 'ARG0');

    //  One common case is name=value which will mean value is empty and name
    //  isn't the real name...
    /* eslint-disable no-div-regex */
    if (/=/.test(name)) {
        value = name.slice(name.indexOf('=') + 1);
        name = name.slice(0, name.indexOf('='));
    }
    /* eslint-enable no-div-regex */

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
                TP.warn('Unknown flag: ' + name) : 0;
        }

        TP.sys.setcfg(name, value);
        aRequest.stdout(TP.sys.cfg(name));
    }

    return aRequest.complete();
});

TP.core.Shell.addHelpTopic('flag',
    TP.core.Shell.Inst.getMethod('executeFlag'),
    'Generates a list of TIBET control flags.',
    ':flag [name[=value]]',
    'Shows the names and values for all control flags if no arguments are' +
    ' supplied, shows the value for one if its name is supplied, or sets' +
    ' the value if both a name and value are supplied.');

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('executeHelp',
function(aRequest) {

    /**
     * @method executeHelp
     * @summary
     * @param {TP.sig.ShellRequest} aRequest The request which triggered this
     *     command.
     * @returns {TP.sig.Request} The request.
     */

    var topics,
        result,

        output;

    //  Grab all of the help topics that were grabbed as the commands loaded
    topics = TP.core.Shell.get('helpTopics');
    result = TP.hc();

    topics.perform(
        function(pair) {
            var cmd,
                func;

            cmd = pair.first();
            func = pair.last();

            result.atPut(cmd, func.$$abstract);
        });

    //  ---

    output = '<dl>';

    result.perform(
        function(kvPair) {

            output +=
                '<dt>' +
                    '<a href="#" onclick="TP.bySystemId(\'SherpaConsoleService\').get(\'$consoleGUI\').setInputContent(\':' + kvPair.first() + ' \'); return false;">' +
                    kvPair.first() +
                    '</a>' +
                '</dt>' +
                '<dd>' +
                    //  We don't use a CDATA section here because we can't copy
                    //  and paste entries from history on Chrome when we do:
                    //  https://bugs.chromium.org/p/chromium/issues/detail?id=696551
                    TP.xmlLiteralsToEntities(kvPair.last()) +
                '</dd>';
        });

    output += '</dl>';

    //  ---

    output += '<div style="text-align: center; font-weight: bold; font-size: large">Shortcuts</div>';

    result = TP.hc(
        '~', 'Used to reference virtual URIs',
        '!', 'Used to repeat commands',
        '%', 'Used to list jobs',
        '&', 'Used to resolve an entity',
        '=',
            'Used to escape all following content and treat like regular JS',
        ':foo',
            'Used to output a tag in the shell’s current default namespace',
        '.', 'Used as an alias for the ‘source’ or ‘import’ commands',
        '/', 'Used as an alias for the ‘flag’ command',
        '?', 'Used an an alias for the ‘help’ command'
    );

    //  ---

    output += '<dl>';

    result.perform(
        function(kvPair) {
            output +=
                '<dt>' +
                    TP.xmlLiteralsToEntities(kvPair.first()) +
                '</dt>' +
                '<dd>' +
                    //  We don't use a CDATA section here because we can't copy
                    //  and paste entries from history on Chrome when we do:
                    //  https://bugs.chromium.org/p/chromium/issues/detail?id=696551
                    TP.xmlLiteralsToEntities(kvPair.last()) +
                '</dd>';
        });

    output += '</dl>';

    aRequest.atPut('cmdAsIs', true);

    return aRequest.complete(output);
});

TP.core.Shell.addHelpTopic('help',
    TP.core.Shell.Inst.getMethod('executeHelp'),
    'Outputs a list of available commands.',
    ':Help',
    '');

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('executeSave',
function(aRequest) {

    /**
     * @method executeSave
     * @summary
     * @param {TP.sig.ShellRequest} aRequest The request which triggered this
     *     command.
     * @returns {TP.sig.Request} The request.
     */

    this.saveProfile();

    return aRequest.complete();
});

TP.core.Shell.addHelpTopic('save',
    TP.core.Shell.Inst.getMethod('executeSave'),
    'Saves current user profile settings to the persistent store.',
    ':save',
    'Saves the currect user profile settings to the browser\'s local storage.');

//  ------------------------------------------------------------------------

TP.core.Shell.Inst.defineMethod('executeSet',
function(aRequest) {

    /**
     * @method executeSet
     * @summary Sets a shell variable in response to a command request.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var varname,
        argv,
        value,
        dict;

    //  This lets us check count which affects behavior of this command.
    argv = this.getArgument(aRequest, 'ARGV', null, true, true);

    //  If no args it's a request to dump the current list.
    if (TP.isEmpty(argv)) {
        dict = TP.hc(this.getExecutionInstance());
        aRequest.stdout(dict);
        return aRequest.complete();
    }

    //  We can get the unexpanded string form of the variable from arg0.
    varname = this.getArgument(aRequest, 'ARG0', null, true, true);
    if (TP.isEmpty(varname)) {
        dict = TP.hc(this.getExecutionInstance());
        aRequest.stdout(dict);

        return aRequest.complete();
    }

    //  one arg means clear value of the variable.
    if (argv.getSize() === 1) {
        this.unsetVariable(varname);
        return aRequest.complete('Variable cleared.');
    }

    //  two args means we need the resolved value of the second argument
    value = this.getArgument(aRequest, 'ARG1');

    this.setVariable(varname, value);

    aRequest.stdout(this.getVariable(varname));

    return aRequest.complete();
});

TP.core.Shell.addHelpTopic('set',
    TP.core.Shell.Inst.getMethod('executeSet'),
    'Sets a shell variable to a specified value or clears it.',
    ':set [name] [value]',
    'Shows the names and values for all shell variables if no arguments are' +
    ' supplied, clears the value for one if its name is supplied, or sets' +
    ' the value for one if both a name and value are supplied.');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
