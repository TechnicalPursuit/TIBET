//  ========================================================================
//  xctrls:panelbox
//  ========================================================================

TP.xctrls.panelbox.Type.describe('TP.xctrls.panelbox: manipulation',
function() {

    var driver,
        windowContext,

        unloadURI,
        loadURI;

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    //  ---

    this.before(
        async function(suite, options) {

            driver = this.getDriver();
            windowContext = driver.get('windowContext');

            loadURI = TP.uc('~lib_test/src/xctrls/xctrls_panelbox.xhtml');
            await driver.setLocation(loadURI);

            this.startTrackingSignals();
        });

    //  ---

    this.after(
        async function(suite, options) {

            this.stopTrackingSignals();

            //  Unload the current page by setting it to the blank
            await driver.setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.afterEach(
        function(test, options) {
            this.getSuite().resetSignalTracking();
        });

    //  ---

    this.it('Switching', async function(test, options) {

        var modelURI,
            modelVal,

            panelBox,
            panelBoxItems,

            panelTrigger,
            fooItem,
            barItem,

            selectedValue;

        modelURI =
            TP.uc('urn:tibet:bound_selection_test_data#tibet(selection_set_1)');

        panelBox = TP.byId('panelbox1', windowContext);
        panelBoxItems = panelBox.get('subitems');

        panelTrigger = TP.byId('select_panel', windowContext);

        fooItem = TP.byId('select_panel_0', windowContext);
        barItem = TP.byId('select_panel_1', windowContext);

        //  ---

        modelVal = modelURI.getResource().get('result');
        test.assert.isEqualTo(
            modelVal,
            'baz');

        selectedValue = panelBox.get('selectedValue');
        test.assert.isEqualTo(
            selectedValue,
            'baz');

        test.refute.isDisplayed(panelBoxItems.at(0));
        test.refute.isDisplayed(panelBoxItems.at(1));
        test.assert.isDisplayed(panelBoxItems.at(2));
        test.refute.isDisplayed(panelBoxItems.at(3));

        test.assert.isEqualTo(
            TP.trim(panelBoxItems.at(0).get('contentElement').getTextContent()),
            'This is content for panel #0.');

        test.assert.isEqualTo(
            TP.trim(panelBoxItems.at(1).get('contentElement').getTextContent()),
            'This is content for panel #1.');

        test.assert.isEqualTo(
            TP.trim(panelBoxItems.at(2).get('contentElement').getTextContent()),
            'This is content for panel #2.');

        test.assert.isEqualTo(
            TP.trim(panelBoxItems.at(3).get('contentElement').getTextContent()),
            'This is content for panel #3. It should never be shown.');

        //  ---

        await driver.constructSequence().
                        click(panelTrigger).
                        run();

        await driver.constructSequence().
                        click(fooItem).
                        run();

        modelVal = modelURI.getResource().get('result');
        test.assert.isEqualTo(
            modelVal,
            'foo');

        selectedValue = panelBox.get('selectedValue');
        test.assert.isEqualTo(
            selectedValue,
            'foo');

        test.assert.isDisplayed(panelBoxItems.at(0));
        test.refute.isDisplayed(panelBoxItems.at(1));
        test.refute.isDisplayed(panelBoxItems.at(2));
        test.refute.isDisplayed(panelBoxItems.at(3));

        //  Make sure the content hasn't been corrupted.
        test.assert.isEqualTo(
            TP.trim(
                panelBoxItems.at(0).get('contentElement').
                                        getTextContent()),
            'This is content for panel #0.');

        await driver.constructSequence().
                        click(panelTrigger).
                        run();

        await driver.constructSequence().
                        click(barItem).
                        run();

        modelVal = modelURI.getResource().get('result');
        test.assert.isEqualTo(
            modelVal,
            'bar');

        selectedValue = panelBox.get('selectedValue');
        test.assert.isEqualTo(
            selectedValue,
            'bar');

        test.refute.isDisplayed(panelBoxItems.at(0));
        test.assert.isDisplayed(panelBoxItems.at(1));
        test.refute.isDisplayed(panelBoxItems.at(2));
        test.refute.isDisplayed(panelBoxItems.at(3));

        //  Make sure the content hasn't been corrupted.
        test.assert.isEqualTo(
            TP.trim(
                panelBoxItems.at(1).get('contentElement').
                                        getTextContent()),
            'This is content for panel #1.');

    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
