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
//  TP.ietf.vcard
//  ========================================================================

TP.ietf.vcard.Inst.describe('TP.ietf.vcard: defaults',
function() {

    var defaultCard;

    defaultCard = TP.ietf.vcard.getInstanceById(
                            TP.sys.cfg('user.default_name'));

    //  ---

    this.it('Check default card', function(test, options) {

        test.assert.isEqualTo(defaultCard.get('fullname'),
                                TP.sys.cfg('user.default_name'));
        test.assert.isEqualTo(defaultCard.get('shortname'),
                                TP.sys.cfg('user.default_name'));
        test.assert.isEqualTo(defaultCard.get('nickname'),
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

TP.ietf.vcard.Inst.describe('TP.ietf.vcard: registration',
function() {

    var loadURI,
        loadedCards;

    loadURI = TP.uc('~lib_test/src/tibet/permissions/test_vcards.xml');

    //  ---

    this.before(
        function(suite, options) {

            //  'this' refers to the suite here.
            suite.chain(
                function() {
                    var loadPromise;

                    loadPromise = TP.ietf.vcard.loadVCards(loadURI);

                    return loadPromise.then(
                                function(aResult) {
                                    loadedCards =
                                        TP.ietf.vcard.initVCards(aResult);

                                    //  Register the vcard for use below.
                                    TP.ietf.vcard.registerVCard(
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
                                'Bill Test');
        test.assert.isEqualTo(testCard.get('shortname'),
                                'Bill');
        test.assert.isEqualTo(testCard.get('nickname'),
                                'bedney');
        test.assert.isEqualTo(testCard.get('jid'),
                                'bill@test.com');
        test.assert.isEqualTo(testCard.get('role'),
                                'Developer');
        test.assert.isEqualTo(testCard.get('orgname'),
                                'Testers Inc.');
        test.assert.isEqualTo(testCard.get('orgunit'),
                                'The Test Group');
    });

    //  ---

    this.it('Registered cards', function(test, options) {

        var testCard;

        //  Use the card registered under 'Bill Test'.
        testCard = TP.ietf.vcard.get('instances').at('Bill Test');

        test.assert.isEqualTo(testCard.get('fullname'),
                                'Bill Test');
        test.assert.isEqualTo(testCard.get('shortname'),
                                'Bill');
        test.assert.isEqualTo(testCard.get('jid'),
                                'bill@test.com');
        test.assert.isEqualTo(testCard.get('role'),
                                'Developer');
        test.assert.isEqualTo(testCard.get('orgname'),
                                'Testers Inc.');
        test.assert.isEqualTo(testCard.get('orgunit'),
                                'The Test Group');
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
