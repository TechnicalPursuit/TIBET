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
 * @type {TP.sf.service}
 * @summary A subtype of TP.dom.ElementNode that acts as an abstract supertype
 *     for tags that expose a remote service endpoint in markup.
 */

//  ------------------------------------------------------------------------

TP.tibet.service.defineSubtype('sf.service');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.sf.service.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,

        lid,

        queryLoc,
        resultLoc;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    lid = TP.lid(elem, true);

    queryLoc = TP.TIBET_URN_PREFIX + lid + '_query';
    TP.elementSetAttribute(elem, 'body', queryLoc, true);

    resultLoc = TP.TIBET_URN_PREFIX + lid + '_result';
    TP.elementSetAttribute(elem, 'name', resultLoc, true);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sf.service.Inst.defineMethod('activate',
function() {

    /**
     * @method activate
     * @summary This method causes the receiver to perform it's 'action'. In
     *     this case, retrieving or sending data to a remote URI endpoint.
     *     Subtypes need to override this method and provide an implementation
     *     of real code to activate.
     * @returns {TP.sf.service} The receiver.
     */

    var queryLoc,
        queryURI,

        query,

        requestParams,

        resultLoc,

        sfRequest;

    queryLoc = this.getAttribute('body');
    queryURI = TP.uc(queryLoc);

    query = queryURI.getContent();
    query = TP.val(query);

    if (TP.isEmpty(query)) {
        //  TODO: Raise exception
        return this;
    }

    requestParams = TP.hc('query', query);

    resultLoc = this.getAttribute('name');

    sfRequest = TP.sig.SalesforceQueryRequest.construct(requestParams);
    sfRequest.defineHandler('RequestSucceeded',
                            function(aResponse) {

                                var result,

                                    keys,
                                    keyLen,

                                    data,

                                    resultURI;

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

                                resultURI = TP.uc(resultLoc);

                                resultURI.setResource(data);
                            });

    sfRequest.fire();

    return this;
});

//  ------------------------------------------------------------------------

TP.sf.service.Inst.defineMethod('getConnectorData',
function(aSourceTPElement) {

    /**
     * @method getConnectorData
     * @summary Returns data for a connector dragging session. This is called by
     *     the Sherpa infrastructure to supply data when the connector has
     *     successfully connected and data about the connector source is needed.
     * @param {TP.dom.ElementNode} aSourceTPElement The source element that the
     *     connection was dragged from.
     * @returns {Promise} A Promise that will resolve with the connector data,
     *     which will be a TP.core.Hash.
     */

    return TP.promptWithChoices(
            'Choose an aspect to bind with:',
            TP.ac('query', 'result'),
            'query').then(
            function(locationVal) {
                var loc,
                    info;

                if (locationVal === 'query') {
                    loc = this.getAttribute('body');
                } else {
                    loc = this.getAttribute('name');
                }

                info = TP.hc(
                        'sourceURI', TP.uc(loc),
                        'propInfo',
                            TP.hc('value', TP.hc('exprs', TP.ac('value'))),
                        'isLeaf', true,
                        'forceManualScope', true,
                        'useServiceTag', false
                        );

                return info;
            }.bind(this));
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
