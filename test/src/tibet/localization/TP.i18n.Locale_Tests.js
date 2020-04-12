//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
 * Tests of TP.i18n.Locale and friends.
 */

//  ------------------------------------------------------------------------

TP.i18n.Locale.describe('registerStrings',
function() {

    var strings;

    strings = {
        en: {
            HELLO: 'Hello',
            GOODBYE: 'Cheers'
        },

        'en-us': {
            HELLO: 'Sup',
            GOODBYE: 'Later'
        },

        fr: {
            HELLO: 'Bonjour',
            GOODBYE: 'Au Revoir'
        }
    };

    this.beforeEach(function(test, options) {
        TP.i18n.Locale.set('strings', null);
        TP.i18n.Locale.activate();
    });

    this.it('Can register strings for multiple locales', function(test, options) {
        TP.i18n.Locale.registerStrings(strings);

        this.assert.isEqualTo(TP.sys.getLocale('en').localizeString('HELLO'),
            'Hello');
        this.assert.isEqualTo(TP.sys.getLocale('en-us').localizeString('HELLO'),
            'Sup');
        this.assert.isEqualTo(TP.sys.getLocale('fr').localizeString('HELLO'),
            'Bonjour');
    });

    this.it('Can register strings in a specific locale', function(test, options) {
        TP.sys.getLocale('en').registerStrings(strings.en);

        this.assert.isEqualTo(TP.sys.getLocale('en').localizeString('HELLO'),
            'Hello');
    });

    this.it('Can register strings incrementally', function(test, options) {
        TP.sys.getLocale('en').registerStrings(strings.en);
        TP.sys.getLocale('en').registerStrings(
            {
                THANKS: 'Thanks'
            });

        this.assert.isEqualTo(TP.sys.getLocale('en').localizeString('HELLO'),
            'Hello');
        this.assert.isEqualTo(TP.sys.getLocale('en').localizeString('THANKS'),
            'Thanks');
    });

    this.it('Can redefine string mappings', function(test, options) {
        TP.sys.getLocale('en').registerStrings(strings.en);
        TP.sys.getLocale('en').registerStrings(
            {
                HELLO: 'ello'
            });

        this.assert.isEqualTo(TP.sys.getLocale('en').localizeString('HELLO'),
            'ello');
    });

    this.it('Returns original string if localized version not found',
    function(test, options) {
        //  Not translated when no string is found.
        this.assert.isEqualTo(TP.sys.getLocale('en-us').localizeString('HELLO'),
            'HELLO');
    });

    this.it('Can translate strings by default locale', function(test, options) {
        TP.i18n.Locale.registerStrings(strings);

        this.assert.isEqualTo(TP.sys.getLocale().localizeString('HELLO'),
            'Sup');
    });

    this.it('Can switch default locale at runtime', function(test, options) {
        TP.i18n.Locale.registerStrings(strings);
        TP.sys.setLocale('fr');

        this.assert.isEqualTo(TP.sys.getLocale().localizeString('HELLO'),
            'Bonjour');
    });

    this.it('Can translate strings via TP.msg namespace', function(test, options) {
        TP.i18n.Locale.registerStrings(strings);
        TP.sys.setLocale('en-us');

        this.assert.isEqualTo(TP.msg.HELLO, 'Sup');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
