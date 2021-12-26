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
 * @type {TP.lama.CouchDBSubInspectorSources}
 */

//  ------------------------------------------------------------------------

TP.lama.InspectorPathSource.defineSubtype('lama.CouchDBSubInspectorSources');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineAttribute('serverAddress');
TP.lama.CouchDBSubInspectorSources.Inst.defineAttribute('databaseName');
TP.lama.CouchDBSubInspectorSources.Inst.defineAttribute('documentID');
TP.lama.CouchDBSubInspectorSources.Inst.defineAttribute('appAndViewName');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.lama.CouchDBSubInspectorSources} The receiver.
     */

    this.callNextMethod();

    /* eslint-disable no-useless-escape */

    //  Servers

    //  What methods will be resolved and queried when the server name (i.e.
    //  'localhost') is *selected*.
    this.registerMethodSuffixForPath(
            'ServerDesignation',
            TP.ac('Remote', 'CouchDB', 'CouchDB_Server_\\d+'));

    //  What methods will be resolved and queried when 'Server Info' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'ServerInfo',
            TP.ac('Remote', 'CouchDB', 'CouchDB_Server_\\d+', 'Server Info'));

    //  What methods will be resolved and queried when 'All Databases' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'AllDatabases',
            TP.ac('Remote', 'CouchDB', 'CouchDB_Server_\\d+', 'All Databases'));

    //  Databases

    //  What methods will be resolved and queried when the database name (i.e.
    //  'testdb') is *selected*.
    this.registerMethodSuffixForPath(
            'DatabaseDesignation',
            TP.ac('Remote', 'CouchDB', 'CouchDB_Server_\\d+', 'All Databases',
                    '\.+'));

    //  What methods will be resolved and queried when 'Database Info' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'DatabaseInfo',
            TP.ac('Remote', 'CouchDB', 'CouchDB_Server_\\d+', 'All Databases',
                    '\.+', 'Database Info'));

    //  What methods will be resolved and queried when 'All Documents' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'AllDocuments',
            TP.ac('Remote', 'CouchDB', 'CouchDB_Server_\\d+', 'All Databases',
                    '\.+', 'All Documents'));

    //  What methods will be resolved and queried when 'Design Documents' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'DesignDocuments',
            TP.ac('Remote', 'CouchDB', 'CouchDB_Server_\\d+', 'All Databases',
                    '\.+', 'Design Documents'));

    //  What methods will be resolved and queried when 'Views' is *selected*.
    this.registerMethodSuffixForPath(
            'Views',
            TP.ac('Remote', 'CouchDB', 'CouchDB_Server_\\d+', 'All Databases',
                    '\.+', 'Views'));

    //  Documents

    //  What methods will be resolved and queried when a document under 'All
    //  Documents' or 'Design Documents' is *selected*.
    this.registerMethodSuffixForPath(
            'DocumentContent',
            TP.ac('Remote', 'CouchDB', 'CouchDB_Server_\\d+', 'All Databases',
                    '\.+', '(All|Design) Documents', '\.+'));

    //  Views

    //  What methods will be resolved and queried when a view under 'Views'
    //  is *selected*.
    this.registerMethodSuffixForPath(
            'ViewContent',
            TP.ac('Remote', 'CouchDB', 'CouchDB_Server_\\d+', 'All Databases',
                    '\.+', 'Views', '\.+'));

    /* eslint-enable no-useless-escape */

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('checkAuthentication',
function() {

    /**
     * @method checkAuthentication
     * @summary Returns whether or not this object is authenticated with the
     *     CouchDB server in its currently configured server address to perform
     *     its required operations.
     * @returns {Boolean} Whether or not we're authenticated.
     */

    var serverURI,
        isAuthenticated;

    serverURI = TP.uc(this.get('serverAddress'));

    isAuthenticated =
        TP.uri.CouchDBURLHandler.isAuthenticated(serverURI, '_admin');

    return isAuthenticated;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getAuthenticationContent',
function(options) {

    /**
     * @method getAuthenticationContent
     * @summary Returns the Element containing user interface content that
     *     allows the user to authenticate.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Element} The content used for authentication GUI for the user.
     */

    var authPanelLoc,
        authPanelReq,
        authPanelResp,

        win,

        bayNum;

    //  Grab the authenication panel content.
    authPanelLoc =
        TP.uc('~ide_root/TP.lama.inspector/couch/auth_panel.xhtml').
        getLocation();

    authPanelReq = TP.request('uri', authPanelLoc, 'async', false);
    authPanelResp = TP.httpGet(authPanelLoc, authPanelReq);

    win = TP.sys.getUIRoot().getNativeWindow();

    //  The bay that the login panel will be drawn into is one more than what is
    //  currently there and can be computed by the total number of bays.
    bayNum = options.at('pathParts').getSize();

    //  After we repaint, and the 'bay inspector item' is real, then set up a
    //  UIDidFocus handler on that item to focus the username field.
    (function() {

        var inspector,
            bayTPElem,
            usernameTPElem;

        inspector = TP.byId('LamaInspector', win);
        bayTPElem = inspector.getBayFromSlotPosition(bayNum);

        //  Set up the UIDidFocus handler directly on the bay inspector item.
        bayTPElem.defineHandler('UIDidFocus',
            function(aSignal) {

                //  Make sure to remove this handler because this bay inspector
                //  item will be reused.
                delete bayTPElem[TP.composeHandlerName('UIDidFocus')];

                //  Grab the username field and focus it.
                usernameTPElem = bayTPElem.get('.username');
                usernameTPElem.focus();
            });

    }).queueAfterNextRepaint(win);

    //  Grab the result of the response and return it's documentElement (i.e.
    //  root element).
    return authPanelResp.get('result').documentElement;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspector',
function(options) {

    /**
     * @method getConfigForInspector
     * @summary Returns the source's configuration data to configure the bay
     *     that the source's content will be hosted in.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {TP.core.Hash} Configuration data used by the inspector for bay
     *     configuration. This could have the following keys, amongst others:
     *          TP.ATTR + '_childtype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay inspector item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     */

    if (!this.checkAuthentication()) {
        options.atPut(TP.ATTR + '_childtype', 'xctrls:list');
        return options;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary Returns the source's content that will be hosted in an inspector
     *     bay.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Element} The Element that will be used as the content for the
     *     bay.
     */

    if (!this.checkAuthentication()) {
        return this.getAuthenticationContent(options);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
     *     the content using TIBET data binding. Therefore, when this data
     *     changes, the content will be refreshed to reflect that.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the data. This will have the following keys, amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Object} The data that will be supplied to the content hosted in
     *     a bay.
     */

    if (!this.checkAuthentication()) {
        return null;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getContentForToolbar',
function(options) {

    /**
     * @method getContentForToolbar
     * @summary Returns the source's content that will be hosted in an inspector
     *     toolbar.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Element} The Element that will be used as the content for the
     *     toolbar.
     */

    if (!this.checkAuthentication()) {
        return null;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineHandler('AuthenticateConnection',
function() {

    /**
     * @method handleAuthenticateConnection
     * @summary Handles when the user has completed authentication information
     *     in the UI in an attempt to authenticate a CouchDB connection.
     * @param {TP.sig.AuthenticateConnection} aSignal The signal indicating that
     *     the user has dismisse
     * @returns {TP.lama.CouchDBSubInspectorSources} The receiver.
     */

    var inspector,
        content,

        username,
        password,

        message,

        serverURI,

        authRequest;

    //  Grab the current bay content.
    inspector = TP.byId('LamaInspector', TP.sys.getUIRoot());
    content = inspector.getInspectorBayContentItem();

    //  Grab the username and password fields from that content.
    username = TP.byCSSPath('.username', content, true);
    password = TP.byCSSPath('.password', content, true);

    //  Grab the message output to the user from that content, show it and a
    //  message that we're authenticating.
    message = TP.byCSSPath('.login_user_message', content, true);
    message.setRawContent(TP.sc('Attempting authentication...'));
    message.setAttribute('hidden', false);

    serverURI = TP.uc(this.get('serverAddress'));

    //  Authenticate the server URI that we're using with the CouchDBURLHandler
    //  using the supplied username and password. Note that this object will
    //  handle the request itself, such that we won't need to fire it.
    authRequest = TP.uri.CouchDBURLHandler.authenticate(
                            serverURI,
                            username.getValue(),
                            password.getValue());

    //  The authentication succeeded - reload the bay we were using to display
    //  the authentication UI and size the inspector to the new content.
    authRequest.defineHandler('RequestSucceeded',
        function(aResponse) {
            inspector.reloadCurrentBay();
        });

    //  The authentication failed - let the user know by setting the message
    //  output. Reset the username and password to empty values and focus the
    //  username field.
    authRequest.defineHandler('401',
        function(aResponse) {
            message.setRawContent(TP.sc('Login failed'));

            username.setValue('');
            password.setValue('');

            username.focus();
        });

    return this;
});

//  ------------------------------------------------------------------------
//  Inspector Config Methods
//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForAllDatabases',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForAllDocuments',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForDesignDocuments',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForViews',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForDatabaseDesignation',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForDatabaseInfo',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'lama:urieditor');

    return options;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForDocumentContent',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'lama:urieditor');

    return options;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForServerDesignation',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForServerInfo',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'lama:urieditor');

    return options;
});

//  ------------------------------------------------------------------------
//  Inspector Content Methods
//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForAllDatabases',
function(options) {

    var dataURI,
        elem;

    dataURI = TP.uc(options.at('bindLoc'));

    elem = TP.elem(
            '<xctrls:list filter="true"' +
            ' alwayschange="true" itemtoggle="false"/>');

    TP.elementSetAttribute(
            elem, 'bind:in', '{data: ' + dataURI.asString() + '}', true);

    return elem;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForAllDocuments',
function(options) {

    var dataURI,
        elem;

    dataURI = TP.uc(options.at('bindLoc'));

    elem = TP.elem(
            '<xctrls:list filter="true"' +
            ' alwayschange="true" itemtoggle="false"/>');

    TP.elementSetAttribute(
            elem, 'bind:in', '{data: ' + dataURI.asString() + '}', true);

    return elem;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForDesignDocuments',
function(options) {

    var dataURI,
        elem;

    dataURI = TP.uc(options.at('bindLoc'));

    elem = TP.elem(
            '<xctrls:list filter="true"' +
            ' alwayschange="true" itemtoggle="false"/>');

    TP.elementSetAttribute(
            elem, 'bind:in', '{data: ' + dataURI.asString() + '}', true);

    return elem;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForViews',
function(options) {

    var dataURI,
        elem;

    dataURI = TP.uc(options.at('bindLoc'));

    elem = TP.elem(
            '<xctrls:list filter="true"' +
            ' alwayschange="true" itemtoggle="false"/>');

    TP.elementSetAttribute(
            elem, 'bind:in', '{data: ' + dataURI.asString() + '}', true);

    return elem;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForDatabaseDesignation',
function(options) {

    var dataURI,
        elem;

    dataURI = TP.uc(options.at('bindLoc'));

    elem = TP.elem(
            '<xctrls:list filter="true"' +
            ' alwayschange="true" itemtoggle="false"/>');

    TP.elementSetAttribute(
            elem, 'bind:in', '{data: ' + dataURI.asString() + '}', true);

    return elem;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForDatabaseInfo',
function(options) {

    var loc,
        locURI,

        uriEditorElem;

    //  The same data as we get when we get data for this target.
    loc = this.get('serverAddress') +
            '/' +
            this.get('databaseName');
    locURI = TP.uc(loc);

    options.atPut('useiframe', false);
    uriEditorElem = TP.getContentForTool(locURI, 'Inspector', options);

    return uriEditorElem;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForDocumentContent',
function(options) {

    var loc,
        locURI,

        uriEditorElem;

    //  The same data as we get when we get data for this target.
    loc = this.get('serverAddress') +
            '/' +
            this.get('databaseName') +
            '/' +
            this.get('documentID');
    locURI = TP.uc(loc);

    options.atPut('useiframe', false);
    uriEditorElem = TP.getContentForTool(locURI, 'Inspector', options);

    return uriEditorElem;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForServerDesignation',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem(
            '<xctrls:list bind:in="{data: ' +
            dataURI.asString() +
            '}" filter="true" alwayschange="true" itemtoggle="false"/>');
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForServerInfo',
function(options) {

    var loc,
        locURI,

        uriEditorElem;

    //  The same data as we get when we get data for this target.
    loc = this.get('serverAddress');
    locURI = TP.uc(loc);

    options.atPut('useiframe', false);
    uriEditorElem = TP.getContentForTool(locURI, 'Inspector', options);

    return uriEditorElem;
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getChildTypeForCanvasForDocumentContent',
function(options) {

    return 'remote/CouchDB/document';
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getChildTypeForCanvasForViewContent',
function(options) {

    return 'remote/CouchDB/view';
});

//  ------------------------------------------------------------------------
//  Inspector Data Methods
//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForAllDatabases',
function(options) {

    var dataURI,

        loc;

    dataURI = TP.uc(options.at('bindLoc'));

    loc = this.get('serverAddress') + '/_all_dbs';

    TP.uc(loc).getResource(
                TP.hc('refresh', true,
                        'async', true,
                        'resultType', TP.WRAP)
                ).then(
                function(result) {
                    var dbNames,
                        data;

                    dbNames = result.get('data');
                    data = TP.ac();

                    dbNames.forEach(
                        function(aName) {
                            data.push(TP.ac(aName, aName));
                        });

                    dataURI.setResource(data);
                }).catch(
                function(err) {
                    TP.ifError() ?
                        TP.error('Error fetching all Couch databases: ' +
                                    TP.str(err)) : 0;
                });

    return TP.ac('Data Loading...');
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForAllDocuments',
function(options) {

    var dataURI,
        dbName,

        loc;

    dataURI = TP.uc(options.at('bindLoc'));
    dbName = this.get('databaseName');

    loc = this.get('serverAddress') +
            '/' +
            dbName +
            '/_all_docs';

    TP.uc(loc).getResource(
                TP.hc('refresh', true,
                        'async', true,
                        'resultType', TP.WRAP)
                ).then(
                function(result) {

                    var data;

                    data = result.get(TP.jpc('rows[0:].id',
                                        TP.hc('shouldCollapse', false)));

                    data = data.collect(
                            function(docID) {
                                return TP.ac(docID, docID);
                            });

                    dataURI.setResource(data);
                }).catch(
                function(err) {
                    TP.ifError() ?
                        TP.error('Error fetching all documents for Couch' +
                                    ' database:' + dbName + ': ' +
                                    TP.str(err)) : 0;
                });

    return TP.ac('Data Loading...');
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForDesignDocuments',
function(options) {

    var dataURI,
        dbName,

        loc;

    dataURI = TP.uc(options.at('bindLoc'));
    dbName = this.get('databaseName');

    loc = this.get('serverAddress') +
            '/' +
            dbName +
            '/_all_docs?startkey="_design"&endkey="_design0"';

    TP.uc(loc).getResource(
                TP.hc('refresh', true,
                        'async', true,
                        'resultType', TP.WRAP)
                ).then(
                function(result) {

                    var data;

                    data = result.get(TP.jpc('rows[0:].id',
                                        TP.hc('shouldCollapse', false)));

                    data = data.collect(
                            function(docID) {
                                return TP.ac(docID, docID);
                            });

                    dataURI.setResource(data);
                }).catch(
                function(err) {
                    TP.ifError() ?
                        TP.error('Error fetching design documents for Couch' +
                                    ' database:' + dbName + ': ' +
                                    TP.str(err)) : 0;
                });

    return TP.ac('Data Loading...');
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForViews',
function(options) {

    var dataURI,
        dbName,

        serverAddr,

        loc,

        appNames;

    dataURI = TP.uc(options.at('bindLoc'));
    dbName = this.get('databaseName');

    serverAddr = this.get('serverAddress');

    loc = serverAddr +
            '/' +
            dbName +
            '/_all_docs?startkey="_design"&endkey="_design0"';

    appNames = TP.ac();

    TP.uc(loc).getResource(
                TP.hc('refresh', true,
                        'async', true,
                        'resultType', TP.WRAP)
                ).then(
                function(result) {

                    var data,

                        startLoc,

                        promises;

                    data = result.get(TP.jpc('rows[0:].id',
                                        TP.hc('shouldCollapse', false)));

                    startLoc = serverAddr + '/' + dbName + '/';

                    promises = data.collect(
                            function(docID) {
                                var fetchLoc;

                                appNames.push(
                                    docID.slice(docID.indexOf('/') + 1));

                                fetchLoc = startLoc + docID;

                                //  NB: This returns a Promise.
                                return TP.uc(fetchLoc).getResource(
                                            TP.hc('refresh', true,
                                                    'async', true,
                                                    'resultType', TP.WRAP)
                                            );
                            });

                    //  NOTE THAT FETCHING IS STILL HAPPENING ASYNCHRONOUSLY
                    //  HERE.
                    return Promise.all(promises);
                }).then(
                function(result) {

                    var data;

                    data = result.collect(
                            function(record) {
                                return TP.keys(record.get(TP.jpc('$.views')));
                            });

                    data = data.flatten();

                    data = data.collect(
                            function(docID, index) {
                                return TP.ac(
                                        appNames.at(index) + '/' + docID,
                                        docID);
                            });

                    dataURI.setResource(data);
                }).catch(
                function(err) {
                    TP.ifError() ?
                        TP.error('Error fetching all documents for Couch' +
                                    ' database:' + dbName + ': ' +
                                    TP.str(err)) : 0;
                });

    return TP.ac('Data Loading...');
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForDatabaseDesignation',
function(options) {

    this.set('databaseName', options.at('targetAspect'));

    return TP.ac(
            TP.ac('Database Info', 'Database Info'),
            TP.ac('All Documents', 'All Documents'),
            TP.ac('Design Documents', 'Design Documents'),
            TP.ac('Views', 'Views')
    );
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForDatabaseInfo',
function(options) {

    var loc;

    loc = this.get('serverAddress') +
            '/' +
            this.get('databaseName');

    return TP.uc(loc);
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForDocumentContent',
function(options) {

    var loc;

    if (TP.notEmpty(options.at('targetAspect'))) {
        this.set('documentID', options.at('targetAspect'));
    }

    loc = this.get('serverAddress') +
            '/' +
            this.get('databaseName') +
            '/' +
            this.get('documentID');

    return TP.uc(loc);
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForServerDesignation',
function(options) {

    return TP.ac(
            TP.ac('Server Info', 'Server Info'),
            TP.ac('All Databases', 'All Databases')
    );
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForServerInfo',
function(options) {

    var loc;

    loc = this.get('serverAddress');

    return TP.uc(loc);
});

//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForViewContent',
function(options) {

    var appAndViewName,
        nameParts,
        loc;

    if (TP.notEmpty(options.at('targetAspect'))) {
        this.set('appAndViewName', options.at('targetAspect'));
    }

    appAndViewName = this.get('appAndViewName');
    nameParts = appAndViewName.split('/');

    loc = this.get('serverAddress') +
            '/' +
            this.get('databaseName') +
            '/_design/' +
            nameParts.first() +
            '/_view/' +
            nameParts.last();

    return TP.uc(loc);
});

//  ------------------------------------------------------------------------
//  Toolbar API
//  ------------------------------------------------------------------------

TP.lama.CouchDBSubInspectorSources.Inst.defineMethod('getContentForToolbarForDocumentContent',
function(options) {

    return TP.elem(
        '<lama:uriEditorToolbarContent id="uriEditorToolbarContent" tibet:ctrl="inspectorEditor"/>');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
