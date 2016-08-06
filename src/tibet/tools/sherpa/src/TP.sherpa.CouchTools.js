//  ------------------------------------------------------------------------
//  Sherpa Couch Tool API
//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('sherpa.CouchTools');

TP.sherpa.CouchTools.addTraits(TP.sherpa.ToolAPI);

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

    return this;
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

    /*
    var targetAspect,
        contentElem;

    targetAspect = options.at('targetAspect');

    contentElem = TP.xhtmlnode(
                '<div>' +
                '<textarea><![CDATA[' + this.get(targetAspect) + ']]></textarea>' +
                '</div>');

    if (!TP.isElement(contentElem)) {

        contentElem = TP.xhtmlnode(
                '<div>' +
                    '<textarea>' +
                        TP.xmlLiteralsToEntities(this.get(targetAspect)) +
                    '</textarea>' +
                '</div>');
    }

    return contentElem;
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
//  Inspector
//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getConfigForInspector',
function(options) {

    /**
     * @method getConfigForInspector
     * @summary
     * @returns
     */

    switch (options.at('targetAspect')) {

        case 'CouchDB - In Config':
        case 'All Databases':

            options.atPut(TP.ATTR + '_contenttype', 'sherpa:navlist');
            break;

        case 'Server Info':

            options.atPut(TP.ATTR + '_contenttype', 'sherpa:urieditor');
            break;

        default:
            break;
    }

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary
     * @returns
     */

    var data,
        dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    data = this.getDataForInspector(options);
    if (TP.isThenable(data)) {
        data.then(
                function(result) {
                    dataURI.setResource(result);
                });
        dataURI.setResource('It\'s coming!',
                            TP.request('signalChange', false));
    } else {
        dataURI.setResource(data,
                            TP.request('signalChange', false));
    }

    switch (options.at('targetAspect')) {

        case 'CouchDB - In Config':
        case 'All Databases':

            return TP.elem('<sherpa:navlist bind:in="' +
                            dataURI.asString() +
                            '"/>');

        case 'Server Info':

        var loc,
            uriEditorTPElem,
            locURI;

            loc = TP.sys.cfg('tds.couch.scheme') +
                    '://' +
                    TP.sys.cfg('tds.couch.host') +
                    ':' +
                    TP.sys.cfg('tds.couch.port');

            loc = 'http://127.0.0.1:5984';

            locURI = TP.uc(loc);

            uriEditorTPElem = TP.wrap(TP.getContentForTool(locURI, 'Inspector'));

            uriEditorTPElem = uriEditorTPElem.clone();

            uriEditorTPElem.setAttribute('bind:in', dataURI.asString());

            return TP.unwrap(uriEditorTPElem);

        default:
            return null;
    }
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary
     * @returns
     */

    var loc,
        fetcher;

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

    //  TODO: This should depend on which Couch Server we're talking to. This
    //  one is for 'CouchDB - In Config'
    loc = TP.sys.cfg('couch.scheme') +
            '://' +
            TP.sys.cfg('couch.host') +
            ':' +
            TP.sys.cfg('couch.port');

    loc = 'http://127.0.0.1:5984';

    switch (options.at('targetAspect')) {

        case 'CouchDB - In Config':

            return TP.ac('Server Info', 'All Databases');

        case 'Server Info':

            return TP.uc(loc);

        case 'All Databases':

            loc += '/_all_dbs';
            return fetcher(TP.uc(loc));

        default:
            return null;
    }
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineMethod('resolveAspectForInspector',
function(anID, options) {

    /**
     * @method resolveAspectForInspector
     * @summary
     * @returns
     */

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
