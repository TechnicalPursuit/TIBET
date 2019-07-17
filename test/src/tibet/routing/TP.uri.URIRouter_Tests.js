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
 * Tests for the TP.uri.URIRouter type.
 */

//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.describe('router api',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
    });

    this.it('can be acquired via TP.sys.getRouter', function(test, options) {
        test.assert.isValid(router);
    });

    this.it('can define path processors', function(test, options) {
        test.assert.isFunction(router.definePath);
    });

    this.it('can define tokens', function(test, options) {
        test.assert.isFunction(router.defineToken);
    });

    this.it('implements route', function(test, options) {
        test.assert.isFunction(router.route);
    });

    this.it('implements setRoute', function(test, options) {
        test.assert.isFunction(router.setRoute);
    });

    this.it('implements getRoute', function(test, options) {
        test.assert.isFunction(router.getRoute);
    });
});

TP.uri.URIRouter.Type.describe('definePath',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
    });

    this.it('can define path processors for simple regexes', function(test, options) {
        var called,
            entry;

        called = 0;
        entry = router.definePath(/fluffy/,
                function(path) {
                    called += 1;
                });
        test.refute.isEmpty(entry);

        router.getRoute('http://127.0.0.1:1407#/fluffy');
        test.assert.isEqualTo(called, 1);
    });

    this.it('can define path processors for simple strings', function(test, options) {
        var called,
            entry;

        called = 0;
        entry = router.definePath('fluffy',
                function(path) {
                    called += 1;
                });
        test.refute.isEmpty(entry);

        router.getRoute('http://127.0.0.1:1407#/fluffy');
        test.assert.isEqualTo(called, 1);
    });
});

TP.uri.URIRouter.Type.describe('compilePattern',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
    });

    this.it('compiles simple strings', function(test, options) {
        var result;

        result = router.compilePattern('fluffy');
        test.assert.isEqualTo(result.first(), /(fluffy)/.toString());
    });

    this.it('compiles regex strings', function(test, options) {
        var result;

        result = router.compilePattern('/fluffy/');
        test.assert.isEqualTo(result.first(), /fluffy/.toString());
    });

    this.it('compiles simple token strings', function(test, options) {
        var result;

        result = router.compilePattern(':fluffy');
        test.assert.isEqualTo(result.first(), /([^/]*?)/.toString());
    });

    this.it('compiles regex token strings', function(test, options) {
        var result;

        router.defineToken('fluffy', /\d{3}/);
        result = router.compilePattern(':fluffy');
        test.assert.isEqualTo(result.first(), /(\d{3})/.toString());
    });

    this.it('compiles complex strings', function(test, options) {
        var result;

        router.defineToken('fluffy', /\d{3}/);
        result = router.compilePattern('/foo/:fluffy/bar');
        test.assert.isEqualTo(result.first(),
            /\/(foo)\/(\d{3})\/(bar)/.toString());
    });
});

TP.uri.URIRouter.Type.describe('processRoute',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
        //  Clear any tokens/processors defined.
        router.set('processors', TP.ac());
    });

    this.it('properly uses route signal name', function(test, options) {
        var result;

        router.definePath('/foo/:fluffy/bar', 'SignalMe');
        result = router.processRoute('/foo/231/bar');
        test.assert.isEqualTo(result.at('route'), 'SignalMe');
        test.assert.isEqualTo(result.at('signal'), 'SignalMe');
    });

    this.it('properly redefines processors', function(test, options) {
        var result;

        router.definePath('/foo/:fluffy/bar', 'SignalMe');
        router.definePath('/foo/:fluffy/bar', 'NoNoSignalMe');
        result = router.processRoute('/foo/231/bar');
        test.assert.isEqualTo(result.at('signal'), 'NoNoSignalMe');
    });

    this.it('properly assigns named parameter values', function(test, options) {
        var result;

        router.definePath('/foo/:fluffy/bar');
        result = router.processRoute('/foo/231/bar');

        //  result.at(1) is payload object. then first pair, first slot.
        test.assert.isEqualTo(result.at('parameters').first().first(), 'fluffy');
    });

    this.it('properly assigns token-based parameters', function(test, options) {
        var result;

        router.defineToken('fluffy', /\d{3}/);
        router.definePath('/foo/:fluffy/bar');
        result = router.processRoute('/foo/231/bar');

        //  result.at(1) is payload object. then first pair, first slot.
        test.assert.isEqualTo(result.at('parameters').first().first(), 'fluffy');
    });

    this.it('properly sorts routes for signal naming', function(test, options) {
        var result;

        router.definePath('/foo/:fluffy');
        router.definePath('/foo/:fluffy/bar');
        result = router.processRoute('/foo/231/bar');

        //  synthetic signal name based on static portions of the inbound path.
        //  The 'bar' portion should be here since it should be longer "full
        //  match" string value.
        test.assert.isEqualTo(result.at('route'), 'FooBar');
        test.assert.isNull(result.at('signal'));
    });

    this.it('properly sorts routes for parameter naming', function(test, options) {
        var result;

        router.definePath('/foo/:fluffy/bar');
        router.definePath('/foo/:stuff');
        result = router.processRoute('/foo/231/bar');

        //  result.at(1) is payload object. then first pair, first slot.
        test.assert.isEqualTo(result.at('parameters').first().first(), 'fluffy');
    });

});

TP.uri.URIRouter.Type.describe('token definition',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
    });

    this.it('can define simple tokens', function(test, options) {
        router.defineToken('fluffy', /\d{3}/);
        test.assert.isEqualTo(TP.sys.cfg('route.tokens.fluffy'),
                                /\d{3}/.toString());
    });
});

TP.uri.URIRouter.Type.describe('route resolution',
function() {

    //  TODO:   processRoute

    //  TODO:   getRoute

    //  TODO:   route

    //  TODO:   setRoute

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
