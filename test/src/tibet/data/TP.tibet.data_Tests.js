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

TP.tibet.data.Inst.describe('TP.tibet.data',
function() {

    var unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

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

            //  Unload the current page by setting it to the
            //  blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();

            //  Reset the metrics we're tracking.
            TP.signal.reset();
        });

    //  ---

    this.it('No specific result type - XML content', function(test, options) {

        loadURI = TP.uc('~lib_tst/src/tibet/data/Data1.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource;

                dataTPElem = TP.byOID('Data1');
                srcURI = TP.uc('urn:tibet:Data1_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource();

                test.assert.isMemberOf(dataResource, TP.core.XMLContent);

                test.then(
                    function() {
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

        loadURI = TP.uc('~lib_tst/src/tibet/data/Data2.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource;

                dataTPElem = TP.byOID('Data2');
                srcURI = TP.uc('urn:tibet:Data2_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource();

                test.assert.isMemberOf(dataResource, TP.core.JSONContent);

                test.then(
                    function() {
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

        loadURI = TP.uc('~lib_tst/src/tibet/data/Data3.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource;

                dataTPElem = TP.byOID('Data3');
                srcURI = TP.uc('urn:tibet:Data3_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource();

                test.assert.isMemberOf(dataResource, TP.test.DataTestMarkupEmployee);

                test.then(
                    function() {
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

        loadURI = TP.uc('~lib_tst/src/tibet/data/Data4.xhtml');

        test.getDriver().setLocation(loadURI);

        test.then(
            function(result) {
                var dataTPElem,
                    srcURI,
                    dataResource;

                dataTPElem = TP.byOID('Data4');
                srcURI = TP.uc('urn:tibet:Data4_person');

                test.assert.didSignal(dataTPElem, 'TP.sig.UIDataConstruct');

                dataResource = srcURI.getResource();

                test.assert.isMemberOf(dataResource, TP.test.DataTestJSONEmployee);

                test.then(
                    function() {
                        test.assert.didSignal(dataTPElem, 'TP.sig.UIDataDestruct');
                    });
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
