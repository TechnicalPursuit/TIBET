//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.aws.service}
 * @summary
 */

//  ------------------------------------------------------------------------

TP.tibet.service.defineSubtype('aws.service');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.aws.service.Inst.defineAttribute('resultURI');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.aws.service.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,

        lambdaFunctionName,
        lid,

        resultLoc;

    //  NOTE: WE DO *NOT* callNextMethod() here. This method is unusual in that
    //  it can take in Attribute nodes, etc. and our supertype method assumes
    //  Element nodes.

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    lambdaFunctionName = TP.elementGetAttribute(elem, 'lambdaname', true);
    lid = TP.lid(elem, true);

    resultLoc = TP.TIBET_URN_PREFIX +
                    lid +
                    '_' +
                    lambdaFunctionName.replace('$', '_') +
                    '_result';

    TP.elementSetAttribute(elem, 'name', resultLoc, true);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.aws.service.Inst.defineMethod('activate',
function() {

    /**
     * @method activate
     * @summary This method causes the receiver to perform it's 'action'. In
     *     this case, retrieving or sending data to a remote URI endpoint.
     * @returns {TP.aws.service} The receiver.
     */

    var lambdaFunctionName,

        requestParams,

        resultLoc,

        lambdaRequest;

    lambdaFunctionName = this.getAttribute('lambdaname');

    requestParams = TP.hc(
                'action', 'invoke',
                'params',
                    TP.hc('remoteService', 'Lambda',
                            'FunctionName', lambdaFunctionName));

    resultLoc = this.getAttribute('name');

    lambdaRequest = TP.sig.AWSPassthroughRequest.construct(requestParams);
    lambdaRequest.defineHandler('RequestSucceeded',
                            function(aResponse) {
                                var result,

                                    data,

                                    resultURI;

                                result = aResponse.getResult();

                                data = result.at('Payload');

                                resultURI = TP.uc(resultLoc);

                                resultURI.setResource(data);
                            });

    lambdaRequest.fire();

    return this;
});

//  ------------------------------------------------------------------------

TP.aws.service.Inst.defineMethod('getConnectorData',
function(aSourceTPElement) {

    /**
     * @method getConnectorData
     * @summary Returns data for a connector dragging session. This is called by
     *     the Sherpa infrastructure to supply data when the connector has
     *     successfully connected and data about the connector source is needed.
     * @param {TP.dom.ElementNode} aSourceTPElement The source element that the
     *     connection was dragged from.
     * @returns {TP.core.Hash|null} The data to be used for this connector
     *     dragging session.
     */

    var resultLoc,
        info;

    resultLoc = this.getAttribute('name');

    info = TP.hc(
            'sourceURI', TP.uc(resultLoc),
            'propInfo', TP.hc('value', TP.hc('exprs', TP.ac('value'))),
            'isLeaf', true,
            'forceManualScope', true,
            'useServiceTag', false
            );

    return info;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
