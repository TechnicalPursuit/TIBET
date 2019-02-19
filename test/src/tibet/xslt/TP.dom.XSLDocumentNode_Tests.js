//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  XSLDocumentNode
//  ========================================================================

TP.dom.XSLDocumentNode.Type.describe('TP.dom.XSLDocumentNode Type processing',
function() {

    this.it('simple XSL transformation', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_test/src/tibet/xslt/XMLArray2XHTMLTable.xsl');

        test.getDriver().fetchResource(loadURI, TP.WRAP).chain(
            function(tpXSLTDoc) {

                var data,
                    elem,
                    str,
                    result;

                data = TP.ac(1, 2, 3, 4, 5, 6);
                elem = TP.elem('<dataroot>' +
                                data.asXMLString() +
                                '</dataroot>');

                str = tpXSLTDoc.transform(elem);
                result = TP.elem(str);

                test.assert.isElement(result);

                //  There is one less 'html:td' than there is data
                test.assert.isEqualTo(
                    TP.nodeGetElementsByTagName(result, 'html:td').getSize(),
                    data.getSize() - 1);

                //  Because there is one 'html:th'
                test.assert.isEqualTo(
                    TP.nodeGetElementsByTagName(result, 'html:th').getSize(),
                    1);

                test.assert.isEqualTo(
                    TP.nodeGetTextContent(
                        TP.nodeGetElementsByTagName(result, 'html:td').at(2)),
                    data.at(3).asString());

            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('XSL transformation with parameters - using default values', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_test/src/tibet/xslt/XMLRPCArray2XHTMLTable.xsl');

        test.getDriver().fetchResource(loadURI, TP.WRAP).chain(
            function(tpXSLTDoc) {

                var data,
                    elem,
                    str,
                    result;

                //  By default, this sheet handles Arrays represented as XML-RPC
                //  nodes, so we get that here.

                data = TP.ac(1, 2, 3, 4, 5, 6);
                elem = data.as('TP.dom.XMLRPCNode');

                str = tpXSLTDoc.transform(elem);
                result = TP.elem(str);

                test.assert.isElement(result);

                //  There is the same number of 'html:td's as there are data
                test.assert.isEqualTo(
                    TP.nodeGetElementsByTagName(result, 'html:td').getSize(),
                    data.getSize());

                //  Since the XSLT defaults its column count to 2, there should
                //  be 'count / 2' number of rows
                test.assert.isEqualTo(
                    TP.nodeGetElementsByTagName(result, 'html:tr').getSize(),
                    data.getSize() / 2);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('XSL transformation with parameters - supply scalar values', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_test/src/tibet/xslt/XMLRPCArray2XHTMLTable.xsl');

        test.getDriver().fetchResource(loadURI, TP.WRAP).chain(
            function(tpXSLTDoc) {

                var data,
                    elem,
                    xslParams,
                    str,
                    result;

                //  By default, this sheet handles Arrays represented as XML-RPC
                //  nodes, but we're going to alter the selection statement that
                //  it uses to get the data, so let's output this as our
                //  'standard XML representation' and then use that.

                data = TP.ac(1, 2, 3, 4, 5, 6);
                elem = data.as('TP.dom.XMLRPCNode');

                //  NB: These should match <xsl:param> elements in the XSLT
                xslParams = TP.hc('numCols', 3);

                str = tpXSLTDoc.transform(elem, xslParams);
                result = TP.elem(str);

                test.assert.isElement(result);

                //  There is the same number of 'html:td's as there are data
                test.assert.isEqualTo(
                    TP.nodeGetElementsByTagName(result, 'html:td').getSize(),
                    data.getSize());

                //  Since we have set the XSLT column count to 3, there should
                //  be 'count / 3' number of rows
                test.assert.isEqualTo(
                    TP.nodeGetElementsByTagName(result, 'html:tr').getSize(),
                    data.getSize() / 3);
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    this.it('XSL transformation with parameters - supply node values', function(test, options) {

        var loadURI;

        loadURI = TP.uc('~lib_test/src/tibet/xslt/ReflectNodeParam.xsl');

        test.getDriver().fetchResource(loadURI, TP.WRAP).chain(
            function(tpXSLTDoc) {

                var data,
                    elem,
                    xslParams,
                    str,
                    result;

                data = TP.ac(1, 2, 3, 4, 5, 6);

                //  NB: These should match <xsl:param> elements in the XSLT
                xslParams = TP.hc('sourceElem',
                                    TP.elem('<dataroot xmlns="">' +
                                            data.asXMLString() +
                                            '</dataroot>'));

                elem = TP.elem('<test/>');

                str = tpXSLTDoc.transform(elem, xslParams);
                result = TP.elem(str);

                test.assert.isElement(result);

                test.assert.isEqualTo(
                        TP.elementGetLocalName(result),
                        'result');

                test.assert.isEqualTo(
                        TP.elementGetLocalName(result.firstElementChild),
                        'dataroot');

                //  There is the same number of 'item's as there are data
                test.assert.isEqualTo(
                    TP.nodeGetElementsByTagName(result, 'item').getSize(),
                    data.getSize());
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
