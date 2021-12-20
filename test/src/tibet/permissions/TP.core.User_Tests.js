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
//  TP.core.User
//  ========================================================================

TP.core.User.Inst.describe('TP.core.User: registration',
function() {

    var loadURI,
        loadedCards;

    loadURI = TP.uc('~lib_test/src/tibet/permissions/testvCards.xml');

    //  ---

    this.before(
        function(suite, options) {

            var loadPromise;

            loadPromise = TP.core.User.loadVCards(loadURI);

            return loadPromise.then(
                        function(aResult) {
                            loadedCards =
                                TP.core.User.initVCards(aResult);

                            //  Register the vcard for use below.
                            TP.core.User.registerVCard(
                                                loadedCards.first());
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
        test.assert.isEqualTo(testCard.get('nickname'),
                                'Test nickname');
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
        testCard = TP.core.User.get('vcards').at('Test fullname');

        test.assert.isEqualTo(testCard.get('fullname'),
                                'Test fullname');
        test.assert.isEqualTo(testCard.get('shortname'),
                                'Test shortname');
        test.assert.isEqualTo(testCard.get('nickname'),
                                'Test nickname');
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
