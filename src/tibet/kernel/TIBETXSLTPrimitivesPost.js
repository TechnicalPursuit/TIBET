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
 * @To support efficient DOM manipulations for various functions we leverage the
 *     XSLT support in the modern browsers. Both IE and Mozilla provide
 *     operationswhich allow the loading and processing of XSLT style sheets.
 *     The TIBETkernel includes XSLT style sheets supporting common DOM
 *     operations/transforms.
 */

//  ------------------------------------------------------------------------

TP.definePrimitive('uriTransformFile',
function(styleUrl, inputUrl, paramHash) {

    /**
     * @method uriTransformFile
     * @summary Loads the two URLs and transforms the input using the style
     *     sheet provided.
     * @param {String} styleUrl The URL of the style sheet.
     * @param {String} inputUrl The URL of the input data file.
     * @param {TP.lang.Hash} paramHash A hash of optional parameters to be
     *     passed to the style sheet. A key of 'xmlns:fixup' set to true will
     *     repair xmlns attributes.
     * @exception TP.sig.XSLTException, TP.sig.InvalidNode, TP.sig.InvalidURI,
     *     URINotFound
     * @returns {Document} A document object containing the results.
     */

    var url1,
        node1,

        url2,
        node2;

    if (TP.notValid(url1 = TP.uc(styleUrl))) {
        this.raise('TP.sig.InvalidURI', styleUrl);

        return;
    }

    node1 = url1.getNativeNode(TP.hc('async', false));

    if (TP.notValid(url2 = TP.uc(inputUrl))) {
        this.raise('TP.sig.InvalidURI', inputUrl);

        return;
    }

    node2 = url2.getNativeNode(TP.hc('async', false));

    return TP.documentTransformFile(node1, node2, paramHash);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriTransformNode',
function(styleUrl, inputNode, paramHash) {

    /**
     * @method uriTransformNode
     * @summary Loads the style sheet URL provided and applies the resulting
     *     style to the input node.
     * @param {String} styleUrl The URL of the style sheet.
     * @param {Node} inputNode The input data element.
     * @param {TP.lang.Hash} paramHash A hash of optional parameters to be
     *     passed to the style sheet. A key of 'xmlns:fixup' set to true will
     *     repair xmlns attributes.
     * @exception TP.sig.XSLTException, TP.sig.InvalidNode, TP.sig.InvalidURI,
     *     URINotFound
     * @returns {Document} A document object containing the results.
     */

    var url1,
        node1;

    if (TP.notValid(url1 = TP.uc(styleUrl))) {
        this.raise('TP.sig.InvalidURI', styleUrl);

        return;
    }

    node1 = url1.getNativeNode(TP.hc('async', false));

    return TP.documentTransformNode(node1, inputNode, paramHash);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentTransformFile',
function(styleNode, inputUrl, paramHash) {

    /**
     * @method documentTransformFile
     * @summary Loads the input URL and transforms the data using the style
     *     sheet node provided.
     * @param {Node} styleNode The XSLT style document or fragment.
     * @param {String} inputUrl The URL of the input data file.
     * @param {TP.lang.Hash} paramHash A hash of optional parameters to be
     *     passed to the style sheet. A key of 'xmlns:fixup' set to true will
     *     repair xmlns attributes.
     * @exception TP.sig.XSLTException, TP.sig.InvalidNode, TP.sig.InvalidURI,
     *     URINotFound
     * @returns {Document} A document object containing the results.
     */

    var url2,
        node2;

    if (TP.notValid(url2 = TP.uc(inputUrl))) {
        this.raise('TP.sig.InvalidURI', inputUrl);
        return;
    }

    node2 = url2.getNativeNode(TP.hc('async', false));

    return TP.documentTransformNode(styleNode, node2, paramHash);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
