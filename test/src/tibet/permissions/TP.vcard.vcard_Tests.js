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
//  TP.vcard.vcard
//  ========================================================================

TP.vcard.vcard.Inst.describe('TP.vcard.vcard: defaults',
function() {

    var defaultCard;

    defaultCard = TP.vcard.vcard.getInstanceById(
                            TP.sys.cfg('user.default_name'));

    //  ---

    this.it('Check default card', function(test, options) {

        test.assert.isEqualTo(defaultCard.get('fullname'),
                                TP.sys.cfg('user.default_name'));
        test.assert.isEqualTo(defaultCard.get('shortname'),
                                TP.sys.cfg('user.default_name'));
        test.assert.isEqualTo(defaultCard.get('role'),
                                TP.sys.cfg('user.default_role'));
        test.assert.isEqualTo(defaultCard.get('orgname'),
                                TP.sys.cfg('user.default_org'));
        test.assert.isEqualTo(defaultCard.get('orgunit'),
                                TP.sys.cfg('user.default_org'));
    });

});

//  ------------------------------------------------------------------------

TP.vcard.vcard.Inst.describe('TP.vcard.vcard: registration',
function() {

    var loadURI,
        loadedCards;

    loadURI = TP.uc('~lib_test/src/tibet/permissions/testVCards.xml');

    //  ---

    this.before(
        function(suite, options) {

            //  'this' refers to the suite here.
            suite.then(
                function() {
                    var loadPromise;

                    loadPromise = TP.vcard.vcard.loadVCards(loadURI);

                    return loadPromise.then(
                                function(aResult) {
                                    loadedCards =
                                        TP.vcard.vcard.initVCards(aResult);

                                    //  Register the vcard for use below.
                                    TP.vcard.vcard.registerVCard(
                                                        loadedCards.first());
                                });
                });
        });

    //  ---

    this.it('Loaded cards', function(test, options) {

        var testCard;

        //  Just use the first card loaded.
        testCard = loadedCards.first();

        test.assert.isEqualTo(testCard.get('fullname'),
                                'Test fullname');
        test.assert.isEqualTo(testCard.get('shortname'),
                                'Test shortname');
        test.assert.isEqualTo(testCard.get('jid'),
                                'Test@testsite.com');
        test.assert.isEqualTo(testCard.get('role'),
                                'Test role');
        test.assert.isEqualTo(testCard.get('orgname'),
                                'Test orgname');
        test.assert.isEqualTo(testCard.get('orgunit'),
                                'Test orgunit');
    });

    //  ---

    this.it('Registered cards', function(test, options) {

        var testCard;

        //  Use the card registered under 'Test fullname'.
        testCard = TP.vcard.vcard.get('vcards').at('Test fullname');

        test.assert.isEqualTo(testCard.get('fullname'),
                                'Test fullname');
        test.assert.isEqualTo(testCard.get('shortname'),
                                'Test shortname');
        test.assert.isEqualTo(testCard.get('jid'),
                                'Test@testsite.com');
        test.assert.isEqualTo(testCard.get('role'),
                                'Test role');
        test.assert.isEqualTo(testCard.get('orgname'),
                                'Test orgname');
        test.assert.isEqualTo(testCard.get('orgunit'),
                                'Test orgunit');
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
