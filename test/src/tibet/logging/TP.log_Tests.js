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

    this.it('verify a logger does not exist', function(test, options) {
        test.assert.isFalse(TP.log.Manager.exists('foofy'));
    });

    this.it('verify a logger does exist', function(test, options) {
        TP.log.Manager.getLogger('foofy');
        test.assert.isTrue(TP.log.Manager.exists('foofy'));
    });

    this.it('registers new loggers on construct', function(test, options) {
        TP.log.Logger.construct('foofy');
        test.assert.isTrue(TP.log.Manager.exists('foofy'));
    });

    this.it('rejects duplicate logger registrations', function(test, options) {
        test.assert.raises(function() {
            var logger;

            logger = TP.log.Logger.construct('foofy');
            TP.log.Manager.registerLogger(logger);
        }, 'DuplicateRegistration');
    });

    this.it('can remove (unregister) loggers', function(test, options) {
        var logger,
            logger2;

        logger = TP.log.Logger.construct('foofy');
        TP.log.Manager.removeLogger(logger);
        logger2 = TP.log.Logger.construct('foofy');

        test.refute.isIdenticalTo(logger, logger2);
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('root logger',
function() {

    var root;

    this.beforeEach(function(test, options) {
        root = TP.log.Manager.getRootLogger();
    });

    this.afterEach(function(test, options) {
        TP.log.Manager.removeLogger(root);
        root = null;
    });

    this.it('can create a root logger', function(test, options) {
        test.assert.isValid(root);
    });

    this.it('only creates one root logger', function(test, options) {
        var root2;

        root2 = TP.log.Manager.getRootLogger();
        test.assert.isIdenticalTo(root, root2);
    });

    this.it('ensures root logger has a level', function(test, options) {
        test.assert.isValid(root.getLevel());
    });

    this.it('ensures root logger has no parent', function(test, options) {
        test.refute.isValid(root.getParent());
    });

    this.it('ensures root does not inherit appenders', function(test, options) {
        test.assert.isFalse(root.inheritsAppenders());
    });

    this.it('ensures root does not inherit filters', function(test, options) {
        test.assert.isFalse(root.inheritsFilters());
    });

    this.it('ensures root has a default appender', function(test, options) {
        test.refute.isEmpty(root.getAppenders());
    });

    this.it('ensures root has no default filters', function(test, options) {
        test.assert.isEmpty(root.getFilters());
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('logger parents',
function() {

    var root;

    this.beforeEach(function(test, options) {
        root = TP.log.Manager.getRootLogger();
    });

    this.afterEach(function(test, options) {
        TP.log.Manager.removeLogger(root);
        TP.log.Manager.removeLogger('foofy');
        TP.log.Manager.removeLogger('foofy.nested');
        TP.log.Manager.removeLogger('foofy.nested.some');
        TP.log.Manager.removeLogger('foofy.nested.some.more');
        root = null;
    });

    this.it('requires a logger name', function(test, options) {
        test.assert.raises(function() {
            TP.log.Logger.construct();
        }, 'InvalidName');
    });

    this.it('can create top-level loggers', function(test, options) {
        test.assert.isValid(TP.log.Manager.getLogger('foofy'));
    });

    this.it('uniques loggers by lower-case name', function(test, options) {
        var logger1,
            logger2,
            logger3;

        logger1 = TP.log.Manager.getLogger('foofy');
        logger2 = TP.log.Manager.getLogger('Foofy');
        logger3 = TP.log.Manager.getLogger('FOOFY');

        test.assert.isIdenticalTo(logger1, logger2);
        test.assert.isIdenticalTo(logger1, logger3);
    });

    this.it('top-level logger parent is root logger', function(test, options) {
        var logger;

        logger = TP.log.Manager.getLogger('foofy');
        test.assert.isIdenticalTo(logger.getParent(), root);
    });

    this.it('can create hierarchical loggers', function(test, options) {
        var logger;

        logger = TP.log.Manager.getLogger('foofy.nested');
        test.assert.isValid(logger);
        test.assert.isEqualTo(logger.getName(), 'foofy.nested');
    });

    this.it('singly-nested loggers get proper parent', function(test, options) {
        var logger,
            primary,
            parent;

        logger = TP.log.Manager.getLogger('foofy.nested');
        primary = TP.log.Manager.getLogger('foofy');
        parent = logger.getParent();

        test.assert.isIdenticalTo(parent, primary);
    });

    this.it('multiply-nested loggers get proper parent', function(test, options) {
        var logger,
            primary,
            parent;

        logger = TP.log.Manager.getLogger('foofy.nested.some.more');
        primary = TP.log.Manager.getLogger('foofy.nested.some');
        parent = logger.getParent();

        test.assert.isIdenticalTo(parent, primary);
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('log levels',
function() {

    this.it('compares ALL properly', function(test, options) {
        test.assert.isTrue(TP.log.ALL.isVisibleAt(TP.log.ALL));
        test.assert.isTrue(TP.log.ALL.isVisibleAt(TP.log.TRACE));
        test.assert.isTrue(TP.log.ALL.isVisibleAt(TP.log.SYSTEM));

        test.assert.isFalse(TP.log.ALL.isVisibleAt(TP.log.OFF));
    });

    this.it('compares OFF properly', function(test, options) {
        test.assert.isFalse(TP.log.OFF.isVisibleAt(TP.log.OFF));
        test.assert.isFalse(TP.log.OFF.isVisibleAt(TP.log.TRACE));
        test.assert.isFalse(TP.log.OFF.isVisibleAt(TP.log.SYSTEM));

        test.assert.isFalse(TP.log.ALL.isVisibleAt(TP.log.OFF));
        test.assert.isFalse(TP.log.TRACE.isVisibleAt(TP.log.OFF));
        test.assert.isFalse(TP.log.SYSTEM.isVisibleAt(TP.log.OFF));
    });

    this.it('compares normal levels property', function(test, options) {
        test.assert.isTrue(TP.log.TRACE.isVisibleAt(TP.log.TRACE));
        test.assert.isTrue(TP.log.DEBUG.isVisibleAt(TP.log.TRACE));
        test.assert.isFalse(TP.log.TRACE.isVisibleAt(TP.log.DEBUG));
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('logger levels',
function() {

    var root;

    this.beforeEach(function(test, options) {
        root = TP.log.Manager.getRootLogger();
    });

    this.afterEach(function(test, options) {
        TP.log.Manager.removeLogger(root);
        root = null;
        TP.log.Manager.removeLogger('foofy');
        TP.log.Manager.removeLogger('foofy.nested');
        TP.log.Manager.removeLogger('foofy.nested.some');
    });

    this.it('primary loggers inherit parent/root level', function(test, options) {
        var logger;

        logger = TP.log.Manager.getLogger('foofy');
        test.assert.isIdenticalTo(root.getLevel(), logger.getLevel());
    });

    this.it('multiply-nested loggers inherit ancestor level', function(test, options) {
        var logger,
            nested;

        logger = TP.log.Manager.getLogger('foofy');
        nested = TP.log.Manager.getLogger('foofy.nested.some');

        logger.setLevel(TP.log.TRACE);

        test.assert.isIdenticalTo(logger.getLevel(), nested.getLevel());
        test.refute.isIdenticalTo(root.getLevel(), nested.getLevel());
    });

    this.it('computes whether logging is enabled properly', function(test, options) {
        var logger;

        logger = TP.log.Manager.getLogger('foofy');

        test.assert.isTrue(logger.isEnabled(TP.log.ALL), 'All');
        test.assert.isTrue(logger.isEnabled(TP.log.INFO), 'Info');
        test.refute.isTrue(logger.isEnabled(TP.log.TRACE), 'Trace');
        test.refute.isTrue(logger.isEnabled(TP.log.OFF), 'Off');
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('logger appenders',
function() {

    var root,
        logger;

    this.beforeEach(function(test, options) {
        root = TP.log.Manager.getRootLogger();
        logger = TP.log.Manager.getLogger('foofy');
    });

    this.afterEach(function(test, options) {
        TP.log.Manager.removeLogger(logger);
        logger = null;
        TP.log.Manager.removeLogger(root);
        root = null;
    });

    this.it('new loggers have no appenders', function(test, options) {
        logger.inheritsAppenders(false);
        test.assert.isEmpty(logger.getAppenders());
    });

    this.it('new loggers inherit root appenders', function(test, options) {
        test.refute.isEmpty(logger.getAppenders());
    });

    this.it('loggers can define appenders', function(test, options) {
        logger.addAppender(TP.log.Appender.construct());
        // Note the 2 here...default from root, one we defined...
        test.assert.isEqualTo(logger.getAppenders().length, 2);
    });

    this.it('loggers can restrict appenders', function(test, options) {
        var root2;

        root2 = TP.log.Manager.getRootLogger();
        root2.addAppender(TP.log.Appender.construct());

        logger.inheritsAppenders(false);
        logger.addAppender(TP.log.Appender.construct());
        test.assert.isEqualTo(logger.getAppenders().length, 1);
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('logger filters',
function() {

    var root,
        logger;

    this.beforeEach(function(test, options) {
        root = TP.log.Manager.getRootLogger();
        logger = TP.log.Manager.getLogger('foofy');
    });

    this.afterEach(function(test, options) {
        TP.log.Manager.removeLogger(logger);
        logger = null;
        TP.log.Manager.removeLogger(root);
        root = null;
    });

    this.it('new loggers have no filters', function(test, options) {
        logger.inheritsFilters(false);
        test.assert.isEmpty(logger.getFilters());
    });

    this.it('new loggers inherit root filters', function(test, options) {
        // Root logger doesn't have filters by default...add one for this test.
        root.addFilter(TP.log.Filter.construct());

        try {
            test.refute.isEmpty(logger.getFilters());
        } finally {
            root.filters = null;
        }
    });

    this.it('loggers can define filters', function(test, options) {
        logger.addFilter(TP.log.Filter.construct());
        test.assert.isEqualTo(logger.getFilters().length, 1);
    });

    this.it('loggers can restrict filters', function(test, options) {
        root.addFilter(TP.log.Filter.construct());

        logger.inheritsFilters(false);
        logger.addFilter(TP.log.Filter.construct());
        try {
            test.assert.isEqualTo(logger.getFilters().length, 1);
        } finally {
            root.filters = null;
        }
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('filters',
function() {
    //  empty
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('appenders',
function() {
    //  empty
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('layouts',
function() {
    //  empty
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('entries',
function() {
    //  empty
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('markers',
function() {
    //  empty
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
