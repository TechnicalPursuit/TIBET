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
                    'All Documents',
                    '\.+'
                    ));

    /* eslint-enable no-useless-escape */

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

    TP.elementSetAttribute(uriEditorElem,
                            'extraLoadHeaders',
                            '{simple_cors_only: true}',
                            true);
    TP.elementSetAttribute(uriEditorElem,
                            'extraSaveHeaders',
                            '{simple_cors_only: true}',
                            true);

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

    TP.elementSetAttribute(uriEditorElem,
                            'extraLoadHeaders',
                            '{simple_cors_only: true}',
                            true);
    TP.elementSetAttribute(uriEditorElem,
                            'extraSaveHeaders',
                            '{simple_cors_only: true}',
                            true);

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

    TP.elementSetAttribute(uriEditorElem,
                            'extraLoadHeaders',
                            '{simple_cors_only: true}',
                            true);
    TP.elementSetAttribute(uriEditorElem,
                            'extraSaveHeaders',
                            '{simple_cors_only: true}',
                            true);

    return uriEditorElem;
});

//  ------------------------------------------------------------------------
//  Inspector Data Methods
//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspectorForAllDatabases',
function(options) {

    var fetcher,

        dataURI,

        loc;

    fetcher = function(aURI) {
        var params,

            fetchRequest,
            fetchResponse;

        params = TP.request('refresh', true,
                            'async', true,
                            'resultType', TP.WRAP,
                            'simple_cors_only', true);

        fetchRequest = TP.request(params);

        aURI.getResource(fetchRequest);

        fetchResponse = fetchRequest.getResponse();

        return fetchResponse;
    };

    dataURI = TP.uc(options.at('bindLoc'));

    loc = this.get('serverAddress') + '/_all_dbs';
    fetcher(TP.uc(loc)).then(
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

    var fetcher,

        dataURI,
        dbName,

        loc;

    fetcher = function(aURI) {
        var params,

            fetchRequest,
            fetchResponse;

        params = TP.request('refresh', true,
                            'async', true,
                            'resultType', TP.WRAP,
                            'simple_cors_only', true);

        fetchRequest = TP.request(params);

        aURI.getResource(fetchRequest);

        fetchResponse = fetchRequest.getResponse();

        return fetchResponse;
    };

    dataURI = TP.uc(options.at('bindLoc'));
    dbName = this.get('databaseName');

    loc = this.get('serverAddress') +
            '/' +
            dbName +
            '/_all_docs';

    fetcher(TP.uc(loc)).then(
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

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspectorForDatabaseDesignation',
function(options) {

    this.set('databaseName', options.at('targetAspect'));

    return TP.ac(
            TP.ac('Database Info', 'Database Info'),
            TP.ac('All Documents', 'All Documents')
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

    this.set('documentID', options.at('targetAspect'));

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
