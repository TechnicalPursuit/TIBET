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
 * @type {TP.sherpa.AWSSubInspectorSources}
 */

//  ------------------------------------------------------------------------

TP.sherpa.InspectorPathSource.defineSubtype('sherpa.AWSSubInspectorSources');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.defineDependencies('TP.extern.Promise', 'TP.extern.AWS');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineAttribute('$authInfoRequest');
TP.sherpa.AWSSubInspectorSources.Inst.defineAttribute('$showAuthContent');

TP.sherpa.AWSSubInspectorSources.Inst.defineAttribute('s3BucketName');
TP.sherpa.AWSSubInspectorSources.Inst.defineAttribute('s3ObjectName');

TP.sherpa.AWSSubInspectorSources.Inst.defineAttribute('lambdaFunctionName');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.sherpa.AWSSubInspectorSources} The receiver.
     */

    this.callNextMethod();

    /* eslint-disable no-useless-escape */

    //  S3

    //  What methods will be resolved and queried when 'S3' is *selected*.
    this.registerMethodSuffixForPath(
            'S3Designation',
            TP.ac('Remote', 'AWS', 'S3'));

    //  What methods will be resolved and queried when 'All Buckets' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'S3AllBuckets',
            TP.ac('Remote', 'AWS', 'S3', 'All Buckets'));

    //  What methods will be resolved and queried when a particular bucket is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'S3BucketContent',
            TP.ac('Remote', 'AWS', 'S3', 'All Buckets', '\.+'));

    //  What methods will be resolved and queried when the object in a
    //  particular bucket is *selected*.
    this.registerMethodSuffixForPath(
            'S3ObjectContent',
            TP.ac('Remote', 'AWS', 'S3', 'All Buckets', '\.+', '\.+'));

    //  Lambda

    //  What methods will be resolved and queried when 'Lambda' is *selected*.
    this.registerMethodSuffixForPath(
            'LambdaDesignation',
            TP.ac('Remote', 'AWS', 'Lambda'));

    //  What methods will be resolved and queried when 'All Functions' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'LambdaAllFunctions',
            TP.ac('Remote', 'AWS', 'Lambda', 'All Functions'));

    //  What methods will be resolved and queried when a particular Function is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'LambdaFunctionInfo',
            TP.ac('Remote', 'AWS', 'Lambda', 'All Functions', '\.+'));

    /* eslint-enable no-useless-escape */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('checkAuthentication',
function() {

    /**
     * @method checkAuthentication
     * @summary Returns whether or not this object is authenticated with AWS to
     *     perform its required operations.
     * @returns {Boolean} Whether or not we're authenticated.
     */

    return TP.aws.AWSService.isAuthenticated('AWSPassthroughService');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getAuthenticationContent',
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
        TP.uc('~ide_root/TP.sherpa.inspector/aws/auth_panel.xhtml').
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

        inspector = TP.byId('SherpaInspector', win);
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

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getContentForInspector',
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

    var service,
        handler;

    if (!this.checkAuthentication()) {
        if (TP.isTrue(this.get('$showAuthContent'))) {
            return this.getAuthenticationContent(options);
        } else {
            service = TP.core.Resource.getResourceById('AWSPassthroughService');

            this.observe(
                service,
                'TP.sig.AWSAuthenticationInfoRequest',
                handler = function(authInfoRequest) {
                    var inspector;

                    this.ignore(service,
                                'TP.sig.AWSAuthenticationInfoRequest',
                                handler);

                    this.set('$showAuthContent', true);
                    this.set('$authInfoRequest', authInfoRequest);

                    inspector = TP.byId('SherpaInspector', TP.sys.getUIRoot());
                    inspector.reloadCurrentBay();
                }.bind(this));
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineHandler('AuthenticateConnection',
function() {

    /**
     * @method handleAuthenticateConnection
     * @summary Handles when the user has completed authentication information
     *     in the UI in an attempt to authenticate an AWS connection.
     * @param {TP.sig.AuthenticateConnection} aSignal The signal indicating that
     *     the user has dismisse
     * @returns {TP.sherpa.AWSSubInspectorSources} The receiver.
     */

    var inspector,
        content,

        username,
        password,

        message,

        authInfoRequest,
        authRequest;

    //  Grab the current bay content.
    inspector = TP.byId('SherpaInspector', TP.sys.getUIRoot());
    content = inspector.getInspectorBayContentItem();

    //  Grab the username and password fields from that content.
    username = TP.byCSSPath('.username', content, true);
    password = TP.byCSSPath('.password', content, true);

    //  Grab the message output to the user from that content, show it and a
    //  message that we're authenticating.
    message = TP.byCSSPath('.login_user_message', content, true);
    message.setRawContent(TP.sc('Attempting authentication...'));
    message.setAttribute('hidden', false);

    authInfoRequest = this.get('$authInfoRequest');
    authRequest = authInfoRequest.get('authRequest');

    //  The authentication succeeded - reload the bay we were using to display
    //  the authentication UI and size the inspector to the new content.
    authRequest.defineHandler('RequestSucceeded',
        function(aResponse) {
            this.set('$showAuthContent', false);
            this.set('$authInfoRequest', null);
            inspector.reloadCurrentBay();
        }.bind(this));

    //  The authentication failed - let the user know by setting the message
    //  output. Reset the username and password to empty values and focus the
    //  username field.
    authRequest.defineHandler('RequestFailed',
        function(aResponse) {
            message.setRawContent('Login failed');

            username.setValue('');
            password.setValue('');

            username.focus();
        });

    authInfoRequest.complete(
        TP.hc('username', username.getValue(),
                'password', password.getValue()));

    return this;
});

//  ------------------------------------------------------------------------
//  Inspector Config Methods
//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getConfigForInspectorForS3Designation',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getConfigForInspectorForS3AllBuckets',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getConfigForInspectorForS3BucketContent',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getConfigForInspectorForS3ObjectContent',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'html:div');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getConfigForInspectorForLambdaDesignation',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getConfigForInspectorForLambdaAllFunctions',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getConfigForInspectorForLambdaFunctionInfo',
function(options) {

    options.atPut(TP.ATTR + '_childtype', 'html:div');

    return options;
});

//  ------------------------------------------------------------------------
//  Inspector Content Methods
//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getContentForInspectorForS3Designation',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem(
            '<xctrls:list bind:in="{data: ' +
            dataURI.asString() +
            '}" filter="true" alwayschange="true" itemtoggle="false"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getContentForInspectorForS3AllBuckets',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem(
            '<xctrls:list bind:in="{data: ' +
            dataURI.asString() +
            '}" filter="true" alwayschange="true" itemtoggle="false"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getContentForInspectorForS3BucketContent',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem(
            '<xctrls:list bind:in="{data: ' +
            dataURI.asString() +
            '}" filter="true" alwayschange="true" itemtoggle="false"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getContentForInspectorForS3ObjectContent',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.xhtmlnode(
            '<div class="cm-s-elegant scrollable wrapped noselect readonly"' +
                ' bind:in="{value: ' +
                dataURI.asString() +
            '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getContentForInspectorForLambdaDesignation',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem(
            '<xctrls:list bind:in="{data: ' +
            dataURI.asString() +
            '}" filter="true" alwayschange="true" itemtoggle="false"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getContentForInspectorForLambdaAllFunctions',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem(
            '<xctrls:list bind:in="{data: ' +
            dataURI.asString() +
            '}" filter="true" alwayschange="true" itemtoggle="false"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getContentForInspectorForLambdaFunctionInfo',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.xhtmlnode(
            '<div class="cm-s-elegant scrollable wrapped noselect readonly"' +
                ' bind:in="{value: ' +
                dataURI.asString() +
            '}"/>');
});

//  ------------------------------------------------------------------------
//  Inspector Data Methods
//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getDataForInspectorForS3Designation',
function(options) {

    return TP.ac(
            TP.ac('All Buckets', 'All Buckets')
    );
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getDataForInspectorForS3AllBuckets',
function(options) {

    var dataURI,

        requestParams,
        s3Request;

    dataURI = TP.uc(options.at('bindLoc'));

    requestParams = TP.hc(
                        'action', 'listBuckets',
                        'params',
                            TP.hc('remoteService', 'S3'));

    s3Request = TP.sig.AWSPassthroughRequest.construct(requestParams);
    s3Request.defineHandler('RequestSucceeded',
                            function(aResponse) {
                                var result,
                                    data;

                                result = aResponse.getResult();
                                data = result.at('Buckets').collect(
                                        function(aHash) {
                                            return TP.ac(
                                                    aHash.at('Name'),
                                                    aHash.at('Name'));
                                        });

                                dataURI.setResource(data);
                            });

    s3Request.fire();

    return TP.ac('Data Loading...');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getDataForInspectorForS3BucketContent',
function(options) {

    var dataURI,

        requestParams,
        s3Request;

    if (TP.notEmpty(options.at('targetAspect'))) {
        this.set('s3BucketName', options.at('targetAspect'));
    }

    dataURI = TP.uc(options.at('bindLoc'));

    requestParams = TP.hc(
                        'action', 'listObjects',
                        'params',
                            TP.hc('remoteService', 'S3',
                                    'Bucket', this.get('s3BucketName')));

    s3Request = TP.sig.AWSPassthroughRequest.construct(requestParams);
    s3Request.defineHandler('RequestSucceeded',
                            function(aResponse) {
                                var result,
                                    data;

                                result = aResponse.getResult();
                                data = result.at('Contents').collect(
                                        function(aHash) {
                                            return TP.ac(
                                                    aHash.at('Key'),
                                                    aHash.at('Key'));
                                        });

                                dataURI.setResource(data);
                            });

    s3Request.fire();

    return TP.ac('Data Loading...');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getDataForInspectorForS3ObjectContent',
function(options) {

    var dataURI,

        requestParams,

        s3Request;

    if (TP.notEmpty(options.at('targetAspect'))) {
        this.set('s3ObjectName', options.at('targetAspect'));
    }

    dataURI = TP.uc(options.at('bindLoc'));

    requestParams = TP.hc(
                        'action', 'getObject',
                        'params',
                            TP.hc('remoteService', 'S3',
                                    'Bucket', this.get('s3BucketName'),
                                    'Key', this.get('s3ObjectName')));

    s3Request = TP.sig.AWSPassthroughRequest.construct(requestParams);
    s3Request.defineHandler('RequestSucceeded',
                            function(aResponse) {
                                var result,

                                    rawArray,
                                    arrayBuffer,

                                    decoder,
                                    data;

                                result = aResponse.getResult();

                                rawArray = result.at('Body').at('data');
                                arrayBuffer = new Uint8Array(rawArray);

                                decoder = new TextDecoder('utf-8');
                                data = decoder.decode(arrayBuffer);

                                dataURI.setResource(data);
                            });

    s3Request.fire();

    return TP.ac('Data Loading...');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getDataForInspectorForLambdaDesignation',
function(options) {

    return TP.ac(
            TP.ac('All Functions', 'All Functions')
    );
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getDataForInspectorForLambdaAllFunctions',
function(options) {

    var dataURI,

        requestParams,
        lambdaRequest;

    dataURI = TP.uc(options.at('bindLoc'));

    requestParams = TP.hc(
                        'action', 'listFunctions',
                        'params',
                            TP.hc('remoteService', 'Lambda'));

    lambdaRequest = TP.sig.AWSPassthroughRequest.construct(requestParams);
    lambdaRequest.defineHandler('RequestSucceeded',
                            function(aResponse) {
                                var result,
                                    data;

                                result = aResponse.getResult();
                                data = result.at('Functions').collect(
                                        function(aHash) {
                                            return TP.ac(
                                                    aHash.at('FunctionName'),
                                                    aHash.at('FunctionName'));
                                        });

                                dataURI.setResource(data);
                            });

    lambdaRequest.fire();

    return TP.ac('Data Loading...');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getDataForInspectorForLambdaFunctionInfo',
function(options) {

    var dataURI,

        requestParams,

        lambdaRequest;

    if (TP.notEmpty(options.at('targetAspect'))) {
        this.set('lambdaFunctionName', options.at('targetAspect'));
    }

    dataURI = TP.uc(options.at('bindLoc'));

    requestParams = TP.hc(
                'action', 'getFunction',
                'params',
                    TP.hc('remoteService', 'Lambda',
                            'FunctionName', this.get('lambdaFunctionName')));

    lambdaRequest = TP.sig.AWSPassthroughRequest.construct(requestParams);
    lambdaRequest.defineHandler('RequestSucceeded',
                            function(aResponse) {
                                var result,

                                    data;

                                result = aResponse.getResult();

                                data = TP.sherpa.pp.fromString(
                                                result.asJSONSource());

                                dataURI.setResource(data);
                            });

    lambdaRequest.fire();

    return TP.ac('Data Loading...');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getChildTypeForCanvasForLambdaFunctionInfo',
function(options) {

    return 'remote/AWS/lambda';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
