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
 * Tests for the TP.core.URIRouter type.
 */

//  ------------------------------------------------------------------------

TP.core.URIRouter.Type.describe('router api',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
    });

    this.it('can be acquired via TP.sys.getRouter', function(test, options) {
        this.assert.isValid(router);
    });

    this.it('can define path processors', function(test, options) {
        this.assert.isFunction(router.definePath);
    });

    this.it('can define tokens', function(test, options) {
        this.assert.isFunction(router.defineToken);
    });

    this.it('implements route', function(test, options) {
        this.assert.isFunction(router.route);
    });

    this.it('implements setRoute', function(test, options) {
        this.assert.isFunction(router.setRoute);
    });

    this.it('implements getRoute', function(test, options) {
        this.assert.isFunction(router.getRoute);
    });
});

TP.core.URIRouter.Type.describe('definePath',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
    });

    this.it('can define path processors for simple regexes',
            function(test, options) {
        var called,
            entry;

        called = 0;
        entry = router.definePath(/fluffy/,
                function(path) {
                    called += 1;
                });
        this.refute.isEmpty(entry);

        router.getRoute('http://127.0.0.1:1407#/fluffy');
        this.assert.isEqualTo(called, 1);
    });

    this.it('can define path processors for simple strings',
            function(test, options) {
        var called,
            entry;

        called = 0;
        entry = router.definePath('fluffy',
                function(path) {
                    called += 1;
                });
        this.refute.isEmpty(entry);

        router.getRoute('http://127.0.0.1:1407#/fluffy');
        this.assert.isEqualTo(called, 1);
    });
});

TP.core.URIRouter.Type.describe('compilePattern',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
    });

    this.it('compiles simple strings', function(test, options) {
        var result;

        result = router.compilePattern('fluffy');
        this.assert.isEqualTo(result.first(), /(fluffy)/.toString());
    });

    this.it('compiles regex strings', function(test, options) {
        var result;

        result = router.compilePattern('/fluffy/');
        this.assert.isEqualTo(result.first(), /fluffy/.toString());
    });

    this.it('compiles simple token strings', function(test, options) {
        var result;

        result = router.compilePattern(':fluffy');
        this.assert.isEqualTo(result.first(), /([^/]*?)/.toString());
    });

    this.it('compiles regex token strings', function(test, options) {
        var result;

        router.defineToken('fluffy', /\d{3}/);
        result = router.compilePattern(':fluffy');
        this.assert.isEqualTo(result.first(), /(\d{3})/.toString());
    });

    this.it('compiles complex strings', function(test, options) {
        var result;

        router.defineToken('fluffy', /\d{3}/);
        result = router.compilePattern('/foo/:fluffy/bar');
        this.assert.isEqualTo(result.first(),
            /\/(foo)\/(\d{3})\/(bar)/.toString());
    });
});

TP.core.URIRouter.Type.describe('processRoute',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
        //  Clear any tokens/processors defined.
        router.set('processors', TP.ac());
        router.set('tokens', TP.hc());
    });

    this.it('properly uses route signal name', function(test, options) {
        var result;

        router.definePath('/foo/:fluffy/bar', 'SignalMe');
        result = router.processRoute('/foo/231/bar');
        this.assert.isEqualTo(result.at(0), 'SignalMe');
    });

    this.it('properly redefines processors', function(test, options) {
        var result;

        router.definePath('/foo/:fluffy/bar', 'SignalMe');
        router.definePath('/foo/:fluffy/bar', 'NoNoSignalMe');
        result = router.processRoute('/foo/231/bar');
        this.assert.isEqualTo(result.at(0), 'NoNoSignalMe');
    });

    this.it('properly assigns named parameter values', function(test, options) {
        var result;

        router.definePath('/foo/:fluffy/bar');
        result = router.processRoute('/foo/231/bar');

        //  result.at(1) is payload object. then first pair, first slot.
        this.assert.isEqualTo(result.at(1).first().first(), 'fluffy');
    });

    this.it('properly assigns token-based parameters', function(test, options) {
        var result;

        router.defineToken('fluffy', /\d{3}/);
        router.definePath('/foo/:fluffy/bar');
        result = router.processRoute('/foo/231/bar');

        //  result.at(1) is payload object. then first pair, first slot.
        this.assert.isEqualTo(result.at(1).first().first(), 'fluffy');
    });

    this.it('properly sorts routes for signal naming', function(test, options) {
        var result;

        router.definePath('/foo/:fluffy');
        router.definePath('/foo/:fluffy/bar');
        result = router.processRoute('/foo/231/bar');

        //  synthetic signal name based on static portions of the inbound path.
        //  The 'bar' portion should be here since it should be longer "full
        //  match" string value.
        this.assert.isEqualTo(result.at(0), 'FooBar');
    });

    this.it('properly sorts routes for parameter naming',
            function(test, options) {
        var result;

        router.definePath('/foo/:fluffy/bar');
        router.definePath('/foo/:stuff');
        result = router.processRoute('/foo/231/bar');

        //  result.at(1) is payload object. then first pair, first slot.
        this.assert.isEqualTo(result.at(1).first().first(), 'fluffy');
    });

});

TP.core.URIRouter.Type.describe('token definition',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
    });

    this.it('can define simple tokens', function(test, options) {
        router.defineToken('fluffy', /\d{3}/);
        this.assert.isEqualTo(TP.sys.cfg('route.tokens.fluffy'),
            /\d{3}/);
    });
});

TP.core.URIRouter.Type.describe('route resolution',
function() {

    //  TODO:   processRoute

    //  TODO:   getRoute

    //  TODO:   route

    //  TODO:   setRoute

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
