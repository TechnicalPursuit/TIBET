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
 * @type {TP.sherpa.SalesforceSubInspectorSources}
 */

//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.defineSubtype('sherpa.SalesforceSubInspectorSources');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.defineDependencies('TP.extern.Promise', 'TP.extern.jsforce');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Inst.defineAttribute('$query');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.sherpa.SalesforceSubInspectorSources} The receiver.
     */

    this.callNextMethod();

    /* eslint-disable no-useless-escape */

    //  Query

    //  What methods will be resolved and queried when 'Query' is *selected*.
    this.registerMethodSuffixForPath(
            'SFQuery',
            TP.ac('REST', 'Salesforce', 'Query'));

    //  Query Results

    //  What methods will be resolved and queried when 'Results' is *selected*.
    this.registerMethodSuffixForPath(
            'SFQueryResults',
            TP.ac('REST', 'Salesforce', 'Query', 'Results'));

    /* eslint-enable no-useless-escape */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Inst.defineHandler('QuerySalesforce',
function() {

    /**
     * @method handleQuerySalesforce
     * @summary Handles when the user wants to query Salesforce.
     * @param {TP.sig.QuerySalesforce} aSignal The signal indicating that
     *     the user wants to query Salesforce.
     * @returns {TP.sherpa.SalesforceDBSubInspectorSources} The receiver.
     */

    var inspector,
        bayNum,
        content,
        queryField;

    inspector = TP.byId('SherpaInspector', TP.sys.getUIRoot());

    //  Grab the number for the bay that the 'query' content has been loaded
    //  into.
    bayNum = inspector.getBayNumForPathParts(
                TP.ac('REST', 'Salesforce', 'Query'));

    //  Grab the underlying content for that bay. That is where our query form
    //  will be found.
    content = inspector.getInspectorBayContentItem(bayNum);

    queryField = TP.byCSSPath('.query', content, true);
    this.set('$query', queryField.getValue());

    inspector.focusUsingInfo(TP.hc('targetAspect', 'Results', 'bayIndex', 3));

    return this;
});

//  ------------------------------------------------------------------------
//  Inspector Config Methods
//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('getConfigForInspectorForSFQuery',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('getConfigForInspectorForSFQueryResults',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'xctrls:table');

    return options;
});

//  ------------------------------------------------------------------------
//  Inspector Content Methods
//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('getContentForInspectorForSFQuery',
function(options) {

    var queryPanelLoc,
        queryPanelReq,
        queryPanelResp,

        win,

        bayNum;

    //  Grab the authenication panel content.
    queryPanelLoc =
        TP.uc('~ide_root/TP.sherpa.inspector/salesforce/query_panel.xhtml').
        getLocation();

    queryPanelReq = TP.request('uri', queryPanelLoc, 'async', false);
    queryPanelResp = TP.httpGet(queryPanelLoc, queryPanelReq);

    win = TP.sys.getUIRoot().getNativeWindow();

    //  The bay that the query panel will be drawn into is one more than what is
    //  currently there and can be computed by the total number of bays.
    bayNum = options.at('pathParts').getSize();

    //  After we repaint, and the 'bay inspector item' is real, then set up a
    //  UIDidFocus handler on that item to focus the username field.
    (function() {

        var inspector,
            bayTPElem,
            usernameTPElem;

        inspector = TP.byId('SherpaInspector', win);
        bayTPElem = inspector.getBayFromSlotPosition(bayNum);

        //  Set up the UIDidFocus handler directly on the bay inspector item.
        bayTPElem.defineHandler('UIDidFocus',
            function(aSignal) {

                //  Make sure to remove this handler because this bay inspector
                //  item will be reused.
                delete bayTPElem[TP.composeHandlerName('UIDidFocus')];

                //  Grab the query field and focus it.
                usernameTPElem = bayTPElem.get('.query');
                usernameTPElem.focus();
            });

    }).queueAfterNextRepaint(win);

    //  Grab the result of the response and return it's documentElement (i.e.
    //  root element).
    return queryPanelResp.get('result').documentElement;
});

//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('getContentForInspectorForSFQueryResults',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem(
            '<xctrls:table bind:in="{data: ' +
            dataURI.asString() +
            '}" filter="true" alwayschange="true" itemtoggle="false"/>');
});

//  ------------------------------------------------------------------------
//  Inspector Data Methods
//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('getDataForInspectorForSFQuery',
function(options) {

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('getDataForInspectorForSFQueryResults',
function(options) {

    var dataURI,

        query,

        requestParams,
        sfRequest;

    dataURI = TP.uc(options.at('bindLoc'));

    query = this.get('$query');

    requestParams = TP.hc('query', query);

    sfRequest = TP.sig.SalesforceQueryRequest.construct(requestParams);
    sfRequest.defineHandler('RequestSucceeded',
                            function(aResponse) {

                                var result,

                                    keys,
                                    keyLen,

                                    data;

                                result = aResponse.get('result');

                                if (TP.notValid(result)) {
                                    return;
                                }

                                keys = TP.keys(result.records.first());
                                keys.remove('attributes');

                                keyLen = keys.getSize();

                                data = result.records.collect(
                                        function(aRecord) {

                                            var retVal,
                                                i;

                                            retVal = TP.ac();
                                            for (i = 0; i < keyLen; i++) {
                                                retVal.push(aRecord[keys[i]]);
                                            }

                                            return retVal;
                                        });

                                dataURI.setResource(data);
                            });

    sfRequest.fire();

    return TP.ac('Data Loading...');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
