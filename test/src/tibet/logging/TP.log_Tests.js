//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

TP.log.Manager.describe('root logger',
function() {

    var root;

    this.beforeEach(function() {
        root = TP.log.Manager.getRootLogger();
    });

    this.afterEach(function() {
        root = null;
    });

    this.it('can create a root logger', function(test, options) {
        this.assert.isValid(root);
    });

    this.it('only creates one root logger', function(test, options) {
        var root2 = TP.log.Manager.getRootLogger();

        this.assert.isIdenticalTo(root, root2);
    });

    this.it('root logger has a level', function(test, options) {
        this.assert.isValid(root.getLevel());
    });

    this.it('root logger has no parent', function(test, options) {
        this.refute.isValid(root.getParent());
    });

    this.it('root logger is not additive', function(test, options) {
        this.assert.isFalse(root.isAdditive());
    });
});


TP.log.Manager.describe('logger parents',
function() {

    var root;

    this.beforeEach(function() {
        root = TP.log.Manager.getRootLogger();
    });

    this.afterEach(function() {
        root = null;
    });

    this.it('can create top-level loggers', function(test, options) {
        this.assert.isValid(TP.log.Manager.getLogger('test'));
    });

    this.it('uniques loggers by name', function(test, options) {
        var logger1 = TP.log.Manager.getLogger('test');
        var logger2 = TP.log.Manager.getLogger('test');

        this.assert.isIdenticalTo(logger1, logger2);
    });

    this.it('top-level logger parent is root', function(test, options) {
        var logger = TP.log.Manager.getLogger('test');

        this.assert.isIdenticalTo(logger.getParent(), root);
    });

    this.it('can create hierarchical loggers', function(test, options) {
        var logger = TP.log.Manager.getLogger('test.nested');
        this.assert.isValid(logger);
        this.assert.isEqualTo(logger.getName(), 'test.nested');
    });

    this.it('singly-nested loggers get proper parent', function(test, options) {
        var logger = TP.log.Manager.getLogger('test.nested');
        var test = TP.log.Manager.getLogger('test');
        var parent = logger.getParent();

        this.assert.isIdenticalTo(parent, test);
    });

    this.it('multiply-nested loggers get proper parent', function(test, options) {
        var logger = TP.log.Manager.getLogger('test.nested.some.more');
        var test = TP.log.Manager.getLogger('test.nested.some');
        var parent = logger.getParent();

        this.assert.isIdenticalTo(parent, test);
    });
});


//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.log.Manager.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
