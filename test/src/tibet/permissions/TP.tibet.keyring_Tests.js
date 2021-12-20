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
//  TP.tibet.keyring
//  ========================================================================

TP.tibet.keyring.Inst.describe('TP.tibet.keyring: defaults',
function() {

    var defaultKeyring;

    defaultKeyring = TP.tibet.keyring.getInstanceById(
                            TP.sys.cfg('user.default_keyring'));

    //  ---

    this.it('Check default card', function(test, options) {

        test.assert.hasAttribute(defaultKeyring, 'id');
        test.assert.isAttributeEqualTo(defaultKeyring, 'id', 'Public');
    });

});

//  ------------------------------------------------------------------------

TP.tibet.keyring.Inst.describe('TP.tibet.keyring: registration',
function() {

    var loadURI,
        loadedKeyrings;

    loadURI = TP.uc('~lib_test/src/tibet/permissions/test_keyrings.xml');

    //  ---

    this.before(
        function(suite, options) {

            var loadPromise;

            loadPromise = TP.tibet.keyring.loadKeyrings(loadURI);

            return loadPromise.then(
                        function(aResult) {
                            loadedKeyrings =
                                TP.tibet.keyring.initKeyrings(aResult);

                            //  Register a few keyrings for use below.
                            TP.tibet.keyring.registerKeyring(
                                                loadedKeyrings.at(0));
                            TP.tibet.keyring.registerKeyring(
                                                loadedKeyrings.at(1));
                            TP.tibet.keyring.registerKeyring(
                                                loadedKeyrings.at(2));
                        });
        });

    //  ---

    this.it('Loaded keyrings', function(test, options) {

        var testKeyring;

        //  Just use the first card loaded.
        testKeyring = loadedKeyrings.at(0);

        test.assert.isTrue(testKeyring.hasAccessKey('R'));
        test.assert.isEqualTo(testKeyring.getAccessKeys(),
                                TP.ac('R'));

        test.assert.isFalse(testKeyring.hasAccessKey('U'));

        testKeyring = loadedKeyrings.at(1);

        test.assert.isTrue(testKeyring.hasAccessKey('R'));
        //  NB: The 'getAccessKeys()' call sorts the access keys alphabetically.
        test.assert.isEqualTo(testKeyring.getAccessKeys(),
                                TP.ac('C', 'D', 'R', 'U'));
    });

    //  ---

    this.it('Registered keyrings', function(test, options) {

        var testKeyring;

        //  Use the card registered under 'guest'.
        testKeyring = TP.tibet.keyring.get('instances').at('guest');

        test.assert.isTrue(testKeyring.hasAccessKey('R'));
        test.assert.isEqualTo(testKeyring.getAccessKeys(),
                                TP.ac('R'));

        test.assert.isFalse(testKeyring.hasAccessKey('U'));

        //  Use the card registered under 'Administrator'.
        testKeyring = TP.tibet.keyring.get('instances').at('administrator');

        test.assert.isTrue(testKeyring.hasAccessKey('R'));
        //  NB: The 'getAccessKeys()' call sorts the access keys alphabetically.
        test.assert.isEqualTo(testKeyring.getAccessKeys(),
                                TP.ac('C', 'D', 'R', 'U'));
    });

    //  ---

    this.it('Child keyrings', function(test, options) {

        var testKeyring;

        //  Use the card registered under 'developer'.
        testKeyring = TP.tibet.keyring.get('instances').at('developer');

        //  Local key
        test.assert.isTrue(testKeyring.hasAccessKey('B'));

        //  Key from child keyring 'development'
        test.assert.isTrue(testKeyring.hasAccessKey('T'));

        //  Key from child keyring 'administrator' of child keyring 'development'
        test.assert.isTrue(testKeyring.hasAccessKey('C'));
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
