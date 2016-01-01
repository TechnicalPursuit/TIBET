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
 * @type {TP.core.TSH}
 * @summary TIBET's primary shell, used for content processing, script
 *     execution, and interactive development via the TIBET console.
 * @description When working in the client we found it invaluable to have an
 *     interactive tool we could use to support debugging and simple
 *     experimentation. A simple 'workspace' in Smalltalk terms. But simply
 *     eval'ing JS was pretty limiting so we started adding features like
 *     history. Before we knew it we found ourselves wanting pipes,
 *     redirections, and other UNIX shell features.
 *
 *     As the shell grew we found ourselves wanting to have an easy way to
 *     extend the command set. We were already processing XML tags as macros for
 *     generating markup and at some point we realized the entire system could
 *     be coalesced as higher-level XML scripting. That's today's TSH...UNIX
 *     meets sugared XML.
 *
 *     Today's TSH is effectively the heart of the TIBET system. When you load
 *     content it is processed by running your page through the shell as a
 *     script. There is literally no difference between a "page" and a "script"
 *     in TSH -- tags are simply commands regardless of where they are found.
 *     Non-XML formats are often converted into an XML-equivalent and processed
 *     in that form, providing ways to optimize authoring of CSS, JSON, etc.
 *
 *     In addition to executing tags and JS/TIBET source code the TSH supports
 *     history, aliases, command substitutions, and variable expansion to cut
 *     down on repetitive typing. URI expansion is done so you can use relative
 *     or virtual paths in most places you'd normally have to type a full URI.
 *     Perhaps most importantly, TSH also supports pipes and redirections
 *     between URIs, handing asynchronicity seamlessly and invisibly.
 *
 *     You can extend the shell by simply creating custom tag types, unifying
 *     how you extend the shell with how you extend your TIBET environment in
 *     general. The majority of XML syntax is hidden from you during interactive
 *     use thanks to shell sugars.
 *
 *     You can configure your shell environment using profile files which are
 *     loaded during the shell login sequence. Like other environments TIBET
 *     supports both "group level" and "user level" profile files so you can
 *     reuse common functionality across users with ease.
 *
 *     Obviously the primary goal in all of this is to support faster
 *     development of web-based applications, particularly those that leverage
 *     client-side code. Since the shell is desugaring your input into XML tags
 *     a natural workflow is to prototype in the console, then simply connect
 *     the resulting XML script to your application's events as appropriate.
 *     Since the shell and tag system are unified there's a seamless
 *     productivity gain.
 *
 *     Of course, you can also use TIBET's inheritance features to create your
 *     own shell types, with their own unique command languages. The YAK shell
 *     is an example of this. It's a shell designed specifically to chat over
 *     XMPP/Jabber from a TIBET console. The TSH is the primary development
 *     shell however.
 *
 *     TSH Character Usage:
 *
 *     The TIBET shell isn't just an "object shell" where everything within the
 *     pipes is an object, it's also an "XML shell" in the sense that everything
 *     which makes up the actual pipe structure is converted from sugared TSH
 *     syntax into equivalent XML form. The resulting XML tags are then
 *     "processed" and "run" by the shell. We obviously try to sugar things as
 *     much as possible so you don't have to deal with the verbose syntax of XML
 *     very often, in fact most shell input looks like normal JavaScript -- but
 *     you could have always entered it as strict XML. This is useful since it
 *     means entering XML and a CDATA block can always help with escaping etc.
 *
 *     From a syntax perspective a primary goal is still to evaluate native
 *     JavaScript. As a result we decided to sugar TSH using characters that are
 *     either illegal in JS, or in the context within which they appear on a
 *     particular command line.
 *
 *     The following characters are not part of the JS operator set, meaning
 *     they are never valid in unquoted portions of JS source. That being the
 *     case we've use them as somewhat primary tokens.
 *
 *
 *      @   &commat;    Dereferencing operator. Used to force the shell to treat
 *                      a variable's content object as a target during redirect
 *                      operations rather than the variable name itself.
 *
 *      \   &bsol;      Escape character. Used to escape the first command
 *                      character from shell processing so you can enter lines
 *                      starting with or symbols which might otherwise cause
 *                      command processing to occur. The result is therefore
 *                      the same as sending the command line without the
 *                      leading backslash directly to the current responder.
 *                      Anywhere else on the command line this symbol is
 *                      handled by the responder itself as an escape of the
 *                      character which follows.
 *
 *     `    &grave;     Command substitution. If a command line includes
 *                      unquoted backticks the contents are extracted,
 *                      processed, and the results are spliced back into the
 *                      original command before execution. This is similar to
 *                      tcsh but is only performed when the input is coming
 *                      from an interactive user.
 *
 *     #    &num;       Fragment/barename prefix. We use a leading # in standard
 *                      URI fragment fashion allowing easy reference to elements
 *                      within the current target document. A pipe to one of
 *                      these operators is very common.
 *
 *                      The following characters are unary operators (or valid
 *                      as a leading character like '.'), but with rules that
 *                      provided some opportunities for specific pattern usage.
 *                      We use them when they fit a pattern that wouldn't be
 *                      found in valid JS or in cases where they might be legal
 *                      but are used so infrequently that we require a leading
 *                      \ to get the default JS operation.
 *
 *     !    &excl;      History prefix, 'imperative' suffix. Equivalent to
 *                      tcsh's normal history prefixing, so !23 means event 23.
 *                      Since ! (not) is legal JS but not typical outside of
 *                      assignment or testing we require an escape to say
 *                      something like \!varname.
 *
 *     ~    &tilde;     Path prefix. This is TIBET's "virtual URI" prefix by
 *                      default; an escape must be used to have a line start
 *                      with a one's complement JS operation.
 *
 *     .    &period;    Path prefix, operator prefix. Used to delimit operators
 *                      by placing a period before the corresponding tcsh
 *                      construct. For example, .| is a pipe in TSH. Also used
 *                      in path constructs since ../ and ./ aren't valid JS
 *                      when found outside of a quoted string.
 *
 *     The following characters are valid operators, but are binary or trinary
 *     in nature so they are potentially useful when used as a leading or
 *     trailing character since that wouldn't be valid JS.
 *
 *     /    &sol;       Used in conjunction with ~ and . for paths. Also used
 *                      as prefix for shell flags such as /tsh.log_execute etc.
 *
 *     =    &equals;    Used at the start of a pipe segment as sugar for the
 *                      tsh:where tag, which serves as a filter on content.
 *
 *     &    &amp;       When prefixed (.&) this operator will pipe stderr
 *                      rather than stdout. Also used in certain combinations to
 *                      signify that error data is flowing. Reserved as a suffix
 *                      for fork().
 *
 *     %    &percnt;    Job access. When used alone this lists the current
 *                      TP.core.Job instances which are running. By listing them
 *                      you can then kill off pending/pesky ones. When used as
 *                      a unary prefix to a number that job is listed.
 *
 *     ^    &circ;      Used at start of line to perform simple regex
 *                      replacements on prior command line input. Similar to
 *                      tcsh, but we also process trailing flags so ^foo^bar^g
 *                      is a global replace and ^foo^bar^i is case-insensitive.
 *
 *     ?    &quest;     Used at the start of a line to ask for help on what
 *                      follows, so ?alias will display help on the alias
 *                      command. When added to a pipe symbol this signifies
 *                      "filter" rather than "transform" as an operation.
 *                      Reserved for URI expansion.
 *
 *     $    $dollar;    ${var} is used to specify that var should be looked up
 *                      in the shell's list of variables. Shell variables are
 *                      set using :set var and can be viewed by entering :set
 *                      with no variable name. :unset removes them.
 *
 *                      Note that unlike standard shells you must use the
 *                      bracketed notation since $ is valid JS as part of an
 *                      identifier, but it can only be followed by a-z, A-Z,
 *                      0-9, and underscore in that form.
 *
 *     < or <<          Input redirection and "here document" input.
 *
 *     > or >>          Output redirection, with and without append semantics.
 *
 *     |                Standard pipe. Output from command preceding is piped to
 *                      second command.
 *
 *     || or &&         Conditional execution combinators.
 *
 *     *    &ast;       Also reserved for URI expansion.
 *
 *     :    &colon;     Namespace qualifier. When a command is entered it is
 *                      always checked for a : to determine whether a command is
 *                      being entered or native JS. If the first word in a
 *                      statement has a colon (:) then that word is taken as
 *                      the tag/command name and that tag is looked up and
 *                      provided with the attribute (parameter) values from the
 *                      statement. A leading : simply defaults to the current
 *                      namespace which can be set via the TSH's command line.
 *                      This is typically the namespace of the current shell.
 *
 *                      Word modifier if used in a history or variable
 *                      substitution as in #3:2 which would refer to the third
 *                      word in event #3.
 *
 *     See tsh_script.js for a full description of how these characters are
 *     combined into TSH-specific operators.
 */

/* JSHint checking */

/* global netscape:false
*/

//  ------------------------------------------------------------------------

TP.core.Shell.defineSubtype('TSH');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  command and content escaping prefixes
TP.core.TSH.Type.defineConstant('ACTION_PREFIX', ':');
TP.core.TSH.Type.defineConstant('ESCAPE_PREFIX', '*');

//  how we split text buffers for subcommand processing
TP.core.TSH.Type.defineConstant('COMMAND_SPLIT_REGEX',
    /\n([-a-zA-Z_0-9]*?):([-a-zA-Z_0-9]*?)($|\s)/g);
TP.core.TSH.Type.defineConstant('COMMAND_START_REGEX',
    /^([-a-zA-Z_0-9]*?):([-a-zA-Z_0-9]*?)($|\s)/);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  standard phases for content processing pipeline. NOTE that there are two
//  other explicit phases which are not found here. The 'Construct' phase is
//  always done to any inbound content to ensure XML-compliant command text.
//  Execute is optionally done with user-generated command input after
//  all other phases have been run.
TP.core.TSH.Type.defineConstant(
    'AWAKEN_PHASES',
    TP.ac('AwakenDOM',          //  xi:includes, CSS @imports, etc.
            'AwakenEvents',     //  ev: namespace. NOTE others can generate
            'AwakenData',       //  model construct et. al.
            'AwakenInfo',       //  other info tags (acl:, dnd:, etc)
            'AwakenBinds',      //  data bindings in the bind: namespace
            'AwakenStyle'       //  CSS is last so display: none can flip
                                //  late
        ));

TP.core.TSH.Type.defineConstant(
    'CACHE_PHASES',
    TP.ac('Includes',           //  xi:includes, CSS @imports, etc.
            'Instructions',     //  ?tibet, ?xsl-stylesheet, etc.
            'Precompile',       //  conversion to compilable form
            'Compile',          //  tag/macro expansion (ACT)
            'Tidy',             //  move non-DTD content out of html:head
                                //  etc.

            'Marshal',          //  virtualize xml:base URIs, encode data
                                //  etc.
            'Store',            //  save the content in a cache/repository
            'Load',             //  load the content from a cache/repository
            'Resolve',          //  resolve xml:base TP.core.URI references,
                                //  decode etc.

            'Localize',         //  adjust for browser, lang, etc.
            'Optimize',         //  do performance-related indexing etc.
            'Finalize'));       //  complete (ready for HTML DOM etc)

TP.core.TSH.Type.defineConstant(
    'COMPILE_PHASES',
    TP.ac('Includes',           //  xi:includes, CSS @imports, etc.
            'Instructions',     //  ?tibet, ?xsl-stylesheet, etc.
            'Precompile',       //  conversion to compilable form
            'Compile'));        //  tag/macro expansion (ACT)

TP.core.TSH.Type.defineConstant(
    'EXECUTE_PHASES',
    TP.ac());                   //  rely on built-in Execute only

TP.core.TSH.Type.defineConstant(
    'NOCACHE_PHASES',
    TP.ac('Includes',           //  xi:includes, CSS @imports, etc.
            'Instructions',     //  ?tibet, ?xsl-stylesheet, etc.
            'Precompile',       //  conversion to compilable form
            'Compile',          //  tag/macro expansion (ACT)
            'Tidy',             //  move non-DTD content out of html:head
                                //  etc.

            'Localize',         //  adjust for browser, lang, etc.
            'Optimize',         //  do performance-related indexing etc.
            'Finalize'));       //  formerly known as "prepped"

TP.core.TSH.Type.defineConstant(
    'REVIVE_PHASES',
    TP.ac('Resolve',            //  move non-DTD content out of html:head
                                //  etc.
            'Localize',         //  adjust for browser, lang, etc.
            'Optimize',         //  do performance-related indexing etc.
            'Finalize'));       //  formerly known as "prepped"

TP.core.TSH.set('commandPrefix', 'tsh');

    //  set up observations for TP.sig.ShellRequests
TP.core.TSH.register();

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.TSH.Type.defineHandler('ActivationKeyUp',
function(aSignal) {

    /**
     * @method handleActivationKeyUp
     * @summary Handles when our activation key is pressed.
     * @param {DOMKeySignal} aSignal The key signal that was mapped to
     *     activating us.
     */

    //  TODO:   look back at this, we don't want this to happen when the
    //  console's already open without managing shell instances better
    return TP.core.Window.open('~tdc_html/home.html');
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the current execution context, a window or frame whose eval will be used
TP.core.TSH.Inst.defineAttribute('context');

//  index-accessible list of currently watched variables
TP.core.TSH.Inst.defineAttribute('watchArray', TP.ac());

//  key-accessible collection of variable/attribute observations
TP.core.TSH.Inst.defineAttribute('watchHash', TP.hc());

TP.core.TSH.Inst.defineAttribute('commandXMLNS', 'tsh:');

//  the XPath visualization controller object
TP.core.TSH.Inst.defineAttribute('xpathVizController');

//  whether a test is currently in process
TP.core.TSH.Inst.defineAttribute('testing', false);

//  current test count
TP.core.TSH.Inst.defineAttribute('testCount', 0);

//  what's the ID of the current test
TP.core.TSH.Inst.defineAttribute('testID');

//  was the last test successful?
TP.core.TSH.Inst.defineAttribute('testOk', true);

//  should the test been run in verbose mode?
TP.core.TSH.Inst.defineAttribute('testVerbose', false);

//  additional information presented when a shell of this type starts up
TP.core.TSH.Inst.defineAttribute('introduction', null);

//  whether or not we're watching changes to remote resources
TP.core.TSH.Inst.defineAttribute('remoteWatch');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('init',
function(aResourceID, aRequest) {

    /**
     * @method init
     * @summary Initializes a new instance.
     * @param {String} aResourceID A unique identifier for this instance.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request or hash
     *     containing an optional "parentShell" key used to define a parent for
     *     the newly constructed shell instance.
     * @returns {TP.core.TSH} A new instance.
     */

    var name;

    this.callNextMethod();

    //  force in the default XMLNS type as a type after setting our prompt
    //  to reflect the current default
    name = this.get('commandXMLNS');

    this.setPrompt(name.chop(':') + '&#160;&#187;');

    this.$set('commandXMLNS', TP.sys.require(name));

    //this.set('xpathVizController', TPXPathVizController.construct());

    return this;
});

//  ------------------------------------------------------------------------
//  STARTUP/LOGIN/LOGOUT
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('isLoginShell',
function(aRequest) {

    /**
     * @method isLoginShell
     * @summary Returns true if the receiver is a top-level login shell.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request or hash
     *     containing parameters.
     * @returns {Boolean}
     */

    var request,
        login;

    request = this.get('request');
    if (TP.isValid(request)) {
        login = request.atIfInvalid('cmdLogin', false);
        return login;
    } else {
        return this.callNextMethod();
    }
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('login',
function(aRequest) {

    /**
     * @method login
     * @summary Performs any login sequence necessary for the receiver. The
     *     TP.core.TSH relies on the current TP.sys.getEffectiveUser() value as
     *     the starting point for the login sequence. When that data is empty
     *     the current 'username' cookie for the application is used to define a
     *     default username whose profile should load.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request or hash
     *     containing parameters.
     * @returns {TP.core.TSH} The receiver.
     */

    var request,

        shell,
        successFunc,

        user,
        name,
        usernameReq;

    request = TP.request(aRequest);

    //  capture 'this' for closure purposes
    shell = this;

    successFunc = function(userName) {

        //  creating a TP.core.User instance will trigger the UI updating done
        //  based on vcard role/unit assignments (if this user has a vCard)
        TP.core.User.construct(userName);

        //  access to the shell instance through our previously defined
        //  shell = this reference
        shell.isRunning(true);
        shell.setVariable('USER', userName);

        //  store the username away in a cookie
        TP.core.Cookie.setCookie(
            'username',
            userName,
            TP.dc().addDuration('P1Y'));

        //  TODO:   clean this up with something more sensible that isn't so
        //  aware of what might be in the console (or that there is a console)

        //  start login message thread...
        TP.sig.UserOutputRequest.construct(
            TP.hc('output', '\n' +
                            'Loading and initializing user profile' +
                            ' data for user "' + userName + '"...',
                    'cssClass', 'inbound_announce',
                    'cmdAsIs', true
                    )).fire(shell);

        //  if we're logged in, initiate the run sequence which will load any
        //  startup files but allow the login output message to display by
        //  forking the call here
        /* eslint-disable no-wrap-func,no-extra-parens */
        (function() {

            shell.initProfile();

            //  notify any observers that we've logged in
            shell.signal('TP.sig.TSH_Login');

        }).fork(20);
        /* eslint-enable no-wrap-func,no-extra-parens */
    };

    //  If the user is running this shell in an already-authenticated
    //  application then we piggyback on that user information instead of asking
    //  for new information
    if (TP.notEmpty(user = request.at('username'))) {
        name = user;
    } else if (TP.isValid(user = TP.sys.getEffectiveUser()) &&
                TP.notEmpty(name = user.get('vCard').get('shortname'))) {

        this.set('username', name);

        //  There's no success or failure here - call the success handler.
        successFunc(name);

        return this;

    } else if (TP.notEmpty(user = TP.core.Cookie.getCookie('username'))) {
        //  this will remove the quotes wrapping the cookie value since
        //  TIBET cookies are stored in JS source format
        try {
            name = user.unquoted();
        } catch (e) {
            //  empty
        }
    }

    name = TP.ifEmpty(name, '');
    this.set('username', name);

    //  Demo version of prompting for a login/password. Note the nested call for
    //  the password input if the username input appears valid. This is shown
    //  'the hard way', since request subtypes would clarify the code
    //  significantly here. This version locally programs the input requests
    //  with their response handlers, an approach that would get out of hand
    //  with more than one or two chained prompts.

    //  SEE the YAK shell for the "other way", using a TP.sig.UserInputSeries

    usernameReq = TP.sig.UserInputRequest.construct(
                                    TP.hc('query', 'username:',
                                            'default', name,
                                            'async', true));

    //  response comes as a TP.sig.UserInput signal, so add a local handler
    usernameReq.defineHandler(
        'UserInput',
        function(aSignal) {

            var invalidUsernameReq,
                passwordReq,
                usernameResult;

            //  do this so the triggering request clears the queue
            if (TP.isValid(aSignal.getRequest().get('responder'))) {
                aSignal.getRequestID().signal('TP.sig.RequestCompleted');
            }

            usernameResult = aSignal.getResult();

            //  if the response wasn't adequate we can deal with that by simply
            //  reporting via an output request
            /* eslint-disable no-extra-parens */
            if (TP.notValid(usernameResult) ||
                usernameResult.getSize() < TP.core.Shell.MIN_USERNAME_LEN) {
                shell.isRunning(false);
            /* eslint-enable no-extra-parens */

                invalidUsernameReq = TP.sig.UserOutputRequest.construct(
                            TP.hc('output', 'Invalid username. Must be ' +
                                            TP.core.Shell.MIN_USERNAME_LEN +
                                            ' chars or more.',
                                    'async', true));

                invalidUsernameReq.isError(true);
                invalidUsernameReq.fire(shell);

                return;
            }

            //  a valid response means we want to formulate a request for the
            //  next step in the process, confirming the profile name by
            //  prompting for a password. NOTE that we tuck the username away in
            //  this new request to support our simple comparison in the
            //  response handler below
            passwordReq = TP.sig.UserInputRequest.construct(
                TP.hc('username', usernameResult,
                        'query', usernameResult + ' password:',
                        'default', null,
                        'hideInput', true,
                        'async', true));

            //  add a local input handler to the second-stage request which will
            //  be called when the password has been entered
            passwordReq.defineHandler(
                'UserInput',
                function(anotherSignal) {

                    var invalidPasswordReq,
                        passwordResult;

                    //  do this so the current request clears the queue
                    if (TP.isValid(
                            anotherSignal.getRequest().get('responder'))) {
                        anotherSignal.getRequestID().signal(
                            'TP.sig.RequestCompleted');
                    }

                    passwordResult = anotherSignal.getResult();

                    //  TODO: replace with decent validation hook
                    if (TP.notValid(passwordResult) ||
                        !passwordResult.equalTo(this.at('username'))) {
                        shell.isRunning(false);

                        invalidPasswordReq = TP.sig.UserOutputRequest.construct(
                                    TP.hc('output', 'Login failed.' +
                                        ' Defaulting requestor settings.' +
                                        ' Use :login to try again.'));

                        invalidPasswordReq.isError(true);
                        invalidPasswordReq.fire(shell);

                        return;
                    }

                    //  We succeeded - call the success handler.
                    successFunc(this.at('username'));

                    return;
                });

            //  second-stage (password) request and response handler are
            //  defined, now trigger them using the shell as originator
            passwordReq.fire(shell);

            return;
        });

    //  first-stage request (username) and response handler are defined so
    //  initiate the sequence, using the shell as the originator
    usernameReq.fire(shell);

    return this;
});

//  ------------------------------------------------------------------------
//  REQUEST HANDLING
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('handle',
function(aRequest) {

    /**
     * @method handle
     * @summary The primary resource/request handling method.
     * @description We override this here to enable privileges if we're on
     *     Mozilla. This avoids a lot of issues when manipulating a window or
     *     contents of a window that come from another domain. The shell
     *     variable PRIVILEGED must be true for this feature to be enabled. It's
     *     false by default.
     * @param {TP.sig.Request} aRequest The request to be serviced.
     * @returns {Object} The handler function's results.
     */

    if (TP.sys.isUA('GECKO') &&
        TP.isTrue(this.getVariable('PRIVILEGED')) &&
        TP.sys.shouldRequestPrivileges()) {
        try {
            if (TP.sys.cfg('log.privilege_requests')) {
                TP.sys.logSecurity('Privilege request at ' +
                       'handle',
                            TP.DEBUG);
            }

            netscape.security.PrivilegeManager.enablePrivilege(
                        'UniversalBrowserRead ' +
                        'UniversalBrowserWrite ' +
                        'UniversalXPConnect');
        } catch (e) {
            this.setVariable('PRIVILEGED', false);

            TP.sys.logSecurity(
                TP.join(
                'Enhanced privileges refused. Setting PRIVILEGED to',
                ' false.\n',
                'You may need signed.applets.codebase_principal_support\n',
                'set to true. See the TIBET installation guide for more.'),
                TP.WARN);
        }
    }

    //  handing off to the standard version within the scope of having
    //  acquire permission means downstream calls will have permissions
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineHandler('ShellRequest',
function(aRequest) {

    /**
     * @method handleShellRequest
     * @summary Constructs a response to the request provided. This is the
     *     entry point into the shell's input processing sequence.
     * @param {TP.sig.ShellRequest} aRequest The request to respond to.
     * @returns {TP.sig.ShellResponse} A response to the request.
     */

    //  all requests handled by the TP.core.TSH get a PID or 'process id'
    //  which can be used by responders as a threadID which can be leveraged
    //  to keep output from related requests together if desired
    aRequest.atPut('PID', this.getNextPID());

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineHandler('ShellRequestCompleted',
function(aSignal) {

    /**
     * @method handleShellRequestCompleted
     * @summary Processes notifications that a shell request the receiver
     *     processed has been completed. We use that notification to set final
     *     execution times and perform other cleanup.
     * @param {TP.sig.ShellResponse} aSignal The response signal, masquerading
     *     as a "Completed" signal.
     * @returns {TP.sig.ShellResponse} The response signal instance.
     */

    var response,
        request,

        timestart,
        timeend,
        exectime;

    response = aSignal;
    request = response.getRequest();

    //  compute/normalize our execution time information
    timestart = request.get('$timestart');
    timeend = Date.now();

    exectime = timeend - timestart;
    request.set('$exectime', TP.isNaN(exectime) ? 0 : exectime);

    return response;
});

//  ------------------------------------------------------------------------
//  EXECUTION
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('shouldComputeCosts',
function(aFlag) {

    /**
     * @method shouldComputeCosts
     * @summary Combined setter/getter for manipulating the shell's
     *     COMPUTE_COSTS variable. When this variable is true the shell will
     *     compute execution time and object creation counts among other things.
     * @param {Boolean} aFlag The optional value to set.
     * @returns {Boolean} The current setting.
     */

    if (TP.isBoolean(aFlag)) {
        this.setVariable('COMPUTE_COSTS', aFlag);
    }

    return TP.ifInvalid(this.getVariable('COMPUTE_COSTS'), false);
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('translateSymbol',
function(aString) {

    /**
     * @method translateSymbol
     * @summary Translates the symbol provided into its text equivalent. This
     *     method allows symbolic prefixes to be mapped into valid strings for
     *     help reporting and other purposes.
     * @param {String} aString The command prefix.
     * @returns {String} The translated string.
     */

    var ch,
        pre;

    if (TP.notValid(aString)) {
        return;
    }

    ch = aString.charAt(0);
    switch (ch) {
        case '@':
            pre = 'commat';
            break;
        case '\\':
            pre = 'bsol';
            break;
        case '`':
            pre = 'grave';
            break;
        case '#':
            pre = 'num';
            break;
        case '!':
            pre = 'excl';
            break;
        case '~':
            pre = 'tilde';
            break;
        case '/':
            pre = 'sol';
            break;
        case '&':
            pre = 'amp';
            break;
        case '%':
            pre = 'percnt';
            break;
        case '=':
            pre = 'equals';
            break;
        case '.':
            pre = 'period';
            break;
        case '^':
            pre = 'circ';
            break;
        case '?':
            pre = 'quest';
            break;
        case '$':
            pre = 'dollar';
            break;
        case '*':
            pre = 'ast';
            break;
        case ':':
            pre = 'colon';
            break;
        case ',':
            pre = 'comma';
            break;
        case '<':
            pre = 'lt';
            break;
        case '>':
            pre = 'gt';
            break;
        case '|':
            pre = 'brvbar';
            break;
        default:
            return aString;
    }

    return pre + aString.slice(1);
});

