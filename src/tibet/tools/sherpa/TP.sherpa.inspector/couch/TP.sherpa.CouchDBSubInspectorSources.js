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
 * @type {TP.sherpa.CouchDBSubInspectorSources}
 */

//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.defineSubtype('sherpa.CouchDBSubInspectorSources');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineAttribute('serverAddress');
TP.sherpa.CouchDBSubInspectorSources.Inst.defineAttribute('databaseName');
TP.sherpa.CouchDBSubInspectorSources.Inst.defineAttribute('documentID');
TP.sherpa.CouchDBSubInspectorSources.Inst.defineAttribute('appAndViewName');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.defineDependencies('TP.extern.Promise');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.sherpa.CouchDBSubInspectorSources} The receiver.
     */

    this.callNextMethod();

    /* eslint-disable no-useless-escape */

    //  Servers

    //  What methods will be resolved and queried when the server name (i.e.
    //  'localhost') is *selected*.
    this.registerMethodSuffixForPath(
            'ServerDesignation',
            TP.ac('REST',
                    TP.PATH_SEP,
                    'CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+'));

    //  What methods will be resolved and queried when 'Server Info' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'ServerInfo',
            TP.ac('REST',
                    TP.PATH_SEP,
                    'CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'Server Info'
                    ));

    //  What methods will be resolved and queried when 'All Databases' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'AllDatabases',
            TP.ac('REST',
                    TP.PATH_SEP,
                    'CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'All Databases'
                    ));

    //  Databases

    //  What methods will be resolved and queried when the database name (i.e.
    //  'testdb') is *selected*.
    this.registerMethodSuffixForPath(
            'DatabaseDesignation',
            TP.ac('REST',
                    TP.PATH_SEP,
                    'CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    '\.+'
                    ));

    //  What methods will be resolved and queried when 'Database Info' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'DatabaseInfo',
            TP.ac('REST',
                    TP.PATH_SEP,
                    'CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    TP.PATH_SEP,
                    '\.+',
                    TP.PATH_SEP,
                    'Database Info'
                    ));

    //  What methods will be resolved and queried when 'All Documents' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'AllDocuments',
            TP.ac('REST',
                    TP.PATH_SEP,
                    'CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    TP.PATH_SEP,
                    '\.+',
                    TP.PATH_SEP,
                    'All Documents'
                    ));

    //  What methods will be resolved and queried when 'Design Documents' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'DesignDocuments',
            TP.ac('REST',
                    TP.PATH_SEP,
                    'CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    TP.PATH_SEP,
                    '\.+',
                    TP.PATH_SEP,
                    'Design Documents'
                    ));

    //  What methods will be resolved and queried when 'Views' is *selected*.
    this.registerMethodSuffixForPath(
            'Views',
            TP.ac('REST',
                    TP.PATH_SEP,
                    'CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    TP.PATH_SEP,
                    '\.+',
                    TP.PATH_SEP,
                    'Views'
                    ));

    //  Documents

    //  What methods will be resolved and queried when a document under 'All
    //  Documents' or 'Design Documents' is *selected*.
    this.registerMethodSuffixForPath(
            'DocumentContent',
            TP.ac('REST',
                    TP.PATH_SEP,
                    'CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    TP.PATH_SEP,
                    '\.+',
                    TP.PATH_SEP,
                    '(All|Design) Documents',
                    '\.+'
                    ));

    //  Views

    //  What methods will be resolved and queried when a view under 'Views'
    //  is *selected*.
    this.registerMethodSuffixForPath(
            'ViewContent',
            TP.ac('REST',
                    TP.PATH_SEP,
                    'CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    TP.PATH_SEP,
                    '\.+',
                    TP.PATH_SEP,
                    'Views',
                    '\.+'
                    ));

    /* eslint-enable no-useless-escape */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('checkAuthentication',
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

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspector',
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
     *          TP.ATTR + '_contenttype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay inspector item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     */

    if (!this.checkAuthentication()) {
        options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');
        return options;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspector',
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
        return this.requestAuthentication();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspector',
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

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentForToolbar',
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

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('requestAuthentication',
function() {

    /**
     * @method requestAuthentication
     * @summary Initialize the instance.
     * @returns {TP.sherpa.CouchDBSubInspectorSources} The receiver.
     */

    var elem;

    //  TODO:   move this to a template file...and preferably make it a tag
    elem = TP.xhtmlnode(
        '<div class="couchdbsubinspectorsauth" tibet:ctrl="urn:tibet:sherpa_inspector_target">' +
            '<label for="username_field">Username:</label>' +
            '<input id="username_field" type="text"/>' +
            '<br/>' +
            '<label for="password_field">Password:</label>' +
            '<input id="password_field" type="password"/>' +
            '<br/>' +
            '<button id="couchlogin" on:UIActivate="AuthenticateConnection">Login</button>' +
            '<br/>' +
            '<a target="_blank" href="https://technicalpursuit.com/docs/couchdb.html">' +
            'see TIBET+CouchDB for help...</a>' +
            '<br/>' +
            '<span id="user_message" pclass:hidden="true"></span>' +
        '</div>');

    return elem;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineHandler('AuthenticateConnection',
function() {

    var inspector,
        content,

        username,
        password,

        message,

        serverURI,

        authRequest;

    inspector = TP.byId('SherpaInspector', TP.win('UIROOT'));
    content = inspector.getInspectorBayContentItem();

    username = TP.byId('username_field', content);
    password = TP.byId('password_field', content);

    message = TP.byId('user_message', content);
    message.setAttribute('hidden', true);

    serverURI = TP.uc(this.get('serverAddress'));


    authRequest = TP.uri.CouchDBURLHandler.authenticate(
                            serverURI,
                            username.getValue(),
                            password.getValue());

    authRequest.defineHandler('RequestSucceeded',
        function(aResponse) {
            inspector.repopulateBay();
            inspector.sizeBays();
            inspector.scrollBaysToEnd();
        });

    authRequest.defineHandler('401',
        function(aResponse) {
            message.setRawContent('Login failed');
            message.setAttribute('hidden', false);

            username.setValue('');
            password.setValue('');

            username.focus();
        });

    return this;
});

//  ------------------------------------------------------------------------
//  Inspector Config Methods
//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForAllDatabases',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForAllDocuments',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForDesignDocuments',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForViews',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForDatabaseDesignation',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForDatabaseInfo',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'sherpa:urieditor');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForDocumentContent',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'sherpa:urieditor');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForServerDesignation',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getConfigForInspectorForServerInfo',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'sherpa:urieditor');

    return options;
});

//  ------------------------------------------------------------------------
//  Inspector Content Methods
//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForAllDatabases',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForAllDocuments',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForDesignDocuments',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForViews',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForDatabaseDesignation',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForDatabaseInfo',
function(options) {

    var loc,
        locURI,

        uriEditorElem;

    //  The same data as we get when we get data for this target.
    loc = this.get('serverAddress') +
            '/' +
            this.get('databaseName');
    locURI = TP.uc(loc);

    uriEditorElem = TP.getContentForTool(locURI, 'Inspector', options);

    return uriEditorElem;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForDocumentContent',
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

    uriEditorElem = TP.getContentForTool(locURI, 'Inspector', options);

    return uriEditorElem;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForServerDesignation',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentForInspectorForServerInfo',
function(options) {

    var loc,
        locURI,

        uriEditorElem;

    //  The same data as we get when we get data for this target.
    loc = this.get('serverAddress');
    locURI = TP.uc(loc);

    uriEditorElem = TP.getContentForTool(locURI, 'Inspector', options);

    return uriEditorElem;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentTypeForCanvasForDocumentContent',
function(options) {

    return 'uri/CouchDB/document';
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentTypeForCanvasForViewContent',
function(options) {

    return 'uri/CouchDB/view';
});

//  ------------------------------------------------------------------------
//  Inspector Data Methods
//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForAllDatabases',
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

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForAllDocuments',
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

                    data = result.get(TP.tpc('rows[0:].id',
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

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForDesignDocuments',
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

                    data = result.get(TP.tpc('rows[0:].id',
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

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForViews',
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

                    data = result.get(TP.tpc('rows[0:].id',
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

                    return TP.extern.Promise.all(promises);
                }).then(
                function(result) {

                    var data;

                    data = result.collect(
                            function(record) {
                                return record.get(TP.tpc('views')).getKeys();
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

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForDatabaseDesignation',
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

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForDatabaseInfo',
function(options) {

    var loc;

    loc = this.get('serverAddress') +
            '/' +
            this.get('databaseName');

    return TP.uc(loc);
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForDocumentContent',
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

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForServerDesignation',
function(options) {

    return TP.ac(
            TP.ac('Server Info', 'Server Info'),
            TP.ac('All Databases', 'All Databases')
    );
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForServerInfo',
function(options) {

    var loc;

    loc = this.get('serverAddress');

    return TP.uc(loc);
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getDataForInspectorForViewContent',
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

TP.sherpa.CouchDBSubInspectorSources.Inst.defineMethod('getContentForToolbarForDocumentContent',
function(options) {

    return TP.elem(
        '<sherpa:uriEditorToolbarContent tibet:ctrl="inspectorEditor"/>');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
