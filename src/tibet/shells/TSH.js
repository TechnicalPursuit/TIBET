//  ========================================================================
/*
NAME:   TP.core.TSH.js
AUTH:   Scott Shattuck (ss)
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
 * @type {TP.core.TSH}
 * @synopsis TIBET's primary shell, used for content processing, script
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
 *      @   &commat;    Load/execute TSH script file. This is analoguous to the
 *                      Oracle command line's use of as a way of loading a SQL
 *                      file and running it. In our case however the file must
 *                      be a valid file containing... more TSH :).
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
 * @todo
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
            'Unmarshal',        //  resolve xml:base TP.core.URI references,
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
    TP.ac('Unmarshal',          //  move non-DTD content out of html:head
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

TP.core.TSH.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Prepares the type for operation by initializing any data
     *     structures or other components.
     */

    //  the announcement used when a shell of this type logs out
    TP.core.TSH.Inst.defineAttribute('goodbye',
        'logged out at ' + TP.dc().toLocaleString());

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Type.defineMethod('handleActivationKeyUp',
function(aSignal) {

    /**
     * @name handleActivationKeyUp
     * @synopsis Handles when our activation key is pressed.
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

//  the announcement used when a shell of this type starts up
TP.core.TSH.Inst.defineAttribute('announcement',
    TP.join('TIBET&#8482; Interactive Web Shell (TP.core.TSH) ',
            TP.sys.getLibVersion(), '\n',
            'Copyright (C) 1999, Technical Pursuit Inc, ',
            'All Rights Reserved. Patents Pending.'));

//  additional information presented when a shell of this type starts up
TP.core.TSH.Inst.defineAttribute('introduction', null);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('init',
function(aResourceID, aRequest) {

    /**
     * @name init
     * @synopsis Initializes a new instance.
     * @param {String} aResourceID A unique identifier for this instance.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request or hash
     *     containing an optional "parentShell" key used to define a parent for
     *     the newly constructed shell instance.
     * @returns {TP.core.TSH} A new instance.
     * @todo
     */

    var name;

    this.callNextMethod();

    //  force in the default XMLNS type as a type after setting our prompt
    //  to reflect the current default
    name = this.get('commandXMLNS');

    this.setPrompt(name.chop(':') + '&nbsp;&#187;');

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
     * @name isLoginShell
     * @synopsis Returns true if the receiver is a top-level login shell.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request or hash
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
     * @name login
     * @synopsis Performs any login sequence necessary for the receiver. The
     *     TP.core.TSH relies on the current TP.sys.getEffectiveUser() value as
     *     the starting point for the login sequence. When that data is empty
     *     the current 'username' cookie for the application is used to define a
     *     default username whose profile should load.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request or hash
     *     containing parameters.
     * @returns {TP.core.TSH} The receiver.
     * @todo
     */

    var user,
        name,
        shell,
        req;

    //  capture 'this' for closure purposes
    shell = this;

    //  If the user is running this shell in an already-authenticated
    //  application then we piggyback on that user information instead of asking
    //  for new information
    if (TP.notEmpty(user = aRequest.at('username'))) {
        name = user;
    } else if (TP.notEmpty(user = TP.sys.getEffectiveUser())) {

        name = user.get('shortname');

        //  When we've got a user we just silently load their profile and be
        //  done with it so there's no prompting etc. and no interference
        shell.initProfile();

    } else if (TP.notEmpty(user = TP.core.Cookie.getCookie('username'))) {
        //  this will remove the quotes wrapping the cookie value since
        //  TIBET cookies are stored in JS source format
        try {
            name = user.unquoted();
        } catch (e) {
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

    req = TP.sig.UserInputRequest.construct(
                                    TP.hc('query', 'username:',
                                            'default', name,
                                            'async', true));

    //  response comes as a TP.sig.UserInput signal, so add a local handler
    req.defineMethod(
        'handleUserInput',
        function(aSignal) {

            var req,
                res,
                responder;

            //  do this so the triggering request clears the queue
            if (TP.isValid(responder =
                            aSignal.getRequest().get('responder'))) {
                aSignal.getRequestID().signal('TP.sig.RequestCompleted');
            }

            res = aSignal.getResult();

            //  if the response wasn't adequate we can deal with that by simply
            //  reporting via an output request
            if (TP.notValid(res) ||
                (res.getSize() < TP.core.Shell.MIN_USERNAME_LEN)) {
                shell.isRunning(false);

                req = TP.sig.UserOutputRequest.construct(
                            TP.hc('output', 'Invalid username. Must be ' +
                                            TP.core.Shell.MIN_USERNAME_LEN +
                                            ' chars or more.',
                                    'async', true));

                req.isError(true);
                req.fire(shell);

                return;
            }

            //  a valid response means we want to formulate a request for the
            //  next step in the process, confirming the profile name by
            //  prompting for a password. NOTE that we tuck the username away in
            //  this new request to support our simple comparison in the
            //  response handler below
            req = TP.sig.UserInputRequest.construct(
                TP.hc('username', res,
                        'query', res + ' password:',
                        'default', null,
                        'hideInput', true,
                        'async', true));

            //  add a local input handler to the second-stage request which will
            //  be called when the password has been entered
            req.defineMethod(
                'handleUserInput',
                function(anotherSignal) {

                    var req,
                        res,
                        thread,
                        responder;

                    //  do this so the current request clears the queue
                    if (TP.isValid(responder =
                        anotherSignal.getRequest().get('responder'))) {
                        anotherSignal.getRequestID().signal(
                            'TP.sig.RequestCompleted');
                    }

                    res = anotherSignal.getResult();

                    //  TODO: replace with decent validation hook
                    if (TP.notValid(res) ||
                        !res.equalTo(this.at('username'))) {
                        shell.isRunning(false);

                        req = TP.sig.UserOutputRequest.construct(
                                    TP.hc('output', 'Login failed.' +
                                        ' Defaulting requestor settings.' +
                                        ' Use :login to try again.'));

                        req.isError(true);
                        req.fire(shell);

                        return;
                    }

                    //  creating a TP.core.User instance will trigger the UI
                    //  updating done based on vcard role/unit assignments (if
                    //  this user has a vCard)
                    TP.core.User.construct(this.at('username'));

                    //  access to the shell instance through our previously
                    //  defined shell = this reference
                    shell.isRunning(true);
                    shell.setVariable('USER', this.at('username'));

                    TP.core.Cookie.setCookie('username',
                        this.at('username'),
                        TP.dc().addDuration('P1Y'));

                    //  TODO:   clean this up with something more sensible that
                    //  isn't so aware of what might be in the console (or that
                    //  there is a console)

                    //  space down from current location/announce
                    TP.sig.UserOutputRequest.construct(
                        TP.hc('output', '<br/>',
                            'render', true
                            )).fire(shell);

                    //  start login message thread...
                    thread = Number.random().toString();
                    TP.sig.UserOutputRequest.construct(
                        TP.hc('output',
                                'Loading and initializing user profile' +
                                ' data for user ' +
                                anotherSignal.getResult() + '...',
                                'cssClass', 'inbound_announce',
                                'render', true,
                                'threadID', thread
                                )).fire(shell);

                    //  if we're logged in, initiate the run sequence which will
                    //  load any startup files but allow the login output
                    //  message to display by forking the call here
                    (function() {

                        shell.initProfile();

                        //  notify any observers that we've logged in
                        shell.signal('TP.sig.TSH_Login');

                     }).fork(20);

                    return;
                });

            //  second-stage (password) request and response handler are
            //  defined, now trigger them using the shell as originator
            req.fire(shell);

            return;
        });

    //  first-stage request (username) and response handler are defined so
    //  initiate the sequence, using the shell as the originator
    req.fire(shell);

    return this;
});

//  ------------------------------------------------------------------------
//  REQUEST HANDLING
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('handle',
function(aRequest) {

    /**
     * @name handle
     * @synopsis The primary resource/request handling method.
     * @description We override this here to enable privileges if we're on
     *     Mozilla. This avoids a lot of issues when manipulating a window or
     *     contents of a window that come from another domain. The shell
     *     variable PRIVILEGED must be true for this feature to be enabled. It's
     *     false by default.
     * @param {TP.sig.Request} aRequest The request to be serviced.
     * @returns {Object} The handler function's results.
     * @todo
     */

    if (TP.boot.isUA('GECKO') &&
        TP.isTrue(this.getVariable('PRIVILEGED')) &&
        TP.sys.shouldRequestPrivileges()) {
        try {
            if (TP.sys.cfg('log.privilege_requests')) {
                TP.sys.logSecurity('Privilege request at ' +
                       'handle',
                            TP.TRACE, arguments);
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
                TP.WARN,
                arguments);
        }
    }

    //  handing off to the standard version within the scope of having
    //  acquire permission means downstream calls will have permissions
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('handleShellRequest',
function(aRequest) {

    /**
     * @name handleShellRequest
     * @synopsis Constructs a response to the request provided. This is the
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

TP.core.TSH.Inst.defineMethod('handleShellRequestCompleted',
function(aSignal) {

    /**
     * @name handleShellRequestCompleted
     * @synopsis Processes notifications that a shell request the receiver
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

    TP.debug('break.shell_response');

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
     * @name shouldComputeCosts
     * @synopsis Combined setter/getter for manipulating the shell's
     *     COMPUTE_COSTS variable. When this variable is true the shell will
     *     compute execution time and object creation counts among other things.
     * @param {Boolean} aFlag The optional value to set.
     * @returns {Boolean} The current setting.
     * @todo
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
     * @name translateSymbol
     * @synopsis Translates the symbol provided into its text equivalent. This
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
 * @todo
 */

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('execute',
function(aRequest) {

    /**
     * @name execute
     * @synopsis The main command execution method, responsible for parsing and
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

    TP.debug('break.shell_execute');

    //  no request means no work :)
    if (TP.notValid(aRequest)) {
        return;
    }

    //  clear the result completely
    aRequest.set('result', undefined);

    aRequest.set('$timestart', Date.now());

    //  the 'cmd' slot of the request must contain the input to process
    if (TP.notValid(src = aRequest.at('cmd'))) {
        if (TP.notValid(src = aRequest.at('cmdNode'))) {
            return aRequest.fail(TP.FAILURE, 'Invalid request input.');
        }

        aRequest.atPut('cmd', TP.nodeAsString(src, false, true));
    }

    //  ---
    //  RESPONSE PREP
    //  ---

    //  handleShellRequest should ensure we have a viable response
    //  object to work with. if not then we can't proceed
    if (TP.notValid(response = aRequest.get('response'))) {
        return aRequest.fail(TP.FAILURE, 'No response object found.');
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
                this.setPrompt(src.chop(':') + '&nbsp;&#187;');

                return aRequest.complete();
            } else {
                return aRequest.fail(
                            TP.FAILURE,
                            'Unable to switch to XMLNS ' + src);
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
                            TP.FAILURE,
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
            tagname = nstype.getTagName() + 'script';
        }

        tagtype = TP.sys.require(tagname);
        if (TP.notValid(tagtype) ||
            !TP.canInvoke(tagtype, '$xmlifyContent')) {
            return aRequest.fail(
                    TP.FAILURE,
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
                        TP.FAILURE,
                        'Unable to create command XML: "' + src + '".');
        }
    } else if (!TP.isNode(node = src)) {
        //  if the content had been a string or node then we can work with
        //  it but otherwise we'll consider it an error
        return aRequest.fail(TP.FAILURE, 'Invalid command: "' + src + '".');
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
                        TP.FAILURE,
                        'Unable to process empty document.');
        }
    } else {
        if (TP.nodeIsDetached(node)) {
            rootDoc = TP.createDocument('', 'request');
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
                            aRequest.at('cmdPhases'),
                        TP.LOG, arguments) : 0;

            phases = this.getType().NOCACHE_PHASES;
        }
    } else if (!TP.isArray(phases)) {
        return aRequest.fail(
                    TP.FAILURE,
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
                TP.debug('break.node_detached');

                cmdNode = aRequest.at('cmdNode');
                if (TP.nodeIsDetached(cmdNode, rootDoc)) {
                    //  error. both the root and node have been swapped out
                    //  by processing of some kind and neither was replaced
                    //  in the request with a viable alternative.
                    return aRequest.fail(
                                TP.FAILURE,
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
        while ((cycles < cyclemax) &&
                TP.isValid(nextPhase) &&
                aRequest.isRunnable());
    }

    //  make sure we ended the loop the right way, otherwise warn/exit
    if (TP.notEmpty(phases) && (cycles >= cyclemax)) {
        return aRequest.fail(TP.FAILURE,
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
                            TP.FAILURE,
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
            aRequest.set('result', aRequest.at('cmdRoot'));
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
     * @name $runPhase
     * @synopsis Runs a particular phase of request processing based on
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
        funcName,
        shell;

    //  list of phases is needed to ensure processed nodes aren't
    //  reprocessed.
    phases = aRequest.at('cmdPhases');

    //  phase should be set by the phase iteration logic in the execute
    //  method.
    phase = aRequest.at('cmdPhase');
    if (TP.isEmpty(phase)) {
        return;
    }

    TP.ifTrace(TP.sys.cfg('log.tsh_phases')) ?
        TP.trace(Date.now() + ' TP.core.TSH ' + phase,
                    TP.LOG, arguments) : 0;

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

    //  hold a reference for traversal entry function
    shell = this;

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
                //  tibet:sourcetag.
                if (TP.nodeHasReachedPhase(child, phase, phases)) {
                    TP.ifTrace(
                            TP.$VERBOSE &&
                            TP.sys.cfg('log.tsh_phases') &&
                            TP.sys.cfg('log.tsh_phase_skips')) ?
                                TP.trace('TP.core.TSH ' + phase +
                                            ' skipping: ' +
                                            TP.name(type) + ' ' +
                                            TP.nodeAsString(child,
                                                            false,
                                                            true),
                                        TP.LOG, arguments) : 0;

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

                    TP.ifTrace(
                        TP.$VERBOSE &&
                        TP.sys.cfg('log.tsh_phases') &&
                        TP.sys.cfg('log.tsh_phase_nodes')) ?
                            TP.trace(Date.now() + ' TP.core.TSH ' + phase +
                                        ' nodetype: ' + TP.name(type) +
                                        ' ' +
                                        TP.nodeAsString(child, false, true),
                                    TP.LOG, arguments) : 0;

                    TP.debug('break.tsh_phase_exec');
                    try {
                      result = type[funcName](aRequest);
                    } catch (e) {
                      message = 'Error running ' + TP.name(type) + '.' +
                        funcName;
                      TP.error(message + ': ' + e.message);
                      return aRequest.fail(TP.FAILURE, TP.ec(e, message));
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
                    TP.warn(message, TP.LOG, arguments);
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
                        TP.debug('break.node_detachment');

                        message = 'TP.core.TSH ' + phase +
                                    ' node detached: ' +
                                    TP.nodeAsString(child, false);
                        TP.error(message);

                        return aRequest.fail(TP.FAILURE, message);
                    }
                }
            } else {
                TP.ifTrace(
                        TP.$VERBOSE &&
                        TP.sys.cfg('log.tsh_phases') &&
                        TP.sys.cfg('log.tsh_phase_skips')) ?
                            TP.trace('TP.core.TSH ' + phase +
                                            ' skipping: ' +
                                            TP.name(type) + ' ' +
                                            TP.nodeAsString(child,
                                                            false,
                                                            true),
                                        TP.LOG, arguments) : 0;
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

                TP.ifTrace(
                        TP.$VERBOSE &&
                        TP.sys.cfg('log.tsh_phases') &&
                        TP.sys.cfg('log.tsh_phase_nodes')) ?
                            TP.trace(Date.now() + ' TP.core.TSH ' + phase +
                                            ' nodetype: ' + TP.name(type) +
                                            ' ' +
                                            TP.nodeAsString(child,
                                                            false,
                                                            true),
                                        TP.LOG, arguments) : 0;

                TP.debug('break.tsh_phase_exec');
                try {
                  result = type[funcName](aRequest);
                } catch (e) {
                  message = 'Error running ' + TP.name(type) + '.' + funcName;
                  TP.error(message + ': ' + e.message);
                  return aRequest.fail(TP.FAILURE, TP.ec(e, message));
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
                        TP.debug('break.node_detachment');
                        message = 'TP.core.TSH ' + phase +
                                    ' node detached: ' +
                                    TP.nodeAsString(child, false);
                        TP.error(message);

                        return aRequest.fail(TP.FAILURE, message);
                    }
                }
            } else {
                TP.ifTrace(
                        TP.$VERBOSE &&
                        TP.sys.cfg('log.tsh_phases') &&
                        TP.sys.cfg('log.tsh_phase_skips')) ?
                            TP.trace('TP.core.TSH ' + phase +
                                            ' skipping: ' +
                                            TP.name(type) + ' ' +
                                            TP.nodeAsString(child,
                                                            false,
                                                            true),
                                        TP.LOG, arguments) : 0;
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

    /**
     * @
     * @todo
     */

    var args;

    args = this.getArgument(aRequest, 'ARGV');
    aRequest.stdout(args.join(' '));

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeLog',
function(aRequest) {

    /**
     * @name executeLog
     * @synopsis Outputs the activity log to the current stdout pipeline.
     * @param {TP.sig.ShellRequest} aRequest The request which triggered this
     *     command.
     * @returns {TP.sig.Request} The request.
     */

    aRequest.stdout(TP.sys.getActivityLog());

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeLogin',
function(aRequest) {

    /**
     * @name executeLogin
     * @param {TP.sig.ShellRequest} aRequest The request which triggered this
     *     command.
     * @returns {TP.sig.Request} The request.
     * @abstract
     * @todo
     */

    var args,
        name;

    args = this.getArgument(aRequest, 'ARGV');

    if (TP.notEmpty(name = args.first())) {
        aRequest.atPut('username', name);
        this.login(aRequest);
    }

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeLogout',
function(aRequest) {

    /**
     * @name executeLogout
     * @param {TP.sig.ShellRequest} aRequest The request which triggered this
     *     command.
     * @returns {TP.sig.Request} The request.
     * @abstract
     * @todo
     */

    var req;

    this.logout();

    //  output any startup announcement for the shell
    req = TP.sig.UserOutputRequest.construct(
                TP.hc('output', 'Logging out user ' + this.get('username'),
                        'cssClass', 'inbound_announce',
                        'cmdAsIs', true,
                        'cmdBox', false,
                        'cmdRecycle', true,
                        'cmdID', aRequest.at('cmdID')));

    req.fire(this);

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeSort',
function(aRequest) {

    /**
     * @
     * @todo
     */


});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeUniq',
function(aRequest) {

    /**
     * @
     * @todo
     */


});

//  ------------------------------------------------------------------------
//  DEBUGGING BUILT-INS
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeBreak',
function(aRequest) {

    /**
     * @
     * @todo
     */


});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeExpect',
function(aRequest) {

    /**
     * @
     * @todo
     */


});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeWatch',
function(aRequest) {

    /**
     * @
     * @todo
     */


});

//  ------------------------------------------------------------------------
//  JOB BUILT-INS
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeJob',
function(aRequest) {

    /**
     * @
     * @todo
     */


});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeKill',
function(aRequest) {

    /**
     * @
     * @todo
     */


});

//  ------------------------------------------------------------------------
//  FORMATTING BUILT-INS
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeAs',
function(aRequest) {

    /**
     * @name executeAs
     * @synopsis Executes a formatting or template transformation operation on
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
        return aRequest.fail(TP.FAILURE,
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
    repeat = this.getArgument(aRequest, 'tsh:repeat', false, true);

    len = input.getSize();
    for (i = 0; i < len; i++) {
        item = input.at(i);
        if (TP.isTrue(aRequest.at('cmdIterate'))) {
            if (TP.canInvoke(item, 'collect')) {
                result = item.collect(
                            function(item) {

                                return TP.format(
                                            item,
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

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeDump',
function(aRequest) {

    /**
     * @
     * @todo
     */

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

    /**
     * @
     * @todo
     */

    var arg,
        url,
        obj,

        editor;

    arg = this.getArgument(aRequest, 'ARG0');

    if (TP.regex.URI_LIKELY.test(arg)) {
        url = this.expandPath(arg);
        if (TP.isURI(url = TP.uc(url))) {
            obj = url;
        } else {
            obj = this.resolveObjectReference(arg, aRequest);
        }
    } else {
        obj = this.resolveObjectReference(arg, aRequest);
    }

    if (TP.isValid(obj)) {
        //  grab a reference to the TDP editor
        if (TP.isValid(editor = TP.byOID('DeveloperEditor'))) {
            editor.setContentObject(obj);
            editor.navigateToEditorScreen();

            aRequest.complete();

            return;
        }
    }

    aRequest.fail();

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeScreen',
function(aRequest) {

    /**
     * @
     * @todo
     */

    var tdp,
        arg;

    arg = this.getArgument(aRequest, 'ARG0');

    tdp = TP.byOID('DeveloperPortal');
    tdp.toggleZoomed();
    tdp.setCurrentScreenCell('screen_' + arg + '_cell');
    tdp.toggleZoomed();

    aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeInspect',
function(aRequest) {

    /**
     * @
     * @todo
     */


});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeReflect',
function(aRequest) {

    /**
     * @
     * @todo
     */

    var node,
        shell,
        input;

    if (TP.notValid(node = aRequest.at('cmdNode'))) {
        return aRequest.fail();
    }

    shell = aRequest.at('cmdShell');

    //  NB: We supply 'null' as the default value if 'tsh:ref' wasn't
    //  specified.
    input = this.getArgument(aRequest, 'tsh:ref', null, true);
    if (TP.notValid(input)) {
        if (TP.isEmpty(input = aRequest.stdin())) {
            //  TODO: return type list, sorted?
            return aRequest.fail();
        }
    }

    if (TP.isValid(input = this.resolveObjectReference(input, aRequest))) {
        aRequest.stdout(input.getInterface('unique_methods').sort());
    } else {
        //  TODO: return type list, sorted?
        return aRequest.fail();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeEntity',
function(aRequest) {

    /**
     * @
     * @todo
     */

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
     * @name executeExport
     * @synopsis Writes out the previous command buffer to the script file named
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
        return aRequest.fail(TP.FAILURE, 'Unable to determine target url.');
    }

    ext = TP.uriExtension(path);
    if (TP.isEmpty(ext)) {
        path = path + '.tsh';
    }

    url = TP.uc(path);
    if (TP.notValid(url)) {
        return aRequest.fail(TP.FAILURE, 'Invalid target url.');
    }

    hid = TP.elementGetAttribute(aRequest.at('cmdNode'), 'tsh:hid', true);
    hid = TP.ifEmpty(hid, -2);
    hid = parseInt(hid, 10);
    if (TP.notValid(hid) || TP.isNaN(hid)) {
        return aRequest.fail(TP.FAILURE, 'Invalid target history.');
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
     * @name executeImport
     * @synopsis Imports the source file referenced if it can be found. The
     *     primary value of this command is that it allows simple file patterns
     *     to be used to determine which file might be desired. For example,
     *     :import TIBETGlobals or simply Globals is enough for this command to
     *     locate the full path to the proper file and to import it.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */


    var node,
        shell,
        root,

        input,

        len,
        i,

        ref,
        options,

        file,
        flag,

        url,
        src,

        debug,

        urlLoc,
        urlName,
        urlTypeName,
        urlType;

    if (TP.notValid(node = aRequest.at('cmdNode'))) {
        return aRequest.fail();
    }

    shell = aRequest.at('cmdShell');
    root = aRequest.at('rootRequest');

    //  NB: We supply 'null' as the default value if 'tsh:href' wasn't
    //  specified.
    input = this.getArgument(aRequest, 'tsh:href', null, true);
    if (TP.notValid(input)) {
        if (TP.isEmpty(input = aRequest.stdin())) {
            return aRequest.fail(TP.FAILURE,
                'Unable to find reference for ' + TP.str(ref));
        }
    } else {
        input = TP.ac(input);
    }

    len = input.getSize();
    for (i = 0; i < len; i++) {
        ref = input.at(i);

        options = TP.boot.$$loadpaths.grep(ref);
        if (TP.isEmpty(options)) {
            //  a file we've never seen before
            options = TP.ac(ref);
        }

        //  ambiguous...
        if (options.getSize() > 1) {
            aRequest.fail(TP.FAILURE,
                'Multiple choices: ' + TP.src(options));

            continue;
        }

        file = options.collapse();
        try {
            flag = TP.sys.shouldLogCodeChanges();
            TP.sys.shouldLogCodeChanges(false);

            root.stdout('tsh:import loading source from ' + file,
                            aRequest);

            url = TP.uc(file);
            if (TP.notValid(url)) {
                aRequest.fail(TP.FAILURE,
                    'tsh:import failed to load ' + file);

                continue;
            }

            if (TP.notValid(src = url.getContent(
                                TP.hc('refresh', true, 'async', false)))) {
                aRequest.fail(TP.FAILURE,
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
                        arguments,
                        'Unable to initialize ' + urlType.getName());
                }
            }
        } catch (e) {
            aRequest.fail(TP.FAILURE,
                TP.ec(e, 'tsh:import failed to load ' + file));

            continue;
        } finally {
            TP.sys.shouldLogCodeChanges(flag);
            TP.sys.shouldUseDebugger(debug);
        }
    }

    aRequest.complete(url);

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeSource',
function(aRequest) {

    /**
     * @name executeSource
     * @synopsis Reloads the source file from which an object was loaded. The
     *     object specification should be provided as ref="obj".
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var node,
        shell,
        root,

        input,

        len,
        i,

        ref,

        $$inst,

        file,
        loadnode,

        flag,

        url,
        src,

        debug,

        type;

    if (TP.notValid(node = aRequest.at('cmdNode'))) {
        return aRequest.fail();
    }

    shell = aRequest.at('cmdShell');
    root = aRequest.at('rootRequest');

    //  NB: We supply 'null' as the default value if 'tsh:ref' wasn't
    //  specified.
    input = this.getArgument(aRequest, 'tsh:ref', null, true);

    if (TP.notValid(input)) {
        if (TP.isEmpty(input = aRequest.stdin())) {
            return aRequest.fail(TP.FAILURE,
                'Unable to find reference for ' + TP.str(ref));
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
                TP.FAILURE,
                'Unable to resolve object reference ' + ref);

            continue;
        }

        if (TP.isNode(loadnode = TP.objectGetLoadNode($$inst)) &&
            (TP.notEmpty(file = TP.elementGetAttribute(loadnode, 'src')) ||
            TP.notEmpty(file = TP.elementGetAttribute(loadnode, 'source')))) {
            try {
                flag = TP.sys.shouldLogCodeChanges();
                TP.sys.shouldLogCodeChanges(false);

                root.stdout('tsh:source loading source from ' + file,
                    aRequest);

                url = TP.uc(file);
                if (TP.notValid(url)) {
                    aRequest.fail(TP.FAILURE,
                        'tsh:source failed to load ' + file);

                    continue;
                }

                if (TP.notValid(
                        src = url.getContent(
                                TP.hc('refresh', true, 'async', false)))) {
                    aRequest.fail(TP.FAILURE,
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
                aRequest.fail(TP.FAILURE,
                    TP.ec(e, 'tsh:source failed to eval ' + file));

                continue;
            } finally {
                TP.sys.shouldLogCodeChanges(flag);
                TP.sys.shouldUseDebugger(debug);
            }
        } else {
            aRequest.fail(TP.FAILURE,
                'Object ' + ref + ' source file not found.');

            continue;
        }
    }

    aRequest.complete(url);

    return;
});

//  ------------------------------------------------------------------------
//  REFLECTION BUILT-INS
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeBuiltins',
function(aRequest) {

    /**
     * @
     * @todo
     */


});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeGlobals',
function(aRequest) {

    /**
     * @
     * @todo
     */

    var keys;

    keys = TP.$getOwnKeys(window);
    keys = keys.select(
            function(key) {

                if (TP.isFunction(window[key]) &&
                    ((window[key][TP.TRACK] === 'Global') ||
                    (window[key][TP.TRACK] === 'Local'))) {
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

    /**
     * @
     * @todo
     */


});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeShorts',
function(aRequest) {

    /**
     * @
     * @todo
     */

    var keys;

    keys = TP.$getOwnKeys(window);
    keys = keys.select(
            function(key) {

                if ((key.indexOf('$') === 0) &&
                    TP.isFunction(window[key]) &&
                    ((window[key][TP.TRACK] === 'Global') ||
                    (window[key][TP.TRACK] === 'Local'))) {
                    return true;
                }

                return false;
            });

    aRequest.stdout(keys.sort().join('\n'));

    aRequest.complete(keys);
});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeTypes',
function(aRequest) {

    /**
     * @
     * @todo
     */


});

//  ------------------------------------------------------------------------
//  TIMING BUILT-INS
//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeOpen',
function(aRequest) {

    /**
     * @synopsis Opens a URI in a window and completes when the onload handler
     *     within that window has properly triggered. NOTE that this is only
     *     consistent when the tibet_hook.js file is included as part of the
     *     page being loaded. When the hook file isn't available the results may
     *     be less consistent.
     */


});

//  ------------------------------------------------------------------------

TP.core.TSH.Inst.defineMethod('executeSleep',
function(aRequest) {

    /**
     * @synopsis Sleeps a specified number of milliseconds before continuing
     *     script processing. Note that sleeps in excess of 30 seconds can only
     *     be achieved by setting tsh.max_sleep higher. script processing. Note
     *     that sleeps in excess of 30 seconds can only be achieved by setting
     *     tsh.sleep_max higher.
     */

    var ms;

    //  NB: We supply the cfg value of 'tsh.sleep_default' as the default value
    //  if 'tsh:ms' wasn't specified.
    ms = this.getArgument(aRequest,
                            'tsh:ms',
                            TP.sys.cfg('tsh.sleep_default', 1000),
                            true);

    ms = Math.max(ms, TP.sys.cfg('tsh.sleep_max', 30000));

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
     * @synopsis Effectively pauses execution until a signal is observed. The
     *     signal can be tied to an origin, so this is effectively a way to tie
     *     shell execution timing to an $observe call.
     */


});

//  ------------------------------------------------------------------------
//  HELP TOPICS
//  ------------------------------------------------------------------------

/*
TP.core.TSH.addHelpTopic(':change', 'Stores a string as a change log entry.');
TP.core.TSH.addHelpTopic(':colors', 'Generates a table of the 216 websafe colors.');
TP.core.TSH.addHelpTopic(':counts', 'Generates a table of object creation counts.');
TP.core.TSH.addHelpTopic(':edit', 'Generates an editor for an object.');
TP.core.TSH.addHelpTopic(':entities', 'Generates a table of XML entity codes.');
TP.core.TSH.addHelpTopic(':flags', 'Generates a table of TIBET control flags.');
TP.core.TSH.addHelpTopic(':globals', 'Display global variables, functions, etc.');
TP.core.TSH.addHelpTopic(':halo', 'Sets up the Halo on a visible document.');
TP.core.TSH.addHelpTopic(':import', 'Loads/executes a JavaScript/TIBET source file.');
TP.core.TSH.addHelpTopic(':inspect', 'Generates an inspector for a particular object.');
TP.core.TSH.addHelpTopic(':instrument', 'Instrument a window/frame for TIBET.');
TP.core.TSH.addHelpTopic(':interests', 'Displays the XML-based signal interest map.');
TP.core.TSH.addHelpTopic(':jobs', 'Generates a table of active "processes".');
TP.core.TSH.addHelpTopic(':kill', 'Kill an active TIBET "job" instance.');
TP.core.TSH.addHelpTopic(':line', 'Displays a line number from a URI[line] entry.');
TP.core.TSH.addHelpTopic(':lint', 'Lint check an object or set of objects.');
TP.core.TSH.addHelpTopic(':load', 'Loads the content text and/or xml of a URI.');
TP.core.TSH.addHelpTopic(':log', 'Generates a listing of a particular log.');
TP.core.TSH.addHelpTopic(':ls', 'Lists the contents of the current path.');
TP.core.TSH.addHelpTopic(':reflect', 'Generates a table of object reflection data.');
TP.core.TSH.addHelpTopic(':source', 'Reloads the source file for an object/type.');
TP.core.TSH.addHelpTopic(':sync', 'Updates a target file relative to a source file.');
TP.core.TSH.addHelpTopic(':test', 'Executes an object\'s tests or test suite.');
TP.core.TSH.addHelpTopic(':tidy', 'Runs a URI through the HTML Tidy service.');
TP.core.TSH.addHelpTopic(':validate', 'Runs the W3C validation service on a URL.');
TP.core.TSH.addHelpTopic(':xpath', 'Executes an XPath expression against a node.');
TP.core.TSH.addHelpTopic(':xslt', 'Transforms a node using an XSLT node/file.');
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
