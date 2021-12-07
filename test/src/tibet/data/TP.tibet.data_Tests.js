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
//  TP.test.DataTestMarkupEmployee
//  ========================================================================

/**
 * @type {TP.test.DataTestMarkupEmployee}
 */

//  ------------------------------------------------------------------------

TP.core.XMLContent.defineSubtype('test.DataTestMarkupEmployee');

//  ========================================================================
//  TP.test.DataTestJSONEmployee
//  ========================================================================

/**
 * @type {TP.test.DataTestJSONEmployee}
 */

//  ------------------------------------------------------------------------

TP.core.JSONContent.defineSubtype('test.DataTestJSONEmployee');

//  ========================================================================
//  TP.tibet.data
//  ========================================================================

TP.tibet.data.Inst.describe('TP.tibet.data - basic',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    this.before(
        function(suite, options) {

            //  ---

            this.getDriver().showTestGUI();

            //  ---

            //  NB: We do this here rather than in the 'beforeEach' so that we
            //  can test for signals that get dispatched during the load
            //  process.
            this.startTrackingSignals();
        });

    this.after(
        function(suite, options) {

            //  ---

            this.getDriver().showTestLog();

            //  ---

            //  Stop tracking here because we started tracking in the before().
            this.stopTrackingSignals();
        });

    this.afterEach(
        function(test, options) {

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();

            //  Reset the metrics we're tracking.
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('No specific result type - non-mutable content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/data/Data1.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource;

                dataTPElem = TP.byId('Data1_boolean',
                                        test.getDriver().get('windowContext'));
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataTPElem = TP.byId('Data1_number',
                                        test.getDriver().get('windowContext'));
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataTPElem = TP.byId('Data1_string',
                                        test.getDriver().get('windowContext'));
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                //  ---

                srcURI = TP.uc('urn:tibet:Data1_boolean');
                dataResource = srcURI.getResource().get('result');
                test.assert.isMemberOf(TP.val(dataResource), Boolean);

                srcURI = TP.uc('urn:tibet:Data1_number');
                dataResource = srcURI.getResource().get('result');
                test.assert.isMemberOf(TP.val(dataResource), Number);

                srcURI = TP.uc('urn:tibet:Data1_string');
                dataResource = srcURI.getResource().get('result');
                test.assert.isMemberOf(TP.val(dataResource), String);

                //  ---

                test.getDriver().setLocation(unloadURI);

                //  ---

                //  NB: By chain()ing this, it gets invoked *after* this test's
                //  afterEach() method, which unloads the URI and which should
                //  cause the tibet:data tag to send 'TP.sig.UIDataDestruct'.
                dataTPElem = TP.byId('Data1_boolean',
                                        test.getDriver().get('windowContext'));
                test.chain(function() {
                    test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                });

                dataTPElem = TP.byId('Data1_number',
                                        test.getDriver().get('windowContext'));
                test.chain(function() {
                    test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                });

                dataTPElem = TP.byId('Data1_string',
                                        test.getDriver().get('windowContext'));
                test.chain(function() {
                    test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Specific result type - non-mutable content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/data/Data2.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource;

                dataTPElem = TP.byId('Data2_boolean',
                                        test.getDriver().get('windowContext'));
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataTPElem = TP.byId('Data2_number',
                                        test.getDriver().get('windowContext'));
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataTPElem = TP.byId('Data2_string',
                                        test.getDriver().get('windowContext'));
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                //  ---

                srcURI = TP.uc('urn:tibet:Data2_boolean');
                dataResource = srcURI.getResource().get('result');
                test.assert.isMemberOf(TP.val(dataResource), Boolean);

                srcURI = TP.uc('urn:tibet:Data2_number');
                dataResource = srcURI.getResource().get('result');
                test.assert.isMemberOf(TP.val(dataResource), Number);

                srcURI = TP.uc('urn:tibet:Data2_string');
                dataResource = srcURI.getResource().get('result');
                test.assert.isMemberOf(TP.val(dataResource), String);

                //  ---

                test.getDriver().setLocation(unloadURI);

                //  ---

                //  NB: By chain()ing this, it gets invoked *after* this test's
                //  afterEach() method, which unloads the URI and which should
                //  cause the tibet:data tag to send 'TP.sig.UIDataDestruct'.
                dataTPElem = TP.byId('Data2_boolean',
                                        test.getDriver().get('windowContext'));
                test.chain(function() {
                    test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                });

                dataTPElem = TP.byId('Data2_number',
                                        test.getDriver().get('windowContext'));
                test.chain(function() {
                    test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                });

                dataTPElem = TP.byId('Data2_string',
                                        test.getDriver().get('windowContext'));
                test.chain(function() {
                    test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('No specific result type - XML content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/data/Data3.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource;

                dataTPElem = TP.byId('Data3',
                                        test.getDriver().get('windowContext'));
                srcURI = TP.uc('urn:tibet:Data3_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource().get('result');

                test.assert.isMemberOf(dataResource, TP.core.XMLContent);

                test.getDriver().setLocation(unloadURI);

                //  ---

                //  NB: By chain()ing this, it gets invoked *after* this test's
                //  afterEach() method, which unloads the URI and which should
                //  cause the tibet:data tag to send 'TP.sig.UIDataDestruct'.
                test.chain(function() {
                    test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Specific result type - XML content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/data/Data4.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource;

                dataTPElem = TP.byId('Data4',
                                        test.getDriver().get('windowContext'));
                srcURI = TP.uc('urn:tibet:Data4_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource().get('result');

                test.assert.isMemberOf(dataResource,
                                        TP.test.DataTestMarkupEmployee);

                test.getDriver().setLocation(unloadURI);

                //  ---

                //  NB: By chain()ing this, it gets invoked *after* this test's
                //  afterEach() method, which unloads the URI and which should
                //  cause the tibet:data tag to send 'TP.sig.UIDataDestruct'.
                test.chain(function() {
                    test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('No specific result type - JSON content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/data/Data5.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource;

                dataTPElem = TP.byId('Data5',
                                        test.getDriver().get('windowContext'));
                srcURI = TP.uc('urn:tibet:Data5_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource().get('result');

                test.assert.isMemberOf(dataResource, TP.core.JSONContent);

                test.getDriver().setLocation(unloadURI);

                //  ---

                //  NB: By chain()ing this, it gets invoked *after* this test's
                //  afterEach() method, which unloads the URI and which should
                //  cause the tibet:data tag to send 'TP.sig.UIDataDestruct'.
                test.chain(function() {
                    test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Specific result type - JSON content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/data/Data6.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource;

                dataTPElem = TP.byId('Data6',
                                        test.getDriver().get('windowContext'));
                srcURI = TP.uc('urn:tibet:Data6_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource().get('result');

                test.assert.isMemberOf(dataResource,
                                        TP.test.DataTestJSONEmployee);

                test.getDriver().setLocation(unloadURI);

                //  ---

                //  NB: By chain()ing this, it gets invoked *after* this test's
                //  afterEach() method, which unloads the URI and which should
                //  cause the tibet:data tag to send 'TP.sig.UIDataDestruct'.
                test.chain(function() {
                    test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

});

//  ------------------------------------------------------------------------

TP.tibet.data.Inst.describe('TP.tibet.data - resetting via setContent()',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    this.before(
        function(suite, options) {

            //  ---

            this.getDriver().showTestGUI();

            //  ---

            //  NB: We do this here rather than in the 'beforeEach' so that we
            //  can test for signals that get dispatched during the load
            //  process.
            this.startTrackingSignals();
        });

    this.after(
        function(suite, options) {

            //  ---

            this.getDriver().showTestLog();

            //  ---

            //  Stop tracking here because we started tracking in the before().
            this.stopTrackingSignals();
        });

    this.afterEach(
        function(test, options) {

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();

            //  Reset the metrics we're tracking.
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('No specific result type - XML content then resetting via setContent()', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/data/Data3.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource;

                dataTPElem = TP.byId('Data3',
                                        test.getDriver().get('windowContext'));
                srcURI = TP.uc('urn:tibet:Data3_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource().get('result');

                //  We loaded with XML, so test that here.
                test.assert.isMemberOf(dataResource, TP.core.XMLContent);

                //  ---

                //  Reset the metrics we're tracking.
                test.getSuite().resetSignalTracking();

                //  Now set the content to other XML on the fly.
                dataTPElem.setContent('<data><randomXML/></data>');

                //  The element should've thrown these signals.
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource().get('result');

                //  We've now reloaded with (more) XML, so test that here.
                test.assert.isMemberOf(dataResource, TP.core.XMLContent);

                //  ---

                //  Reset the metrics we're tracking.
                test.getSuite().resetSignalTracking();

                //  Now set the content to JSON on the fly.
                dataTPElem.setContent('{"foo":["1st","2nd",{"hi":"there"}]}');

                //  The element should've thrown these signals.
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource().get('result');

                //  We've now reloaded with JSON, so test that here.
                test.assert.isMemberOf(dataResource, TP.core.JSONContent);

                test.getDriver().setLocation(unloadURI);

                //  ---

                //  NB: By chain()ing this, it gets invoked *after* this test's
                //  afterEach() method, which unloads the URI and which should
                //  cause the tibet:data tag to send 'TP.sig.UIDataDestruct'.
                test.chain(
                    function() {
                        test.assert.didSignal(dataTPElem,
                                                'TP.sig.UIDataDestruct');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('No specific result type - JSON content then resetting via setContent()', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/data/Data5.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource;

                dataTPElem = TP.byId('Data5',
                                        test.getDriver().get('windowContext'));
                srcURI = TP.uc('urn:tibet:Data5_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource().get('result');

                //  We loaded with JSON, so test that here.
                test.assert.isMemberOf(dataResource, TP.core.JSONContent);

                //  ---

                //  Reset the metrics we're tracking.
                test.getSuite().resetSignalTracking();

                //  Now set the content to other JSON on the fly.
                dataTPElem.setContent('{"foo":["1st","2nd",{"hi":"there"}]}');

                //  The element should've thrown these signals.
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource().get('result');

                //  We've now reloaded with (more) JSON, so test that here.
                test.assert.isMemberOf(dataResource, TP.core.JSONContent);

                //  ---

                //  Reset the metrics we're tracking.
                test.getSuite().resetSignalTracking();

                //  Now set the content to XML on the fly.
                dataTPElem.setContent('<data><randomXML/></data>');

                //  The element should've thrown these signals.
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource().get('result');

                //  We've now reloaded with XML, so test that here.
                test.assert.isMemberOf(dataResource, TP.core.XMLContent);

                test.getDriver().setLocation(unloadURI);

                //  ---

                //  NB: By chain()ing this, it gets invoked *after* this test's
                //  afterEach() method, which unloads the URI and which should
                //  cause the tibet:data tag to send 'TP.sig.UIDataDestruct'.
                test.chain(
                    function() {
                        test.assert.didSignal(dataTPElem,
                                                'TP.sig.UIDataDestruct');
                    });
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

});

//  ------------------------------------------------------------------------

TP.tibet.data.Inst.describe('TP.tibet.data - auto-creation of structures',
function() {

    var loadURI;

    this.before(
        function(suite, options) {

            //  ---

            this.getDriver().showTestGUI();

            //  ---

            //  NB: We do this here rather than in the 'beforeEach' so that we
            //  can test for signals that get dispatched during the load
            //  process.
            this.startTrackingSignals();
        });

    this.after(
        function(suite, options) {

            //  ---

            this.getDriver().showTestLog();

            //  ---

            //  Stop tracking here because we started tracking in the before().
            this.stopTrackingSignals();
        });

    this.afterEach(
        function(test, options) {

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();

            //  Reset the metrics we're tracking.
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('Auto-creation within existing structure - XML content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/data/Data7.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource,

                    testPath,
                    val;

                dataTPElem = TP.byId('Data7',
                                        test.getDriver().get('windowContext'));
                srcURI = TP.uc('urn:tibet:Data7_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource().get('result');

                //  We loaded with XML, so test that here.
                test.assert.isMemberOf(dataResource, TP.core.XMLContent);

                testPath = TP.xpc('/person/license_number');

                dataResource.set(testPath, '404040');

                val = TP.val(dataResource.get(testPath));

                test.assert.isEqualTo(val, '404040');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Auto-creation within existing structure - JSON content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/data/Data8.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource,

                    testPath,
                    val;

                dataTPElem = TP.byId('Data8',
                                        test.getDriver().get('windowContext'));
                srcURI = TP.uc('urn:tibet:Data8_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource().get('result');

                //  We loaded with JSON, so test that here.
                test.assert.isMemberOf(dataResource, TP.core.JSONContent);

                testPath = TP.jpc('$.person.license_number');

                dataResource.set(testPath, '404040');

                val = TP.val(dataResource.get(testPath));

                test.assert.isEqualTo(val, '404040');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Auto-creation into no existing structure - XML content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/data/Data9.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource,

                    testPath,
                    val;

                dataTPElem = TP.byId('Data9',
                                        test.getDriver().get('windowContext'));
                srcURI = TP.uc('urn:tibet:Data9_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                //  NB: The <tibet:data> tag will not have signaled
                //  UIDataConstruct, since it doesn't have any data. Therefore,
                //  we don't check for that here.

                dataResource = srcURI.getResource().get('result');

                //  We loaded with XML, so test that here.
                test.assert.isMemberOf(dataResource, TP.core.XMLContent);

                testPath = TP.xpc('/person/license_number');

                dataResource.set(testPath, '808080');

                val = TP.val(dataResource.get(testPath));

                test.assert.isEqualTo(val, '808080');
            },
            function(error) {
                test.fail(error, TP.sc('Couldn\'t get resource: ',
                                            loadURI.getLocation()));
            });
    });

    //  ---

    this.it('Auto-creation into no existing structure - JSON content', function(test, options) {

        loadURI = TP.uc('~lib_test/src/tibet/data/Data10.xhtml');

        test.getDriver().setLocation(loadURI);

        test.chain(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource,

                    testPath,
                    val;

                dataTPElem = TP.byId('Data10',
                                        test.getDriver().get('windowContext'));
                srcURI = TP.uc('urn:tibet:Data10_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                //  NB: The <tibet:data> tag will not have signaled
                //  UIDataConstruct, since it doesn't have any data. Therefore,
                //  we don't check for that here.

                dataResource = srcURI.getResource().get('result');

                //  We loaded with JSON, so test that here.
                test.assert.isMemberOf(dataResource, TP.core.JSONContent);

                testPath = TP.jpc('$.person.license_number');

                dataResource.set(testPath, '808080');

                val = TP.val(dataResource.get(testPath));

                test.assert.isEqualTo(val, '808080');
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
