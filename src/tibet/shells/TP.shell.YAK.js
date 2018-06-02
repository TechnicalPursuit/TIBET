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
 * @type {TP.shell.YAK(tm)}
 * @summary A TP.shell.Shell specific to handling XMPP (Jabber) communication.
 *     The default "execution" in this shell is to send the input to the
 *     currently targeted JID.
 */

//  ------------------------------------------------------------------------

TP.shell.Shell.defineSubtype('shell.YAK');

TP.shell.YAK.set('commandPrefix', 'yak');

TP.w3.Xmlns.registerNSInfo('urn:yak',
        TP.hc('uri', 'urn:yak', 'prefix', 'yak'));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  whether to display the raw XMPP traffic. note that this is separate from
//  the TP.sys.shouldLogIO() setting, which may also cause you to see
//  portions of the XMPP traffic on the wire.
TP.shell.YAK.Inst.defineAttribute('debug', true);

//  the last inbound message packet, used for :reply processing
TP.shell.YAK.Inst.defineAttribute('lastNode');

//  collection containing secure jids and their keys
TP.shell.YAK.Inst.defineAttribute('secureJIDs');

//  the server uri we last asked to connect to
TP.shell.YAK.Inst.defineAttribute('serverURI');

//  the last server name we tried to connect to
TP.shell.YAK.Inst.defineAttribute('serverName');

//  the ID of the service this instance uses, typically this is set to the
//  receiver's resource ID plus 'Service'
TP.shell.YAK.Inst.defineAttribute('serviceID');

//  the currently targeted JID for our output traffic
TP.shell.YAK.Inst.defineAttribute('targetJID');

//  the last user JID we used when logging in
TP.shell.YAK.Inst.defineAttribute('userJID');

