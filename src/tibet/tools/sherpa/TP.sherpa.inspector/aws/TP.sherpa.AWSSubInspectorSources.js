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
            TP.ac('REST',
                    TP.PATH_SEP,
                    'AWS',
                    TP.PATH_SEP,
                    'S3'
                    ));

    //  What methods will be resolved and queried when 'All Buckets' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'S3AllBuckets',
            TP.ac('REST',
                    TP.PATH_SEP,
                    'AWS',
                    TP.PATH_SEP,
                    'S3',
                    TP.PATH_SEP,
                    'All Buckets'
                    ));

    //  S3

    //  What methods will be resolved and queried when 'Lambda' is *selected*.
    this.registerMethodSuffixForPath(
            'LambdaDesignation',
            TP.ac('REST',
                    TP.PATH_SEP,
                    'AWS',
                    TP.PATH_SEP,
                    'Lambda'
                    ));

    //  What methods will be resolved and queried when 'All Functions' is
    //  *selected*.
    this.registerMethodSuffixForPath(
            'LambdaAllFunctions',
            TP.ac('REST',
                    TP.PATH_SEP,
                    'AWS',
                    TP.PATH_SEP,
                    'Lambda',
                    TP.PATH_SEP,
                    'All Functions'
                    ));

    /* eslint-enable no-useless-escape */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('checkAuthentication',
function() {
    return true;
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getConfigForInspector',
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

    if (!this.checkAuthentication()) {
        return this.requestAuthentication();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getDataForInspector',
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

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getContentForToolbar',
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
//  Inspector Config Methods
//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getConfigForInspectorForS3Designation',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getConfigForInspectorForS3AllBuckets',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getConfigForInspectorForLambdaDesignation',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getConfigForInspectorForLambdaAllFunctions',
function(options) {

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------
//  Inspector Content Methods
//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getContentForInspectorForS3Designation',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getContentForInspectorForS3AllBuckets',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getContentForInspectorForLambdaDesignation',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
                    dataURI.asString() +
                    '}"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getContentForInspectorForLambdaAllFunctions',
function(options) {

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem('<xctrls:list bind:in="{data: ' +
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

    requestParams = TP.hc('action', 'listBuckets');
    s3Request = TP.sig.AWSS3Request.construct(requestParams);
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

    requestParams = TP.hc('action', 'listFunctions');
    lambdaRequest = TP.sig.AWSLambdaRequest.construct(requestParams);
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

TP.sherpa.AWSSubInspectorSources.Inst.defineMethod('getDataForInspectorForLambdaAllFunctionsFoofy',
function(options) {

    var dataURI,

        serverAddr,
        loc;

    dataURI = TP.uc(options.at('bindLoc'));

    serverAddr = this.get('serverAddress');

    loc = serverAddr +
            '?' +
            'listFunctions';

    TP.uc(loc).getResource(
                TP.hc('refresh', true,
                        'async', true,
                        'resultType', TP.WRAP)
                ).then(
                function(result) {

                    var data;

                    data = result.at('Functions').collect(
                                function(aHash) {
                                    return TP.ac(
                                            aHash.at('FunctionName'),
                                            aHash.at('FunctionName'));
                                });

                    dataURI.setResource(data);
                }).catch(
                function(err) {
                    TP.ifError() ?
                        TP.error('Error fetching all buckets for AWS: ' +
                                    TP.str(err)) : 0;
                });

    return TP.ac('Data Loading...');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
