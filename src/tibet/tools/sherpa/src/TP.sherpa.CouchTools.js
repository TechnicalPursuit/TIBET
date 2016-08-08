//  ------------------------------------------------------------------------
//  Sherpa Couch Tool API
//  ------------------------------------------------------------------------

TP.sherpa.InspectorSource.defineSubtype('sherpa.CouchTools');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.CouchTools.Inst.defineAttribute('serverAddress');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

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

    var rootLabel;

    rootLabel = this.getInspectorPath().last();

    switch (options.at('targetAspect')) {

        case rootLabel:
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
        dataURI,
        rootLabel,

        loc,
        uriEditorTPElem,
        locURI;


    dataURI = TP.uc(options.at('bindLoc'));

    data = this.getDataForInspector(options);
    if (TP.isThenable(data)) {
        data.then(
                function(result) {
                    dataURI.setResource(result);
                });
        dataURI.setResource(TP.ac('It\'s coming!'),
                            TP.request('signalChange', false));
    } else {
        dataURI.setResource(data,
                            TP.request('signalChange', false));
    }

    rootLabel = this.getInspectorPath().last();

    switch (options.at('targetAspect')) {

        case rootLabel:
        case 'All Databases':

            return TP.elem('<sherpa:navlist bind:in="' +
                            dataURI.asString() +
                            '"/>');

        case 'Server Info':

            loc = this.get('serverAddress');

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

    var fetcher,

        rootLabel,

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

    rootLabel = this.getInspectorPath().last();

    loc = this.get('serverAddress');

    switch (options.at('targetAspect')) {

        case rootLabel:

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
