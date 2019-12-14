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

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('checkAuthentication',
function() {

    /**
     * @method checkAuthentication
     * @summary Returns whether or not this object is authenticated with SF to
     *     perform its required operations.
     * @returns {Boolean} Whether or not we're authenticated.
     */

    var isAuthenticated;

    isAuthenticated = TP.sf.SalesforceService.isAuthenticated('SALESFORCE_QUERY');

    return isAuthenticated;
});

//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('getAuthenticationContent',
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

    return TP.xhtmlnode('<div>Attempting authentication...</div>');
});

//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('getConfigForInspector',
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

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('getContentForInspector',
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
        this.authenticate();
        return this.getAuthenticationContent(options);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('getDataForInspector',
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

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('getContentForToolbar',
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

TP.sherpa.SalesforceSubInspectorSources.Inst.defineMethod('authenticate',
function() {

    /**
     * @method authenticate
     * @summary
     * @returns {TP.sherpa.SalesforceSubInspectorSources} The receiver.
     */

    var inspector,

        authRequest;

    //  Authenticate the server URI that we're using with the
    //  SFPassthroughService using the supplied username and password. Note that
    //  this object will handle the request itself, such that we won't need to
    //  fire it.
    authRequest = TP.sf.SalesforceQueryService.authenticate('SALESFORCE_QUERY');

    inspector = TP.byId('SherpaInspector', TP.sys.getUIRoot());

    //  The authentication succeeded - repopulate the bay we were using to
    //  display the authentication UI and size the inspector to the new content.
    authRequest.defineHandler('RequestSucceeded',
        function(aResponse) {
            inspector.repopulateBay();
            inspector.sizeBays();
            inspector.scrollBaysToEnd();
        });

    //  The authentication failed - let the user know by setting the message
    //  output.
    authRequest.defineHandler('RequestFailed',
        function(aResponse) {
            // message.setRawContent('Login failed');
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.SalesforceSubInspectorSources.Inst.defineHandler('QuerySalesforce',
function() {

    /**
     * @method handleQuerySalesforce
     * @summary Handles when the user has completed authentication information
     *     in the UI in an attempt to authenticate a CouchDB connection.
     * @param {TP.sig.QuerySalesforce} aSignal The signal indicating that
     *     the user has dismisse
     * @returns {TP.sherpa.CouchDBSubInspectorSources} The receiver.
     */

    var inspector,
        content,
        queryField;

    inspector = TP.byId('SherpaInspector', TP.sys.getUIRoot());

    content = inspector.getInspectorBayContentItem();

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

                                var data;

                                data = aResponse.get('result').records.collect(
                                            function(aRecord) {
                                                return TP.ac(aRecord.Id,
                                                                aRecord.Name);
                                            });

                                dataURI.setResource(data);
                            });

    sfRequest.fire();

    return TP.ac('Data Loading...');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
