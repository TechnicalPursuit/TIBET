//  ------------------------------------------------------------------------
//  Sherpa Couch Tool API
//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.defineSubtype('sherpa.CouchTools');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineAttribute('databaseName');
TP.sherpa.CouchTools.Inst.defineAttribute('serverAddress');

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
            TP.ac('\.+',
                    TP.PATH_SEP,
                    'CouchDB',
                    TP.PATH_NO_SEP));

    this.registerMethodSuffixForPath(
            'ServerInfo',
            TP.ac('\.+',
                    TP.PATH_SEP,
                    'CouchDB\.+',
                    TP.PATH_SEP,
                    'Server Info'
                    ));
    this.registerMethodSuffixForPath(
            'AllDatabases',
            TP.ac('\.+',
                    TP.PATH_SEP,
                    'CouchDB\.+',
                    TP.PATH_SEP,
                    'All Databases'
                    ));

    //  Databases

    this.registerMethodSuffixForPath(
            'DatabaseDesignation',
            TP.ac('\.+',
                    TP.PATH_SEP,
                    'CouchDB\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    TP.PATH_NO_SEP
                    ));
    this.registerMethodSuffixForPath(
            'DatabaseInfo',
            TP.ac('\.+',
                    TP.PATH_SEP,
                    'CouchDB\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    TP.PATH_SEP,
                    '\.+',
                    'Database Info'
                    ));
    this.registerMethodSuffixForPath(
            'AllDocuments',
            TP.ac('\.+',
                    TP.PATH_SEP,
                    'CouchDB\.+',
                    TP.PATH_SEP,
                    'All Databases',
                    TP.PATH_SEP,
                    '\.+',
                    TP.PATH_SEP,
                    'All Documents'
                    ));

    /* eslint-enable no-useless-escape */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getInspectorPath',
function() {
    return TP.ac('Remote Data Sources',
                    'CouchDB @ ' + this.get('serverAddress'));
});

//  ------------------------------------------------------------------------
//  Editor
//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForEditor',
function(options) {

    /**
     * @method getContentForEditor
     * @summary
     * @returns
     */

    var targetAspect,
        targetURI,

        params,
        targetReq,

        dataURI;

    targetAspect = options.at('targetAspect');

    if (TP.isURIString(targetAspect)) {

        dataURI = TP.uc(options.at('bindLoc'));

        params = TP.hc('refresh', true,
                        'async', true,
                        'resultType', TP.WRAP);

        targetReq = TP.request(params);
        targetReq.defineHandler('RequestSucceeded',
                function(aResponse) {
                    var data;

                    data = aResponse.getResult();
                    dataURI.setResource(data);
                });

        targetURI = TP.uc(targetAspect);
        targetURI.getResource(targetReq);

        return TP.elem('<sherpa:navlist bind:in="' +
                        dataURI.asString() +
                        '"/>');
    }
});

//  ------------------------------------------------------------------------
//  Inspector Config Methods
//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForAllDatabases',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'sherpa:navlist');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForAllDocuments',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'sherpa:navlist');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForDatabaseDesignation',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'sherpa:navlist');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForDatabaseInfo',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'sherpa:urieditor');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForServerDesignation',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'sherpa:navlist');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForServerInfo',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'sherpa:urieditor');

    return options;
});

//  ------------------------------------------------------------------------
//  Inspector Content Methods
//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForAllDatabases',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<sherpa:navlist bind:in="' +
                    dataURI.asString() +
                    '"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForAllDocuments',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<sherpa:navlist bind:in="' +
                    dataURI.asString() +
                    '"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForDatabaseDesignation',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<sherpa:navlist bind:in="' +
                    dataURI.asString() +
                    '"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForDatabaseInfo',
function(options) {

    var dataURI,

        targetAspect,

        loc,
        locURI,

        uriEditorTPElem;

    dataURI = TP.uc(options.at('bindLoc'));

    targetAspect = options.at('targetAspect');

    loc = this.get('serverAddress') + '/' + targetAspect;
    locURI = TP.uc(loc);

    uriEditorTPElem = TP.wrap(TP.getContentForTool(locURI, 'Inspector'));

    uriEditorTPElem = uriEditorTPElem.clone();

    uriEditorTPElem.setAttribute('bind:in', dataURI.asString());

    return TP.unwrap(uriEditorTPElem);
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForServerDesignation',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<sherpa:navlist bind:in="' +
                    dataURI.asString() +
                    '"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForServerInfo',
function(options) {

    var dataURI,

        loc,
        locURI,

        uriEditorTPElem;

    dataURI = TP.uc(options.at('bindLoc'));

    loc = this.get('serverAddress');
    locURI = TP.uc(loc);

    uriEditorTPElem = TP.wrap(TP.getContentForTool(locURI, 'Inspector'));

    uriEditorTPElem = uriEditorTPElem.clone();

    uriEditorTPElem.setAttribute('bind:in', dataURI.asString());

    return TP.unwrap(uriEditorTPElem);
});

//  ------------------------------------------------------------------------
//  Inspector Data Methods
//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getDataForAllDatabases',
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
                            'resultType', TP.WRAP);

        fetchRequest = TP.request(params);

        aURI.getResource(fetchRequest);

        fetchResponse = fetchRequest.getResponse();

        return fetchResponse;
    };

    dataURI = TP.uc(options.at('bindLoc'));

    loc = this.get('serverAddress') + '/_all_dbs';
    fetcher(TP.uc(loc)).then(
                function(result) {
                    dataURI.setResource(result);
                }).catch(
                function(err) {
                    TP.ifError() ?
                        TP.error('Error fetching all Couch databases: ' +
                                    TP.str(err)) : 0;
                });

    return TP.ac('It\'s coming!');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getDataForAllDocuments',
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
                            'resultType', TP.WRAP);

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
                    dataURI.setResource(TP.ac(result.get('rows[0:].id')));
                }).catch(
                function(err) {
                    TP.ifError() ?
                        TP.error('Error fetching all documents for Couch' +
                                    ' database:' + dbName + ': ' +
                                    TP.str(err)) : 0;
                });

    return TP.ac('It\'s coming!');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getDataForServerDesignation',
function(options) {

    return TP.ac('Server Info', 'All Databases');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getDataForServerInfo',
function(options) {

    var loc;

    loc = this.get('serverAddress');

    return TP.uc(loc);
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getDataForDatabaseDesignation',
function(options) {

    this.set('databaseName', options.at('targetAspect'));

    return TP.ac('Database Info', 'All Documents');
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getDataForDatabaseInfo',
function(options) {

    var loc;

    loc = this.get('serverAddress') + '/' + this.get('databaseName');

    return TP.uc(loc);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
