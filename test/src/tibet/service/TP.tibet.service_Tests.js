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
//  TP.tibet.service
//  ========================================================================

TP.tibet.service.Inst.describe('TP.tibet.service',
function() {

    var unloadURI;

    unloadURI = TP.uc(TP.sys.cfg('tibet.blankpage'));

    this.before(
        function() {

            //  ---

            this.getDriver().showTestGUI();

            //  ---

            //  NB: We do this here rather than in the 'beforeEach' so that we
            //  can test for signals that get dispatched during the load
            //  process.
            this.startTrackingSignals();
        });

    this.after(
        function() {

            //  ---

            this.getDriver().showTestLog();

            //  ---

            //  Stop tracking here because we started tracking in the before().
            this.stopTrackingSignals();
        });

    this.afterEach(
        function() {
            //  Reset the metrics we're tracking.
            TP.signal.reset();
        });

    //  ---

    this.it('GET with static query-style parameter - no specific result type', function(test, options) {

        var loadURI,
            handler;

        loadURI = TP.uc('~lib_tst/src/tibet/service/Service1.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var locStr,
                    resultElem,
                    server,

                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_QUERY_GET_TEST?search=dog';
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  Create a 'fake' HTTP server
                server = TP.test.fakeServer.create();

                //  Set up the 'server' to respond properly.
                server.respondWith(
                    TP.HTTP_GET,
                    locStr,
                    [
                        200,
                        {
                            'Content-Type': TP.XML_ENCODED
                        },
                        resultElem.asString()
                    ]);

                //  ---

                serviceTPElem = TP.byOID('Service1');

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {
                        handler = function() {
                            var resultURI,
                                aResult;

                            //  Now that we're really done with everything, we
                            //  can resolve() the Promise.
                            resolver();

                            handler.ignore(serviceTPElem, 'TP.sig.DOMReady');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataReceived');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataConstruct');

                            resultURI = TP.uc('urn:tibet:Service1_Result');

                            aResult = resultURI.getResource();

                            test.assert.isKindOf(
                                aResult, TP.core.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body').at(0),
                                    resultElem.get('html|body').at(0));

                            //  Unload the current page by setting it to the
                            //  blank
                            test.getDriver().setLocation(unloadURI);

                            //  Unregister the URI to avoid a memory leak
                            loadURI.unregister();

                            return this;
                        };
                    });

                handler.observe(serviceTPElem, 'TP.sig.DOMReady');

                serviceTPElem.trigger();

                test.assert.didSignal(serviceTPElem, 'TP.sig.UIDataSent');

                server.respond();

                //  Restore the server to the built-in functionality.
                server.restore();

                //  Return the Promise.
                return promise;
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('GET with dynamic query-style parameter - no specific result type', function(test, options) {

        var loadURI,
            handler;

        loadURI = TP.uc('~lib_tst/src/tibet/service/Service2.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var locRe,
                    resultElem,
                    server,

                    searchTPElem,
                    serviceTPElem,

                    promise;

                locRe = TP.rc('\\/TIBET_endpoints\\/HTTP_QUERY_GET_TEST\\?search=.+');
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  Create a 'fake' HTTP server
                server = TP.test.fakeServer.create();

                //  Set up the 'server' to respond properly.
                server.respondWith(
                    TP.HTTP_GET,
                    locRe,
                    [
                        200,
                        {
                            'Content-Type': TP.XML_ENCODED
                        },
                        resultElem.asString()
                    ]);

                //  ---

                searchTPElem = TP.byOID('SearchTermField');
                serviceTPElem = TP.byOID('Service2');

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {
                        handler = function() {
                            var resultURI,
                                aResult;

                            //  Now that we're really done with everything, we
                            //  can resolve() the Promise.
                            resolver();

                            handler.ignore(serviceTPElem, 'TP.sig.DOMReady');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataReceived');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataConstruct');

                            resultURI = TP.uc('urn:tibet:Service2_Result');

                            aResult = resultURI.getResource();

                            test.assert.isKindOf(
                                aResult, TP.core.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body').at(0),
                                    resultElem.get('html|body').at(0));

                            //  Unload the current page by setting it to the
                            //  blank
                            test.getDriver().setLocation(unloadURI);

                            //  Unregister the URI to avoid a memory leak
                            loadURI.unregister();

                            return this;
                        };
                    });

                handler.observe(serviceTPElem, 'TP.sig.DOMReady');

                test.getDriver().startSequence().
                    sendKeys('dog', searchTPElem).
                    sendEvent(TP.hc('type', 'change'), searchTPElem).
                    perform();

                test.then(
                    function() {
                        serviceTPElem.trigger();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();

                        //  Restore the server to the built-in functionality.
                        server.restore();
                    });

                //  Return the Promise.
                return promise;
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('REST GET with no parameter, no specific result type', function(test, options) {

        var loadURI,
            handler;

        loadURI = TP.uc('~lib_tst/src/tibet/service/Service3.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var locStr,
                    resultElem,
                    server,

                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_REST_GET_TEST';
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  Create a 'fake' HTTP server
                server = TP.test.fakeServer.create();

                //  Set up the 'server' to respond properly.
                server.respondWith(
                    TP.HTTP_GET,
                    locStr,
                    [
                        200,
                        {
                            'Content-Type': TP.XML_ENCODED
                        },
                        resultElem.asString()
                    ]);

                //  ---

                serviceTPElem = TP.byOID('Service3');

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {
                        handler = function() {
                            var resultURI,
                                aResult;

                            //  Now that we're really done with everything, we
                            //  can resolve() the Promise.
                            resolver();

                            handler.ignore(serviceTPElem, 'TP.sig.DOMReady');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataReceived');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataConstruct');

                            resultURI = TP.uc('urn:tibet:Service3_Result');

                            aResult = resultURI.getResource();

                            test.assert.isKindOf(
                                aResult, TP.core.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body').at(0),
                                    resultElem.get('html|body').at(0));

                            //  Unload the current page by setting it to the
                            //  blank
                            test.getDriver().setLocation(unloadURI);

                            //  Unregister the URI to avoid a memory leak
                            loadURI.unregister();

                            return this;
                        };
                    });

                handler.observe(serviceTPElem, 'TP.sig.DOMReady');

                serviceTPElem.trigger();

                test.assert.didSignal(serviceTPElem, 'TP.sig.UIDataSent');

                server.respond();

                //  Restore the server to the built-in functionality.
                server.restore();

                //  Return the Promise.
                return promise;
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('REST GET with static parameter - no specific result type', function(test, options) {

        var loadURI,
            handler;

        loadURI = TP.uc('~lib_tst/src/tibet/service/Service4.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var locStr,
                    resultElem,
                    server,

                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_REST_GET_TEST/dog';
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  Create a 'fake' HTTP server
                server = TP.test.fakeServer.create();

                //  Set up the 'server' to respond properly.
                server.respondWith(
                    TP.HTTP_GET,
                    locStr,
                    [
                        200,
                        {
                            'Content-Type': TP.XML_ENCODED
                        },
                        resultElem.asString()
                    ]);

                //  ---

                serviceTPElem = TP.byOID('Service4');

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {
                        handler = function() {
                            var resultURI,
                                aResult;

                            //  Now that we're really done with everything, we
                            //  can resolve() the Promise.
                            resolver();

                            handler.ignore(serviceTPElem, 'TP.sig.DOMReady');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataReceived');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataConstruct');

                            resultURI = TP.uc('urn:tibet:Service4_Result');

                            aResult = resultURI.getResource();

                            test.assert.isKindOf(
                                aResult, TP.core.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body').at(0),
                                    resultElem.get('html|body').at(0));

                            //  Unload the current page by setting it to the
                            //  blank
                            test.getDriver().setLocation(unloadURI);

                            //  Unregister the URI to avoid a memory leak
                            loadURI.unregister();

                            return this;
                        };
                    });

                handler.observe(serviceTPElem, 'TP.sig.DOMReady');

                serviceTPElem.trigger();

                test.assert.didSignal(serviceTPElem, 'TP.sig.UIDataSent');

                server.respond();

                //  Restore the server to the built-in functionality.
                server.restore();

                //  Return the Promise.
                return promise;
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('REST GET with dynamic parameter - no specific result type', function(test, options) {

        var loadURI,
            handler;

        loadURI = TP.uc('~lib_tst/src/tibet/service/Service5.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var locRe,
                    resultElem,
                    server,

                    searchTPElem,
                    serviceTPElem,

                    promise;

                locRe = TP.rc('\\/TIBET_endpoints\\/HTTP_REST_GET_TEST\\/.+');
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  Create a 'fake' HTTP server
                server = TP.test.fakeServer.create();

                //  Set up the 'server' to respond properly.
                server.respondWith(
                    TP.HTTP_GET,
                    locRe,
                    [
                        200,
                        {
                            'Content-Type': TP.XML_ENCODED
                        },
                        resultElem.asString()
                    ]);

                //  ---

                searchTPElem = TP.byOID('SearchTermField');
                serviceTPElem = TP.byOID('Service5');

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {
                        handler = function() {
                            var resultURI,
                                aResult;

                            //  Now that we're really done with everything, we
                            //  can resolve() the Promise.
                            resolver();

                            handler.ignore(serviceTPElem, 'TP.sig.DOMReady');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataReceived');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataConstruct');

                            resultURI = TP.uc('urn:tibet:Service5_Result');

                            aResult = resultURI.getResource();

                            test.assert.isKindOf(
                                aResult, TP.core.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body').at(0),
                                    resultElem.get('html|body').at(0));

                            //  Unload the current page by setting it to the
                            //  blank
                            test.getDriver().setLocation(unloadURI);

                            //  Unregister the URI to avoid a memory leak
                            loadURI.unregister();

                            return this;
                        };
                    });

                handler.observe(serviceTPElem, 'TP.sig.DOMReady');

                test.getDriver().startSequence().
                    sendKeys('dog', searchTPElem).
                    sendEvent(TP.hc('type', 'change'), searchTPElem).
                    perform();

                test.then(
                    function() {
                        serviceTPElem.trigger();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();

                        //  Restore the server to the built-in functionality.
                        server.restore();

                        //  Return the Promise.
                        return promise;
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('REST GET with dynamic parameter and custom headers - no specific result type', function(test, options) {

        var loadURI,
            handler;

        loadURI = TP.uc('~lib_tst/src/tibet/service/Service6.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var locRe,
                    resultElem,
                    server,

                    searchTPElem,
                    serviceTPElem,

                    promise;

                locRe = TP.rc('\\/TIBET_endpoints\\/HTTP_REST_GET_TEST\\/.+');
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  Create a 'fake' HTTP server
                server = TP.test.fakeServer.create();

                //  Set up the 'server' to respond properly.
                server.respondWith(
                    TP.HTTP_GET,
                    locRe,
                    function(req) {

                        test.assert.isValid(req.requestHeaders['X-Record-Num']);

                        req.respond(
                            200,
                            {
                                'Content-Type': TP.XML_ENCODED
                            },
                            resultElem.asString());
                    });

                //  ---

                searchTPElem = TP.byOID('SearchTermField');
                serviceTPElem = TP.byOID('Service6');

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {
                        handler = function() {
                            var resultURI,
                                aResult;

                            //  Now that we're really done with everything, we
                            //  can resolve() the Promise.
                            resolver();

                            handler.ignore(serviceTPElem, 'TP.sig.DOMReady');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataReceived');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataConstruct');

                            resultURI = TP.uc('urn:tibet:Service6_Result');

                            aResult = resultURI.getResource();

                            test.assert.isKindOf(
                                aResult, TP.core.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body').at(0),
                                    resultElem.get('html|body').at(0));

                            //  Unload the current page by setting it to the
                            //  blank
                            test.getDriver().setLocation(unloadURI);

                            //  Unregister the URI to avoid a memory leak
                            loadURI.unregister();

                            return this;
                        };
                    });

                handler.observe(serviceTPElem, 'TP.sig.DOMReady');

                test.getDriver().startSequence().
                    sendKeys('dog', searchTPElem).
                    sendEvent(TP.hc('type', 'change'), searchTPElem).
                    perform();

                test.then(
                    function() {
                        serviceTPElem.trigger();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();

                        //  Restore the server to the built-in functionality.
                        server.restore();

                        //  Return the Promise.
                        return promise;
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('REST POST with dynamic body - no specific result type', function(test, options) {

        var loadURI,
            handler;

        loadURI = TP.uc('~lib_tst/src/tibet/service/Service7.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var locStr,
                    testBody,

                    server,

                    bodyContentTPElem,
                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_REST_POST_TEST';
                testBody = 'POST test content';

                //  Create a 'fake' HTTP server
                server = TP.test.fakeServer.create();

                //  Set up the 'server' to respond properly.
                server.respondWith(
                    TP.HTTP_POST,
                    locStr,
                    function(req) {

                        test.assert.isEqualTo(req.requestBody, testBody);

                        req.respond(
                            200,
                            {
                                'Content-Type': TP.PLAIN_TEXT_ENCODED
                            },
                            'OK from POST');
                    });

                //  ---

                bodyContentTPElem = TP.byOID('BodyContentField');
                serviceTPElem = TP.byOID('Service7');

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {
                        handler = function() {
                            var resultURI,
                                aResult;

                            //  Now that we're really done with everything, we
                            //  can resolve() the Promise.
                            resolver();

                            handler.ignore(serviceTPElem, 'TP.sig.DOMReady');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataReceived');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataConstruct');

                            resultURI = TP.uc('urn:tibet:Service7_Result');

                            aResult = resultURI.getResource();

                            test.assert.isKindOf(aResult, String);
                            test.assert.isEqualTo(aResult, testBody);

                            //  Unload the current page by setting it to the
                            //  blank
                            test.getDriver().setLocation(unloadURI);

                            //  Unregister the URI to avoid a memory leak
                            loadURI.unregister();

                            return this;
                        };
                    });

                handler.observe(serviceTPElem, 'TP.sig.DOMReady');

                test.getDriver().startSequence().
                    sendKeys(testBody, bodyContentTPElem).
                    sendEvent(TP.hc('type', 'change'), bodyContentTPElem).
                    perform();

                test.then(
                    function() {
                        serviceTPElem.trigger();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();

                        //  Restore the server to the built-in functionality.
                        server.restore();

                        //  Return the Promise.
                        return promise;
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('REST PUT with dynamic parameter - no specific result type', function(test, options) {

        var loadURI,
            handler;

        loadURI = TP.uc('~lib_tst/src/tibet/service/Service8.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var locRe,
                    resultElem,
                    server,

                    searchTPElem,
                    serviceTPElem,

                    promise;

                locRe = TP.rc('\\/TIBET_endpoints\\/HTTP_REST_PUT_TEST\\/.+');
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  Create a 'fake' HTTP server
                server = TP.test.fakeServer.create();

                //  Set up the 'server' to respond properly.
                server.respondWith(
                    TP.HTTP_PUT,
                    locRe,
                    [
                        200,
                        {
                            'Content-Type': TP.XML_ENCODED
                        },
                        resultElem.asString()
                    ]);

                //  ---

                searchTPElem = TP.byOID('SearchTermField');
                serviceTPElem = TP.byOID('Service8');

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {
                        handler = function() {
                            var resultURI,
                                aResult;

                            //  Now that we're really done with everything, we
                            //  can resolve() the Promise.
                            resolver();

                            handler.ignore(serviceTPElem, 'TP.sig.DOMReady');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataReceived');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataConstruct');

                            resultURI = TP.uc('urn:tibet:Service8_Result');

                            aResult = resultURI.getResource();

                            test.assert.isKindOf(
                                aResult, TP.core.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body').at(0),
                                    resultElem.get('html|body').at(0));

                            //  Unload the current page by setting it to the
                            //  blank
                            test.getDriver().setLocation(unloadURI);

                            //  Unregister the URI to avoid a memory leak
                            loadURI.unregister();

                            return this;
                        };
                    });

                handler.observe(serviceTPElem, 'TP.sig.DOMReady');

                test.getDriver().startSequence().
                    sendKeys('dog', searchTPElem).
                    sendEvent(TP.hc('type', 'change'), searchTPElem).
                    perform();

                test.then(
                    function() {
                        serviceTPElem.trigger();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();

                        //  Restore the server to the built-in functionality.
                        server.restore();

                        //  Return the Promise.
                        return promise;
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('REST DELETE with dynamic parameter - no specific result type', function(test, options) {

        var loadURI,
            handler;

        loadURI = TP.uc('~lib_tst/src/tibet/service/Service9.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var locRe,
                    resultElem,
                    server,

                    searchTPElem,
                    serviceTPElem,

                    promise;

                locRe = TP.rc('\\/TIBET_endpoints\\/HTTP_REST_DELETE_TEST\\/.+');
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  Create a 'fake' HTTP server
                server = TP.test.fakeServer.create();

                //  Set up the 'server' to respond properly.
                server.respondWith(
                    TP.HTTP_DELETE,
                    locRe,
                    [
                        200,
                        {
                            'Content-Type': TP.XML_ENCODED
                        },
                        resultElem.asString()
                    ]);

                //  ---

                searchTPElem = TP.byOID('SearchTermField');
                serviceTPElem = TP.byOID('Service9');

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {
                        handler = function() {
                            var resultURI,
                                aResult;

                            //  Now that we're really done with everything, we
                            //  can resolve() the Promise.
                            resolver();

                            handler.ignore(serviceTPElem, 'TP.sig.DOMReady');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataReceived');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataConstruct');

                            resultURI = TP.uc('urn:tibet:Service9_Result');

                            aResult = resultURI.getResource();

                            test.assert.isKindOf(
                                aResult, TP.core.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body').at(0),
                                    resultElem.get('html|body').at(0));

                            //  Unload the current page by setting it to the
                            //  blank
                            test.getDriver().setLocation(unloadURI);

                            //  Unregister the URI to avoid a memory leak
                            loadURI.unregister();

                            return this;
                        };
                    });

                handler.observe(serviceTPElem, 'TP.sig.DOMReady');

                test.getDriver().startSequence().
                    sendKeys('dog', searchTPElem).
                    sendEvent(TP.hc('type', 'change'), searchTPElem).
                    perform();

                test.then(
                    function() {
                        serviceTPElem.trigger();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();

                        //  Restore the server to the built-in functionality.
                        server.restore();

                        //  Return the Promise.
                        return promise;
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('FORM POST with body - no specific result type', function(test, options) {

        var loadURI,
            handler;

        loadURI = TP.uc('~lib_tst/src/tibet/service/Service10.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var locStr,

                    bodyURI,
                    testBody,

                    server,

                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_FORM_POST_TEST';

                bodyURI = TP.uc('urn:tibet:Service10_Body');
                testBody = bodyURI.getResource();

                //  Create a 'fake' HTTP server
                server = TP.test.fakeServer.create();

                //  Set up the 'server' to respond properly.
                server.respondWith(
                    TP.HTTP_POST,
                    locStr,
                    function(req) {

                        test.assert.isEqualTo(
                            req.requestBody,
                            TP.httpEncode(testBody.at('data'), TP.URL_ENCODED));

                        req.respond(
                            200,
                            {
                                'Content-Type': TP.PLAIN_TEXT_ENCODED
                            },
                            'OK from POST');
                    });

                //  ---

                serviceTPElem = TP.byOID('Service10');

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {
                        handler = function() {
                            var resultURI,
                                aResult;

                            //  Now that we're really done with everything, we
                            //  can resolve() the Promise.
                            resolver();

                            handler.ignore(serviceTPElem, 'TP.sig.DOMReady');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataReceived');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataConstruct');

                            resultURI = TP.uc('urn:tibet:Service10_Result');

                            aResult = resultURI.getResource();

                            test.assert.isKindOf(aResult, TP.lang.Hash);
                            test.assert.isEqualTo(
                                aResult, testBody.get('data'));

                            //  Unload the current page by setting it to the
                            //  blank
                            test.getDriver().setLocation(unloadURI);

                            //  Unregister the URI to avoid a memory leak
                            loadURI.unregister();

                            return this;
                        };
                    });

                handler.observe(serviceTPElem, 'TP.sig.DOMReady');

                serviceTPElem.trigger();

                test.assert.didSignal(serviceTPElem, 'TP.sig.UIDataSent');

                server.respond();

                //  Restore the server to the built-in functionality.
                server.restore();

                //  Return the Promise.
                return promise;
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('MULTIPART FORM POST with body - no specific result type', function(test, options) {

        var loadURI,
            handler;

        loadURI = TP.uc('~lib_tst/src/tibet/service/Service11.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var locStr,

                    server,

                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_MULTIPART_FORM_POST_TEST';

                //  Create a 'fake' HTTP server
                server = TP.test.fakeServer.create();

                //  Set up the 'server' to respond properly.
                server.respondWith(
                    TP.HTTP_POST,
                    locStr,
                    function(req) {

                        test.assert.matches(req.requestBody, /Content-disposition: form-data; name="0"/);
                        test.assert.matches(req.requestBody, /Content-disposition: form-data; name="1"/);

                        req.respond(
                            200,
                            {
                                'Content-Type': TP.PLAIN_TEXT_ENCODED
                            },
                            'OK from POST');
                    });

                //  ---

                serviceTPElem = TP.byOID('Service11');

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {
                        handler = function() {
                            var resultURI,
                                aResult;

                            //  Now that we're really done with everything, we
                            //  can resolve() the Promise.
                            resolver();

                            handler.ignore(serviceTPElem, 'TP.sig.DOMReady');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataReceived');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataConstruct');

                            resultURI = TP.uc('urn:tibet:Service11_Result');

                            aResult = resultURI.getResource();

                            test.assert.isKindOf(aResult, Array);
                            test.assert.hasKey(aResult.at(0), 'body');
                            test.assert.hasKey(aResult.at(1), 'body');

                            //  Unload the current page by setting it to the
                            //  blank
                            test.getDriver().setLocation(unloadURI);

                            //  Unregister the URI to avoid a memory leak
                            loadURI.unregister();

                            return this;
                        };
                    });

                handler.observe(serviceTPElem, 'TP.sig.DOMReady');

                serviceTPElem.trigger();

                test.assert.didSignal(serviceTPElem, 'TP.sig.UIDataSent');

                server.respond();

                //  Restore the server to the built-in functionality.
                server.restore();

                //  Return the Promise.
                return promise;
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('MULTIPART RELATED POST with body - no specific result type', function(test, options) {

        var loadURI,
            handler;

        loadURI = TP.uc('~lib_tst/src/tibet/service/Service12.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var locStr,

                    server,

                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_MULTIPART_RELATED_POST_TEST';

                //  Create a 'fake' HTTP server
                server = TP.test.fakeServer.create();

                //  Set up the 'server' to respond properly.
                server.respondWith(
                    TP.HTTP_POST,
                    locStr,
                    function(req) {

                        test.assert.matches(req.requestBody, /Content-ID: 0\s+foo => bar, baz => goo/);
                        test.assert.matches(req.requestBody, /Content-ID: 1\s+<value><goo>tar<\/goo><faz>roo<\/faz><\/value>/);

                        req.respond(
                            200,
                            {
                                'Content-Type': TP.PLAIN_TEXT_ENCODED
                            },
                            'OK from POST');
                    });

                //  ---

                serviceTPElem = TP.byOID('Service12');

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {
                        handler = function() {
                            var resultURI,
                                aResult;

                            //  Now that we're really done with everything, we
                            //  can resolve() the Promise.
                            resolver();

                            handler.ignore(serviceTPElem, 'TP.sig.DOMReady');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataReceived');

                            test.assert.didSignal(
                                serviceTPElem, 'TP.sig.UIDataConstruct');

                            resultURI = TP.uc('urn:tibet:Service12_Result');

                            aResult = resultURI.getResource();

                            test.assert.isKindOf(aResult, Array);
                            test.assert.hasKey(aResult.at(0), 'body');
                            test.assert.hasKey(aResult.at(1), 'body');

                            //  Unload the current page by setting it to the
                            //  blank
                            test.getDriver().setLocation(unloadURI);

                            //  Unregister the URI to avoid a memory leak
                            loadURI.unregister();

                            return this;
                        };
                    });

                handler.observe(serviceTPElem, 'TP.sig.DOMReady');

                serviceTPElem.trigger();

                test.assert.didSignal(serviceTPElem, 'TP.sig.UIDataSent');

                server.respond();

                //  Restore the server to the built-in functionality.
                server.restore();

                //  Return the Promise.
                return promise;
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });
}).skip(TP.sys.cfg('boot.context') === 'phantomjs');

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.tibet.data.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
