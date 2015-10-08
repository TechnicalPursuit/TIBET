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
        test.assert.isValid(router);
    });

    this.it('can define path processors', function(test, options) {
        test.assert.isFunction(router.defineProcessor);
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

TP.core.URIRouter.Type.describe('defineProcessor',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
    });

    this.it('can define path processors for simple regexes',
            function(test, options) {
        var called;

        called = 0;
        router.defineProcessor(/fluffy/,
                function(path) {
                    called += 1;
                });

        router.getRoute('http://127.0.0.1:1407#/fluffy');
        test.assert.isEqualTo(called, 1);
    });

    this.it('can define path processors for simple strings',
            function(test, options) {
        var called;

        called = 0;
        router.defineProcessor('fluffy',
                function(path) {
                    called += 1;
                });

        router.getRoute('http://127.0.0.1:1407#/fluffy');
        test.assert.isEqualTo(called, 1);
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
        test.assert.isEqualTo(result.first(), /(.*?)/.toString());
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
        test.assert.isEqualTo(result.first(), /\/(foo)\/(\d{3})\/(bar)/.toString());
    });
});

TP.core.URIRouter.Type.describe('processRoute',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
    });

    this.it('', function(test, options) {
        var result;

        router.defineToken('fluffy', /\d{3}/);
        router.defineProcessor('/foo/:fluffy/bar');
        result = router.processRoute('/foo/231/bar');
console.log(JSON.stringify(result));
        test.assert.isTrue(true);
    });
});

TP.core.URIRouter.Type.describe('token definition',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
    });

    //  TODO:   defineToken

});

TP.core.URIRouter.Type.describe('route resolution',
function() {
    var router;

    this.before(function() {
        router = TP.sys.getRouter();
    });

    //  TODO:   processRoute

    //  TODO:   getRoute

    //  TODO:   route

    //  TODO:   setRoute

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
