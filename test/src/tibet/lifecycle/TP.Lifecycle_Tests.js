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
//  Document Loaded / Document Unloaded
//  ========================================================================

TP.describe('TP: document lifecycle',
function() {

    var loadURI,
        unloadURI,

        winContext;

    loadURI = TP.uc('~lib_test/src/tibet/lifecycle/LoadUnload_Test.xhtml');
    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        function(suite, options) {
            winContext = this.getDriver().get('windowContext');

            this.startTrackingSignals();
        });

    //  ---

    this.beforeEach(
        function(test, options) {
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.after(
        function(suite, options) {
            this.stopTrackingSignals();
        });

    //  ---

    this.it('window - DocumentLoaded', async function(test, options) {

        var driver;

        driver = test.getDriver();

        await driver.setLocation(loadURI);

        //  Window throws DocumentLoaded when document loads
        test.assert.didSignal(TP.gid(winContext),
                                'TP.sig.DocumentLoaded');
    });

    //  ---

    this.it('window - DocumentUnloaded', async function(test, options) {

        var driver;

        driver = test.getDriver();

        await driver.setLocation(loadURI);

        //  Now that we're loaded, unload the document
        await driver.setLocation(unloadURI);

        //  Window throws DocumentUnloaded when document unloads
        test.assert.didSignal(TP.gid(winContext),
                                'TP.sig.DocumentUnloaded');
    });

    //  ---

    this.it('document - DOMContentLoaded', async function(test, options) {

        var driver;

        driver = test.getDriver();

        await driver.setLocation(loadURI);

        //  Document throws DOMContentLoaded when document loads
        test.assert.didSignal(
                TP.gid(winContext.getNativeDocument()),
                'TP.sig.DOMContentLoaded');
    });

    //  ---

    this.it('document - DOMContentUnloaded', async function(test, options) {

        var driver,
            gid;

        driver = test.getDriver();

        await driver.setLocation(loadURI);

        //  Grab the id with the now-loaded content. Any unload will be
        //  signaled from here. If we wait until the next 'then' the ID
        //  will have shifted to the unload URI.
        gid = TP.gid(winContext.getNativeDocument());

        //  Now that we're loaded, unload the document
        await driver.setLocation(unloadURI);

        //  Document throws DOMContentUnloaded when document
        //  unloads
        test.assert.didSignal(gid,
                'TP.sig.DOMContentUnloaded');
    });

    //  ---

    this.it('element - DOMContentLoaded', async function(test, options) {

        var driver;

        driver = test.getDriver();

        await driver.setLocation(loadURI);

        TP.elementSetContent(
            TP.byId('testSpan', winContext, false),
            '<span>This is inner content</span>');


        //  Element throws DOMContentLoaded when its content is added
        //  to, inserted or set.
        test.assert.didSignal(
            TP.gid(TP.byId('testSpan', winContext, false)),
            'TP.sig.DOMContentLoaded');
    });

    this.it('element - AttachComplete', async function(test, options) {

        var driver;

        driver = test.getDriver();

        await driver.setLocation(loadURI);

        TP.elementSetContent(
            TP.byId('testSpan', winContext, false),
            '<span>This is inner content</span>');

        //  Element throws AttachComplete when its content is done
        //  attaching.
        test.assert.didSignal(
            TP.gid(TP.byId('testSpan', winContext, false)),
            'TP.sig.AttachComplete');
    }).skip();
});

//  ------------------------------------------------------------------------

TP.describe('TP: form management',
function() {

    var unloadURI,
        windowContext,

        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    loadURI = TP.uc('~lib_test/src/tibet/lifecycle/FormSubmit_Test.xhtml');

    //  ---

    this.before(
        function(suite, options) {
            windowContext = this.getDriver().get('windowContext');
        });

    //  ---

    this.it('form - block submission', async function(test, options) {

        var driver,
            submitButton;

        driver = test.getDriver();
        await driver.setLocation(loadURI);

        submitButton = TP.byId('submitButton', windowContext, false);

        driver.constructSequence().click(submitButton).run();

        //  Note here how we re-obtain the submit button so that
        //  we can test its presence again. The submit event
        //  should've been blocked, so the page should've
        //  remained where it was and this element should still
        //  be on the page.
        submitButton = TP.byId('submitButton',
                                windowContext,
                                false);

        test.assert.isElement(submitButton);

        //  Unload the current page by setting it to the blank
        await driver.setLocation(unloadURI);

        //  Unregister the URI to avoid a memory leak
        loadURI.unregister();
    });

    //  Can't test "submit" in Headless because we're not launching from an
    //  HTTP server.
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
