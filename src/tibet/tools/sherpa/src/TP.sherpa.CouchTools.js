//  ------------------------------------------------------------------------
//  Sherpa Couch Tool API
//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.defineSubtype('sherpa.CouchTools');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineAttribute('serverAddress');
TP.sherpa.CouchTools.Inst.defineAttribute('databaseName');
TP.sherpa.CouchTools.Inst.defineAttribute('documentID');
TP.sherpa.CouchTools.Inst.defineAttribute('appAndViewName');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Type.defineMethod('fetchURI',
function(aURI) {

    var params,

        fetchRequest,
        fetchResponse;

    params = TP.hc('refresh', true,
                    'async', true,
                    'resultType', TP.WRAP);

    fetchRequest = TP.sig.HTTPRequest.construct(params);

    aURI.getResource(fetchRequest);

    fetchResponse = fetchRequest.getResponse();

    return fetchResponse;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.sherpa.CouchTools} The receiver.
     */

    this.callNextMethod();

    /* eslint-disable no-useless-escape */

    //  Servers

    this.registerMethodSuffixForPath(
            'ServerDesignation',
            TP.ac('CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+'));

    this.registerMethodSuffixForPath(
            'ServerInfo',
            TP.ac('CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'Server Info'
                    ));

    this.registerMethodSuffixForPath(
            'AllDatabases',
            TP.ac('CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'All Databases'
                    ));

    //  Databases

    this.registerMethodSuffixForPath(
            'DatabaseDesignation',
            TP.ac('CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    '\.+'
                    ));

    this.registerMethodSuffixForPath(
            'DatabaseInfo',
            TP.ac('CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    TP.PATH_SEP,
                    '\.+',
                    TP.PATH_SEP,
                    'Database Info'
                    ));

    this.registerMethodSuffixForPath(
            'AllDocuments',
            TP.ac('CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    TP.PATH_SEP,
                    '\.+',
                    TP.PATH_SEP,
                    'All Documents'
                    ));

    this.registerMethodSuffixForPath(
            'DesignDocuments',
            TP.ac('CouchDB',
                    TP.PATH_SEP,
                    'CouchDB_Server_\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    TP.PATH_SEP,
                    '\.+',
                    TP.PATH_SEP,
                    'Design Documents'
                    ));

    this.registerMethodSuffixForPath(
            'Views',
            TP.ac('CouchDB',
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

    this.registerMethodSuffixForPath(
            'DocumentContent',
            TP.ac('CouchDB',
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

    this.registerMethodSuffixForPath(
            'ViewContent',
            TP.ac('CouchDB',
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

TP.sherpa.CouchTools.Inst.defineMethod('checkAuthentication',
function() {

    var serverURI,
        isAuthenticated;

    serverURI = TP.uc(this.get('serverAddress'));
    isAuthenticated = TP.couchdb.CouchDBURLHandler.isAuthenticatedURI(serverURI);

    return isAuthenticated;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForInspector',
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

TP.sherpa.CouchTools.Inst.defineMethod('getContentForInspector',
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

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspector',
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

TP.sherpa.CouchTools.Inst.defineMethod('getContentForToolbar',
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

TP.sherpa.CouchTools.Inst.defineMethod('requestAuthentication',
function() {

    /**
     * @method requestAuthentication
     * @summary Initialize the instance.
     * @returns {TP.sherpa.CouchTools} The receiver.
     */

    var elem;

    elem = TP.xhtmlnode(
        '<div tibet:ctrl="urn:tibet:sherpa_inspector_target" style="font-size: 77%">' +
            '<label for="username_field">Username:</label>' +
            '<input id="username_field" type="text"/>' +
            '<br/>' +
            '<label for="password_field">Password:</label>' +
            '<input id="password_field" type="password"/>' +
            '<br/>' +
            '<button on:UIActivate="AuthenticateConnection">Log Me In</button>' +
            '<br/>' +
            '<span id="user_message" pclass:hidden="true"></span>' +
        '</div>');

    return elem;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineHandler('AuthenticateConnection',
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


    authRequest = TP.couchdb.CouchDBURLHandler.authenticate(
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

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForInspectorForAllDatabases',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForInspectorForAllDocuments',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForInspectorForDesignDocuments',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForInspectorForViews',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForInspectorForDatabaseDesignation',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForInspectorForDatabaseInfo',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'sherpa:urieditor');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForInspectorForDocumentContent',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'sherpa:urieditor');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForInspectorForServerDesignation',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForInspectorForServerInfo',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'sherpa:urieditor');

    return options;
});

//  ------------------------------------------------------------------------
//  Inspector Content Methods
//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForInspectorForAllDatabases',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForInspectorForAllDocuments',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForInspectorForDesignDocuments',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForInspectorForViews',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForInspectorForDatabaseDesignation',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForInspectorForDatabaseInfo',
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

TP.sherpa.CouchTools.Inst.defineMethod('getContentForInspectorForDocumentContent',
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

TP.sherpa.CouchTools.Inst.defineMethod('getContentForInspectorForServerDesignation',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForInspectorForServerInfo',
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

TP.sherpa.CouchTools.Inst.defineMethod('getContentTypeForCanvasForDocumentContent',
function(options) {

    return 'uri/CouchDB/document';
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentTypeForCanvasForViewContent',
function(options) {

    return 'uri/CouchDB/view';
});

//  ------------------------------------------------------------------------
//  Inspector Data Methods
//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspectorForAllDatabases',
function(options) {

    var dataURI,

        loc;

    dataURI = TP.uc(options.at('bindLoc'));

    loc = this.get('serverAddress') + '/_all_dbs';
    this.getType().fetchURI(TP.uc(loc)).then(
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

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspectorForAllDocuments',
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

    this.getType().fetchURI(TP.uc(loc)).then(
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

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspectorForDesignDocuments',
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

    this.getType().fetchURI(TP.uc(loc)).then(
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

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspectorForViews',
function(options) {

    var dataURI,
        dbName,

        serverAddr,

        loc,

        appNames,

        thisType;

    dataURI = TP.uc(options.at('bindLoc'));
    dbName = this.get('databaseName');

    serverAddr = this.get('serverAddress');

    loc = serverAddr +
            '/' +
            dbName +
            '/_all_docs?startkey="_design"&endkey="_design0"';

    appNames = TP.ac();

    thisType = this.getType();

    this.getType().fetchURI(TP.uc(loc)).then(
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
                                return thisType.fetchURI(TP.uc(fetchLoc));
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

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspectorForDatabaseDesignation',
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

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspectorForDatabaseInfo',
function(options) {

    var loc;

    loc = this.get('serverAddress') +
            '/' +
            this.get('databaseName');

    return TP.uc(loc);
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspectorForDocumentContent',
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

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspectorForServerDesignation',
function(options) {

    return TP.ac(
            TP.ac('Server Info', 'Server Info'),
            TP.ac('All Databases', 'All Databases')
    );
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspectorForServerInfo',
function(options) {

    var loc;

    loc = this.get('serverAddress');

    return TP.uc(loc);
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspectorForViewContent',
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

TP.sherpa.CouchTools.Inst.defineMethod('getContentForToolbarForDocumentContent',
function(options) {

    return TP.elem(
        '<sherpa:uriEditorToolbarContent tibet:ctrl="inspectorEditor"/>');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
