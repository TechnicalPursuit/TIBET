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
//  TP.http.service
//  ========================================================================

TP.http.service.Inst.describe('TP.http.service',
function() {

    var driver,

        unloadURI,

        httpLoc,

        windowContext,

        loadURI,

        server;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    httpLoc = 'http://127.0.0.1:1407';

    this.before(
        function(suite, options) {

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            //  ---

            driver.showTestGUI();

            //  ---

            //  NB: We do this here rather than in the 'beforeEach' so that we
            //  can test for signals that get dispatched during the load
            //  process.
            this.startTrackingSignals();
        });

    this.after(
        function(suite, options) {

            //  ---

            driver.showTestLog();

            //  ---

            //  Stop tracking here because we started tracking in the before().
            this.stopTrackingSignals();
        });

    this.afterEach(
        function(test, options) {

            server.restore();

            //  Unload the current page by setting it to the
            //  blank
            driver.setLocation(unloadURI);
        });

    //  ---

    this.it('GET with static query-style parameter - no specific result type', function(test, options) {

        loadURI = TP.uc('~lib_test/src/http/service/Service1.xhtml');

        driver.setLocation(loadURI);

        test.chain(
            function(result) {
                var locStr,
                    resultElem,

                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_QUERY_GET_TEST?search=dog';
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  ---

                serviceTPElem = TP.byId('Service1', windowContext);

                //  If we're running in headless mode (we're probably testing),
                //  then we need to rewrite the URL to have an HTTP resource and
                //  reset it on the service element.
                if (TP.sys.cfg('boot.context') === 'headless') {
                    locStr = httpLoc + locStr;
                    TP.elementSetAttribute(serviceTPElem.getNativeNode(),
                                            'href',
                                            locStr,
                                            true);
                }

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        var handler;

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

                            aResult = resultURI.getResource(
                                TP.hc('resultType', TP.WRAP)).get('result');

                            test.assert.isKindOf(
                                aResult, TP.dom.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body'),
                                    resultElem.get('html|body'));

                            return this;
                        };

                        handler.observe(serviceTPElem, 'TP.sig.DOMReady');
                    });

                test.chain(
                    function() {

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

                        serviceTPElem.activate();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();
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

    this.it('GET with dynamic query-style parameter - no specific result type', function(test, options) {

        loadURI = TP.uc('~lib_test/src/http/service/Service2.xhtml');

        driver.setLocation(loadURI);

        test.chain(
            function(result) {
                var locRe,
                    resultElem,

                    searchTPElem,
                    serviceTPElem,

                    promise;

                locRe = TP.rc('\\/TIBET_endpoints\\/HTTP_QUERY_GET_TEST\\?search=.+');
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  ---

                searchTPElem = TP.byId('SearchTermField', windowContext);
                serviceTPElem = TP.byId('Service2', windowContext);

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        var handler;

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

                            aResult = resultURI.getResource(
                                TP.hc('resultType', TP.WRAP)).get('result');

                            test.assert.isKindOf(
                                aResult, TP.dom.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body'),
                                    resultElem.get('html|body'));

                            return this;
                        };

                        handler.observe(serviceTPElem, 'TP.sig.DOMReady');
                    });

                driver.constructSequence().
                    sendKeys('dog', searchTPElem).
                    sendEvent(TP.hc('type', 'change'), searchTPElem).
                    run();

                test.chain(
                    function() {

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

                        serviceTPElem.activate();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();
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

        loadURI = TP.uc('~lib_test/src/http/service/Service3.xhtml');

        driver.setLocation(loadURI);

        test.chain(
            function(result) {
                var locStr,
                    resultElem,

                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_REST_GET_TEST';
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  ---

                serviceTPElem = TP.byId('Service3', windowContext);

                //  If we're running in headless mode (we're probably testing),
                //  then we need to rewrite the URL to have an HTTP resource and
                //  reset it on the service element.
                if (TP.sys.cfg('boot.context') === 'headless') {
                    locStr = httpLoc + locStr;
                    TP.elementSetAttribute(serviceTPElem.getNativeNode(),
                                            'href',
                                            locStr,
                                            true);
                }

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        var handler;

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

                            aResult = resultURI.getResource(
                                TP.hc('resultType', TP.WRAP)).get('result');

                            test.assert.isKindOf(
                                aResult, TP.dom.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body'),
                                    resultElem.get('html|body'));

                            return this;
                        };

                        handler.observe(serviceTPElem, 'TP.sig.DOMReady');
                    });

                test.chain(
                    function() {

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

                        serviceTPElem.activate();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();
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

    this.it('REST GET with static parameter - no specific result type', function(test, options) {

        loadURI = TP.uc('~lib_test/src/http/service/Service4.xhtml');

        driver.setLocation(loadURI);

        test.chain(
            function(result) {
                var locStr,
                    resultElem,

                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_REST_GET_TEST/dog';
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  ---

                serviceTPElem = TP.byId('Service4', windowContext);

                //  If we're running in headless mode (we're probably testing),
                //  then we need to rewrite the URL to have an HTTP resource and
                //  reset it on the service element.
                if (TP.sys.cfg('boot.context') === 'headless') {
                    locStr = httpLoc + locStr;
                    TP.elementSetAttribute(serviceTPElem.getNativeNode(),
                                            'href',
                                            locStr,
                                            true);
                }

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        var handler;

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

                            aResult = resultURI.getResource(
                                TP.hc('resultType', TP.WRAP)).get('result');

                            test.assert.isKindOf(
                                aResult, TP.dom.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body'),
                                    resultElem.get('html|body'));

                            return this;
                        };

                        handler.observe(serviceTPElem, 'TP.sig.DOMReady');
                    });

                test.chain(
                    function() {

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

                        serviceTPElem.activate();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();
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

    this.it('REST GET with dynamic parameter - no specific result type', function(test, options) {

        loadURI = TP.uc('~lib_test/src/http/service/Service5.xhtml');

        driver.setLocation(loadURI);

        test.chain(
            function(result) {
                var locRe,
                    resultElem,

                    searchTPElem,
                    serviceTPElem,

                    promise;

                locRe = TP.rc('\\/TIBET_endpoints\\/HTTP_REST_GET_TEST\\/.+');
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  ---

                searchTPElem = TP.byId('SearchTermField', windowContext);
                serviceTPElem = TP.byId('Service5', windowContext);

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        var handler;

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

                            aResult = resultURI.getResource(
                                TP.hc('resultType', TP.WRAP)).get('result');

                            test.assert.isKindOf(
                                aResult, TP.dom.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body'),
                                    resultElem.get('html|body'));

                            return this;
                        };

                        handler.observe(serviceTPElem, 'TP.sig.DOMReady');
                    });

                driver.constructSequence().
                    sendKeys('dog', searchTPElem).
                    sendEvent(TP.hc('type', 'change'), searchTPElem).
                    run();

                test.chain(
                    function() {

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

                        serviceTPElem.activate();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();
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

    this.it('REST GET with dynamic parameter and custom headers - no specific result type', function(test, options) {

        loadURI = TP.uc('~lib_test/src/http/service/Service6.xhtml');

        driver.setLocation(loadURI);

        test.chain(
            function(result) {
                var locRe,
                    resultElem,

                    searchTPElem,
                    serviceTPElem,

                    promise;

                locRe = TP.rc('\\/TIBET_endpoints\\/HTTP_REST_GET_TEST\\/.+');
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  ---

                searchTPElem = TP.byId('SearchTermField', windowContext);
                serviceTPElem = TP.byId('Service6', windowContext);

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        var handler;

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

                            aResult = resultURI.getResource(
                                TP.hc('resultType', TP.WRAP)).get('result');

                            test.assert.isKindOf(
                                aResult, TP.dom.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body'),
                                    resultElem.get('html|body'));

                            return this;
                        };

                        handler.observe(serviceTPElem, 'TP.sig.DOMReady');
                    });

                driver.constructSequence().
                    sendKeys('dog', searchTPElem).
                    sendEvent(TP.hc('type', 'change'), searchTPElem).
                    run();

                test.chain(
                    function() {

                        //  Create a 'fake' HTTP server
                        server = TP.test.fakeServer.create();

                        //  Set up the 'server' to respond properly.
                        server.respondWith(
                            TP.HTTP_GET,
                            locRe,
                            function(req) {

                                req.respond(
                                    200,
                                    {
                                        'Content-Type': TP.XML_ENCODED
                                    },
                                    resultElem.asString());
                            });

                        serviceTPElem.activate();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();
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

    this.it('REST POST with dynamic body - no specific result type', function(test, options) {

        loadURI = TP.uc('~lib_test/src/http/service/Service7.xhtml');

        driver.setLocation(loadURI);

        test.chain(
            function(result) {
                var locStr,
                    testBody,

                    bodyContentTPElem,
                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_REST_POST_TEST';
                testBody = 'OK from POST';

                //  ---

                bodyContentTPElem = TP.byId('BodyContentField', windowContext);
                serviceTPElem = TP.byId('Service7', windowContext);

                //  If we're running in headless mode (we're probably testing),
                //  then we need to rewrite the URL to have an HTTP resource and
                //  reset it on the service element.
                if (TP.sys.cfg('boot.context') === 'headless') {
                    locStr = httpLoc + locStr;
                    TP.elementSetAttribute(serviceTPElem.getNativeNode(),
                                            'href',
                                            locStr,
                                            true);
                }

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        var handler;

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

                            aResult = resultURI.getResource(
                                TP.hc('resultType', TP.TEXT)).get('result');

                            test.assert.isKindOf(aResult, String);
                            test.assert.isEqualTo(aResult, testBody);

                            return this;
                        };

                        handler.observe(serviceTPElem, 'TP.sig.DOMReady');
                    });

                driver.constructSequence().
                    sendKeys(testBody, bodyContentTPElem).
                    sendEvent(TP.hc('type', 'change'), bodyContentTPElem).
                    run();

                test.chain(
                    function() {

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

                        serviceTPElem.activate();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();
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

    this.it('REST PUT with dynamic parameter - no specific result type', function(test, options) {

        loadURI = TP.uc('~lib_test/src/http/service/Service8.xhtml');

        driver.setLocation(loadURI);

        test.chain(
            function(result) {
                var locRe,
                    resultElem,

                    searchTPElem,
                    serviceTPElem,

                    promise;

                locRe = TP.rc('\\/TIBET_endpoints\\/HTTP_REST_PUT_TEST\\/.+');
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  ---

                searchTPElem = TP.byId('SearchTermField', windowContext);
                serviceTPElem = TP.byId('Service8', windowContext);

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        var handler;

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

                            aResult = resultURI.getResource(
                                TP.hc('resultType', TP.WRAP)).get('result');

                            test.assert.isKindOf(
                                aResult, TP.dom.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body'),
                                    resultElem.get('html|body'));

                            return this;
                        };

                        handler.observe(serviceTPElem, 'TP.sig.DOMReady');
                    });

                driver.constructSequence().
                    sendKeys('dog', searchTPElem).
                    sendEvent(TP.hc('type', 'change'), searchTPElem).
                    run();

                test.chain(
                    function() {

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

                        serviceTPElem.activate();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();
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

    this.it('REST DELETE with dynamic parameter - no specific result type', function(test, options) {

        loadURI = TP.uc('~lib_test/src/http/service/Service9.xhtml');

        driver.setLocation(loadURI);

        test.chain(
            function(result) {
                var locRe,
                    resultElem,

                    searchTPElem,
                    serviceTPElem,

                    promise;

                locRe = TP.rc('\\/TIBET_endpoints\\/HTTP_REST_DELETE_TEST\\/.+');
                resultElem = TP.wrap(
                                TP.xhtmlnode(
                                    '<html><body>Hi there</body></html>'));

                //  ---

                searchTPElem = TP.byId('SearchTermField', windowContext);
                serviceTPElem = TP.byId('Service9', windowContext);

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        var handler;

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

                            aResult = resultURI.getResource(
                                TP.hc('resultType', TP.WRAP)).get('result');

                            test.assert.isKindOf(
                                aResult, TP.dom.XHTMLDocumentNode);

                            test.assert.isEqualTo(
                                    aResult.get('html|body'),
                                    resultElem.get('html|body'));

                            return this;
                        };

                        handler.observe(serviceTPElem, 'TP.sig.DOMReady');
                    });

                driver.constructSequence().
                    sendKeys('dog', searchTPElem).
                    sendEvent(TP.hc('type', 'change'), searchTPElem).
                    run();

                test.chain(
                    function() {

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

                        serviceTPElem.activate();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();
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

    this.it('FORM POST with body - no specific result type', function(test, options) {

        loadURI = TP.uc('~lib_test/src/http/service/Service10.xhtml');

        driver.setLocation(loadURI);

        test.chain(
            function(result) {
                var locStr,

                    bodyURI,
                    testBody,

                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_FORM_POST_TEST';

                bodyURI = TP.uc('urn:tibet:Service10_Body');
                testBody = bodyURI.getResource().get('result');

                //  ---

                serviceTPElem = TP.byId('Service10', windowContext);

                //  If we're running in headless mode (we're probably testing),
                //  then we need to rewrite the URL to have an HTTP resource and
                //  reset it on the service element.
                if (TP.sys.cfg('boot.context') === 'headless') {
                    locStr = httpLoc + locStr;
                    TP.elementSetAttribute(serviceTPElem.getNativeNode(),
                                            'href',
                                            locStr,
                                            true);
                }

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        var handler;

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

                            aResult = resultURI.getResource(
                                    TP.hc('resultType', TP.TEXT)).get('result');

                            test.assert.isKindOf(aResult, String);
                            test.assert.isEqualTo(aResult, 'OK from POST');

                            return this;
                        };

                        handler.observe(serviceTPElem, 'TP.sig.DOMReady');
                    });

                test.chain(
                    function() {

                        //  Create a 'fake' HTTP server
                        server = TP.test.fakeServer.create();

                        //  Set up the 'server' to respond properly.
                        server.respondWith(
                            TP.HTTP_POST,
                            locStr,
                            function(req) {

                                test.assert.isEqualTo(
                                    req.requestBody,
                                    testBody.asHTTPValue());

                                req.respond(
                                    200,
                                    {
                                        'Content-Type': TP.PLAIN_TEXT_ENCODED
                                    },
                                    'OK from POST');
                            });

                        serviceTPElem.activate();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();
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

    this.it('MULTIPART FORM POST with body - no specific result type', function(test, options) {

        loadURI = TP.uc('~lib_test/src/http/service/Service11.xhtml');

        driver.setLocation(loadURI);

        test.chain(
            function(result) {
                var locStr,

                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_MULTIPART_FORM_POST_TEST';

                //  ---

                serviceTPElem = TP.byId('Service11', windowContext);

                //  If we're running in headless mode (we're probably testing),
                //  then we need to rewrite the URL to have an HTTP resource and
                //  reset it on the service element.
                if (TP.sys.cfg('boot.context') === 'headless') {
                    locStr = httpLoc + locStr;
                    TP.elementSetAttribute(serviceTPElem.getNativeNode(),
                                            'href',
                                            locStr,
                                            true);
                }

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        var handler;

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

                            aResult = resultURI.getResource().get('result');

                            aResult = resultURI.getResource(
                                    TP.hc('resultType', TP.TEXT)).get('result');

                            test.assert.isKindOf(aResult, String);
                            test.assert.isEqualTo(aResult, 'OK from POST');

                            return this;
                        };

                        handler.observe(serviceTPElem, 'TP.sig.DOMReady');
                    });

                test.chain(
                    function() {

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

                        serviceTPElem.activate();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();
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

    this.it('MULTIPART RELATED POST with body - no specific result type', function(test, options) {

        loadURI = TP.uc('~lib_test/src/http/service/Service12.xhtml');

        driver.setLocation(loadURI);

        test.chain(
            function(result) {
                var locStr,

                    serviceTPElem,

                    promise;

                locStr = '/TIBET_endpoints/HTTP_MULTIPART_RELATED_POST_TEST';

                //  ---

                serviceTPElem = TP.byId('Service12', windowContext);

                //  If we're running in headless mode (we're probably testing),
                //  then we need to rewrite the URL to have an HTTP resource and
                //  reset it on the service element.
                if (TP.sys.cfg('boot.context') === 'headless') {
                    locStr = httpLoc + locStr;
                    TP.elementSetAttribute(serviceTPElem.getNativeNode(),
                                            'href',
                                            locStr,
                                            true);
                }

                //  ---

                //  In order to make the asynchronous behavior work here, we
                //  create a Promise and return it from the test case method.
                promise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        var handler;

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

                            aResult = resultURI.getResource(
                                    TP.hc('resultType', TP.TEXT)).get('result');

                            test.assert.isKindOf(aResult, String);
                            test.assert.isEqualTo(aResult, 'OK from POST');

                            return this;
                        };

                        handler.observe(serviceTPElem, 'TP.sig.DOMReady');
                    });

                test.chain(
                    function() {

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

                        serviceTPElem.activate();

                        test.assert.didSignal(serviceTPElem,
                                                'TP.sig.UIDataSent');

                        server.respond();
                    });

                //  Return the Promise.
                return promise;
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
