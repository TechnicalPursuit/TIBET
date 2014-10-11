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
 * Tests for TIBET's log4j 2.0-ish logging implementation. Covers the TP.log
 * namespace and all types rooted there which are part of the core framework.
 */

//  ------------------------------------------------------------------------

TP.log.Manager.describe('logger registration',
function() {

    this.it('can check for logger existence', function(test, options) {
        this.assert.isFalse(TP.log.Manager.exists('test'));
    });

    this.it('registers new loggers on construct', function(test, options) {
        TP.log.Logger.construct('test');
        this.assert.isTrue(TP.log.Manager.exists('test'));
    });

    this.it('rejects duplicate loggers', function(test, options) {

        this.assert.raises(function() {
            var logger = TP.log.Logger.construct('test');
            TP.log.Manager.registerLogger(logger);
        }, 'DuplicateRegistration');
    });

    this.it('removes loggers', function(test, options) {
        var logger = TP.log.Logger.construct('test');
        TP.log.Manager.removeLogger(logger);
        var logger2 = TP.log.Logger.construct('test');

        this.refute.isIdenticalTo(logger, logger2);
    });
});

//  ------------------------------------------------------------------------

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
        this.assert.isFalse(root.inheritsAppenders());
        this.assert.isFalse(root.inheritsFilters());
    });
});

//  ------------------------------------------------------------------------

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
        var primary = TP.log.Manager.getLogger('test');
        var parent = logger.getParent();

        this.assert.isIdenticalTo(parent, primary);
    });

    this.it('multiply-nested loggers get proper parent', function(test, options) {
        var logger = TP.log.Manager.getLogger('test.nested.some.more');
        var primary = TP.log.Manager.getLogger('test.nested.some');
        var parent = logger.getParent();

        this.assert.isIdenticalTo(parent, primary);
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('logger levels',
function() {

    this.it('primary loggers inherit parent/root level', function(test, options) {
        var root = TP.log.Manager.getRootLogger();
        var logger = TP.log.Manager.getLogger('test');

        this.assert.isIdenticalTo(root.getLevel(), logger.getLevel());
    });

    this.it('multiply-nested loggers inherit ancestor level', function(test, options) {
        var root = TP.log.Manager.getRootLogger();
        var logger = TP.log.Manager.getLogger('test');
        var nested = TP.log.Manager.getLogger('test.nested.some');

        logger.setLevel(TP.log.TRACE);

        this.assert.isIdenticalTo(logger.getLevel(), nested.getLevel());
        this.refute.isIdenticalTo(root.getLevel(), nested.getLevel());
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('logger appenders',
function() {

    var logger;

    this.beforeEach(function() {
        logger = TP.log.Manager.getLogger('test');
    });

    this.afterEach(function() {
        TP.log.Manager.removeLogger(logger);
        logger = null;
    });

    this.it('new loggers have no appenders', function() {
        logger.inheritsAppenders(false);
        this.assert.isEmpty(logger.getAppenders());
    });

    this.it('new loggers can inherit root appenders', function() {
        this.refute.isEmpty(logger.getAppenders());
    });

    this.it('loggers can define appenders', function() {
        logger.addAppender(TP.log.Appender.construct());
        this.assert.isEqualTo(logger.getAppenders().length, 2);
    });

    this.it('loggers can restrict appenders', function() {
        logger.inheritsAppenders(false);
        logger.addAppender(TP.log.Appender.construct());
        this.assert.isEqualTo(logger.getAppenders().length, 1);
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('logger filters',
function() {

    var logger;

    this.beforeEach(function() {
        logger = TP.log.Manager.getLogger('test');
    });

    this.afterEach(function() {
        TP.log.Manager.removeLogger(logger);
        logger = null;
    });

    this.it('new loggers have no filters', function() {
        logger.inheritsFilters(false);
        this.assert.isEmpty(logger.getFilters());
    });

    this.it('new loggers can inherit root filters', function() {
        // Root logger doesn't have filters by default...add one for this test.
        var root = TP.log.Manager.getRootLogger();
        root.addFilter(TP.log.Filter.construct());

        try {
            this.refute.isEmpty(logger.getFilters());
        } finally {
            root.filters = null;
        }
    });

    this.it('loggers can define filters', function() {
        logger.addFilter(TP.log.Filter.construct());
        this.assert.isEqualTo(logger.getFilters().length, 1);
    });

    this.it('loggers can restrict filters', function() {
        var root = TP.log.Manager.getRootLogger();
        root.addFilter(TP.log.Filter.construct());

        logger.inheritsFilters(false);
        logger.addFilter(TP.log.Filter.construct());
        try {
            this.assert.isEqualTo(logger.getFilters().length, 1);
        } finally {
            root.filters = null;
        }
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('levels',
function() {

    this.it('compares ALL properly', function() {
        this.assert.isTrue(TP.log.ALL.isEnabled(TP.log.INFO));
        this.assert.isTrue(TP.log.INFO.isEnabled(TP.log.ALL));
    });

    this.it('compares OFF properly', function() {
        this.assert.isFalse(TP.log.OFF.isEnabled(TP.log.INFO));
        this.assert.isFalse(TP.log.INFO.isEnabled(TP.log.OFF));
    });

    this.it('compares normal levels property', function() {
        this.assert.isTrue(TP.log.TRACE.isEnabled(TP.log.TRACE));
        this.assert.isTrue(TP.log.TRACE.isEnabled(TP.log.DEBUG));

        this.assert.isFalse(TP.log.DEBUG.isEnabled(TP.log.TRACE));
    });

});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('filters',
function() {
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('appenders',
function() {

});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('layouts',
function() {
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
