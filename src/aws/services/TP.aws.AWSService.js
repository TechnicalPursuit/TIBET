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
 * @type {TP.aws.AWSService}
 * @summary A subtype of TP.core.IOService that communicates with various Amazon
 *     Web Services.
 * @description This type provides a method that can be invoked as a
 *     'passthrough' mechanism when needing to invoke any of Amazon Web Services
 *     without having to deal with individual authentication, identification or
 *     CORS issues on a 'per method' basis. Note that this is an abstract type
 *     and cannot be instantiated. See one of its concrete subtypes.
 */

//  ------------------------------------------------------------------------

TP.core.IOService.defineSubtype('aws.AWSService');

//  Can't construct concrete instances of this type.
TP.aws.AWSService.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.aws.AWSService.Type.defineAttribute(
                        'supportedModes', TP.core.SyncAsync.ASYNCHRONOUS);
TP.aws.AWSService.Type.defineAttribute(
                        'mode', TP.core.SyncAsync.ASYNCHRONOUS);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.aws.AWSService.Type.defineMethod('invokePassthrough',
function(serviceName, methodName, methodParams) {

    /**
     * @method invokePassthrough
     * @summary Invokes the TIBET 'AWS Passthrough' - a CORS-enabled AWS Lambda
     *     function that gives access to other AWS services.
     * @param {String} serviceName The name of the service to invoke (i.e. 'S3',
     *     'Lambda', etc.).
     * @param {String} methodName The name of the method to invoke on the
     *     service (i.e. 'listBuckets', etc.).
     * @param {TP.core.Hash} methodParams A hash of the parameters to pass to
     *     the function (i.e. 'Body', 'Key', etc.).
     * @returns {Promise} The promisified request to the AWS Lambda function.
     */

    var region,
        apiVersion,
        roleArn,
        identityPoolID,

        lambda,
        params,

        invocationParams;

    //  Make sure that we have a configured passthrough region.
    region = TP.sys.getcfg('aws.passthrough.region');
    if (TP.isEmpty(region)) {
        return this.raise('InvalidQuery',
                            'Missing passthrough region.');
    }

    //  Make sure that we have a configured passthrough apiVersion.
    apiVersion = TP.sys.getcfg('aws.passthrough.apiVersion');
    if (TP.isEmpty(apiVersion)) {
        return this.raise('InvalidQuery',
                            'Missing passthrough apiVersion.');
    }

    //  Make sure that we have a configured passthrough roleArn. This should
    //  match the role that our passthrough Lambda function has.
    roleArn = TP.sys.getcfg('aws.passthrough.roleArn');
    if (TP.isEmpty(roleArn)) {
        return this.raise('InvalidQuery',
                            'Missing passthrough roleArn.');
    }

    //  Make sure that we have a configured passthrough identityPoolID.
    identityPoolID = TP.sys.getcfg('aws.passthrough.identityPoolID');
    if (TP.isEmpty(identityPoolID)) {
        return this.raise('InvalidQuery',
                            'Missing passthrough identityPoolID.');
    }

    //  Update the AWS config with the region and credentials computed from
    //  Cognito.
    TP.extern.AWS.config.update({
        region: region,
        credentials: new TP.extern.AWS.CognitoIdentityCredentials({
            RoleArn: roleArn,
            IdentityPoolId: identityPoolID
          })
    });

    //  Create a new Lambda client-side invocation stub.
    lambda = new TP.extern.AWS.Lambda({
        region: region,
        apiVersion: apiVersion
    });

    //  If method params were supplied, then get a POJO from the Hash.
    //  Otherwise, just default params to a POJO.
    if (TP.notEmpty(methodParams)) {
        params = methodParams.asObject();
    } else {
        params = {};
    }

    //  Build a set of invocation params to invoke the Lambda function with.
    invocationParams = {
        FunctionName: 'invoker',
        InvocationType: 'RequestResponse',
        LogType: 'None',
        Payload: JSON.stringify({
            service: serviceName,
            methodName: methodName,
            params: params
        })
    };

    //  Invoke the Lambda on the server, returning a Promise and then a Function
    //  that will parse the payload and return the body, which will be a String.
    //  That String might contain more JSON-ified data, but it's the callers
    //  responsibility to further parse that.
    return lambda.invoke(invocationParams).promise().then(
            function(aResult) {
                var payload;

                payload = JSON.parse(aResult.Payload);
                if (TP.isValid(payload.body)) {
                    return payload.body;
                }

                return null;
            });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
