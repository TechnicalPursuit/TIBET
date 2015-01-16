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
        this.assert.isFalse(TP.log.Manager.exists('foofy'));
    });

    this.it('verify a logger does exist', function(test, options) {
        TP.log.Manager.getLogger('foofy');
        this.assert.isTrue(TP.log.Manager.exists('foofy'));
    });

    this.it('registers new loggers on construct', function(test, options) {
        TP.log.Logger.construct('foofy');
        this.assert.isTrue(TP.log.Manager.exists('foofy'));
    });

    this.it('rejects duplicate logger registrations', function(test, options) {
        this.assert.raises(function() {
            var logger = TP.log.Logger.construct('foofy');
            TP.log.Manager.registerLogger(logger);
        }, 'DuplicateRegistration');
    });

    this.it('can remove (unregister) loggers', function(test, options) {
        var logger,
            logger2;

        logger = TP.log.Logger.construct('foofy');
        TP.log.Manager.removeLogger(logger);
        logger2 = TP.log.Logger.construct('foofy');

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
        TP.log.Manager.removeLogger(root);
        root = null;
    });

    this.it('can create a root logger', function(test, options) {
        this.assert.isValid(root);
    });

    this.it('only creates one root logger', function(test, options) {
        var root2 = TP.log.Manager.getRootLogger();

        this.assert.isIdenticalTo(root, root2);
    });

    this.it('ensures root logger has a level', function(test, options) {
        this.assert.isValid(root.getLevel());
    });

    this.it('ensures root logger has no parent', function(test, options) {
        this.refute.isValid(root.getParent());
    });

    this.it('ensures root does not inherit appenders', function(test, options) {
        this.assert.isFalse(root.inheritsAppenders());
    });

    this.it('ensures root does not inherit filters', function(test, options) {
        this.assert.isFalse(root.inheritsFilters());
    });

    this.it('ensures root has a default appender', function(test, options) {
        this.refute.isEmpty(root.getAppenders());
    });

    this.it('ensures root has no default filters', function(test, options) {
        this.assert.isEmpty(root.getFilters());
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
        TP.log.Manager.removeLogger(root);
        TP.log.Manager.removeLogger('foofy');
        TP.log.Manager.removeLogger('foofy.nested');
        TP.log.Manager.removeLogger('foofy.nested.some');
        TP.log.Manager.removeLogger('foofy.nested.some.more');
        root = null;
    });

    this.it('requires a logger name', function(test, options) {
        this.assert.raises(function() {
            TP.log.Logger.construct();
        }, 'InvalidName');
    });

    this.it('can create top-level loggers', function(test, options) {
        this.assert.isValid(TP.log.Manager.getLogger('foofy'));
    });

    this.it('uniques loggers by lower-case name', function(test, options) {
        var logger1,
            logger2,
            logger3;

        logger1 = TP.log.Manager.getLogger('foofy');
        logger2 = TP.log.Manager.getLogger('Foofy');
        logger3 = TP.log.Manager.getLogger('FOOFY');

        this.assert.isIdenticalTo(logger1, logger2);
        this.assert.isIdenticalTo(logger1, logger3);
    });

    this.it('top-level logger parent is root logger', function(test, options) {
        var logger = TP.log.Manager.getLogger('foofy');

        this.assert.isIdenticalTo(logger.getParent(), root);
    });

    this.it('can create hierarchical loggers', function(test, options) {
        var logger = TP.log.Manager.getLogger('foofy.nested');
        this.assert.isValid(logger);
        this.assert.isEqualTo(logger.getName(), 'foofy.nested');
    });

    this.it('singly-nested loggers get proper parent', function(test, options) {
        var logger,
            primary,
            parent;

        logger = TP.log.Manager.getLogger('foofy.nested');
        primary = TP.log.Manager.getLogger('foofy');
        parent = logger.getParent();

        this.assert.isIdenticalTo(parent, primary);
    });

    this.it('multiply-nested loggers get proper parent',
        function(test, options) {
            var logger,
                primary,
                parent;

            logger = TP.log.Manager.getLogger('foofy.nested.some.more');
            primary = TP.log.Manager.getLogger('foofy.nested.some');
            parent = logger.getParent();

            this.assert.isIdenticalTo(parent, primary);
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('log levels',
function() {

    this.it('compares ALL properly', function() {
        this.assert.isTrue(TP.log.ALL.isVisibleAt(TP.log.ALL));
        this.assert.isTrue(TP.log.ALL.isVisibleAt(TP.log.TRACE));
        this.assert.isTrue(TP.log.ALL.isVisibleAt(TP.log.SYSTEM));

        this.assert.isFalse(TP.log.ALL.isVisibleAt(TP.log.OFF));
    });

    this.it('compares OFF properly', function() {
        this.assert.isFalse(TP.log.OFF.isVisibleAt(TP.log.OFF));
        this.assert.isFalse(TP.log.OFF.isVisibleAt(TP.log.TRACE));
        this.assert.isFalse(TP.log.OFF.isVisibleAt(TP.log.SYSTEM));

        this.assert.isFalse(TP.log.ALL.isVisibleAt(TP.log.OFF));
        this.assert.isFalse(TP.log.TRACE.isVisibleAt(TP.log.OFF));
        this.assert.isFalse(TP.log.SYSTEM.isVisibleAt(TP.log.OFF));
    });

    this.it('compares normal levels property', function() {
        this.assert.isTrue(TP.log.TRACE.isVisibleAt(TP.log.TRACE));
        this.assert.isTrue(TP.log.DEBUG.isVisibleAt(TP.log.TRACE));
        this.assert.isFalse(TP.log.TRACE.isVisibleAt(TP.log.DEBUG));
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('logger levels',
function() {

    var root;

    this.beforeEach(function() {
        root = TP.log.Manager.getRootLogger();
    });

    this.afterEach(function() {
        TP.log.Manager.removeLogger(root);
        root = null;
        TP.log.Manager.removeLogger('foofy');
        TP.log.Manager.removeLogger('foofy.nested');
        TP.log.Manager.removeLogger('foofy.nested.some');
    });

    this.it('primary loggers inherit parent/root level',
        function(test, options) {
            var logger = TP.log.Manager.getLogger('foofy');

            this.assert.isIdenticalTo(root.getLevel(), logger.getLevel());
    });

    this.it('multiply-nested loggers inherit ancestor level',
        function(test, options) {
            var logger,
                nested;

            logger = TP.log.Manager.getLogger('foofy');
            nested = TP.log.Manager.getLogger('foofy.nested.some');

            logger.setLevel(TP.log.TRACE);

            this.assert.isIdenticalTo(logger.getLevel(), nested.getLevel());
            this.refute.isIdenticalTo(root.getLevel(), nested.getLevel());
    });

    this.it('computes whether logging is enabled properly',
        function(test, options) {
            var logger = TP.log.Manager.getLogger('foofy');

            this.assert.isTrue(logger.isEnabled(TP.log.ALL), 'All');
            this.assert.isTrue(logger.isEnabled(TP.log.INFO), 'Info');
            this.refute.isTrue(logger.isEnabled(TP.log.TRACE), 'Trace');
            this.refute.isTrue(logger.isEnabled(TP.log.OFF), 'Off');
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('logger appenders',
function() {

    var root,
        logger;

    this.beforeEach(function() {
        root = TP.log.Manager.getRootLogger();
        logger = TP.log.Manager.getLogger('foofy');
    });

    this.afterEach(function() {
        TP.log.Manager.removeLogger(logger);
        logger = null;
        TP.log.Manager.removeLogger(root);
        root = null;
    });

    this.it('new loggers have no appenders', function() {
        logger.inheritsAppenders(false);
        this.assert.isEmpty(logger.getAppenders());
    });

    this.it('new loggers inherit root appenders', function() {
        // Root logger doesn't have default appenders...add one for this test.
        root.addAppender(TP.log.Appender.construct());

        try {
            this.refute.isEmpty(logger.getAppenders());
        } finally {
            root.appenders = null;
        }
    });

    this.it('loggers can define appenders', function() {
        // Root logger doesn't have default appenders...add one for this test.
        root.addAppender(TP.log.Appender.construct());

        logger.addAppender(TP.log.Appender.construct());
        // Note the 2 here...one from root, one we defined...
        this.assert.isEqualTo(logger.getAppenders().length, 2);
    });

    this.it('loggers can restrict appenders', function() {
        var root = TP.log.Manager.getRootLogger();
        root.addAppender(TP.log.Appender.construct());

        logger.inheritsAppenders(false);
        logger.addAppender(TP.log.Appender.construct());
        try {
            this.assert.isEqualTo(logger.getAppenders().length, 1);
        } finally {
            root.appenders = null;
        }
    });
});

//  ------------------------------------------------------------------------

TP.log.Manager.describe('logger filters',
function() {

    var root,
        logger;

    this.beforeEach(function() {
        root = TP.log.Manager.getRootLogger();
        logger = TP.log.Manager.getLogger('foofy');
    });

    this.afterEach(function() {
        TP.log.Manager.removeLogger(logger);
        logger = null;
        TP.log.Manager.removeLogger(root);
        root = null;
    });

    this.it('new loggers have no filters', function() {
        logger.inheritsFilters(false);
        this.assert.isEmpty(logger.getFilters());
    });

    this.it('new loggers inherit root filters', function() {
        // Root logger doesn't have filters by default...add one for this test.
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

//  ------------------------------------------------------------------------

TP.log.Manager.describe('entries',
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