//  additional information presented when a shell of this type starts up
TP.shell.YAK.Inst.defineAttribute('introduction',
    TP.join('Shift-Return to send. Shift-Up/Down for history. ',
            'Shift-Delete to clear. Shift-Esc to cancel.<br/><br/>',
            'Type ',

            '<a class="help_table_link" href="#" onclick="TP.shellExec(',
                '\':help\', false, false, false, \'', '`getID()`', '\'); ',
                'return false;">?</a> or ',

            '<a class="help_table_link" href="#" onclick="TP.shellExec(',
                '\':help\', false, false, false, \'', '`getID()`', '\'); ',
                'return false;">:help</a> for help, ',

            '<a class="help_table_link" href="#" onclick="TP.shellExec(',
                '\':history\', false, false, false, \'', '`getID()`', '\'); ',
                'return false;">#?</a> or ',

            '<a class="help_table_link" href="#" onclick="TP.shellExec(',
                '\':history\', false, false, false, \'', '`getID()`', '\'); ',
                'return false;">:history</a> for history; use ',

            '<a class="help_table_link" href="#" onclick="TP.shellExec(',
                '\':to \', false, false, false, \'', '`getID()`', '\'); ',
                'return false;">:to</a> to target a specific JID.',

            '<br/>'));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('init',
function(resourceID) {

    /**
     * @method init
     * @summary Initializes a new instance.
     * @param {String} resourceID A unique resource identifier for this shell
     *     instance.
     * @returns {TP.shell.YAK} A new instance.
     */

    //  pass the adjusted resource ID to the supertype constructor
    this.callNextMethod(resourceID);

    //  make sure we know about input from our connections
    this.observe(null, 'TP.sig.XMPPInput');

    //  construct the secure key collection so it's ready for action
    this.$set('secureJIDs', TP.hc());

    return this;
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('canSend',
function() {

    /**
     * @method canSend
     * @summary Returns true if the receiver has an open, authenticated
     *     connection which will support a send operation.
     * @returns {Boolean}
     */

    var yakService;

    if (!this.isRunning()) {
        return false;
    }

    if (TP.notValid(yakService =
                        TP.uri.XMPPService.getInstanceById(
                                                    this.getServiceID()))) {
        return false;
    }

    return yakService.hasAuthConnection();
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('displayDebugData',
function(aMessage) {

    /**
     * @method displayDebugData
     * @summary Displays debugging information related to the message provided.
     *     This method is typically invoked when the shell has debugging turned
     *     on.
     * @param {TP.xmpp.Message} aMessage The message instance.
     * @returns {TP.shell.YAK} The receiver.
     */

    var yakService,
        packet,
        str,
        msgType;

    if (TP.notTrue(this.get('debug')) || !this.isRunning()) {
        return this;
    }

    yakService = TP.uri.XMPPService.getInstanceById(this.getServiceID());

    packet = yakService.get('connection').getOutputStream().getLastPacket();
    if (TP.notValid(packet)) {
        return this;
    }

    msgType = TP.isValid(aMessage) ? aMessage.getTypeName() + ':\n' : '';

    try {
        str = TP.join('[SEND]\n', msgType, TP.nodeAsString(packet));

        TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', str,
                    'messageType', 'debug'
                    )).fire(this);
    } catch (e) {
        //  empty
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('getAnnouncement',
function() {

    /**
     * Returns the announcement string to use for the receiver.
     * @returns {String} The announcement string.
     */

    var str;

    str = this.$get('announcement');
    if (TP.isEmpty(str)) {
        str = TP.join('TIBET Messaging Shell (YAK) ',
            TP.sys.getLibVersion());
        this.$set('announcement', str);
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('getServiceID',
function() {

    /**
     * @method getServiceID
     * @summary Returns the service ID for the service this instance of shell
     *     uses for its server communication.
     * @returns {String} The service ID.
     */

    //  used to be hard-coded to 'TP.shell.YAKService'
    return this.getID() + 'Service';
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('setTargetJID',
function(aJID) {

    /**
     * @method setTargetJID
     * @summary Sets the default JID to target with unqualified sends.
     * @param {TP.xmpp.JID} aJID The JID to target.
     * @returns {TP.shell.YAK} The receiver.
     */

    this.$set('targetJID', aJID);

    //  the TARGET variable will display in the status bar if set
    this.setVariable('TARGET', aJID.asString());

    return this;
});

//  ------------------------------------------------------------------------
//  STARTUP/LOGIN/LOGOUT
//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('login',
function(aRequest) {

    /**
     * @method login
     * @summary Performs any login sequence necessary for the receiver. The
     *     TP.shell.YAK initiates a query sequence to get proper values for a
     *     server uri, server name, jid, and password.
     * @param {TP.sig.ShellRequest} aRequest The request which is triggering
     *     this activity.
     * @returns {TP.shell.YAK} The receiver.
     */

    var shell,

        uis;

    if (this.isRunning()) {
        this.stderr('Still logged in. Please log out first.');

        return this;
    }

    /* eslint-disable consistent-this */

    shell = this;

    uis = TP.sig.UserInputSeries.construct();

    //  Add a query to the series to get the 'polling uri' (that is, the
    //  polling URL).
    uis.addQuery(
        TP.hc('query', 'polling uri:',
                'retryPrompt', 'Invalid URI. Please re-enter...',
                'validator',
                    function(response, request) {

                        if (TP.notValid(response) ||
                            response.getSize() < 'http://'.getSize() ||
                            TP.notValid(TP.uc(response))) {
                            return false;
                        }

                        shell.$set('serverURI', response);

                        return true;
                    }));

    //  Add a query to the series to get the 'server name' (that is, the
    //  actual Jabber server).
    uis.addQuery(
        TP.hc('query', 'server name:',
                'retryPrompt', 'Invalid server name. Please re-enter...',
                'default',
                function(response, request) {

                    var res,
                        host;

                    //  note we want to use the response to the first
                    //  question to generate part of our value here
                    res = request.getLastReply();

                    try {
                        host = TP.uc(res).get('host');
                    } catch (e) {
                        host = '';
                    }

                    return host;
                },
                'validator',
                function(response, request) {

                    //  need a valid server name
                    if (TP.notValid(response) || response.getSize() < 1) {
                        return false;
                    }

                    shell.$set('serverName', response);

                    return true;
                }));

    //  Add a query to the series to get the 'user jid'.
    uis.addQuery(
        TP.hc('query', 'user jid:',
                'retryPrompt', 'Invalid JID. Please re-enter...',
                'validator',
                function(response, request) {

                    var val;

                    if (TP.notValid(response) ||
                        TP.notValid(val = TP.xmpp.JID.construct(response))) {
                        return false;
                    }

                    shell.$set('userJID', val);

                    return true;
                }));

    //  Add a query to the series to get the user's 'password'.
    uis.addQuery(
        TP.hc('query', 'password:',
                'hideInput', true,
                'retryPrompt', 'Password cannot be empty.' +
                                ' Please re-enter...',
                'validator',
                function(response, request) {

                    if (TP.notValid(response) ||
                        response.getSize() <
                                 TP.shell.Shell.MIN_PASSWORD_LEN) {
                        return false;
                    }

                    return true;
                }));

    //  Add a hook in case the user cancels the operation during the login
    //  process.
    uis.addCancelHook(
        function(aUIS) {

            TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', 'Login request cancelled.',
                    'messageType', 'failure'
                    )).fire(shell);

            shell.logout();

            return;
        });

    //  Add a hook in case the login operation fails during the login
    //  process.
    uis.addFailureHook(
        function(aUIS) {

            TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', 'Login request failed.',
                    'messageType', 'failure'
                    )).fire(shell);

            shell.logout();

            return;
        });

    //  Add the hook in case the login operation succeeds.
    uis.addSuccessHook(
        function(aUIS) {

            TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', 'Login parameters obtained.' +
                                ' Attempting login...'
                    )).fire(shell);

            shell.loginCompletion(aUIS);

            return;
        });

    /* eslint-enable consistent-this */

    //  now initiate the input series
    uis.fire(shell);

    return this;
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('loginCompletion',
function(aUserInputSeries) {

    /**
     * @method loginCompletion
     * @summary Completes a login sequence using the information contained in
     *     the receiver's instance variables and the user input series provided.
     *     This method is leveraged by both the login and register sequences to
     *     complete the login process.
     * @param {TP.sig.UserInputSeries} aUserInputSeries An input request
     *     containing all the necessary data.
     * @returns {TP.shell.YAK} The receiver.
     */

    var ndx,
        arr,
        i,
        pass,

        yakService;

    //  find the password data so we're ready for action
    ndx = TP.NOT_FOUND;
    arr = aUserInputSeries.get('queries');

    for (i = 0; i < arr.getSize(); i++) {
        if (arr.at(i).at(aUserInputSeries.getType().QUERY_INDEX).
                                                    startsWith('password')) {
            ndx = i;
            break;
        }
    }

    pass = aUserInputSeries.get('replies').at(ndx);

    //  Allocate the service and set its serviceURI and serverName
    if (TP.notValid(yakService =
                        TP.uri.XMPPService.getInstanceById(
                                this.getServiceID()))) {
        yakService = TP.uri.XMPPService.construct(this.getServiceID());
        yakService.set('serviceURI', this.get('serverURI'));
        yakService.set('serverName', this.get('serverName'));
    }

    //  make the connection/login attempt...

    //  First, check to see if the service already had an authenticated
    //  connection. This may have happened if the service was allocated
    //  before and we're reusing it. Note that in order for the service to
    //  consider the connection 'authenticated', the connection's URI and
    //  server name must match those of the service and it must be
    //  authenticated with a JID.
    if (yakService.hasAuthConnection()) {
        return this;
    }

    //  Then try to open a new connection
    if (!yakService.openConnection()) {
        TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', 'Login attempt failed.' +
                                ' Connection did not open.',
                    'messageType', 'failure'
                    )).fire(this);

        return this;
    }

    //  now that the connection is open, go ahead and try to establish
    //  the connection with the server. This will authenticate our
    //  connection with the server, request various resources from the
    //  server and try to establish a session.
    if (yakService.authenticateConnection(this.get('userJID'), pass)) {
        //  creating a TP.core.User instance will trigger the UI updating
        //  done based on vcard role/unit assignments (if this user has a
        //  vcard)
        TP.core.User.construct(this.get('userJID'));

        //  login successful
        this.isRunning(true);

        this.setVariable('USER', this.get('userJID').asString());

        TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output',
                            this.get('userJID').asString() +
                            ' logged in at ' +
                            TP.dc().toLocaleString(),
                    'messageType', 'response',
                    'cssClass', 'inbound_announce'
                    )).fire(this);

        yakService.setupCurrentUser();

        this.displayDebugData(yakService.get('lastMsg'));
    } else {
        //  failed to log in
        TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', 'Login authentication failed.',
                    'messageType', 'failure'
                    )).fire(this);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('logout',
function(aRequest) {

    /**
     * @method logout
     * @summary Logs out of the current session, closing the connection.
     * @param {TP.sig.ShellRequest} aRequest The request which is triggering
     *     this activity.
     * @returns {TP.shell.YAK} The receiver.
     */

    var yakService;

    //  Make sure we have an open connection. Otherwise, there's nothing to
    //  'log out' from.
    try {
        //  No XMPP service? Shut this shell down and exit here.
        if (TP.notValid(yakService =
                            TP.uri.XMPPService.getInstanceById(
                                this.getServiceID()))) {
            if (this.isRunning()) {
                this.isRunning(false);
            }

            this.signal('TP.sig.Logout');

            return this;
        }

        //  Tell the service to shut down its connection.
        yakService.shutdownConnection();
    } catch (e) {
        //  ignore problems closing
        //  empty
    }

    if (this.isRunning()) {
        this.isRunning(false);
    }

    this.signal('TP.sig.Logout');

    return this;
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('register',
function(aRequest) {

    /**
     * @method register
     * @summary Initiates the registration process for a new user with the
     *     Jabber server.
     * @param {TP.sig.ShellRequest} aRequest The request which is triggering
     *     this activity.
     * @returns {TP.shell.YAK} The receiver.
     */

    var shell,
        uis;

    if (this.isRunning()) {
        this.stderr('Still logged in. Please log out first.');
        return this;
    }

    /* eslint-disable consistent-this */

    shell = this;

    uis = TP.sig.UserInputSeries.construct();

    //  Add a query to the series to get the 'polling uri' (that is, the
    //  polling URL).
    uis.addQuery(
            TP.hc('query', 'polling uri:',
                    'retryPrompt', 'Invalid URI. Please re-enter...',
                    'validator',
                    function(response, request) {

                        if (TP.notValid(response) ||
                            response.getSize() < 'http://'.getSize() ||
                            TP.notValid(TP.uc(response))) {
                            return false;
                        }

                        shell.$set('serverURI', response);

                        return true;
                    }));

    //  Add a query to the series to get the 'server name' (that is, the
    //  actual Jabber server).
    uis.addQuery(
            TP.hc('query', 'server name:',
                    'default',
                    function(response, request) {

                        var res,
                            host;

                        //  note we want to use the response to the first
                        //  question to generate part of our value here
                        res = request.getLastReply();

                        try {
                            host = TP.uc(res).get('host');
                        } catch (e) {
                            host = '';
                        }

                        return host;
                    },
                    'retryPrompt', 'Invalid server name.' +
                                    ' Please re-enter...',
                    'validator',
                    function(response, request) {

                        //  need a valid server name
                        if (TP.notValid(response) ||
                            response.getSize() < 1) {
                            return false;
                        }

                        shell.$set('serverName', response);

                        return true;
                    }));

    //  Add a hook in case the user cancels the operation during the
    //  registration process.
    uis.addCancelHook(
        function(aUIS) {

            TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', 'Registration request cancelled.',
                    'messageType', 'failure'
                    )).fire(shell);

            shell.logout();

            return;
        });

    //  Add a hook in case the login operation fails during the registration
    //  process.
    uis.addFailureHook(
        function(aUIS) {

            TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', 'Registration request failed.',
                    'messageType', 'failure'
                    )).fire(shell);

            shell.logout();

            return;
        });

    //  Add the hook in case the registration operation succeeds.
    uis.addSuccessHook(
        function(aUIS) {

            var yakService,
                res;

            //  Allocate the service and set its serviceURI and serverName
            if (TP.notValid(yakService =
                                TP.uri.XMPPService.getInstanceById(
                                    this.getServiceID()))) {
                yakService = TP.uri.XMPPService.construct(
                                    this.getServiceID());

                yakService.set('serviceURI', shell.get('serverURI'));
                yakService.set('serverName', shell.get('serverName'));
            }

            //  make the connection/login attempt...

            //  we don't check to see if we have an authenticated connection
            //  here since we're trying to register for a JID in the first
            //  place...

            //  first step is to try to opening the connection
            if (!yakService.openConnection()) {
                TP.sig.UserOutputRequest.construct(
                        TP.hc(
                            'output',
                            'Registration attempt failed.' +
                                ' Connection did not open.',
                            'messageType', 'failure'
                            )).fire(shell);

                return;
            }

            res = yakService.initiateRegistration();

            if (TP.notValid(res)) {
                //  failed to get connection
                TP.sig.UserOutputRequest.construct(
                        TP.hc(
                            'output', 'Registration attempt failed.' +
                                        ' No response.',
                            'messageType', 'failure'
                            )).fire(shell);

                return;
            }

            try {
                //  finish the registration process with the data we've
                //  collected
                shell.registerCompletion(res);
            } catch (e) {
                //  failed to get registered
                TP.sig.UserOutputRequest.construct(
                        TP.hc(
                            'output',
                            'Registration attempt failed processing' +
                                ' response.',
                            'messageType', 'failure'
                            )).fire(shell);
            }

            return;
        });

    /* eslint-enable consistent-this */

    //  now initiate the input series
    uis.fire(shell);

    return this;
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('registerCompletion',
function(aRegistrationNode) {

    /**
     * @method registerCompletion
     * @summary Completes a registration sequence using the information
     *     contained in the receiver's instance variables and the user input
     *     series provided.
     * @param {TP.xmpp.Node} aRegistrationNode The node containing the
     *     registration information.
     * @returns {TP.shell.YAK} The receiver.
     */

    var shell,
        uis,

        yakService,

        regFields;

    /* eslint-disable consistent-this */

    shell = this;
    uis = TP.sig.UserInputSeries.construct();

    //  username and password are always required so we'll do them manually
    uis.addQuery(
        TP.hc('query', 'username:',
                'retryPrompt', 'Username cannot be empty.' +
                                ' Please re-enter...',
                'validator',
                function(response, request) {

                    var val;

                    if (TP.isEmpty(response)) {
                        return false;
                    }

                    //  adjust for whether they used an @ or not
                    if (response.containsString('@')) {
                        val = TP.xmpp.JID.construct(response);
                    } else {
                        val = TP.xmpp.JID.construct(
                                response + '@' + shell.get('serverName'));
                    }

                    shell.$set('userJID', val);

                    return true;
                }));

    uis.addQuery(
        TP.hc('query', 'password:',
                'hideInput', true,
                'retryPrompt', 'Password cannot be empty.' +
                                ' Please re-enter...',
                'validator',
                function(response, request) {

                    if (TP.notValid(response) ||
                        response.getSize() <
                             TP.shell.Shell.MIN_PASSWORD_LEN) {
                        return false;
                    }

                    return true;
                }));

    yakService = TP.uri.XMPPService.getInstanceById(this.getServiceID());

    //  This returns a hash of registration field names and descriptions
    //  that the server wants the user to complete in order to register with
    //  this particular server. We process each one of these into an
    //  additional query for the user. We skip 'username' and 'password'
    //  since almost every server requires them and we've hardcoded them
    //  above.
    regFields = yakService.getRegistrationFieldsFrom(aRegistrationNode);

    regFields.perform(
        function(kvPair) {

            //  Skip fields where the key is either 'username' or
            //  'password' - we took care of those above.
            if (kvPair.first() === 'username' ||
                kvPair.first() === 'password') {
                return;
            }

            //  If key is 'instructions', then there's nothing we need the
            //  user to do, so we just output that to stdout.
            if (kvPair.first() === 'instructions') {
                shell.stdout(kvPair.last());

                return;
            }

            //  Otherwise, add a query for that field (putting the
            //  description in parens for the user's convenience)
            uis.addQuery(
                TP.hc('query',
                        TP.join(kvPair.first(),
                                ' (', kvPair.last(), '): ')));
        });

    uis.addSuccessHook(
        function(aUIS) {

            var service,

                regValues,

                arr,
                i,

                item,
                val,
                res;

            regValues = TP.hc();

            arr = aUIS.get('queries');
            for (i = 0; i < arr.getSize(); i++) {
                item = arr.at(i).at(aUIS.getType().QUERY_INDEX);
                item = item.chop(':');

                val = aUIS.getReplies().at(i);

                //  special handling required here to avoid having the
                //  server name in the username we send
                if (item.startsWith('username') &&
                    item.containsString('@')) {
                    val = val.split('@').at(0);
                }

                regValues.atPut(item, val);
            }

            service = TP.uri.XMPPService.getInstanceById(
                                                this.getServiceID());

            res = service.finalizeRegistration(regValues);

            if (TP.notValid(res)) {
                //  failed to get connection
                TP.sig.UserOutputRequest.construct(
                        TP.hc(
                            'output', 'Registration attempt failed.' +
                                        ' No response.',
                            'messageType', 'failure'
                            )).fire(shell);

                return;
            }

            if (res.isError()) {
                //  failed to get connection
                TP.sig.UserOutputRequest.construct(
                        TP.hc(
                            'output', 'Registration attempt failed. ' +
                                                    res.get('errorMessage'),
                            'messageType', 'failure'
                            )).fire(shell);
            } else {
                //  it worked, output status and complete login sequence
                TP.sig.UserOutputRequest.construct(
                        TP.hc(
                            'output', 'Registration successful.' +
                                        ' Logging in...'
                            )).fire(shell);

                shell.loginCompletion(aUIS);
            }

            return;
        });

    /* eslint-enable consistent-this */

    uis.fire(shell);

    return this;
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('start',
function(aRequest) {

    /**
     * @method start
     * @summary Performs common startup processing, including displaying an
     *     announcement specific to the current shell. The login() sequence is
     *     initiated as part of this method.
     * @param {TP.sig.ShellRequest} aRequest The request which is triggering
     *     this activity.
     * @returns {TP.shell.YAK} The receiver.
     */

    var req,
        shell;

    if (this.isRunning()) {
        return this;
    }

    /* eslint-disable consistent-this */

    shell = this;

    this.announce(aRequest);

    //  turn off display of 'null' return values when doing input
    this.setVariable('SHOW_INVALID', false);

    //  prompt in this case tries to determine if we're working to register
    //  a new user or an existing one

    req = TP.sig.UserInputRequest.construct(
            TP.hc(
                'query', '(n)ew or (e)xisting user?',
                'default', 'existing',
                'async', true));

    // req.observe(req.getRequestID(), 'TP.sig.UserInput');

    //  if the user hit 'Shift-Esc', then we need to make sure everything is
    //  closed out.
    req.defineHandler('RequestCancelled',
        function() {

            shell.logout(aRequest);
        });

    req.defineHandler('UserInput',
        function(anotherSignal) {

            var result;

            req.ignore(req.getRequestID(), 'TP.sig.UserInput');
            req.getRequestID().signal('TP.sig.RequestCompleted');

            //  be prepared for cancellation etc.
            if (anotherSignal.didFail()) {
                shell.logout(aRequest);

                return;
            }

            result = anotherSignal.getResult();

            //  is this 'existing' or a new registration request?
            if (TP.isString(result) && result.toLowerCase().startsWith('e')) {
                shell.login(aRequest);
            } else {
                shell.register(aRequest);
            }
        });

    /* eslint-enable consistent-this */

    req.fire(shell);

    return this;
});

//  ------------------------------------------------------------------------
//  EXECUTION
//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('echoRequest',
function(aRequest) {

    /**
     * @method echoRequest
     * @summary Outputs the request by making a TP.sig.UserOutputRequest with
     *     the request command text.
     * @param {TP.sig.Request} aRequest The request object containing the input.
     * @returns {TP.sig.Request} The request.
     */

    var req,
        cmd,
        typ,
        out,
        jid;

    if (TP.notValid(cmd = aRequest.at('cmd'))) {
        return aRequest;
    }

    if (TP.notTrue(aRequest.at('cmdEcho'))) {
        return aRequest;
    }

    //  when the text is a command we think in terms of a 'query', otherwise
    //  its a standard message
    if (cmd.startsWith(':')) {
        typ = 'query';
        out = cmd;
    } else {
        //  peel off any escape of the prefix
        if (cmd.startsWith('\\:')) {
            cmd = cmd.slice(1);
        }

        jid = this.get('targetJID');
        if (TP.notValid(jid)) {
            jid = 'undefined';
        }

        typ = 'message';
        out = TP.join('<span class="outbound_ident_time">',
                        '[', TP.dc().asTimestamp(false, false), ']',
                        '</span><span class="outbound_ident_tid">',
                            '&nbsp;&gt;&nbsp;',
                            jid.asString(),
                        '</span>&nbsp;',
                            cmd);
    }

    req = TP.sig.UserOutputRequest.construct(
            TP.hc('output', out,
                    'render', true,
                    'messageType', typ));
    req.fire(this);

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('execute',
function(aRequest) {

    var response;

    //  first make sure we can construct a valid response
    if (TP.notValid(response = aRequest.getResponse())) {
        this.raise('TP.sig.ProcessingException',
                    'Couldn\'t construct response.');

        return;
    }

    //  TODO
    //  command lookup is simple in this shell, just parse for built-ins
    //  and run them or default to a :send action

    return response;
});

//  ------------------------------------------------------------------------
//  TP.shell.YAK BUILT-INS
//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('executeAvailable',
function(aRequest) {

    /**
     * @method executeAvailable
     * @summary Updates the availability status of the current JID in response
     *     to command requests.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var args,
        jidStatus,

        yakService;

    if (!this.canSend()) {
        return aRequest.fail(
            'No active XMPP connection. Please login.');
    }

    args = this.getCommandArguments(aRequest);
    if (args.getSize() > 0) {
        jidStatus = args.join(' ');
    } else {
        jidStatus = '';
    }

    yakService = TP.uri.XMPPService.getInstanceById(this.getServiceID());
    yakService.setPresence(TP.xmpp.XMLNS.ONLINE, jidStatus);

    this.displayDebugData(yakService.get('lastMsg'));

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('executeAway',
function(aRequest) {

    /**
     * @method executeAway
     * @summary Updates the current JID's away status in response to a command
     *     request.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var args,
        jidStatus,

        yakService;

    if (!this.canSend()) {
        return aRequest.fail(
            'No active XMPP connection. Please login.');
    }

    args = this.getCommandArguments(aRequest);
    if (args.getSize() > 0) {
        jidStatus = args.join(' ');
    } else {
        jidStatus = '';
    }

    yakService = TP.uri.XMPPService.getInstanceById(this.getServiceID());
    yakService.setPresence(TP.xmpp.XMLNS.AWAY, jidStatus);

    this.displayDebugData(yakService.get('lastMsg'));

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('executeDebug',
function(aRequest) {

    /**
     * @method executeDebug
     * @summary Turns on or off debugging output in response to a command
     *     request.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var args,
        bool;

    args = this.getCommandArguments(aRequest);
    if (args.getSize() !== 0) {
        bool = TP.bc(args.at(0));
        this.set('debug', bool);
    }

    //  TODO:
    //  in debug mode we want to see packets in both directions so we need
    //  to hook into the send machinery somehow
    aRequest.set('result',
        'debug is ' + (TP.isTrue(this.get('debug')) ? 'on' : 'off'));

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('executeRegister',
function(aRequest) {

    /**
     * @method executeRegister
     * @summary Initiates a registration sequence.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    this.register();

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('executeRoster',
function(aRequest) {

    /**
     * @method executeRoster
     * @summary Requests and displays the current JIDs roster information.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var yakService;

    if (!this.canSend()) {
        return aRequest.fail(
            'No active XMPP connection. Please login.');
    }

    yakService = TP.uri.XMPPService.getInstanceById(this.getServiceID());
    yakService.fetchRoster();

    this.displayDebugData(yakService.get('lastMsg'));

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('executeSecure',
function(aRequest) {

    /**
     * @method executeSecure
     * @summary Defines a secure key for a target JID. The first argument is
     *     the JID and all remaining text is considered to be the key string to
     *     use for that JID. If no key is provided it defaults to the current
     *     window location, allowing users across a single server to have a
     *     shared default key.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var args,
        jid,
        key;

    args = this.getCommandArguments(aRequest);
    if (args.getSize() < 1) {
        //  display the current secure JIDs (but not their key strings)
        TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', TP.keys(this.get('secureJIDs')),
                    'messageType', 'response'
                    )).fire(this);

        return aRequest.complete();
    }

    jid = args.at(0);
    if (args.getSize() === 1) {
        //  when only the JID is specified the key defaults to the
        //  load URI for the application (which lets users from the
        //  same server share a key across all users of that server)
        key = window.location;
    } else {
        args.shift();
        key = args.join(' ');
    }

    this.get('secureJIDs').atPut(jid, key);

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('executeSend',
function(aRequest) {

    /**
     * @method executeSend
     * @summary Responds to requests to send content to the currently targeted
     *     JID.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var yakService,

        jid,
        key,
        msgContent;

    if (!this.canSend()) {
        return aRequest.fail(
            'No active XMPP connection. Please login.');
    }

    if (TP.notValid(jid = this.get('targetJID'))) {
        return aRequest.fail(
            'No active target JID. Use :to to set one.');
    }

    if (TP.notValid(key = this.get('secureJIDs').at(jid))) {
        msgContent = aRequest.at('cmd');
    } else {
        msgContent = aRequest.at('cmd').encrypt(key);
    }

    yakService = TP.uri.XMPPService.getInstanceById(this.getServiceID());
    yakService.sendMessage(jid, msgContent);

    this.displayDebugData(yakService.get('lastMsg'));

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('executeStatus',
function(aRequest) {

    /**
     * @method executeStatus
     * @summary Displays status information for all known JIDs (the current
     *     JID's buddy list) in response to a command request.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var pkt,
        str,
        list,
        show,
        stat,
        keys,
        i,
        item;

    str = TP.ac();
    str.push('<table width="100%" cellpadding="3" cellspacing="0"',
                ' class="xmpp_table"><thead class="xmpp_table_title">',
                    '<tr><td>JID</td>',
                    '<td>Showing</td>',
                    '<td>Status</td></tr></thead>',
                '<tbody class="xmpp_table_data">');

    list = TP.xmpp.JID.get('instances');
    keys = TP.keys(list).sort();

    for (i = 0; i < keys.getSize(); i++) {
        item = list.at(keys.at(i));
        if (TP.notValid(pkt = item.get('presence'))) {
            //  for some reason we have a JID but no presence
            show = 'unknown';
            stat = 'unknown';
        } else {
            show = TP.ifInvalid(pkt.get('show'), 'Online');
            stat = TP.ifInvalid(pkt.get('status'), '');
        }

        //  don't output those we have no data on
        if (show === 'unknown') {
            continue;
        }

        str.push('<tr><td>',
                    '<a href="#" onclick="',
                        'TP.shellExec(',
                        '\':to ', keys.at(i), '\'',
                        ', false, false, false,',
                        '\'', this.getID(), '\'',
                        ');',
                    ' return false;">',
                    keys.at(i),
                    '</a>',
                    '</td>');

        str.push('<td>', show, '</td>');
        str.push('<td>', stat, '</td>');
        str.push('</tr>');
    }

    str.push('</tbody></table>');

    str = str.join('');

    TP.sig.UserOutputRequest.construct(
            TP.hc(
                'output', str,
                'render', true,
                'messageType', 'response'
                )).fire(this);

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('executeSubscribe',
function(aRequest) {

    /**
     * @method executeSubscribe
     * @summary Places a request to subscribe to a particular JID in response
     *     to a command request.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var args,
        jid,

        yakService;

    args = this.getCommandArguments(aRequest);
    if (args.getSize() < 1) {
        return aRequest.complete();
    } else {
        jid = args.at(0);
    }

    if (!this.canSend()) {
        return aRequest.fail(
            'No active XMPP connection. Please login.');
    }

    yakService = TP.uri.XMPPService.getInstanceById(this.getServiceID());
    yakService.subscribeTo(jid);

    this.displayDebugData(yakService.get('lastMsg'));

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('executeTo',
function(aRequest) {

    /**
     * @method executeTo
     * @summary Sets the target JID for any unqualified messages, or, when
     *     followed directly by message text sends a one-time message to the JID
     *     provided without altering the default JID.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var args,
        jid,
        str,

        msgContent,
        yakService,

        out,
        req,
        key;

    args = this.getCommandArguments(aRequest);
    if (args.getSize() < 1) {
        //  display the current target
        TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', this.get('targetJID'),
                    'messageType', 'response'
                    )).fire(this);

        return aRequest.complete();
    } else if (args.getSize() === 1) {
        //  adjust default JID
        this.set('targetJID', args.at(0));

        return aRequest.complete();
    }

    //  if we got here it's because they want to send a one-time message...
    if (!this.canSend()) {
        return aRequest.fail(
            'No active XMPP connection. Please login.');
    }

    jid = args.at(0);

    args.shift();
    str = args.join(' ');

    if (TP.notValid(key = this.get('secureJIDs').at(jid))) {
        msgContent = str;
    } else {
        msgContent = str.encrypt(key);
    }

    yakService = TP.uri.XMPPService.getInstanceById(this.getServiceID());
    yakService.sendMessage(jid, msgContent);

    this.displayDebugData(yakService.get('lastMsg'));

    out = TP.join('<span class="outbound_ident_time">',
                '[', TP.dc().asTimestamp(false, false), ']',
                '</span><span class="outbound_ident_tid">',
                    '&nbsp;&gt;&nbsp;',
                    jid,
                '</span>&nbsp;',
                    str);

    req = TP.sig.UserOutputRequest.construct(
                    TP.hc('output', out,
                            'render', true,
                            'messageType', 'message'));
    req.fire(this);

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('executeUnavailable',
function(aRequest) {

    /**
     * @method executeUnavailable
     * @summary Sets the current JID's status to unavailable in response to a
     *     command request.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    return this.executeAway(aRequest);
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('executeUnsecure',
function(aRequest) {

    /**
     * @method executeUnsecure
     * @summary Removes any secure encryption key for the JID provided, making
     *     communication with that JID unsecure.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var args,
        jid;

    args = this.getCommandArguments(aRequest);
    if (args.getSize() !== 1) {
        aRequest.atPut('topic', 'unsecure');

        return this.executeHelpTopic(aRequest);
    }

    jid = args.at(0);
    this.get('secureJIDs').removeKey(jid);

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineMethod('executeUnsubscribe',
function(aRequest) {

    /**
     * @method executeUnsubscribe
     * @summary Responds to requests to unsubscribe the current JID from a
     *     particular target JID's presence updates.
     * @param {TP.sig.ShellRequest} aRequest The request containing the command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var args,
        jid,
        yakService;

    args = this.getCommandArguments(aRequest);
    if (args.getSize() < 1) {
        return aRequest.complete();
    } else {
        jid = args.at(0);
    }

    if (!this.canSend()) {
        return aRequest.fail(
            'No active XMPP connection. Please login.');
    }

    yakService = TP.uri.XMPPService.getInstanceById(this.getServiceID());
    yakService.unsubscribeFrom(jid);

    this.displayDebugData(yakService.get('lastMsg'));

    return aRequest.complete();
});

//  ------------------------------------------------------------------------
//  INBOUND TRAFFIC
//  ------------------------------------------------------------------------

TP.shell.YAK.Inst.defineHandler('XMPPInput',
function(aSignal) {

    /**
     * @method handleXMPPInput
     * @summary Responds to notifications of XMPP input. This method provides
     *     the hook between the XMPP data stream and the console, allowing the
     *     console to see packets as they arrive.
     * @param {TP.sig.XMPPInput} aSignal The triggering signal.
     * @returns {TP.shell.YAK} The receiver.
     */

    var str,
        args,
        node,
        render;

    if (TP.notValid(aSignal) || TP.notValid(args = aSignal.getPayload())) {
        TP.ifWarn() ?
            TP.warn('Invalid signal data for TP.sig.XMPPInput event.') : 0;

        return this;
    }

    if (TP.notValid(node = args.at('node'))) {
        TP.ifWarn() ?
            TP.warn('Missing stanza data for TP.sig.XMPPInput event.') : 0;

        return this;
    }

    //  hold node to support :reply
    this.set('lastNode', node);

    render = false;

    //  produce debug output as needed
    if (TP.isTrue(this.get('debug'))) {
        str = '[RECV]\n' +
                node.getTypeName() + ':\n' +
                node.asString() + '\n';

        TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', str,
                    'render', render,
                    'messageType', 'debug'
                    )).fire(this);
    }

    try {
        str = node.asConsoleString(this);
        render = node.shouldRenderConsoleString();

        TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', str,
                    'render', render,
                    'messageType', 'message'
                    )).fire(this);
    } catch (e) {
        TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', TP.str(e),
                    'messageType', 'failure'
                    )).fire(this);
    }

    try {
        //  give the node a chance to respond to arrival
        if (TP.canInvoke(node, 'handleArrival')) {
            aSignal.set('console', this);
            node[TP.composeHandlerName('Arrival')](aSignal);
        }
    } catch (e) {
        TP.sig.UserOutputRequest.construct(
                TP.hc(
                    'output', TP.str(e),
                    'messageType', 'failure'
                    )).fire(this);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
