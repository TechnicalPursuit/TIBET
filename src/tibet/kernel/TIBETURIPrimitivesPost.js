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
 */

//  ------------------------------------------------------------------------

TP.definePrimitive('elementFromURI',
function(aURI) {

    /**
     * @method elementFromURI
     * @summary Loads the supplied URI and tries to extract an Element
     *     representation from it.
     * @param {String|TP.uri.URI} aURI The URI to process.
     * @returns {Promise} A Promise with the retrieved and extracted Element as
     *     its result.
     */

    var uri,
        req,
        value,
        extractElementFromResult;

    //  Make sure this is a URI.
    uri = TP.uc(aURI);

    //  We try to get the URI subsystem to return us a native DOM node.
    req = TP.request('resultType', TP.DOM);

    extractElementFromResult = function(result) {

        var elem;

        //  If the URI pointed to a type and that type is a subtype
        //  of TP.dom.ElementNode, then create an Element using the
        //  canonical name.
        if (TP.isType(result) &&
            TP.isSubtypeOf(result, TP.dom.ElementNode)) {
            elem = TP.elem('<' + result.getCanonicalName() + '/>');
        } else if (TP.isKindOf(result, TP.dom.ElementNode)) {
            elem = result.getNativeNode();
        } else if (TP.isElement(result)) {
            elem = result;
        } else if (TP.isValid(result)) {
            //  Rely on smart conversion here - Documents will return their
            //  documentElements, etc.
            elem = TP.elem(result);
        }

        return elem;
    };

    //  If the URI's mode is ASYNCHRONOUS, then we fetch and use the returned
    //  'then'able to extract the element from the result.
    if (uri.get('mode') === TP.core.SyncAsync.ASYNCHRONOUS) {
        return uri.getResource(req).then(
            function(result) {
                return extractElementFromResult(result);
            });
    } else {
        //  Otherwise, fetching the content of the URI will be synchronous, so
        //  just extract the element from the result.
        value = extractElementFromResult(uri.getResource(req).get('result'));
        if (TP.isElement(value)) {
            return TP.extern.Promise.resolve(value);
        } else {
            return TP.extern.Promise.resolve(value);
            //  TODO: this should be used, not resolve().
            // return TP.extern.Promise.reject(new Error('InvalidElement'));
        }
    }
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