//  ------------------------------------------------------------------------
//  SHELL PROCESSING PIPELINE
//  ------------------------------------------------------------------------

/**
 * @Methods in this section support the core processing pipeline for shell
 *     requests. In particular, the execute method and the various helper
 *     functionsit relies upon are defined here.
 *
 *     // The invoker is responsible for reading cached reps and submitting //
 *     them to the pipeline, the pipeline only runs on content and skips //
 *     steps until reaching the phase the content already exists at. NOTE //
 *     that for shell and console input there's never a cache so things // just
 *     run as expected. for URIs it means processing is always invoked // from
 *     the URI initially so the URI can manage cached URI content.
 *
 *     // IFF the page is in a "relativized" state then the page is "revived"
 *     // by invoking each tag's revive method. NOTE that when a request's //
 *     XML shows that it's a compiled representation the previous steps // are
 *     all skipped and processing begins with this step.
 *
 *     // any tag-specific URI attributes are converted to app paths
 *
 *     // xml:base markers are resolved to application-specific paths
 *
 *     // --- // XML PRE-PROCESSING // ---
 *
 *     // resulting XML is now processed consistently with XML and browser //
 *     precedence rules to complete any "pre-processing" transformations.
 *
 *     // NOTE that doing these at this point implies that xi:include and //
 *     early-stage XSLT etc. can produce tsh:cmd tags whose content is // still
 *     in sugared form. We can allow this _when_ there is already // tsh:cmd
 *     content and the request is sugared. otherwise we should // be prepared to
 *     strip such content or "disable" it so the exec loop // ignores tags
 *     injected through those means.
 *
 *     // xi:include
 *
 *     // <?tibet?> processing instructions
 *
 *     // <?xsl-stylesheet?> instructions
 *
 *     // --- // MACRO EXPANSION // ---
 *
 *     // tags are invoked to produce their "expanded" representation, which //
 *     typically means producing XHTML content that could be injected into // a
 *     rendering surface. action tags produce XHTML as well, but rarely // alter
 *     their child content since that's often runtime-sensitive.
 *
 *     // NOTE that we only need to message the root node since expansion is a
 *     // recursive descent process and descendant content will be managed by //
 *     the initial node itself as it expands its child content
 *
 *     // NOTE that in the past this process started with XMLNS XSLT //
 *     transformations and moved on to individual tags. The proposed // approach
 *     now is that we run the tag method and let the tag fall // back to the
 *     namespace as needed
 *
 *     // NOTE that for a lot of these a single global "turn it into a // span"
 *     process could be used as a final backstop rather than // using that logic
 *     but separately for each unique namespace
 *
 *     // NOTE that this approach could use an array/push method such that //
 *     each entry in the array could be either a string/template or a // node
 *     based on the particular tag's situation. the resulting // array is then
 *     combined into a new document via a custom join() // which first converts
 *     nodes to strings, joins, then TP.node()s.
 *
 *     // NOTE that the tsh:script and tsh:cmd tags injected during // the
 *     initial processing phase can be produced in "pre-compiled // form" to
 *     keep this overhead low for interactive scripts
 *
 *     // --- // DOCUMENT REPAIR // ---
 *
 *     // with or without caching in place we want to "repair" the document so
 *     // it won't give other tools (or the browser) too much heartburn. (NOTE
 *     // that this used to be part of the finalize call, but it's not really //
 *     canvas-specific so that was an inappropriate location). if
 *     (TP.notEmpty(doc = TP.nodeGetDocument(node))) { if (TP.notEmpty(root =
 *     doc.documentElement)) { if (TP.notEmpty(wrap = TP.tpnode(root))) { if
 *     (TP.canInvoke(wrap, 'tshTidy')) { wrap.tshRepair(aRequest); }; }; }; };
 *
 *     // --- // CACHING // ---
 *
 *     // requestor is told to cache content. remaining question of what is //
 *     cached if anything is handled by the specific content type(s) if
 *     (TP.notEmpty(requestor = aRequest.get('requestor'))) { if
 *     (TP.canInvoke(requestor, 'tshStore')) { // xml:base and "base aware"
 *     attributes are marked (WHY) // any tag-specific URI attribute values are
 *     updated (WHY) requestor.tshStore(aRequest); }; };
 *
 *     // --- // PRE-RENDERING // ---
 *
 *     // MOVE MOVE MOVE to setContent as a built-in transform call, so the //
 *     shell won't actually be involved here
 *
 *     // IFF node implements finalize content, finalize for canvas, making //
 *     it possible to handle variables and processing logic that should be //
 *     updated each time a page or content is actually rendered
 *
 *     // <?tibet?> instructions are executed (do we still want this?)
 *
 *     // `command substitution` expansions (is this secure?)
 *
 *     // NEW: replace above with string template execution/evaluation // where
 *     the template is provided with the request as the // source data and the
 *     window and document are injected?
 */

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('execute',
function(aRequest) {

    /**
     * @method execute
     * @summary The main command execution method, responsible for parsing and
     *     processing shell input in a fashion suitable for the specific
     *     requirements of each shell and for the specific content being
     *     processed.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input.
     * @returns {Constant} A TP.core.Shell control constant.
     */

    var src,
        response,
        hid,

        nstype,
        tagname,
        tagtype,

        node,
        rootDoc,

        phases,
        targetPhase,

        startPhase,

        cycles,
        cyclemax,

        root,
        cmdNode,

        nextPhase;

    //  no request means no work :)
    if (TP.notValid(aRequest)) {
        return;
    }

    //  clear the result completely
    aRequest.set('result', undefined, null, true);

    aRequest.set('$timestart', Date.now());

    //  the 'cmd' slot of the request must contain the input to process
    if (TP.notValid(src = aRequest.at('cmd'))) {
        if (TP.notValid(src = aRequest.at('cmdNode'))) {
            return aRequest.fail('Invalid request input.');
        }

        aRequest.atPut('cmd', TP.nodeAsString(src, false, true));
    }

    //  ---
    //  RESPONSE PREP
    //  ---

    //  handleShellRequest should ensure we have a viable response
    //  object to work with. if not then we can't proceed
    if (TP.notValid(response = aRequest.get('response'))) {
        return aRequest.fail('No response object found.');
    }

    //  TODO:   tie this back into the shouldComputeCosts call etc.,
    //  probably should be at the command level however
    response.atPut('creations', 'off');

    //  any time we react to a command we should ensure our result is sent
    //  back as an inbound response (from the console/receiver perspective)
    response.set('messageType', 'response');

    //  ---
    //  REQUEST RECORDING
    //  ---

    //  save history if requested
    if (TP.isTrue(aRequest.at('cmdHistory'))) {
        hid = this.addHistory(aRequest);
        aRequest.atPut('cmdHistoryID', hid);
    }

    //  ---
    //  XML-IFICATION
    //  ---

    //  NOTE that this phase is always done, all other phases rely on the
    //  content being able to be massaged into XML form somehow. For all
    //  inbound content the shell adds an enclosing 'script' tag from the
    //  current XMLNS (typically tsh:). This outer tag serves as a common
    //  root which helps maintain flexibility around content processing.

    aRequest.atPut('cmdPhase', 'Construct');

    if (TP.isString(src)) {
        //  "blank" requests don't require processing
        if (TP.isEmpty(src = src.trim())) {
            return aRequest.complete();
        }

        //  ---
        //  NAMESPACE DEFINITION
        //  ---

        //  a built-in as it were...any single word ending in a : represents
        //  a potentially new default namespace. when that is recognized the
        //  shell updates that value and returns success.

        //  TODO: potentially split the buffer here based on single lines of
        //  this type and wrap each subcontent section in the proper tag.
        //  the entire buffer would then likely go into a tsh:script tag.
        if (/^(\w)*:$/.test(src)) {
            if (TP.isType(nstype = TP.sys.require(src))) {
                this.$set('commandXMLNS', nstype);
                this.setPrompt(src.chop(':') + '&#160;&#187;');

                return aRequest.complete();
            } else {
                return aRequest.fail('Unable to switch to XMLNS ' + src);
            }
        }

        //  ---
        //  CONTENT-TYPING
        //  ---

        //  requests can provide a specific XMLNS whose script tag should be
        //  used as the enclosing script execution tag. if that's not found
        //  we look to the current default XMLNS for the shell
        if (TP.isValid(nstype = aRequest.at('cmdXMLNS'))) {
            nstype = TP.sys.require(nstype);
            if (TP.notValid(nstype)) {
                return aRequest.fail(
                            'Unable to find XMLNS type: ' +
                                aRequest.at('cmdXMLNS'));
            }
        } else {
            nstype = this.get('commandXMLNS');
            if (TP.notValid(nstype)) {
                nstype = TP.sys.require('tsh:');
            }
        }

        //  most of the time we can go with the NS name + ':script', but
        //  leave the opportunity for each XMLNS to override that.
        if (TP.canInvoke(nstype, 'getTSHScriptTag')) {
            tagname = nstype.getTSHScriptTag();
        } else {
            //  NOTE that type names here are presumed to be namespace types
            //  so the resulting tag name is expected to be of the form
            //  prefix:script where prefix is the default prefix.
            tagname = nstype.getCanonicalName() + 'script';
        }

        tagtype = TP.sys.require(tagname);
        if (TP.notValid(tagtype) ||
            !TP.canInvoke(tagtype, '$xmlifyContent')) {
            return aRequest.fail(
                    'Unable to find tag type: ' + tagname);
        }

        //  before we can attempt to convert into XML we have to handle
        //  things at a token level so we can support mixed JS and XML,
        //  which means sugars for containers such as here documents and
        //  nested script tags have to be desugared before the next step.
        src = tagtype.$xmlifyContent(src, this, aRequest);

        //  try for a node now that "content" area entities have been
        //  processed along with any other high-level tag desugaring
        node = TP.nodeFromString(
                TP.join('<', tagname, '>', src,
                    '</', tagname, '>'), false);

        if (TP.notValid(node)) {
            node = TP.nodeFromString(
                TP.join('<', tagname, '><![CDATA[',
                    src, ']]></', tagname, '>'));
        }

        //  if the content isn't a valid node by now we've got a problem
        //  since the remaining steps work by leveraging polymorphic
        //  APIs on the tags
        if (TP.notValid(node)) {
            //  problem transforming command buffer into XML. Typically
            //  either malformed XML or a missing xmlns declaration.
            return aRequest.fail(
                        'Unable to create command XML: "' + src + '".');
        }
    } else if (!TP.isNode(node = src)) {
        //  if the content had been a string or node then we can work with
        //  it but otherwise we'll consider it an error
        return aRequest.fail('Invalid command: "' + src + '". Try ? or :help.');
    }

    //  all processing has to take place within a viable document, so we
    //  make sure we have a proper one here. if the node already lives in a
    //  document we presume that's the document the invoker desires.
    if (TP.isDocument(node)) {
        //  node is already a document. start here.
        rootDoc = node;

        if (TP.notValid(node)) {
            //  ouch! no content
            return aRequest.fail(
                        'Unable to process empty document.');
        }
    } else {
        if (TP.nodeIsDetached(node)) {
            rootDoc = TP.constructDocument('', 'request');
            rootDoc.documentElement.appendChild(node);
        } else {
            rootDoc = TP.nodeGetDocument(node);
        }
    }

    //  store the original root node for reference. this may change based on
    //  processing, but each phase starts from this node
    aRequest.atPut('cmdRoot', node);

    //  ---
    //  PHASED CONTENT PIPELINE
    //  ---

    //  To allow the shell to be configured for various purposes we drive
    //  everything off a list of phases. The phases map to methods in the
    //  various tag types. Different content types can provide a different
    //  set of phases to the shell to have it process their content through
    //  a different sequence but the default sequence comes from the shell
    //  itself. the only two hard-coded phases are Construct and Execute.

    //  NOTE that we are looking for one of two values here, either a string
    //  which names a pre-defined phase-set or an array containing actual
    //  phase names we want to process.
    phases = aRequest.atIfInvalid('cmdPhases', 'nocache');
    if (TP.isString(phases)) {
        phases = this.getType()[phases.toUpperCase() + '_PHASES'];
        if (TP.notValid(phases)) {
            TP.ifWarn() ?
                TP.warn('Invalid phase set in request: ' +
                            aRequest.at('cmdPhases')) : 0;

            phases = this.getType().NOCACHE_PHASES;
        }
    } else if (!TP.isArray(phases)) {
        return aRequest.fail(
                    'Invalid phase definition: ' + phases + '.');
    }

    //  we default to targeting the last phase in whatever list we were
    //  provided, but try to honor any specific target set in the request.
    targetPhase = TP.ifKeyInvalid(aRequest, 'targetPhase', phases.last());

    //  configure for our loop and termination values. we have a default
    //  parameter we start from and then allow the request to override that
    //  when the specific request may have deeper cycle requirements.
    cycles = 0;

    //  We default the maximum of the phase cycles to twice the number of
    //  our phases, unless a Number is defined in the 'cmdPhaseMax' slot of
    //  the request.
    cyclemax = aRequest.atIfInvalid('cmdPhaseMax', phases.getSize() * 2);

    aRequest.atPut('cmdPhases', phases);

    if (TP.notEmpty(phases)) {
        startPhase = TP.nodeGetStartPhase(node,
                                            phases,
                                            aRequest.at('cmdRoot'));

        aRequest.atPut('cmdPhase', phases.at(
                                        phases.getPosition(startPhase)));
        do {
            //  count cycles as a fallback limit in case phases are getting
            //  reset such that we'd otherwise loop forever
            cycles++;

            //  typically we want to restart at the root node, the node
            //  which we started with, but in some cases that node can be
            //  replaced by transformation activity, particularly when we're
            //  processing a subset of content entered interactively in the
            //  console.
            root = aRequest.at('cmdRoot');
            if (TP.nodeIsDetached(root, rootDoc)) {
                cmdNode = aRequest.at('cmdNode');
                if (TP.nodeIsDetached(cmdNode, rootDoc)) {
                    //  error. both the root and node have been swapped out
                    //  by processing of some kind and neither was replaced
                    //  in the request with a viable alternative.
                    return aRequest.fail(
                                aRequest.at('cmdPhase') +
                                ' cycle node detached: ' +
                                TP.str(cmdNode, false));
                }

                aRequest.atPut('cmdRoot', cmdNode);
            } else {
                aRequest.atPut('cmdNode', root);
            }

            //  don't process past the target phase
            if (TP.nodeHasReachedPhase(aRequest.at('cmdRoot'),
                                        targetPhase,
                                        phases,
                                        aRequest.at('cmdRoot'))) {
                break;
            }

            //  clear any nextPhase information so we don't get into a
            //  strange loop unless the phase execution demands it, then run
            //  the phase
            aRequest.atPut('nextPhase', null);
            this.$runPhase(aRequest);

            //  mark that we've processed the node this far
            TP.elementSetAttributeInNS(
                        TP.elem(aRequest.at('cmdRoot')),
                        'tibet:phase',
                        aRequest.at('cmdPhase'),
                        TP.w3.Xmlns.TIBET);

            //  compute next phase, allowing the previous processing to
            //  define where we go from here as needed.
            nextPhase = TP.ifInvalid(
                aRequest.at('nextPhase'),
                aRequest.at('cmdPhases').after(aRequest.at('cmdPhase')));

            aRequest.atPut('cmdPhase', nextPhase);
        }
        while (cycles < cyclemax &&
                TP.isValid(nextPhase) &&
                aRequest.isRunnable());
    }

    //  make sure we ended the loop the right way, otherwise warn/exit
    if (TP.notEmpty(phases) && cycles >= cyclemax) {
        return aRequest.fail(
            'Terminated content processing: content.phase_max exceeded.');
    } else if (aRequest.didComplete()) {
        //  cancelled or failed
        return aRequest;
    }

    //  ---
    //  TAG EXECUTION
    //  ---

    //  NOTE that this phase is optional, and external to the core phase
    //  execution machinery. Execution is done primarly when the shell
    //  or TP.tdp.Console provide a request and flag it for explicit
    //  execution, otherwise this phase is rarely part of the standard phase
    //  sequence.
    if (aRequest.atIfInvalid('cmdExecute', false)) {
        //  process from top again, ensuring all content is part of the
        //  execution sequence.
        root = aRequest.at('cmdRoot');
        if (TP.nodeIsDetached(root, rootDoc)) {
            cmdNode = aRequest.at('cmdNode');
            if (TP.nodeIsDetached(cmdNode, rootDoc)) {
                //  error. both the root and node have been swapped out by
                //  processing of some kind and neither was replaced in the
                //  request with a viable alternative.
                return aRequest.fail(
                            'Execution cycle node detached: ' +
                            TP.str(cmdNode, false));
            }

            aRequest.atPut('cmdRoot', cmdNode);
        } else {
            aRequest.atPut('cmdNode', root);
        }

        //  store the expanded text for history purposes. this is
        //  effectively what would be stored as the "ready to run" XML
        aRequest.atPut(
            'cmdExpansion',
            TP.nodeAsString(aRequest.at('cmdRoot'), true, false));

        //  Do the actual phase invocation.
        aRequest.atPut('cmdPhase', 'Execute');
        this.$runPhase(aRequest);
    }

    //  When no subcommands are involved (which commonly occurs if the
    //  request is doing content processing rather than interactive script
    //  execution), then we have to ensure a proper result. The default when
    //  the result is still undefined is to presume the cmdRoot.
    if (!aRequest.didComplete() && aRequest.canComplete()) {
        //  patch over result data for any callers in need of the content
        //  that was processed.
        if (TP.notValid(aRequest.get('result'))) {
            aRequest.set('result', aRequest.at('cmdRoot'), null, true);
        }

        //  NOTE that we don't worry about output of results when not
        //  executing.
        if (aRequest.at('cmdPhase') === 'Execute') {
            aRequest.complete(aRequest.get('result'));
        } else {
            aRequest.complete();
        }
    }

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('$runPhase',
function(aRequest) {

    /**
     * @method $runPhase
     * @summary Runs a particular phase of request processing based on
     *     information found in the request. Important key/value pairs include
     *     cmdPhase and cmdNode which define the phase and the node to process
     *     respectively.
     * @param {TP.sig.ShellRequest} aRequest The request containing parameter
     *     data.
     * @returns {TP.sig.ShellRequest}
     */

    var phases,
        phase,
        node,
        rootDoc,
        funcName;

    //  list of phases is needed to ensure processed nodes aren't
    //  reprocessed.
    phases = aRequest.at('cmdPhases');

    //  phase should be set by the phase iteration logic in the execute
    //  method.
    phase = aRequest.at('cmdPhase');
    if (TP.isEmpty(phase)) {
        return;
    }

    TP.ifTrace() && TP.sys.cfg('log.tsh_phases') ?
        TP.trace(Date.now() + ' TP.core.TSH ' + phase) : 0;

    //  the node we should process should be found in cmdNode. it can change
    //  between phases as replacement documents/nodes are built etc, but it
    //  should exist in some form between each processing phase, having been
    //  reset to cmdRoot after each successful pass.
    node = aRequest.at('cmdNode');
    if (TP.notValid(node)) {
        return;
    }

    //  capture a root document we can use for detachment detection
    rootDoc = TP.nodeGetDocument(node);

    //  All phase methods for the TP.core.TSH are prefixed as such.
    funcName = 'tsh' + phase;

    //  traverse the entire DOM of the current cmdRoot, processing each
    //  node for the phase in question. NOTE that the nodeDepthTraversal
    //  routine is specifically coded to handle dynamic changes to the tree
    //  that it is iterating over.
    TP.nodeDepthTraversal(
        node,
        function(child) {

            /*
            Enter function.
            */

            var type,
                retval,
                result,
                newnode,
                cmdRoot,
                message;

            //  we leverage TP.core.Node subtypes to manage
            //  type/tag-specific logic in a coherent fashion, so get a
            //  viable type. Tags we can't seem to find a type for are
            //  skipped by simply returning from the block.
            type = TP.core.Node.getConcreteType(child);
            if (TP.notValid(type)) {
                //  TODO: Return message to say 'I don't know about this type --
                //  please teach me about it' (hide behind flag for development
                //  mode, etc.)
                return;
            }

            //  so that phases aren't hard-coded into the logic we'll test
            //  here before we dispatch. this allows new kinds of content to
            //  define their own phases as long as they stick to the common
            //  prefixing rule
            if (TP.canInvoke(type, funcName)) {
                //  if the node is already processed up to the phase in
                //  question we don't want to work on it again. This can
                //  occur when a template or similar compilation returns
                //  compiled elements which refer to concrete types via
                //  tibet:tag.
                if (TP.nodeHasReachedPhase(child, phase, phases)) {
                    TP.ifTrace() &&
                            TP.$VERBOSE &&
                            TP.sys.cfg('log.tsh_phases') &&
                            TP.sys.cfg('log.tsh_phase_skips') ?
                                TP.trace('TP.core.TSH ' + phase +
                                            ' skipping: ' +
                                            TP.name(type) + ' ' +
                                            TP.nodeAsString(child,
                                                false, true)) : 0;

                    //  don't reprocess. descend or continue.
                    if (TP.isElement(
                        newnode = TP.nodeGetFirstChildElement(child))) {
                        result = newnode;
                    } else {
                        if (TP.isElement(
                            newnode = TP.nodeGetFirstSiblingElement(child))) {
                            result = newnode;
                        } else {
                            newnode = child.parentNode;
                            result = TP.ac(newnode, TP.CONTINUE);
                        }
                    }

                    //  When dealing with generated nodes we'll often have a
                    //  phase placed on the tag to ensure
                    //  TP.nodeHasReachedPhase. Once we've branched however,
                    //  we want to clear the flag.

                    //  TODO: Can't do this here because of compile errors
                    //  around including templates multiple times... Need a
                    //  fix.
                    //TP.elementRemoveAttribute(child, 'tibet:phase', true);
                } else {
                    aRequest.atPut('cmdNode', child);

                    TP.ifTrace() &&
                        TP.$VERBOSE &&
                        TP.sys.cfg('log.tsh_phases') &&
                        TP.sys.cfg('log.tsh_phase_nodes') ?
                            TP.trace(Date.now() + ' TP.core.TSH ' + phase +
                                ' ctrl: ' + TP.name(type) +
                                ' ' +
                                TP.nodeAsString(child, false, true)) : 0;

                    try {
                        result = type[funcName](aRequest);
                    } catch (e) {
                        message = 'Error running ' + TP.name(type) + '.' +
                            funcName + ': ' + e.message;

                        TP.error(message + '\n' +
                            TP.getStackInfo(e).join('\n'));

                        return aRequest.fail(TP.ec(e, message));
                    }
                }

                if (TP.isArray(result)) {
                    newnode = result.at(0);
                    retval = result.at(1);
                } else if (TP.isNode(result)) {
                    newnode = result;
                } else if (TP.notValid(result)) {
                    /*
                    //  Not a Node, an Array or one of our constants...
                    message = 'No return value running: ' +
                                TP.name(type) + '.' + funcName;
                    TP.warn(message);
                    */
                    //  Need to set both - we return result, but use retval in
                    //  tests below.
                    result = TP.DESCEND;
                    retval = TP.DESCEND;
                }

                //  after execution we have to check to be sure the various
                //  control node slots are updated relative to any node
                //  replacements etc. which may have occurred.
                if (TP.isNode(newnode)) {
                    cmdRoot = aRequest.at('cmdRoot');

                    //  If the cmdNode is the same as the cmdRoot, then that
                    //  means we're processing the node at the top of the
                    //  tree we were handed (i.e. the first node)
                    if (child === cmdRoot) {
                        //  If cmdRoot has been detached or newnode is not a
                        //  descendant of cmdRoot (i.e. the processing step
                        //  either detached it or is returning a node from a
                        //  completely new tree), then we reset it to the
                        //  newnode itself (like we did for 'cmdNode').
                        if (TP.nodeIsDetached(cmdRoot, rootDoc)) {

                            if (TP.nodeContainsNode(cmdRoot, newnode)) {
                                //  Descendant of detached root - error
                                void 0;
                            } else {
                                //  newnode is a replacement root

                                //  Update the reference to cmdRoot in the
                                //  request and set the traversal to be
                                //  TP.REPEAT.
                                aRequest.atPut('cmdRoot', newnode);

                                //  If we weren't given a value for retval,
                                //  then we set it to TP.REPEAT here because we
                                //  were simply returned a node and don't know
                                //  where to go.
                                if (TP.notValid(retval)) {
                                    retval = TP.REPEAT;
                                }
                            }
                        } else {
                            //  root is not detached - is newnode detached?
                            if (TP.nodeIsDetached(newnode, rootDoc)) {
                                //  TODO
                                void 0;
                            } else {
                                //  neither cmdRoot or newnode is detached

                                //  If we weren't given a value for retval,
                                //  then we set it to TP.REPEAT here because we
                                //  were simply returned a node and don't know
                                //  where to go.
                                if (TP.notValid(retval)) {
                                    retval = TP.REPEAT;
                                }
                            }
                        }
                    } else {
                        //  If the newnode isn't in the rootDoc, then that means
                        //  that it was returned without being placed. Do that
                        //  here, replacing the 'child'.
                        if (TP.nodeIsDetached(newnode, rootDoc)) {
                            TP.nodeReplaceChild(child.parentNode,
                                                newnode,
                                                child,
                                                false);
                        }
                    }

                    //  We didn't get set to TP.REPEAT above, so set our retval
                    //  to TP.CONTINUE
                    if (TP.notValid(retval)) {
                        retval = TP.CONTINUE;
                    }

                    aRequest.atPut('cmdNode', newnode);
                } else if (retval !== TP.BREAK) {
                    //  if we're not terminating and didn't return a new
                    //  command node it's possible that the transform could
                    //  have overlooked updating the cmdNode. we want to be
                    //  sure that the child is still contained in the node
                    //  to trap potentially bad transform logic
                    if (TP.nodeIsDetached(child, rootDoc)) {
                        message = 'TP.core.TSH ' + phase +
                                    ' node detached: ' +
                                    TP.nodeAsString(child, false);
                        TP.error(message);

                        return aRequest.fail(message);
                    }
                }
            } else {
                TP.ifTrace() &&
                        TP.$VERBOSE &&
                        TP.sys.cfg('log.tsh_phases') &&
                        TP.sys.cfg('log.tsh_phase_skips') ?
                            TP.trace('TP.core.TSH ' + phase +
                                ' skipping: ' +
                                TP.name(type) + ' ' +
                                TP.nodeAsString(child,
                                    false, true)) : 0;
            }

            return result;
        },
        null,   //  No exitFunc
        function(child) {

            /*
            Content function.
            */
            var type,
                retval,
                result,
                newnode,
                cmdRoot,
                message;

            //  We only process ProcessingInstruction 'content' nodes.
            if (child.nodeType !== Node.PROCESSING_INSTRUCTION_NODE) {
                return;
            }

            //  we leverage TP.core.Node subtypes to manage
            //  type/tag-specific logic in a coherent fashion, so get a
            //  viable type. Tags we can't seem to find a type for are
            //  skipped by simply returning from the block.
            type = TP.core.Node.getConcreteType(child);
            if (TP.notValid(type)) {
                return;
            }

            //  so that phases aren't hard-coded into the logic we'll test
            //  here before we dispatch. this allows new kinds of content to
            //  define their own phases as long as they stick to the common
            //  prefixing rule
            if (TP.canInvoke(type, funcName)) {
                aRequest.atPut('cmdNode', child);

                TP.ifTrace() &&
                        TP.$VERBOSE &&
                        TP.sys.cfg('log.tsh_phases') &&
                        TP.sys.cfg('log.tsh_phase_nodes') ?
                            TP.trace(Date.now() + ' TP.core.TSH ' + phase +
                                ' ctrl: ' + TP.name(type) +
                                ' ' +
                                TP.nodeAsString(child,
                                    false, true)) : 0;

                try {
                    result = type[funcName](aRequest);
                } catch (e) {
                    message = 'Error running ' + TP.name(type) + '.' +
                        funcName + ': ' + e.message;

                    TP.error(message + '\n' + TP.getStackInfo(e).join('\n'));

                    return aRequest.fail(TP.ec(e, message));
                }

                if (TP.isArray(result)) {
                    newnode = result.at(0);
                    retval = result.at(1);
                } else if (TP.isNode(result)) {
                    newnode = result;
                    retval = result;
                }

                //  after execution we have to check to be sure the various
                //  control node slots are updated relative to any node
                //  replacements etc. which may have occurred.
                if (TP.isNode(newnode)) {
                    cmdRoot = aRequest.at('cmdRoot');

                    //  If the cmdNode is the same as the cmdRoot, then that
                    //  means we're processing the node at the top of the
                    //  tree we were handed (i.e. the first node)
                    if (child === cmdRoot) {
                        //  If cmdRoot has been detached or newnode is not a
                        //  descendant of cmdRoot (i.e. the processing step
                        //  either detached it or is returning a node from a
                        //  completely new tree), then we reset it to the
                        //  newnode itself (like we did for 'cmdNode').
                        if (TP.nodeIsDetached(cmdRoot, rootDoc) ||
                            !TP.nodeContainsNode(cmdRoot, newnode)) {
                            aRequest.atPut('cmdRoot', newnode);
                        }
                    } else {
                        //  If the newnode isn't in the rootDoc, then that means
                        //  that it was returned without being placed. Do that
                        //  here, replacing the 'child'.
                        if (TP.nodeIsDetached(newnode, rootDoc)) {
                            TP.nodeReplaceChild(child.parentNode,
                                                newnode,
                                                child,
                                                false);
                        }
                    }

                    aRequest.atPut('cmdNode', newnode);
                } else if (retval !== TP.BREAK) {
                    //  if we're not terminating and didn't return a new
                    //  command node it's possible that the transform could
                    //  have overlooked updating the cmdNode. we want to be
                    //  sure that the child is still contained in the node
                    //  to trap potentially bad transform logic
                    if (TP.nodeIsDetached(child, rootDoc)) {
                        message = 'TP.core.TSH ' + phase +
                                    ' node detached: ' +
                                    TP.nodeAsString(child, false);
                        TP.error(message);

                        return aRequest.fail(message);
                    }
                }
            } else {
                TP.ifTrace() &&
                        TP.$VERBOSE &&
                        TP.sys.cfg('log.tsh_phases') &&
                        TP.sys.cfg('log.tsh_phase_skips') ?
                            TP.trace('TP.core.TSH ' + phase +
                                ' skipping: ' +
                                TP.name(type) + ' ' +
                                TP.nodeAsString(child,
                                    false, true)) : 0;
            }

            return result;
        });

    return aRequest;
});

//  ------------------------------------------------------------------------
//  DATA BUILT-INS
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeEcho',
function(aRequest) {

    var args;

    args = this.getArgument(aRequest, 'ARGV');
    aRequest.stdout(args.join(' '));

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeLog',
function(aRequest) {

    /**
     * @method executeLog
     * @summary Outputs a log's content to the current stdout pipeline.
     * @param {TP.sig.ShellRequest} aRequest The request which triggered this
     *     command.
     * @returns {TP.sig.Request} The request.
     */

    aRequest.stdout('Not yet implemented.');

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeLogin',
function(aRequest) {

    /**
     * @method executeLogin
     * @param {TP.sig.ShellRequest} aRequest The request which triggered this
     *     command.
     * @returns {TP.sig.Request} The request.
     */

    var args,
        name;

    args = this.getArgument(aRequest, 'ARGV');

    //  If a name was supplied, then use it. Otherwise, the current effective
    //  user's shortname or the 'username' property from a cookie will be used.
    if (TP.notEmpty(name = args.first())) {
        aRequest.atPut('username', name);
    }

    this.login(aRequest);

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeLogout',
function(aRequest) {

    /**
     * @method executeLogout
     * @param {TP.sig.ShellRequest} aRequest The request which triggered this
     *     command.
     * @returns {TP.sig.Request} The request.
     */

    var req;

    this.logout();

    req = TP.sig.UserOutputRequest.construct(
                TP.hc('output', '\n' +
                                'Logging out user "' +
                                this.get('username') +
                                '"',
                        'cssClass', 'inbound_announce',
                        'cmdAsIs', true));

    req.fire(this);

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeSort',
function(aRequest) {

    aRequest.stdout('Not yet implemented.');

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeUniq',
function(aRequest) {

    aRequest.stdout('Not yet implemented.');

    return aRequest.complete();

});

//  ------------------------------------------------------------------------
//  DEBUGGING BUILT-INS
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeBreak',
function(aRequest) {

    aRequest.stdout('Not yet implemented.');

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeExpect',
function(aRequest) {

    aRequest.stdout('Not yet implemented.');

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeWatch',
function(aRequest) {

    aRequest.stdout('Not yet implemented.');

    return aRequest.complete();
});

//  ------------------------------------------------------------------------
//  JOB BUILT-INS
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeJob',
function(aRequest) {

    aRequest.stdout('Not yet implemented.');

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeKill',
function(aRequest) {

    aRequest.stdout('Not yet implemented.');

    return aRequest.complete();
});

//  ------------------------------------------------------------------------
//  FORMATTING BUILT-INS
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeAs',
function(aRequest) {

    /**
     * @method executeAs
     * @summary Executes a formatting or template transformation operation on
     *     the current value of stdin.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var node,

        format,

        input,

        repeat,

        len,
        i,

        item,
        result;

    if (TP.notValid(node = aRequest.at('cmdNode'))) {
        return aRequest.fail();
    }

    //  'input' cannot be empty.
    if (TP.isEmpty(input = aRequest.stdin())) {
        return aRequest.fail(
            'Unable to find input for: ' + TP.str(node));
    }

    //  get our primary argument by adding true to our lookup call
    //  NB: We supply 'null' as the default value if 'tsh:format' wasn't
    //  specified.
    format = this.getArgument(aRequest, 'tsh:format', null, true);

    //  'format' might be null, but we still do the work in case 'repeat' was
    //  specified or the -asis flag was specified. In this case, the
    //  'TP.format()' call below will just hand back the original object.

    //  NB: We supply 'false' as the default value if 'tsh:repeat' wasn't
    //  specified.
    repeat = this.getArgument(aRequest, 'tsh:repeat', false);

    /* eslint-disable no-loop-func */

    len = input.getSize();
    for (i = 0; i < len; i++) {
        item = input.at(i);
        if (TP.isTrue(aRequest.at('cmdIterate'))) {
            if (TP.canInvoke(item, 'collect')) {
                result = item.collect(
                            function(it) {

                                return TP.format(
                                            it,
                                            format,
                                            TP.hc('repeat', repeat));
                            });
            } else {
                result = TP.format(item, format, TP.hc('repeat', repeat));
            }
        } else {
            result = TP.format(item, format, TP.hc('repeat', repeat));
        }

        aRequest.stdout(result);
    }

    /* eslint-enable no-loop-func */

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeDump',
function(aRequest) {

    var arg,
        obj;

    arg = this.getArgument(aRequest, 'ARG0');
    obj = this.resolveObjectReference(arg, aRequest);

    if (TP.isValid(obj)) {
        aRequest.stdout(obj, TP.request('cmdTitle', TP.name(obj)));
        aRequest.complete();
    } else {
        aRequest.fail();
    }

    return;

});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeEdit',
function(aRequest) {

    var arg,
        url,
        obj;

    arg = this.getArgument(aRequest, 'ARG0');

    if (TP.regex.URI_LIKELY.test(arg) &&
        !TP.regex.REGEX_LITERAL_STRING.test(arg)) {
        url = this.expandPath(arg);
        if (TP.isURI(url = TP.uc(url))) {
            obj = url;
        } else {
            obj = this.resolveObjectReference(arg, aRequest);
        }
    } else {
        obj = this.resolveObjectReference(arg, aRequest);
    }

    aRequest.atPut('structuredOutput', true);
    aRequest.complete(obj);

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeScreen',
function(aRequest) {

    var tdp,
        arg;

    arg = this.getArgument(aRequest, 'ARG0');

    tdp = TP.bySystemId('DeveloperPortal');
    tdp.toggleZoomed();
    tdp.setCurrentScreenCell('screen_' + arg + '_cell');
    tdp.toggleZoomed();

    aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeInspect',
function(aRequest) {

    aRequest.stdout('Not yet implemented.');

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeMan',
function(aRequest) {

    aRequest.stdout('Not yet implemented.');

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeApropos',
function(aRequest) {

    var methods,
        terms,
        limit,
        comments,
        ignorecase,
        minified,
        byName,
        byComments,
        results;

    terms = this.getArgument(aRequest, 'ARGV');
    limit = Math.max(1, this.getArgument(aRequest, 'tsh:limit', 2));
    comments = this.getArgument(aRequest, 'tsh:comments', false);
    ignorecase = this.getArgument(aRequest, 'tsh:ignorecase', true);

    //  Convert terms into regular expressions if possible. Otherwise use the
    //  original term and we'll try indexOf during checking.
    terms = terms.map(
                function(term) {
                    var regex;

                    //  Use a global regex so we can capture counts which form a
                    //  kind of aid for determining which matches are the most
                    //  relevant.
                    regex = RegExp.construct(
                                    term.unquoted(),
                                    'g' + (ignorecase ? 'i' : ''));

                    if (TP.notValid(regex)) {
                        return term;
                    }
                    return regex;
                });

    byName = TP.ac();
    byComments = TP.ac();

    methods = TP.sys.getMetadata('methods');
    methods.perform(
            function(item) {
                var name,
                    method,
                    nameMatch,
                    func,
                    text,
                    file,
                    count;

                name = item.at(0);
                method = name.split('_').last();

                func = item.at(1);

                //  Note how we go after load path here, since source paths will
                //  never be minified and that's what we check below.
                file = TP.objectGetLoadPath(func);
                text = comments ? func.getCommentText() : '';

                if (TP.isEmpty(text)) {
                    if (TP.notEmpty(file) && file.match(/\.min\./)) {
                        minified = true;
                    }
                }

                count = 0;

                terms.forEach(
                        function(term) {
                            var parts,
                                match;

                            if (TP.isString(term)) {
                                //  Split the comment using the string. The
                                //  number of parts represents one more than the
                                //  number of times that string was in the text.
                                parts = text.split(term);
                                count += parts.getSize() - 1;

                                if (method.indexOf(term) !== -1) {
                                    nameMatch = true;
                                    count += 1;
                                }

                            } else {
                                //  Our regular expressions are global so
                                //  they'll provide a match count for the total
                                //  string.
                                match = term.match(text);
                                if (TP.isValid(match)) {
                                    count += match.getSize();
                                }

                                match = term.match(method);
                                if (TP.isValid(match)) {
                                    nameMatch = true;
                                    count += match.getSize();
                                }
                            }
                        });

                if (nameMatch) {
                    byName.push(TP.ac(name, count, true));
                } else if (count >= limit) {
                    byComments.push(TP.ac(name, count, false));
                }
            });

    //  The name matches come first but we still want to sort them by any
    //  additional count information they may have.
    byName = byName.sort(
                function(a, b) {
                    if (a[1] < b[1]) {
                        return 1;
                    } else if (a[1] > b[1]) {
                        return -1;
                    } else {
                        //  counts match, order by character sequencing
                        if ([a, b].sort()[1] === b) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                });

    //  Sort comment-based matches by count. We'll append this list to the name
    //  matches for the output sequence.
    byComments = byComments.sort(
                    function(a, b) {
                        if (a[1] < b[1]) {
                            return 1;
                        } else if (a[1] > b[1]) {
                            return -1;
                        } else {
                            //  counts match, order by character sequencing
                            if ([a, b].sort()[1] === b) {
                                return -1;
                            } else {
                                return 0;
                            }
                        }
                    });

    //  Throw some separator content into the output between chunks...
    byName.unshift(TP.ac('', 0));
    byName.unshift(TP.ac('- by name', 0));

    if (comments) {
        byName.push(TP.ac('', 0));
        byName.push(TP.ac('- by comment', 0));
        byName.push(TP.ac('', 0));
        results = byName.concat(byComments);
    } else {
        results = byName;
    }

    results = results.map(
                function(result) {
                    var str;

                    str = result.at(0);
                    if (comments && result.at(1) >= limit) {
                        str += ' (' + result.at(1) + ')';
                    }

                    return str;
                });

    //  If we found any minified source along the way point that out.
    if (minified) {
        results.unshift(
            'Partial results. Some package#config files were minified.');
    }

    //  PhantomJS/CLI support requires output line-by-line.
    if (TP.sys.cfg('boot.context') === 'phantomjs') {
        results.forEach(
                function(result) {
                    aRequest.stdout(result);
                });
        return aRequest.complete();
    }

    return aRequest.complete(results);
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeDoclint',
function(aRequest) {

    var methods,
        results,
        checklib,
        filter,
        pattern,
        tags,
        aliases,
        keys,
        dups,
        fileDict,
        totalErrors,
        errorFiles,
        totalFiles,
        prefix;

    //  TODO:   migrate the actual checking code to a more reusable location.

    aRequest.atPut('cmdTAP', true);

    results = TP.ac();

    // The following tags allow duplicate entries for the same tag. This list is
    // not strictly exhaustive, but it should be adequate for now.
    dups = ['@param', '@throws', '@exception', '@fires', '@listens', '@mixes',
        '@example', '@author'];

    tags = ['@abstract', '@virtual', '@access', '@alias', '@augments',
         '@extends', '@author', '@borrows', '@callback', '@class',
         '@constructor', '@classdesc', '@constant', '@const', '@constructs',
         '@copyright', '@default', '@defaultvalue', '@deprecated',
         '@description', '@desc', '@enum', '@event', '@example', '@exports',
         '@external', '@host', '@file', '@fileoverview', '@overview', '@fires',
         '@emits', '@function', '@func', '@method', '@global', '@ignore',
         '@implements', '@inheritdoc', '@inner', '@instance', '@interface',
         '@kind', '@lends', '@license', '@listens', '@member', '@var',
         '@memberof', '@mixes', '@mixin', '@module', '@name', '@namespace',
         '@overide', '@param', '@arg', '@argument', '@private', '@property',
         '@prop', '@protected', '@public', '@readonly', '@requires', '@returns',
         '@return', '@see', '@since', '@static', '@summary', '@this', '@throws',
         '@exception', '@todo', '@tutorial', '@type', '@typedef', '@variation',
         '@version'];

    aliases = {'@virtual': '@abstract',
        '@return': '@returns',
        '@extends': '@augments',
        '@const': '@constant',
        '@defaultvalue': '@default',
        '@desc': '@description',
        '@host': '@external',
        '@fileoverview': '@overview',
        '@file': '@overview',
        '@emits': '@fires',
        // NOTE we don't convert @exception to @throws, they're different in
        // TIBET. @exception is based on raise() and @throws is via throw.
        '@function': '@method',
        '@func': '@method',
        '@member': '@var',
        '@arg': '@param',
        '@argument': '@param',
        '@prop': '@property'};

    keys = TP.keys(aliases);

    fileDict = TP.hc();

    checklib = this.getArgument(aRequest, 'tsh:tibet', false);

    filter = this.getArgument(aRequest, 'tsh:filter', null);
    if (TP.notEmpty(filter)) {
        filter = filter.unquoted();
        if (/^\/.+\/([ig]*)$/.test(filter)) {
            pattern = RegExp.construct(filter);
        }
    }

    methods = TP.sys.getMetadata('methods');
    methods.perform(function(item) {
        var name,
            func,
            file,
            lines,
            names,
            match,
            found,
            tagline,
            type,
            taglines,
            dict,
            text,
            result,
            source,
            error,
            fParams,
            cParams;

        name = item.at(0);
        func = item.at(1);

        //  Note how we go after load path here, since source paths will never
        //  be minified and that's what we check below.
        file = TP.objectGetLoadPath(func);

        lines = func.getCommentLines();
        source = func.getSourceText();
        error = {file: file, name: name, errors: TP.ac()};

        if (TP.isFalse(checklib)) {
            if (TP.boot.$uriInTIBETFormat(file).startsWith('~lib')) {
                return;
            }
        }

        if (TP.notEmpty(filter)) {
            if (TP.isValid(pattern)) {
                //  Regular expression as filter.
                if (!pattern.match(file)) {
                    return;
                }
            } else {
                //  Normal text string as filter.
                if (!TP.boot.$uriInTIBETFormat(file).contains(filter)) {
                    return;
                }
            }
        }

        //  Create an entry for every file. This will let us count total files
        //  in addition to just error files.
        if (TP.notEmpty(file)) {
            fileDict.atPut(file, null);
        }

        if (TP.notValid(lines)) {
            //  Most common issue here is running against a system that's
            //  loading minified code.
            if (TP.notEmpty(file) && !file.match(/\.min\./) &&
                    !func.$resolutionMethod) {
                text = func.toString();
                if (!TP.regex.NATIVE_CODE.test(text)) {
                    results.push(
                        {file: file, name: name, errors: ['missing comment']});
                }
            }
        } else if (lines.length === 0) {
            results.push(
                {file: file, name: name, errors: ['empty comment']});
        } else {
            // Comment. Question is, is it viable?

            //  ---
            //  tag validity and aliasing
            //  ---

            lines.forEach(function(line, index) {
                var tag;

                //  Skip lines for examples etc. which won't start with @
                if (line.charAt(0) !== '@') {
                    return;
                }

                //  Alias over any tags so our lint checks focus on a canonical
                //  variant.
                keys.forEach(function(key) {
                    var value;

                    value = aliases[key];
                    // NOTE the trailing space. This ensures we don't match
                    // @description and think it's @desc etc.
                    if (line.startsWith(key + ' ')) {
                        result = TP.ifInvalid(result, error);
                        result.errors.push('prefer ' + value + ' to ' + key);
                        lines[index] = line.replace(key, value);
                    }
                });

                //  Verify all tags are known.
                tag = line.split(' ').first();
                if (tags.indexOf(tag) === TP.NOT_FOUND) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push(tag + ' unknown');
                }
            });

            //  ---
            //  @method
            //  ---

            names = lines.filter(function(line) {
                return line.startsWith('@method ') ||
                    line.startsWith('@alias ');
            });

            if (TP.isEmpty(names)) {
                result = TP.ifInvalid(result, error);
                result.errors.push('@method missing');
            } else {

                //  The name is of the form A_B_method_name_parts where we
                //  can even have double-underscore. As a result we have to
                //  use a regex rather than split or other approaches.
                match = name.match(/^(.*?)_(.*?)_(.*)$/);

                found = false;
                names.forEach(
                        function(line) {
                            var lineParts;

                            //  Throw away tag, keeping remainder.
                            lineParts = line.split(' ').last();

                            if (match && match[3] === lineParts) {
                                found = true;
                            }
                        });

                if (!found) {

                    result = TP.ifInvalid(result, error);
                    result.errors.push('@method incorrect');
                }
            }

            //  ---
            //  duplicates
            //  ---

            //  Collect all tag-prefixed lines.
            taglines = lines.filter(function(line) {
                return line.startsWith('@');
            });

            dict = TP.hc();

            taglines.forEach(function(line) {
                var tag;

                //  Slice the tag off the front.
                tag = line.split(' ').first();

                //  Check to see if dups are allowed for this tag.
                if (dups.indexOf(tag) !== TP.NOT_FOUND) {
                    return;
                }

                //  Verify via hash lookup and add any new ones.
                if (dict.at(tag)) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('multiple ' + tag + '\'s');
                } else {
                    dict.atPut(tag, tag);
                }
            });

            //  ---
            //  summary/description
            //  ---

            //  Have to have a summary or description (preferably both ;)).
            taglines = lines.filter(function(line) {
                return line.startsWith('@summary ') ||
                    line.startsWith('@description ');
            });

            if (TP.isEmpty(taglines)) {
                result = TP.ifInvalid(result, error);
                result.errors.push('@summary/@description missing');
            }

            //  ---
            //  @param
            //  ---

            //  Collect the comment parameters...
            cParams = lines.filter(function(line) {
                return line.startsWith('@param ');
            });

            //  Collect comment parameter names. While we're processing these
            //  verify that each @param has a type definition.
            cParams =
                cParams.map(
                    function(param) {
                        var theParam,

                            paramType,
                            count,
                            i,
                            c,
                            len,
                            pname,
                            needName,
                            optional,
                            defaulted,
                            description;

                        theParam = param.slice('@param '.length);

                        //  Check for parameter type references...
                        if (theParam.indexOf('{') !== 0) {
                            // Apparently not formatted with a type for the
                            // param.
                            result = TP.ifInvalid(result, error);
                            result.errors.push('missing type for @param ');
                            needName = true;
                        } else {
                            //  Since some parameter type descriptions involve
                            //  the use of nested {}'s we need to actually do a
                            //  simple count here to be certain of our result.
                            len = theParam.length;
                            paramType = '';
                            count = 0;
                            for (i = 0; i < len; i++) {
                                c = theParam.charAt(i);
                                if (c === '}') {
                                    count--;
                                    if (count === 0) {
                                        theParam = theParam.slice(i + 1).trim();
                                        break;
                                    }
                                } else if (c === '{') {
                                    count++;
                                }
                                paramType += c;
                            }

                            //  If the braces aren't balanced we can fall off
                            //  the end. Watch out for that.
                            if (count !== 0) {
                                result = TP.ifInvalid(result, error);
                                result.errors.push(
                                        'unbalanced {}\'s in @param ');
                                needName = true;

                                // Take our best guess at what the real type and
                                // parameter name are.
                                paramType = theParam.slice(
                                                1, theParam.lastIndexOf('}'));
                                paramType =
                                    '{' + paramType.strip('{').strip('}') + '}';

                                theParam =
                                    theParam.slice(
                                        theParam.lastIndexOf('}') + 1).trim();
                            }

                            //  We want to use a leading '?' not 'null' in
                            //  types.
                            if (paramType.match(/null/)) {
                                result = TP.ifInvalid(result, error);
                                result.errors.push(
                                        'prefer {?...} in @param ');
                                needName = true;
                            }

                            //  We want function() instead of Function for
                            //  function parameters so there's a tendency to
                            //  document signature.
                            if (paramType.match(/Function/)) {
                                result = TP.ifInvalid(result, error);
                                result.errors.push(
                                        'prefer {function(...)} in @param ');
                                needName = true;
                            }

                            //  We want to use Type[] rather than Array.<Type>
                            if (paramType.match(/Array/)) {
                                result = TP.ifInvalid(result, error);
                                result.errors.push(
                                        'prefer {Type[]} in @param ');
                                needName = true;
                            }

                            //  We want to use {key: type} rather than Object.<>
                            if (paramType.match(/Object\./)) {
                                result = TP.ifInvalid(result, error);
                                result.errors.push(
                                        'prefer @param name.slot for @param ');
                                needName = true;
                            }
                        }

                        //  Param name should be next non-whitespace sequence...
                        //  or the content of ['s before any = for signifying a
                        //  default value.
                        if (theParam.charAt(0) === '[') {
                            optional = true;
                            pname = theParam.slice(1, theParam.indexOf(']'));
                            defaulted = pname.indexOf('=') !== TP.NOT_FOUND;
                            pname = pname.split('=').first();
                        } else {
                            pname = theParam.split(' ').first();
                        }

                        //  Verify the parameter has a description.
                        if (theParam.indexOf(' ') === TP.NOT_FOUND) {
                            result = TP.ifInvalid(result, error);
                            result.errors.push(
                                        'missing text for @param ');
                            needName = true;
                        } else {
                            //  There's a description. Does it indicate that we
                            //  may need optional/default value content for the
                            //  pname?
                            description =
                                theParam.slice(theParam.indexOf(' ') + 1);
                            if (description.match(/[Oo]ptional/) && !optional) {
                                result = TP.ifInvalid(result, error);
                                result.errors.push(
                                    'use [name] for optional @param ');
                                needName = true;
                            }

                            if (description.match(/[Dd]efault/) && !defaulted) {
                                result = TP.ifInvalid(result, error);
                                result.errors.push(
                                    'use [name=value] for defaulted @param ');
                                needName = true;
                            }
                        }

                        //  If we flagged a missing type we need to append the
                        //  name to the last message.
                        if (needName) {
                            result.errors.atPut(result.errors.length - 1,
                                result.errors.last() + pname);
                        }

                        //  If the param is a varargs param we should see '...'
                        //  in the type definition.
                        if (pname === 'varargs' &&
                                TP.notValid(paramType.match(/\.\.\./))) {
                            result = TP.ifInvalid(result, error);
                            result.errors.push(
                                    '@param varargs needs \'...\' in type');
                        }

                        return pname;
                    });

            //  Get the function's parameter name list.
            fParams = func.getParameterNames();

            //  Filter comment parameters to remove any nested ones.
            cParams = cParams.filter(function(pname) {
                return pname.indexOf('.') === TP.NOT_FOUND;
            });

            //  Order matters here so loop over the function signature and make
            //  sure that a) all items are accounted for, and b) the order of
            //  the items (not including "nested properties") is consistent.
            fParams.forEach(function(pname, index) {

                //  Does the parameter exist?
                if (cParams.indexOf(pname) === TP.NOT_FOUND) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('@param ' + pname + ' missing');
                } else if (cParams[index] !== pname) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('@param ' + pname + ' mismatch');
                }
            });

            //  Now for the other direction, comment parameters which are found
            //  but which are not valid in the function signature...
            cParams.forEach(function(pname) {
                if (fParams.indexOf(pname) === TP.NOT_FOUND) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('@param ' + pname + ' not in signature');
                }
            });

            if (result) {
                results.push(result);
            }


            //  ---
            //  @returns
            //  ---

            tagline = lines.detect(function(line) {
                return line.startsWith('@returns ');
            });

            //  Returns should include a type at a minimum.
            if (TP.notEmpty(tagline)) {
                type = tagline.slice(tagline.indexOf('{'),
                    tagline.lastIndexOf('}'));
                if (TP.isEmpty(type)) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('no @return type(s)');
                }
            }

            //  Remaining checks are sanity checks comparing the type and the
            //  nature of the return calls in the code.
            if (source.match(/return (.*?)/)) {
                //  Complex returns, so there should be a real @return tag.
                if (TP.isEmpty(tagline)) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('no @return for non-empty return(s)');
                } else if (type) {
                    if (source.match(/return;/)) {
                        //  At least one nullable return. Make sure the type
                        //  accounts for that.
                        if (type && !type.match(/(null|\?)/)) {
                            result = TP.ifInvalid(result, error);
                            result.errors.push(
                                'missing {?...} for nullable @return');
                        }
                    } else if (type && type.match(/null/)) {
                        result = TP.ifInvalid(result, error);
                        result.errors.push(
                            'prefer {?...} for nullable @return');
                    }
                }
            } else {
                //  No complex returns in the code.
                if (TP.notEmpty(tagline)) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('extraneous @return');
                }
            }


            //  ---
            //  other type checks
            //  ---

            //  @throws, @exception, @signal, @listens should all be done so we
            //  have a separate type and description per line.
            taglines = lines.filter(function(line) {
                return line.match(/@(throws|exception|fires|listens) /);
            });

            taglines.forEach(function(line) {
                var tag;

                tag = line.split(' ').first();

                if (TP.notEmpty(line)) {
                    type = line.slice(line.indexOf('{'),
                        line.lastIndexOf('}'));
                    if (TP.isEmpty(type)) {
                        result = TP.ifInvalid(result, error);
                        result.errors.push('no ' + tag + ' type(s)');
                    } else if (type.match(/[,|]/)) {
                        result = TP.ifInvalid(result, error);
                        result.errors.push(
                            'prefer one type per ' + tag);
                    }
                }
            });

            //  ---
            //  source checks
            //  ---

            if (source.match(/\.todo\(/)) {
                tagline = lines.detect(function(line) {
                    return line.startsWith('@todo ');
                });

                if (TP.isEmpty(tagline)) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('no @todo for TP.todo()');
                }
            }

            if (source.match(/\.signal\(/)) {
                tagline = lines.detect(function(line) {
                    return line.startsWith('@fires ');
                });

                if (TP.isEmpty(tagline)) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('no @fires for signal()');
                }
            }

            if (source.match(/\.observe\(/)) {
                tagline = lines.detect(function(line) {
                    return line.startsWith('@listens ');
                });

                if (TP.isEmpty(tagline)) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('no @listens for observe()');
                }
            }

            if (source.match(/\.raise\(/)) {
                tagline = lines.detect(function(line) {
                    return line.startsWith('@exception ');
                });

                if (TP.isEmpty(tagline)) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('no @exception for raise()');
                }
            }

            if (source.match(/throw (.*?);/)) {
                tagline = lines.detect(function(line) {
                    return line.startsWith('@throws ');
                });

                if (TP.isEmpty(tagline)) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('no @throws for throw');
                }
            }
        }
    });

    //  Output the results. Our content looks like this:
    //  [ { file: filename, name: funcname, errors: [a, b, c] }, ... ]
    //  Our goal is to coalesce by file name so we can output the set of errors
    //  specific to that file in a set.

    totalFiles = fileDict.getKeys().getSize();
    errorFiles = 0;
    totalErrors = 0;

    results.forEach(function(result) {
        var errors;

        errors = fileDict.at(result.file);
        if (TP.notValid(errors)) {
            errors = TP.ac();
        }
        fileDict.atPut(result.file, errors);

        errors.push(result);
    });

    //  Now that we've reorganized the results truncate that list. We'll use it
    //  again for line-by-line output below.
    results.length = 0;

    //  Loop over the files, sorted by name, and dump the file name and then all
    //  errors for that file.
    fileDict.getKeys().sort().forEach(function(key) {
        var entries;

        entries = fileDict.at(key);
        if (TP.notValid(entries)) {
            if (TP.notEmpty(key)) {
                results.push('ok - ' + key);
            }
            return;
        }

        errorFiles++;

        //  Output the file name.
        results.push('not ok - ' + key);

        entries.forEach(function(entry) {
            var name,
                errors;

            TP.regex.UNDERSCORES.lastIndex = 0;
            name = entry.name.replace(TP.regex.UNDERSCORES, '.');
            errors = entry.errors;

            totalErrors += errors.length;

            results.push('# ' + name + ' (' + errors.length +
                ') -> [' + errors.join(', ') + ']');
        });
    });

    //  Output some summary data.
    if (totalErrors > 0) {
        prefix = '# FAIL: ';
    } else {
        prefix = '# PASS: ';
    }

    results.push(prefix + totalErrors + ' errors in ' + errorFiles +
            ' of ' + totalFiles + ' files.');

    //  PhantomJS/CLI support requires output line-by-line.
    if (TP.sys.cfg('boot.context') === 'phantomjs') {
        results.forEach(function(result) {
            TP.sys.logTest(result);
        });
        return aRequest.complete();
    }

    return aRequest.complete(results);
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeReflect',
function(aRequest) {

    /**
     * Provides reflection data dependent on the object and parameters provided.
     * The output is based on the nature of the object being reflected upon. An
     * empty set of arguments returns usage data. A standard namespace
     * without arguments provides types on that namespace. The APP root
     * typically lists namespaces found below that root. TP will list any
     * namespaces and primitives available for further reflection. A type will
     * normally default to listing type, instance, and local methods. An
     * instance will typically default to local and instance method listings.
     * The ultimate goal is to support exploration and filtering across the
     * metadata from types to methods to method owners.
     * @param {Request} aRequest The shell request containing command arguments.
     */

    var usage,
        arg0,
        meta,
        obj,
        regex,
        keys,
        types,
        methods,
        owners,
        slots,
        filter,
        interface,
        text,
        file,
        results;

    usage = 'Usage: :reflect [target] [--interface <interface>]' +
        ' [-filter <filter> [--types] [--methods] [--owners] [--slots]';

    //  No arguments means we dump usage. Need at least a flag to list
    //  something like types.
    if (!this.hasArguments(aRequest)) {
        aRequest.stdout(usage);
        return aRequest.complete();
    }

    arg0 = this.getArgument(aRequest, 'ARG0');
    if (TP.isString(arg0)) {
        arg0 = arg0.unquoted();
    }

    filter = this.getArgument(aRequest, 'tsh:filter');
    if (TP.isString(filter)) {
        filter = filter.unquoted();
    }

    interface = this.getArgument(aRequest, 'tsh:interface');
    if (TP.isString(interface)) {
        interface = interface.unquoted();
    }

    types = this.getArgument(aRequest, 'tsh:types', false);
    methods = this.getArgument(aRequest, 'tsh:methods', false);
    owners = this.getArgument(aRequest, 'tsh:owners', false);
    slots = this.getArgument(aRequest, 'tsh:slots', false);

    //  We collect data based on potentially multiple flags so the best way to
    //  start is with an empty array we can add to.
    results = TP.ac();

    //  No specification for an object means we need a flag of some kind saying
    //  what we should list (types vs. methods).
    if (TP.isEmpty(arg0)) {

        //  Must have something to list or we just output usage.
        if (!types && !methods && !slots) {
            aRequest.stdout(usage);
            return aRequest.complete();
        }

        if (types) {
            results.addAll(
                TP.sys.getTypes().getValues().collect(function(type) {
                    return TP.name(type);
                }));
        }

        if (methods) {
            results.addAll(
                TP.sys.getMetadata('methods').getKeys().collect(
                function(key) {
                    TP.regex.UNDERSCORES.lastIndex = 0;
                    return key.replace(TP.regex.UNDERSCORES, '.');
                }));
        }

        if (slots) {
            results.addAll(
                TP.sys.getMetadata('owners').getKeys().collect(
                function(key) {
                    TP.regex.UNDERSCORES.lastIndex = 0;
                    return key.replace(TP.regex.UNDERSCORES, '.');
                }));
        }

        results.sort();

    } else {

        //  First attempt to resolve the target as a specific object name.
        obj = this.resolveObjectReference(arg0, aRequest);

        //  Second attempt :) We try to support shortened input with respect to
        //  method names in particular. If we find it via that name in the owner
        //  list we can use that list to filter back through the method keys.
        if (TP.notValid(obj)) {
            meta = TP.sys.getMetadata('methods');

            // Query for owners, but just names. We don't want to ass_ume types.
            results = TP.sys.getMethodOwners(arg0, true);
            if (TP.notEmpty(results)) {
                regex = RegExp.construct('/\.' + arg0 + '$/');
                if (TP.isValid(regex)) {
                    keys = meta.getKeys().filter(
                        function(key) {
                            return TP.notEmpty(regex.match(key));
                        });

                    if (TP.notEmpty(keys) && keys.getSize() > 1) {
                        results = keys.collect(function(key) {
                            TP.regex.UNDERSCORES.lastIndex = 0;
                            return key.replace(TP.regex.UNDERSCORES, '.');
                        });
                    } else {
                        obj = meta.at(keys.first());
                    }
                }
            } else {
                obj = meta.at(arg0);
                if (TP.notValid(obj)) {
                    obj = meta.at(arg0.replace(/\./g, '_'));
                }
            }
        }

        if (TP.isValid(obj)) {
            //  If we resolve the object reference our goal is to provide
            //  reflection data appropriate to the nature of that object.

            if (TP.isNamespace(obj)) {

                //  Namespaces don't support getInterface so we ignore any
                //  --interface value and focus on --slots, --methods, and
                //  --types as the things we can list for a namespace.

                if (slots) {
                    results.addAll(TP.keys(obj));
                } else {
                    if (methods) {
                        results.addAll(TP.keys(obj).filter(function(key) {
                            if (TP.owns(obj, key)) {
                                if (TP.isFunction(obj[key])) {
                                    return true;
                                }
                            }
                        }));
                    } else if (types) {
                        results.addAll(TP.keys(obj).filter(function(key) {
                            if (TP.owns(obj, key)) {
                                if (TP.isType(obj[key])) {
                                    return true;
                                }
                            }
                        }));
                    }
                }
                results.sort();

            } else if (TP.isType(obj)) {

                //  Types can support getInterface so we let any --interface
                //  value override any request for slots, methods, or types.

                if (TP.notEmpty(interface)) {
                    results.addAll(TP.interface(obj, interface));
                } else {
                    if (slots) {
                        results.addAll(TP.keys(obj));
                    } else {
                        if (methods) {
                            results.addAll(TP.keys(obj).filter(function(key) {
                                if (TP.owns(obj, key)) {
                                    if (TP.isFunction(obj[key])) {
                                        return true;
                                    }
                                }
                            }));
                        } else {
                            results.addAll(TP.keys(obj));
                        }
                    }
                }
                results.sort();

            } else if (TP.isFunction(obj)) {

                if (owners) {
                    // Query for owners, but just names.
                    results = TP.sys.getMethodOwners(arg0, true);
                    if (TP.notEmpty(results)) {
                        regex = RegExp.construct('/\.' + arg0 + '$/');
                        if (TP.isValid(regex)) {
                            meta = TP.sys.getMetadata('methods');
                            keys = meta.getKeys().filter(
                                function(key) {
                                    return TP.notEmpty(regex.match(key));
                                });

                            if (TP.notEmpty(keys) && keys.getSize() > 1) {
                                results = keys.collect(function(key) {
                                    TP.regex.UNDERSCORES.lastIndex = 0;
                                    return key.replace(TP.regex.UNDERSCORES, '.');
                                });
                            } else {
                                obj = meta.at(keys.first());
                            }
                        }
                    }
                } else {

                    results.push(obj.getSignature());
                    text = obj.getCommentText();

                    if (TP.isEmpty(text)) {

                        //  Note how we go after load path here, since source
                        //  paths will never be minified and that's what we
                        //  check below.
                        file = TP.objectGetLoadPath(obj);

                        if (TP.notEmpty(file)) {
                            if (file.match(/\.min\./)) {
                                results.push(
                                    'Source minified. No comment text available.');
                            } else {
                                results.push(
                                    'Uncommented :(. No comment text available.');
                            }
                        } else {
                            results.push(
                                'No source file. Native code?');
                        }
                    } else {
                        results.push(text);
                    }

                    //  But here we go after the source path for reporting
                    //  purposes.
                    results.push(TP.objectGetSourcePath(obj) || '');
                }

            } else if (!TP.isMutable(obj)) {

                //  Simple values should just output as values.
                results.push(TP.str(obj));

            } else {
                if (TP.notEmpty(interface)) {
                    results.addAll(TP.interface(obj, interface));
                } else {
                    if (slots) {
                        results.addAll(TP.keys(obj));
                    } else {
                        if (methods) {
                            results.addAll(TP.keys(obj).filter(function(key) {
                                if (TP.owns(obj, key)) {
                                    if (TP.isFunction(obj[key])) {
                                        return true;
                                    }
                                }
                            }));
                        } else {
                            results.addAll(TP.keys(obj));
                        }
                    }
                }
                results.sort();
            }
        } else if (TP.isEmpty(results)) {
            results.push(arg0 + ' not found.');
        }
    }

    if (results.length > 0) {

        //  If we have a filter try to apply it now.
        if (TP.notEmpty(filter)) {

            filter = filter.unquoted();
            regex = RegExp.construct(filter);

            results = results.filter(function(result) {
                if (TP.isValid(regex)) {
                    return regex.test(result);
                } else {
                    return result.indexOf(filter) !== TP.NOT_FOUND;
                }
            });
        }

        //  PhantomJS/CLI support requires output line-by-line.
        if (TP.sys.cfg('boot.context') === 'phantomjs') {
            results.forEach(function(result) {
                aRequest.stdout(result);
            });
            return aRequest.complete();
        }

        return aRequest.complete(results);
    } else {
        return aRequest.complete();
    }
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeFull',
function(aRequest) {

    /**
     * Expands the console into a more "full window" mode so you have as much
     * real-estate as possible.
     */

    var bootframe;

    bootframe = TP.byId('UIBOOT', top);
    if (TP.isValid(bootframe)) {
        bootframe.getContentDocument().getBody().addClass('full_console');
    }

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeEntity',
function(aRequest) {

    var arg,
        entity;

    arg = this.getArgument(aRequest, 'ARG0');
    if (TP.isValid(arg)) {
        entity = '&#' + arg.replace(';', '') + ';';
        aRequest.atPut('cmdAsIs', true);
        aRequest.stdout(entity);
    } else {
        aRequest.stdout('Entity table dump not yet implemented.');
        aRequest.complete();
    }
});

//  ------------------------------------------------------------------------
//  LOADING BUILT-INS
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeExport',
function(aRequest) {

    /**
     * @method executeExport
     * @summary Writes out the previous command buffer to the script file named
     *     as the target url.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input.
     */

    var path,
        ext,
        url,
        hid,

        request,
        content;

    //  TODO:   make this read from stdin for potential buffer content etc

    //  NB: We supply 'null' as the default value if 'tsh:ref' wasn't
    //  specified.
    path = this.getArgument(aRequest, 'tsh:href', null, true);
    if (TP.isEmpty(path)) {
        return aRequest.fail('Unable to determine target url.');
    }

    ext = TP.uriExtension(path);
    if (TP.isEmpty(ext)) {
        path = path + '.tsh';
    }

    url = TP.uc(path);
    if (TP.notValid(url)) {
        return aRequest.fail('Invalid target url.');
    }

    hid = TP.elementGetAttribute(aRequest.at('cmdNode'), 'tsh:hid', true);
    hid = TP.ifEmpty(hid, -2);
    hid = parseInt(hid, 10);
    if (TP.notValid(hid) || TP.isNaN(hid)) {
        return aRequest.fail('Invalid target history.');
    }

    //  we want the expanded form of the last command, ready for action.
    request = this.$get('history').at(hid);

    content = request.at('cmdExpansion');
    content = TP.XML_10_UTF8_HEADER + content;
    content = content.replace(/>/g, '>\n');

    aRequest.stdout(content);
    url.setContent(content, TP.request('resultType', TP.TEXT));

    url.save(TP.request('verb', TP.HTTP_PUT));

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeImport',
function(aRequest) {

    /**
     * @method executeImport
     * @summary Imports the source file referenced if it can be found. The
     *     primary value of this command is that it allows simple file patterns
     *     to be used to determine which file might be desired. For example,
     *     :import TIBETGlobals or simply Globals is enough for this command to
     *     locate the full path to the proper file and to import it.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */


    var input,

        len,
        i,

        ref,
        options,

        file,
        flag,

        url,
        resp,
        src,

        debug,

        urlLoc,
        urlName,
        urlTypeName,
        urlType;

    if (TP.notValid(aRequest.at('cmdNode'))) {
        return aRequest.fail();
    }

    //  NB: We supply 'null' as the default value if 'tsh:href' wasn't
    //  specified.
    input = this.getArgument(aRequest, 'tsh:href', null, true);
    if (TP.notValid(input)) {
        if (TP.isEmpty(input = aRequest.stdin())) {
            return aRequest.fail(
                'Unable to find reference for ' + TP.str(ref));
        }
    } else {
        input = TP.ac(input);
    }

    len = input.getSize();
    for (i = 0; i < len; i++) {
        ref = input.at(i);

        ref = TP.uriExpandPath(ref);

        options = TP.boot.$$loadpaths.grep(ref);
        if (TP.isEmpty(options)) {
            //  a file we've never seen before
            options = TP.ac(ref);
        }

        //  ambiguous...
        if (options.getSize() > 1) {
            aRequest.fail(
                'Multiple choices: ' + TP.src(options));

            continue;
        }

        file = options.collapse();
        try {
            flag = TP.sys.shouldLogCodeChanges();
            TP.sys.shouldLogCodeChanges(false);

            /*
            root.stdout('tsh:import loading source from ' + file,
                            aRequest);
            */

            url = TP.uc(file);
            if (TP.notValid(url)) {
                aRequest.fail(
                    'tsh:import failed to load ' + file);

                continue;
            }

            resp = url.getResource(TP.hc('refresh', true, 'async', false));
            if (TP.notValid(src = resp.get('result'))) {
                aRequest.fail(
                    'tsh:import failed to load ' + file);

                continue;
            }

            debug = TP.sys.shouldUseDebugger();
            TP.sys.shouldUseDebugger(false);
            TP.boot.$sourceImport(src, null, TP.str(url), null, true);

            //  Grab the location of the URL, trim it down so that its only
            //  the name of the file with no extension and see if there's
            //  now a 'type' with that name. If so, call its 'initialize()'
            //  method.
            urlLoc = url.getLocation();
            urlName = TP.uriName(urlLoc);
            urlTypeName = urlName.slice(0, urlName.lastIndexOf('.'));
            urlTypeName = urlTypeName.replace(/_/, ':');

            if (TP.isType(urlType = urlTypeName.asType()) &&
                !urlType.isInitialized() &&
                urlType.ownsMethod('initialize')) {
                try {
                    urlType.initialize();
                    urlType.isInitialized(true);
                } catch (e) {
                    this.raise(
                        'TP.sig.InitializationException',
                        'Unable to initialize ' + urlType.getName());
                }
            }
        } catch (e) {
            aRequest.fail(
                TP.ec(e, 'tsh:import failed to load ' + file));

            continue;
        } finally {
            TP.sys.shouldLogCodeChanges(flag);
            TP.sys.shouldUseDebugger(debug);
        }
    }

    aRequest.complete(url.getLocation());

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeSource',
function(aRequest) {

    /**
     * @method executeSource
     * @summary Reloads the source file from which an object was loaded. The
     *     object specification should be provided as ref="obj".
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var input,

        len,
        i,

        ref,

        $$inst,

        file,

        flag,

        url,
        resp,
        src,

        debug,

        type;

    if (TP.notValid(aRequest.at('cmdNode'))) {
        return aRequest.fail();
    }

    //  NB: We supply 'null' as the default value if 'tsh:ref' wasn't
    //  specified.
    input = this.getArgument(aRequest, 'tsh:ref', null, true);
    if (TP.notValid(input)) {
        if (TP.isEmpty(input = aRequest.stdin())) {
            return aRequest.fail(
                'Unable to find reference for ' + TP.str(input));
        }
    } else {
        input = TP.ac(input);
    }

    len = input.getSize();
    for (i = 0; i < len; i++) {
        ref = input.at(i);

        //  Try to resolve the object reference
        $$inst = this.resolveObjectReference(ref, aRequest);

        if (TP.notValid($$inst)) {
            aRequest.fail(
                'Unable to resolve object reference ' + ref);

            continue;
        }

        if (TP.notEmpty(file = TP.objectGetSourcePath($$inst))) {
            try {
                flag = TP.sys.shouldLogCodeChanges();
                TP.sys.shouldLogCodeChanges(false);

                /*
                root.stdout('tsh:source loading source from ' + file,
                    aRequest);
                */

                url = TP.uc(file);
                if (TP.notValid(url)) {
                    aRequest.fail(
                        'tsh:source failed to load ' + file);

                    continue;
                }

                resp = url.getResource(TP.hc('refresh', true, 'async', false));
                if (TP.notValid(src = resp.get('result'))) {
                    aRequest.fail(
                        'tsh:source failed to load ' + file);

                    continue;
                }

                debug = TP.sys.shouldUseDebugger();
                TP.sys.shouldUseDebugger(false);
                TP.boot.$sourceImport(src, null, file, null, true);

                //  may need to re-initialize the type
                if (TP.isType($$inst)) {
                    type = $$inst;
                } else {
                    type = $$inst.getType();
                }

                if (TP.owns(type, 'initialize')) {
                    type.initialize();
                }
            } catch (e) {
                aRequest.fail(
                    TP.ec(e, 'tsh:source failed to eval ' + file));

                continue;
            } finally {
                TP.sys.shouldLogCodeChanges(flag);
                TP.sys.shouldUseDebugger(debug);
            }
        } else {
            aRequest.fail(
                'Object ' + ref + ' source file not found.');

            continue;
        }
    }

    aRequest.complete(url.getLocation());

    return;
});

//  ------------------------------------------------------------------------
//  REFLECTION BUILT-INS
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeBuiltins',
function(aRequest) {

    aRequest.stdout('Not yet implemented.');

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeGlobals',
function(aRequest) {

    var keys;

    keys = TP.$getOwnKeys(window);
    keys = keys.select(
            function(key) {

                if (TP.isFunction(window[key]) &&
                    (window[key][TP.TRACK] === 'Global' ||
                        window[key][TP.TRACK] === 'Local')) {
                    return true;
                }

                return false;
            });

    aRequest.stdout(keys.sort().join('\n'));

    aRequest.complete(keys);
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeHelp',
function(aRequest) {

    var methods,
        shell;

    methods = this.getInterface('methods');
    methods = methods.filter(function(method) {
        return /^execute([A-Z])+/.test(method);
    });

    shell = this;

    methods = methods.map(function(method) {
        var func,
            name,
            str;

        func = shell[method];

        name = method.slice('execute'.length);

        str = ':' + name.slice(0, 1)[0].toLowerCase() + name.slice(1);

        if (TP.isFunction(func) && TP.notEmpty(func.$$abstract)) {
            str += ' - ' + func.$$abstract;
        }

        return str;
    });

    aRequest.stdout(methods.sort());

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeShorts',
function(aRequest) {

    var keys;

    keys = TP.$getOwnKeys(window);
    keys = keys.select(
            function(key) {

                if (key.indexOf('$') === 0 &&
                    TP.isFunction(window[key]) &&
                    (window[key][TP.TRACK] === 'Global' ||
                        window[key][TP.TRACK] === 'Local')) {
                    return true;
                }

                return false;
            });

    aRequest.stdout(keys.sort().join('\n'));

    aRequest.complete(keys);

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeTypes',
function(aRequest) {

    /**
     * @method executeTypes
     * @summary Returns an array of all of the types in the system. This will
     *     include native types if the 'includeNative' flag is supplied.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var includeNatives,
        typesKeys;

    if (TP.notValid(aRequest.at('cmdNode'))) {
        return aRequest.fail();
    }

    typesKeys = TP.sys.getCustomTypes().getKeys();

    includeNatives = this.getArgument(aRequest, 'tsh:includeNative');
    if (TP.isValid(includeNatives) && TP.isTrue(TP.bc(includeNatives))) {
        typesKeys.addAll(TP.sys.getNativeTypes().getKeys());
    }

    if (TP.notEmpty(typesKeys)) {
        aRequest.stdout(typesKeys.sort());
    }

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------
//  TIMING BUILT-INS
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeOpen',
function(aRequest) {

    /**
     * @summary Opens a URI in a window and completes when the onload handler
     *     within that window has properly triggered. NOTE that this is only
     *     consistent when the tibet_hook.js file is included as part of the
     *     page being loaded. When the hook file isn't available the results may
     *     be less consistent.
     */

    aRequest.stdout('Not yet implemented.');

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeSleep',
function(aRequest) {

    /**
     * @summary Sleeps a specified number of milliseconds before continuing
     *     script processing. Note that sleeps in excess of 30 seconds can only
     *     be achieved by setting tsh.max_sleep higher. script processing. Note
     *     that sleeps in excess of 30 seconds can only be achieved by setting
     *     tsh.max_sleep higher.
     */

    var ms;

    //  NB: We supply the cfg value of 'tsh.default_sleep' as the default value
    //  if 'tsh:ms' wasn't specified.
    ms = this.getArgument(aRequest,
                            'tsh:ms',
                            TP.sys.cfg('tsh.default_sleep', 1000),
                            true);

    ms = Math.max(ms, TP.sys.cfg('tsh.max_sleep', 30000));

    setTimeout(
        function() {

            aRequest.complete();
        }, ms);

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeWait',
function(aRequest) {

    /**
     * @summary Effectively pauses execution until a signal is observed. The
     *     signal can be tied to an origin, so this is effectively a way to tie
     *     shell execution timing to an $observe call.
     */

    aRequest.stdout('Not yet implemented.');

    return aRequest.complete();
});

//  ------------------------------------------------------------------------
//  TIBET COMMAND INTERFACE
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeTibet',
function(aRequest) {

    var cmd,
        args,
        argv,
        url,
        req;

    //  TODO: sanity check them for non-alphanumeric 'command line' chars.

    cmd = this.getArgument(aRequest, 'tsh:cmd', null, true);
    if (TP.isEmpty(cmd)) {
        cmd = 'help';
    }

    //  The url root we want to send to is in tds.cli.url
    url = TP.uriJoinPaths(TP.sys.getLaunchRoot(), TP.sys.cfg('tds.cli.uri'));

    //  TODO: Maybe use TP.httpEncode() here?
    url += '?cmd=' + encodeURIComponent(cmd);

    argv = this.getArgument(aRequest, 'ARGV');
    if (TP.notEmpty(argv)) {
        argv.shift();       //  pop off the first one, it's the command.
        if (TP.notEmpty(argv)) {
            argv.forEach(
                    function(item, ind) {
                        url += '&arg' + ind + '=' + encodeURIComponent(item);
                    });
        }
    }

    args = this.getArguments(aRequest);
    args.perform(
        function(arg) {
            var key,
                value;

            key = arg.first();
            value = arg.last();

            //  We already processed ARGV above, which includes all ARG*
            //  arguments.
            if (/^ARG/.test(key)) {
                return;
            }

            //  Have to get a little fancier here. If we see tsh: prefixes we
            //  want to remove those. If we don't see a value that key is a
            //  boolean flag.
            if (/tsh:/.test(key)) {
                key = key.slice(4);
            }

            url += '&' + encodeURIComponent(key);
            if (TP.notEmpty(value)) {
                if (value !== true) {
                    //  TODO: remove quotes?
                    url += '=' + encodeURIComponent(
                        ('' + value).stripEnclosingQuotes());
                }
            }
        });

    url = TP.uc(url);
    if (TP.notValid(url)) {
        return aRequest.fail('Invalid request input.');
    }

    req = url.constructRequest();

    req.defineHandler('RequestSucceeded',
                        function() {
                            aRequest.stdout(req.getResult());
                            aRequest.complete();
                        });
    req.defineHandler('RequestFailed',
                        function() {
                            aRequest.stderr(req.getResult());
                            aRequest.complete();
                        });

    url.save(req);

    return this;
});

//  ------------------------------------------------------------------------
//  FILE SYSTEM WATCH
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeListChangedRemotes',
function(aRequest) {

    var resourceHash;

    resourceHash = TP.core.URI.get('changedResources');

    //  Set cmdAsIs to false to get fancy JSON formatting.

    //  NB: We do the TP.json2js(resourceHash.asJSONSource()) shuffle because
    //  resourceHash has circular references that freak out the JSON parser.
    aRequest.stdout(TP.jsoncc(TP.json2js(resourceHash.asJSONSource())),
                    TP.hc('cmdAsIs', false));

    aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeForceRemoteRefresh',
function(aRequest) {

    TP.core.URI.refreshChangedURIs();

    aRequest.stdout('Remote refreshing complete');

    aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeToggleRemoteWatch',
function(aRequest) {

    var currentlyProcessing,

        watchSources,
        args;

    currentlyProcessing = TP.sys.cfg('uri.process_remote_changes');
    watchSources = TP.sys.cfg('uri.remote_watch_sources');
    watchSources.convert(
                function(aLocation) {
                    return TP.uriExpandPath(aLocation);
                });

    //  Then, if a URI was supplied, we add it to the 'uri.remote_watch_sources'
    //  Array.
    args = this.getArgument(aRequest, 'ARGV');
    if (TP.notEmpty(args)) {

        args.forEach(
            function(argLoc) {
                var argURI,
                    deletedCount;

                argURI = TP.uc(argLoc);
                deletedCount = watchSources.remove(argURI.getLocation());

                //  Didn't find it - add the argument's URI string value.
                if (deletedCount === 0) {
                    watchSources.push(argURI.getLocation());
                }
            });

        //  If watch sources is not empty, activate any watchers, otherwise
        //  deactivate any active ones.
        if (TP.notEmpty(watchSources)) {
            TP.core.RemoteURLWatchHandler.activateWatchers();
        } else {
            TP.core.RemoteURLWatchHandler.deactivateWatchers();
        }
    } else if (TP.notEmpty(watchSources)) {
        //  If we have watch sources, but the flag is already true, then we
        //  deactivate any active watchers.
        if (TP.isTrue(currentlyProcessing)) {
            TP.core.RemoteURLWatchHandler.deactivateWatchers();
        } else {
            TP.core.RemoteURLWatchHandler.activateWatchers();
        }
    } else {
        //  watch sources was empty, so we just deactivate any active watchers.
        TP.core.RemoteURLWatchHandler.deactivateWatchers();
    }

    //  Note here how we go after the stored value - we might have changed it
    //  above.
    if (TP.isTrue(TP.sys.cfg('uri.process_remote_changes'))) {
        aRequest.stdout('Remote resource change monitoring active for: ');

        //  Set cmdAsIs to false to get fancy JSON formatting.
        aRequest.stdout(TP.jsoncc(watchSources), TP.hc('cmdAsIs', false));
    } else {
        aRequest.stdout('Remote resource change monitoring inactive');
    }

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeToggleReportChangedRemotes',
function(aRequest) {

    var resourceHash,
        handler;

    resourceHash = TP.core.URI.get('changedResources');

    handler =
        function(aSignal) {
            var req;

            req = TP.sig.UserOutputRequest.construct(
                        TP.hc('output', 'Changed remote resources:',
                                'cmdAsIs', true,
                                'cmdBox', false,
                                'cmdRecycle', true));

            req.fire(this);

            //  Set cmdAsIs to false to get fancy JSON formatting.

            //  NB: We do the TP.json2js(resourceHash.asJSONSource())
            //  shuffle because resourceHash has circular references that
            //  freak out the JSON parser.
            req = TP.sig.UserOutputRequest.construct(
                        TP.hc('output',
                                TP.jsoncc(
                                    TP.json2js(
                                        resourceHash.asJSONSource())),
                                'cmdAsIs', false,
                                'cmdBox', false,
                                'cmdRecycle', true));

            req.fire(this);
        }.bind(this);

    if (this.get('remoteWatch')) {

        //  Toggle off

        this.ignore(resourceHash, 'Change', handler);

        this.set('remoteWatch', false);

        aRequest.stdout('Remote resource change monitoring ended.');

    } else {

        //  Toggle on

        this.observe(resourceHash, 'Change', handler);

        this.set('remoteWatch', true);

        aRequest.stdout('Remote resource change monitoring active.');
    }

    aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('getAnnouncement',
function() {

    /**
     * Returns the announcement string to use for the receiver.
     * @returns {String} The announcement string.
     */

    var str;

    str = this.$get('announcement');
    if (TP.isEmpty(str)) {
        str = TP.join('TIBET Web Shell (TSH) ', TP.sys.getLibVersion());
        this.$set('announcement', str);
    }

    return str;
});

//  ------------------------------------------------------------------------
//  HELP TOPICS
//  ------------------------------------------------------------------------

TP.core.TSH.Type.defineMethod('addHelpTopic',
function(command, abstract, usage, description) {

    /**
     * Adds a help abstract for a particular shell command. The resulting text
     * is output by the :help command.
     */

    var name,
        method;

    name = 'execute' + command.slice(1).asTitleCase();

    method = this.Inst[name];

    if (TP.isFunction(method)) {
        method.$$abstract = abstract;
        method.$$usage = usage;
        method.$$description = description;
    } else {
        if (TP.sys.cfg('tsh.warn_extra_help')) {
            TP.warn('Defining help for non-existent shell command: ' + command);
        }
    }

    return method;
});

//  ------------------------------------------------------------------------

TP.core.TSH.addHelpTopic(':about', 'Outputs a simple identification string.');
TP.core.TSH.addHelpTopic(':alias', 'Define or display a command alias.');
TP.core.TSH.addHelpTopic(':apropos', 'List methods related to a topic.');
TP.core.TSH.addHelpTopic(':as', 'Transforms stdin and writes it to stdout.');
TP.core.TSH.addHelpTopic(':break', 'Sets a debugger breakpoint.');
TP.core.TSH.addHelpTopic(':builtins', 'Lists the available built-in functions.');
TP.core.TSH.addHelpTopic(':change', 'Stores a string as a change log entry.');
TP.core.TSH.addHelpTopic(':changedFS', 'Displays a list of pending FS changes.');
TP.core.TSH.addHelpTopic(':clear', 'Clears the console output region.');
TP.core.TSH.addHelpTopic(':colors', 'Generates a table of the 216 websafe colors.');
TP.core.TSH.addHelpTopic(':counts', 'Generates a table of object creation counts.');
TP.core.TSH.addHelpTopic(':doclint', 'Run a lint check on all method comments.');
TP.core.TSH.addHelpTopic(':dump', 'Dumps a detailed version of stdout to stdout.');
TP.core.TSH.addHelpTopic(':echo', 'Echoes the arguments provided for debugging.');
TP.core.TSH.addHelpTopic(':edit', 'Generates an editor for the value at stdin.');
TP.core.TSH.addHelpTopic(':entity', 'Generates a table of XML entity codes.');
TP.core.TSH.addHelpTopic(':expect', 'Sets an expectation to be verified.');
TP.core.TSH.addHelpTopic(':export', 'Writes the previous buffer to a target.');
TP.core.TSH.addHelpTopic(':flag', 'Generates a table of TIBET control flags.');
TP.core.TSH.addHelpTopic(':globals', 'Display global variables, functions, etc.');
TP.core.TSH.addHelpTopic(':halo', 'Sets up the Halo on a visible document.');
TP.core.TSH.addHelpTopic(':help', 'Outputs a list of available commands.');
TP.core.TSH.addHelpTopic(':import', 'Loads/executes a JavaScript/TIBET source file.');
TP.core.TSH.addHelpTopic(':inspect', 'Generates an inspector for stdin data.');
TP.core.TSH.addHelpTopic(':instrument', 'Instrument a window/frame for TIBET.');
TP.core.TSH.addHelpTopic(':interests', 'Displays the XML-based signal interest map.');
TP.core.TSH.addHelpTopic(':job', 'Generates a table of active "processes".');
TP.core.TSH.addHelpTopic(':kill', 'Kill an active TIBET "job" instance.');
TP.core.TSH.addHelpTopic(':line', 'Displays a line number from a URI[line] entry.');
TP.core.TSH.addHelpTopic(':lint', 'Lint check an object or set of objects.');
TP.core.TSH.addHelpTopic(':load', 'Loads the content text and/or xml of a URI.');
TP.core.TSH.addHelpTopic(':log', 'Generates a listing of a particular log.');
TP.core.TSH.addHelpTopic(':login', 'Logs in to a specific user profile.');
TP.core.TSH.addHelpTopic(':logout', 'Logs out of a specific user profile.');
TP.core.TSH.addHelpTopic(':ls', 'Lists the contents of the current path.');
TP.core.TSH.addHelpTopic(':open', 'Opens a URI in a window/canvas.');
TP.core.TSH.addHelpTopic(':reflect', 'Output targeted reflection data/metadata.');
TP.core.TSH.addHelpTopic(':save', 'Saves current data to the current user profile.');
TP.core.TSH.addHelpTopic(':screen', 'Sets the canvas being viewed to a screen.');
TP.core.TSH.addHelpTopic(':set', 'Sets a shell variable to a specified value.');
TP.core.TSH.addHelpTopic(':sleep', 'Pauses and waits a specified amount of time.');
TP.core.TSH.addHelpTopic(':shorts', 'Outputs a list of "shortcut" functions.');
TP.core.TSH.addHelpTopic(':sort', 'Sorts stdin and writes it to stdout.');
TP.core.TSH.addHelpTopic(':source', 'Reloads the source file for an object/type.');
TP.core.TSH.addHelpTopic(':sourceFS', 'Sources in pending file system changes.');
TP.core.TSH.addHelpTopic(':sync', 'Updates a target file relative to a source file.');
TP.core.TSH.addHelpTopic(':test', 'Executes an object\'s tests or test suite.');
TP.core.TSH.addHelpTopic(':tibet', 'Runs a tibet CLI call. Requires active TDS.');
TP.core.TSH.addHelpTopic(':tidy', 'Runs a URI through the HTML Tidy service.');
TP.core.TSH.addHelpTopic(':types', 'Outputs a list of available system types.');
TP.core.TSH.addHelpTopic(':uniq', 'Uniques stdin and writes it to stdout.');
TP.core.TSH.addHelpTopic(':unwatchFS', 'Ignores file system changes. Requires TDS.');
TP.core.TSH.addHelpTopic(':validate', 'Runs the W3C validation service on a URL.');
TP.core.TSH.addHelpTopic(':wait', 'Pauses execution until a signal is received.');
TP.core.TSH.addHelpTopic(':watch', 'Sets a value watch expression to be monitored.');
TP.core.TSH.addHelpTopic(':watchFS', 'Observes file system changes. Requires TDS.');
TP.core.TSH.addHelpTopic(':xpath', 'Executes an XPath expression against a node.');
TP.core.TSH.addHelpTopic(':xslt', 'Transforms a node using an XSLT node/file.');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
