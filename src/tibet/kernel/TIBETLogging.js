//  ============================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ============================================================================

/*
 * Loosely based on log4j 2.0 but adjusted to fit TIBET's unique requirements.
 *
 * Most major aspects of the log4js 2.0 architecture and API are supported
 * including Manager, Logger, Appender, Layout, Filter, Marker, and Entry types.
 * Logger additivity in log4j terms is supported for appenders and filters.
 *
 * TIBET provides two "primary" loggers, TP and APP, which make it easier to
 * differentiate between framework and application logging output. In addition
 * there are methods on both TP and APP to log at various levels which defer to
 * the default logger for each branch (TP.debug vs. APP.debug for example).
 */

/* eslint-disable no-unused-vars */
/* global $STATUS:true */
/* eslint-enable no-unused-vars */

//  ----------------------------------------------------------------------------

/**
 * The namespace responsible for all framework logging.
 */
/* eslint-disable no-unused-vars */
TP.defineNamespace('TP.log');
/* eslint-enable no-unused-vars */

//  ============================================================================
//  TP.log.Manager
//  ============================================================================

/**
 * The log manager, responsible for the overall logging subsystem.
 * @type {TP.log.Manager}
 */
TP.lang.Object.defineSubtype('log.Manager');

//  ----------------------------------------------------------------------------

/**
 * Dictionary of available loggers, by logger name. NOTE that this dictionary is
 * local to the TP.log.Manager type. No subtypes are expected for this type.
 * @type {TP.core.Hash}
 */
TP.log.Manager.defineAttribute('loggers', TP.hc());

//  ----------------------------------------------------------------------------

/**
 * The name of the root logger. This is normally stripped from any logging
 * output.
 * @type {String}
 */
TP.log.Manager.Type.defineConstant('ROOT_LOGGER_NAME', 'ROOT');

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('exists',
function(aName) {

    /**
     * @method exists
     * @summary Returns true if the named logger exists. This method provides a
     *     way to check for existence without creating a new logger if it does
     *     not yet exist (as getLogger does).
     * @param {String} aName The logger to verify.
     * @returns {Boolean} True if the named logger exists.
     */

    var name;

    /* eslint-disable no-extra-parens */
    name = (aName === TP.log.Manager.ROOT_LOGGER_NAME) ? aName :
        aName.toLowerCase();
    /* eslint-enable no-extra-parens */

    return TP.isValid(this.loggers.at(name));
});

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('getLogger',
function(aName) {

    /**
     * @method getLogger
     * @summary Returns the logger instance with the specified name. If the
     *     instance does not exist it is created, registered, and returned as a
     *     result of this call.
     * @param {String} aName The logger to return, or create and return.
     * @returns {TP.log.Logger} The named logger instance.
     */

    var name,
        logger;

    if (TP.isEmpty(aName)) {
        return this.raise('InvalidName');
    }

    /* eslint-disable no-extra-parens */
    name = (aName === TP.log.Manager.ROOT_LOGGER_NAME) ? aName :
        aName.toLowerCase();
    /* eslint-enable no-extra-parens */

    logger = this.loggers.at(name);

    if (TP.isValid(logger)) {
        return logger;
    }

    return this.getLoggerFactory().construct(aName);
});

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('getLoggers',
function() {

    /**
     * @method getLoggers
     * @summary Returns the dictionary of all known loggers. The keys of this
     *     dictionary are the logger names converted to lowercase to normalize
     *     them. The entries are the logger instances themselves.
     * @returns {TP.core.Hash} The logger dictionary.
     */

    return this.loggers;
});

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('getLoggerFactory',
function() {

    /**
     * @method getLoggerFactory
     * @summary Returns the type to use for construction of new loggers.
     * @returns {TP.log.Logger} A logger type or subtype.
     */

    return TP.sys.getTypeByName(TP.sys.cfg('log.default_factory'));
});

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('getRootLogger',
function() {

    /**
     * @method getRootLogger
     * @summary Returns the root logger for TIBET. This logger instance is the
     *     "parent" instance for the TP and APP log instances. This logger has
     *     no name with respect to logging output.
     * @returns {TP.log.Logger} The root logger instance.
     */

    return this.getLogger(this.ROOT_LOGGER_NAME);
});

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('initialize',
function(aName) {

    /**
     * @method initialize
     * @summary Initializes the class, ensuring that the initial root and
     *     primary logger instances are created.
     * @returns {TP.log.Manager} The receiver.
     */

    //  Force construction of the root logger on startup.
    TP.log.Manager.getRootLogger();

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('registerLogger',
function(aLogger) {

    /**
     * @method registerLogger
     * @summary Registers a logger instance by name.
     * @param {TP.log.Logger} aLogger The logger to register.
     * @returns {TP.log.Manager} The receiver.
     */

    var name;

    name = aLogger.get('name');
    if (this.exists(name)) {
        return this.raise('DuplicateRegistration', name);
    }

    /* eslint-disable no-extra-parens */
    name = (name === TP.log.Manager.ROOT_LOGGER_NAME) ? name :
        name.toLowerCase();
    /* eslint-enable no-extra-parens */

    this.loggers.atPut(name, aLogger);

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('removeLogger',
function(aLogger) {

    /**
     * @method removeLogger
     * @summary Removes a logger instance by name.
     * @param {TP.log.Logger} aLogger The logger to remove.
     * @returns {TP.log.Manager} The receiver.
     */

    var name;

    name = TP.isString(aLogger) ? aLogger : aLogger.get('name');

    //  Ignore attempts to remove the root logger.
    if (name === TP.log.Manager.ROOT_LOGGER_NAME) {
        return this;
    }

    if (this.exists(name)) {
        this.loggers.removeKey(name.toLowerCase());
    }

    return this;
});

//  ============================================================================
//  TP.log.Nestable
//  ============================================================================

/**
 * A common root type for objects in the logging system whose naming represents
 * a hierarchy of sorts. Two examples are Logger and Marker instances.
 */
TP.lang.Object.defineSubtype('log.Nestable');

//  TP.log.Nestable is an abstract supertype. You can't create instances
//  directly.
TP.log.Nestable.isAbstract(true);

//  ----------------------------------------------------------------------------

TP.log.Nestable.Type.defineMethod('getInstanceByName',
function(aName) {

    /**
     * Returns the instance whose name matches the name provided. If the
     * instance doesn't exist this method will not create it.
     * @returns {TP.log.Logger} The named instance.
     */

    TP.override();
});

//  ----------------------------------------------------------------------------
//  Nestable - Instance Definition
//  ----------------------------------------------------------------------------

/**
 * The list of ancestors for the receiver. This is computed once and cached.
 * @type {TP.log.Nestable[]}
 */
TP.log.Nestable.Inst.defineAttribute('ancestors');

//  ----------------------------------------------------------------------------

/**
 * The list of ancestor names for the receiver. This is computed once and
 * cached.
 * @type {String[]}
 */
TP.log.Nestable.Inst.defineAttribute('ancestorNames');

//  ----------------------------------------------------------------------------

/**
 * The receiver's full name including any ancestor portions.
 * @type {String}
 */
TP.log.Nestable.Inst.defineAttribute('name');

//  ----------------------------------------------------------------------------

/**
 * The parent instance for the receiver. May be null.
 * @type {TP.log.Nestable}
 */
TP.log.Nestable.Inst.defineAttribute('parent');

//  ----------------------------------------------------------------------------

TP.log.Nestable.Inst.defineMethod('getName',
function() {

    /**
     * @method getName
     * @summary Returns the name of the marker.
     * @returns {String} The marker name.
     */

    return this.name;
});

//  ----------------------------------------------------------------------------

TP.log.Nestable.Inst.defineMethod('init',
function(aName) {

    /**
     * @method init
     * @summary Initializes new instances, configuring their default values etc.
     * @param {String} aName The marker's name. May include '.' for hierarchy.
     * @returns {TP.log.Nestable} The new marker instance.
     */

    this.callNextMethod();

    this.set('name', aName);

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Nestable.Inst.defineMethod('getAncestors',
function() {

    /**
     * @method getAncestors
     * @summary Returns a list of all ancestor instances for the receiver.
     * @returns {TP.log.Nestable[]} The ancestor list.
     */

    var ancestors,
        type;

    ancestors = this.$get('ancestors');
    if (TP.isValid(ancestors)) {
        return ancestors;
    }

    type = this.getType();

    ancestors = this.getAncestorNames().map(
                            function(name) {
                                return type.getInstanceByName(name);
                            });

    this.set('ancestors', ancestors);

    return ancestors;
});

//  ----------------------------------------------------------------------------

TP.log.Nestable.Inst.defineMethod('getAncestorNames',
function() {

    /**
     * @method getAncestorNames
     * @summary Returns a list of all ancestor instance names for the receiver.
     * @returns {String[]} The ancestor name list.
     */

    var str,
        names;

    names = this.$get('ancestorNames');
    if (TP.isValid(names)) {
        return names;
    }

    str = this.get('name');
    names = TP.ac();

    while (str.indexOf('.') !== TP.NOT_FOUND) {
        str = str.slice(0, str.lastIndexOf('.'));
        names.push(str);
    }

    this.set('ancestorNames', names);

    return names;
});

//  ----------------------------------------------------------------------------

TP.log.Nestable.Inst.defineMethod('getParent',
function() {

    /**
     * @method getParent
     * @summary Returns the receiver's parent instance, the instance whose name
     *     is one "level" above the receiver.
     * @returns {TP.log.Nestable} The parent instance.
     */

    var pname,
        parent;

    if (TP.isValid(parent = this.$get('parent'))) {
        return parent;
    }

    if (this.get('name').indexOf('.') === TP.NOT_FOUND) {
        return;
    }

    pname = this.get('name').slice(0, this.get('name').lastIndexOf('.'));
    parent = this.getType().getInstanceByName(pname);

    this.set('parent', parent);

    return parent;
});

//  ============================================================================
//  TP.log.Filtered
//  ============================================================================

/**
 * @type {TP.log.Filtered}
 * @summary A trait intended to be leveraged by Logger and Appender which both
 *     rely onfiltering logic and TP.log.Filter instances.
 */
TP.lang.Object.defineSubtype('log.Filtered');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.log.Filtered.isAbstract(true);

//  ----------------------------------------------------------------------------
//  Filtered - Instance Definition
//  ----------------------------------------------------------------------------

/**
 * The instance's list of filters. Can be empty.
 * @type {TP.log.Filter[]}
 */
TP.log.Filtered.Inst.defineAttribute('filters');

//  ----------------------------------------------------------------------------

TP.log.Filtered.Inst.defineMethod('addFilter',
function(aFilter) {

    /**
     * @method addFilter
     * @summary Adds a new filter to the receiver. Instances can have 0 to N
     *     filters defined.
     * @param {TP.log.Filter} aFilter The new filter to add.
     * @returns {TP.log.Filtered} The receiver.
     */

    var filters;

    //  Make sure to use $get() here to only get our local filters, not any of
    //  our parent's filters.
    if (TP.notValid(filters = this.$get('filters'))) {
        filters = TP.ac();
        this.set('filters', filters);
    }

    if (!filters.contains(aFilter)) {
        filters.push(aFilter);
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Filtered.Inst.defineMethod('clearFilters',
function() {

    /**
     * @method clearFilters
     * @summary Empties the receiver's filter list.
     * @returns {TP.log.Filtered} The receiver.
     */

    this.set('filters', null);

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Filtered.Inst.defineMethod('filter',
function(anEntry) {

    /**
     * @method filter
     * @summary Verifies that the entry should be logged by the receiver. The
     *     first check is the entry level but the entry is also checked by any
     *     filters for the receiver or its parent chain (if filters inherit).
     *     NOTE that unlike log4j TIBET filtering simply checks that no filter
     *     blocks the entry. There is no "neutral" or "pass and ignore others"
     *     option in our implementation of filters.
     * @returns {Boolean} Returns true if the entry should be logged/appended.
     */

    var filters,
        results;

    if (TP.notValid(anEntry)) {
        return false;
    }

    if (!this.isEnabled(anEntry.getLevel())) {
        return false;
    }

    filters = this.getFilters();
    if (TP.notEmpty(filters)) {
        results = filters.map(
                    function(filter) {
                        return filter.filter(anEntry);
                    });

        if (results.contains(false)) {
            return false;
        }
    }

    return true;
});

//  ----------------------------------------------------------------------------

TP.log.Filtered.Inst.defineMethod('getFilters',
function() {

    /**
     * @method getFilters
     * @summary Returns an array of filters for the receiver. If the receiver
     *     inheritsFilters() the list includes all inherited filters.
     * @returns {TP.log.Filter[]} The filter list.
     */

    var filters;

    filters = this.$get('filters');
    if (TP.notValid(filters)) {
        filters = TP.ac();
    }

    return filters;
});

//  ============================================================================
//  TP.log.Leveled
//  ============================================================================

/**
 * A trait intended to be leveraged by types which can limit their logging based
 * on a log entry level.
 * @type {TP.log.Leveled}
 */
TP.lang.Object.defineSubtype('log.Leveled');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.log.Leveled.isAbstract(true);

//  ----------------------------------------------------------------------------
//  Leveled - Instance Definition
//  ----------------------------------------------------------------------------

/**
 * The instance's current logging level. Messages logged at this level and above
 * will be visible.
 * @type {TP.log.Level}
 */
TP.log.Leveled.Inst.defineAttribute('level');

//  ----------------------------------------------------------------------------

TP.log.Leveled.Inst.defineMethod('getLevel',
function() {

    /**
     * @method getLevel
     * @summary Returns the logging level for the receiver. Defaults to ALL.
     * @returns {TP.log.Level} The current logging level.
     */

    return TP.ifInvalid(this.$get('level'), TP.log.ALL);
});

//  ----------------------------------------------------------------------------

TP.log.Leveled.Inst.defineMethod('isEnabled',
function(aLevel) {

    /**
     * @method isEnabled
     * @summary Returns true if the receiver can log at the level provided.
     * @param {TP.log.Level} aLevel The level to verify.
     * @returns {Boolean} True if the receiver can log at aLevel.
     */

    //  Is the level provided "enabled" eg. "visible" relative to our threshold.
    return aLevel.isVisibleAt(this.getLevel());
});

//  ----------------------------------------------------------------------------

TP.log.Leveled.Inst.defineMethod('setLevel',
function(aLevel) {

    /**
     * @method setLevel
     * @summary Sets the logging level for the receiver.
     * @param {TP.log.Level} aLevel The new level to set.
     * @returns {TP.log.Logger} The receiver.
     */

    this.$set('level', aLevel);

    return this;
});

//  ============================================================================
//  TP.log.Logger
//  ============================================================================

/**
 * The primary logging type whose filter/appender/layout configurations define
 * how log entries are processed.
 * @type {TP.log.Logger}
 */
TP.log.Nestable.defineSubtype('log.Logger');

//  ----------------------------------------------------------------------------

TP.log.Logger.addTraits(TP.log.Leveled);
TP.log.Logger.addTraits(TP.log.Filtered);

//  Logger's inherit from their ancestor chain so we need to preserve getters.
TP.log.Logger.Inst.resolveTraits(
    TP.ac('getFilters', 'getLevel', 'getParent'),
    TP.log.Logger);

TP.log.Logger.Inst.resolveTrait('getName', TP.log.Nestable);

//  ----------------------------------------------------------------------------

/**
 * A default instance of appender which can be reused by loggers which don't
 * have one configured directly.
 * @type {TP.log.Appender}
 */
TP.log.Logger.Type.defineAttribute('defaultAppender');

//  ----------------------------------------------------------------------------

/**
 * The default type name to use when constructing a default appender instance.
 * @type {String}
 */
TP.log.Logger.Type.defineAttribute('defaultAppenderType');

//  ----------------------------------------------------------------------------

TP.log.Logger.Type.defineMethod('construct',
function(aName) {

    /**
     * @method construct
     * @summary Allocates and initializes a new logger instance. Note that
     *     while aName can be in any case loggers are uniqued by their
     *     lower-case names so 'test', 'Test', and 'TEST' will all return the
     *     same logger. The first registered logger's name is the one preserved.
     * @param {String} aName The new logger's name.
     * @returns {TP.log.Logger} The newly created Logger.
     */

    var name,
        logger;

    if (TP.isEmpty(aName)) {
        return this.raise('InvalidName');
    }

    /* eslint-disable no-extra-parens */
    name = (aName === TP.log.Manager.ROOT_LOGGER_NAME) ? aName :
        aName.toLowerCase();
    /* eslint-enable no-extra-parens */

    if (TP.log.Manager.exists(name)) {
        return TP.log.Manager.getLogger(name);
    }

    logger = this.callNextMethod();
    TP.log.Manager.registerLogger(logger);

    return logger;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Type.defineMethod('getDefaultAppender',
function() {

    /**
     * Returns an instance of the default appender type for the receiver.
     * @returns {TP.log.Appender} The default appender instance.
     */

    var name,
        type,
        inst;

    inst = this.$get('defaultAppender');
    if (TP.isValid(inst)) {
        return inst;
    }

    name = this.$get('defaultAppenderType');
    if (TP.notValid(name)) {
        name = TP.sys.cfg('log.appender');
    }

    if (TP.notEmpty(name)) {
        type = TP.sys.getTypeByName(name);
    }

    if (TP.notValid(type)) {
        type = TP.sys.getTypeByName('TP.log.ConsoleAppender');
    }

    //  If the types in question can't be located use one from this file...
    if (TP.notValid(type)) {
        type = TP.sys.getTypeByName('TP.log.Appender');
    }

    inst = type.construct();
    this.set('defaultAppender', inst);

    return inst;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Type.defineMethod('getInstanceByName',
function(aName) {

    /**
     * Returns the instance whose name matches the name provided. If the
     * instance doesn't exist this method will not create it.
     * @returns {TP.log.Logger} The named instance.
     */

    if (TP.log.Manager.exists(aName)) {
        return TP.log.Manager.getLogger(aName);
    }
});

//  ----------------------------------------------------------------------------
//  Logger - Instance Definition
//  ----------------------------------------------------------------------------

/**
 * Whether the receiver inherits appenders from its ancestor chain. By default
 * all loggers inherit appender lists.
 * @type {Boolean}
 */
TP.log.Logger.Inst.defineAttribute('additiveAppenders', true);

//  ----------------------------------------------------------------------------

/**
 * Whether the receiver inherits filters from its ancestor chain. By default
 * all loggers inherit filter lists.
 * @type {Boolean}
 */
TP.log.Logger.Inst.defineAttribute('additiveFilters', true);

//  ----------------------------------------------------------------------------

/**
 * The logger's list of appenders. Can be empty.
 @type {TP.log.Appender[]}
 */
TP.log.Logger.Inst.defineAttribute('appenders');

//  ----------------------------------------------------------------------------

/**
 * Whether the logger is buffered. If true, the logger will only trigger append
 * operations when flush is triggered, normally by reaching a buffer limit.
 * @type {Boolean}
 */
TP.log.Logger.Inst.defineAttribute('buffered', false);

//  ----------------------------------------------------------------------------

/**
 * The logger's list of entries. This will only contain data if the logger has
 * been marked as either persistent or buffered. Both cases require the logger
 * to maintain entries.
 @type {TP.log.Entry[]}
 */
TP.log.Logger.Inst.defineAttribute('entries');

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('init',
function(aName) {

    /**
     * @method init
     * @summary Initializes new instances, configuring their default values
     *     etc.
     * @param {String} aName The logger's name. May include '.' for hierarchy.
     * @returns {TP.log.Logger} The new logger instance.
     */

    var level;

    this.callNextMethod();

    //  We have some special setup for the root logger to ensure it acts as a
    //  proper backstop for level and parent searching.
    if (this.$get('name') === TP.log.Manager.ROOT_LOGGER_NAME) {

        level = TP.sys.cfg('log.level') || TP.sys.cfg('boot.level') || 'info';
        level = level.toLowerCase();

        this.set('level', TP.log.Level.getLevel(level));

        //  The root doesn't inherit anything.
        this.set('additiveAppenders', false);
        this.set('additiveFilters', false);

        //  We need a default appender at the root level to backstop things.
        this.addAppender(this.getType().getDefaultAppender());
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('addAppender',
function(anAppender) {

    /**
     * @method addAppender
     * @summary Adds a new appender to the logger. Loggers can have 0 to N
     *     appenders.
     * @param {TP.log.Appender} anAppender The new appender to add.
     * @returns {TP.log.Logger} The receiver.
     */

    var appenders;

    //  Make sure to use $get() here to only get our local appenders, not any of
    //  our parent's appenders.
    if (TP.notValid(appenders = this.$get('appenders'))) {
        appenders = TP.ac();
        this.set('appenders', appenders);
    }

    if (!appenders.contains(anAppender)) {
        appenders.push(anAppender);
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('clearAppenders',
function() {

    /**
     * @method clearAppenders
     * @summary Removes any local appenders from the receiver. If this logger
     *     inherits parent appenders those are unaffected.
     * @returns {TP.log.Logger} The receiver.
     */

    return this.$set('appenders', TP.ac());
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('clearFilters',
function() {

    /**
     * @method clearFilters
     * @summary Removes any local filters from the receiver. If this logger
     *     inherits parent filters those are unaffected.
     * @returns {TP.log.Logger} The receiver.
     */

    return this.$set('filters', TP.ac());
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('getAppenders',
function(localOnly) {

    /**
     * @method getAppenders
     * @summary Returns an array of appenders for the receiver. If the receiver
     *     inheritsAppenders() the list includes all inherited appenders.
     * @param {Boolean} [localOnly=false] True to avoid collecting inherited
     *     appenders.
     * @returns {TP.log.Appender[]} The appender list.
     */

    var appenders,

        parent,
        parentAppenders;

    appenders = this.$get('appenders');

    if (!this.inheritsAppenders() || localOnly === true) {
        return appenders;
    }

    if (TP.notValid(parent = this.getParent())) {
        return;
    }

    parentAppenders = parent.getAppenders();

    if (TP.isEmpty(parentAppenders)) {
        return appenders;
    }

    if (TP.isEmpty(appenders)) {
        return parentAppenders.copy();
    }

    return parentAppenders.concat(appenders);
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('getFilters',
function(localOnly) {

    /**
     * @method getFilters
     * @summary Returns an array of filters for the receiver. If the receiver
     *     inheritsFilters() the list includes all inherited filters.
     * @param {Boolean} [localOnly=false] True to avoid collecting inherited
     *     appenders.
     * @returns {TP.log.Filter[]} The filter list.
     */

    var filters,

        parent,
        parentFilters;

    filters = this.$get('filters');

    if (!this.inheritsFilters() || localOnly === true) {
        return filters;
    }

    if (TP.notValid(parent = this.getParent())) {
        return;
    }

    parentFilters = parent.getFilters();

    if (TP.isEmpty(parentFilters)) {
        return filters;
    }

    if (TP.isEmpty(filters)) {
        return parentFilters.copy();
    }

    return parentFilters.concat(filters);
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('getLevel',
function() {

    /**
     * @method getLevel
     * @summary Returns the logging level for the receiver. This search may
     *     include traversing up the parent chain to return the first level
     *     which is specifically defined. Level is inherited bottom up.
     * @returns {TP.log.Level} The current logging level.
     */

    var parent;

    if (TP.isValid(this.$get('level'))) {
        return this.$get('level');
    }

    parent = this.getParent();
    if (TP.notValid(parent)) {
        return TP.ALL;
    }

    return parent.getLevel();
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('getParent',
function() {

    /**
     * @method getParent
     * @summary Returns the receiver's parent logger, if any. The root logger
     *     will not have one but all other loggers will ultimately inherit from
     *     the root logger.
     * @returns {TP.log.Logger} The parent logger.
     */

    var pname,
        parent;

    if (TP.isValid(this.$get('parent'))) {
        return this.$get('parent');
    }

    if (this.get('name') === TP.log.Manager.ROOT_LOGGER_NAME) {
        return;
    }

    if (this.get('name').indexOf('.') === TP.NOT_FOUND) {
        parent = TP.log.Manager.getRootLogger();
    } else {
        pname = this.get('name').slice(0, this.get('name').lastIndexOf('.'));
        parent = TP.log.Manager.getLogger(pname);
    }

    this.set('parent', parent);

    return parent;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('inheritsAppenders',
function(aFlag) {

    /**
     * @method inheritsAppenders
     * @summary Optionally updates and then returns the value for whether the
     *     receiver inherits appenders from ancestral loggers.
     * @param {Boolean} aFlag A new value for the inherited appender state.
     * @returns {Boolean} The current inherited appender state.
     */

    if (TP.isDefined(aFlag)) {
        this.set('additiveAppenders', aFlag);
    }

    return this.get('additiveAppenders');
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('inheritsFilters',
function(aFlag) {

    /**
     * @method inheritsFilters
     * @summary Optionally updates and then returns the value for whether the
     *     receiver inherits filters from ancestral loggers.
     * @param {Boolean} aFlag A new value for the inherited filter state.
     * @returns {Boolean} The current inherited filter state.
     */

    if (TP.isDefined(aFlag)) {
        this.set('additiveFilters', aFlag);
    }

    return this.get('additiveFilters');
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('$logArglist',
function(aLevel, arglist) {

    /**
     * @method $logArglist
     * @summary Logs one or more objects based on the argument list. This
     *     method is typically invoked via one of the common logging methods
     *     such as warn() or error() and therefore the arglist has a typical
     *     format. The result of this method is to invoke $logEntry() after
     *     constructing a logging entry for the inbound level and argument data.
     * @param {TP.log.Level} aLevel The level to log at.
     * @param {Object[]} arglist An array of arguments from the invoking function.
     *     Content should follow [aLevel, aMarkerOrObject, ..., anError]
     *     where the marker and error elements are optional but checked by this
     *     routine and processed if found. All other items are treated as
     *     content to be logged regardless of it particular type.
     * @returns {TP.log.Logger} The receiver.
     */

    this.$logEntry(TP.log.Entry.construct(this, aLevel, arglist));

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('$logEntry',
function(anEntry) {

    /**
     * @method $logEntry
     * @summary Logs an entry based on the level, marker, and message content
     *     data found in the entry. This is the routine that handles the lower
     *     level work involved in filtering and forwarding to appenders. This
     *     method is invoked via $logArglist after that method constructs a log
     *     Entry owned by the receiver.
     * @param {TP.log.Entry} anEntry The log entry to output.
     * @returns {TP.log.Logger} The receiver.
     */

    var appenders;

    if (TP.notTrue(this.filter(anEntry))) {
        return;
    }

    appenders = this.getAppenders();
    if (TP.notEmpty(appenders)) {
        appenders.forEach(
                    function(appender) {
                        appender.log(anEntry);
                    });
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('removeAppender',
function(anAppender) {

    /**
     * @method removeAppender
     * @summary Removes a appender from the logger. Loggers can have 0 to N
     *     appenders.
     * @param {TP.log.Appender} anAppender The appender to remove.
     * @returns {TP.log.Logger} The receiver.
     */

    var appenders;

    //  Make sure to use $get() here to only get our local appenders, not any of
    //  our parent's appenders.
    if (TP.notValid(appenders = this.$get('appenders'))) {
        return this;
    }

    appenders.remove(anAppender, TP.IDENTITY);

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('trace',
function(varargs) {

    /**
     * @method trace
     * @summary Log all arguments provided at trace level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {arguments} varargs One or more arguments as desired.
     * @returns {TP.log.Logger|undefined} The receiver or null if the log for
     *     this level is disabled.
     */

    if (!this.isEnabled(TP.log.TRACE)) {
        return;
    }

    return this.$logArglist(TP.log.TRACE, TP.args(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('debug',
function(varargs) {

    /**
     * @method debug
     * @summary Log all arguments provided at debug level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {arguments} varargs One or more arguments as desired.
     * @returns {TP.log.Logger|undefined} The receiver or null if the log for
     *     this level is disabled.
     */

    if (!this.isEnabled(TP.log.DEBUG)) {
        return;
    }

    return this.$logArglist(TP.log.DEBUG, TP.args(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('info',
function(varargs) {

    /**
     * @method info
     * @summary Log all arguments provided at info level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {arguments} varargs One or more arguments as desired.
     * @returns {TP.log.Logger|undefined} The receiver or null if the log for
     *     this level is disabled.
     */

    if (!this.isEnabled(TP.log.INFO)) {
        return;
    }

    return this.$logArglist(TP.log.INFO, TP.args(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('warn',
function(varargs) {

    /**
     * @method warn
     * @summary Log all arguments provided at warn level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {arguments} varargs One or more arguments as desired.
     * @returns {TP.log.Logger|undefined} The receiver or null if the log for
     *     this level is disabled.
     */

    if (!this.isEnabled(TP.log.WARN)) {
        return;
    }

    return this.$logArglist(TP.log.WARN, TP.args(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('error',
function(varargs) {

    /**
     * @method error
     * @summary Log all arguments provided at error level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {arguments} varargs One or more arguments as desired.
     * @returns {TP.log.Logger|undefined} The receiver or null if the log for
     *     this level is disabled.
     */

    if (!this.isEnabled(TP.log.ERROR)) {
        return;
    }

    return this.$logArglist(TP.log.ERROR, TP.args(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('fatal',
function(varargs) {

    /**
     * @method fatal
     * @summary Log all arguments provided at fatal level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {arguments} varargs One or more arguments as desired.
     * @returns {TP.log.Logger|undefined} The receiver or null if the log for
     *     this level is disabled.
     */

    if (!this.isEnabled(TP.log.FATAL)) {
        return;
    }

    return this.$logArglist(TP.log.FATAL, TP.args(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('system',
function(varargs) {

    /**
     * @method system
     * @summary Log all arguments provided at system level. If there is a
     *     marker for this entry it should be the first argument.
     * @param {arguments} varargs One or more arguments as desired.
     * @returns {TP.log.Logger|undefined} The receiver or null if the log for
     *     this level is disabled.
     */

    if (!this.isEnabled(TP.log.SYSTEM)) {
        return;
    }

    return this.$logArglist(TP.log.SYSTEM, TP.args(arguments));
});

//  ============================================================================
//  TP.log.Appender
//  ============================================================================

/**
 * The core type for actual logging. Appender types and their instances do the
 * actual work of outputting log entries to various sinks such as the browser
 * console, the TIBET UI, or remote servers.
 */
TP.lang.Object.defineSubtype('log.Appender');

//  ----------------------------------------------------------------------------

//  Appenders are leveled and filtered based on both level and filter content.
TP.log.Appender.addTraits(TP.log.Leveled);
TP.log.Appender.addTraits(TP.log.Filtered);

//  ----------------------------------------------------------------------------

/**
 * A default instance of layout which can be reused by appenders which don't
 * have one configured directly.
 * @type {TP.log.Layout}
 */
TP.log.Appender.Type.defineAttribute('defaultLayout');

//  ----------------------------------------------------------------------------

/**
 * The default type name to use when constructing a default layout instance.
 * @type {String}
 */
TP.log.Appender.Type.defineAttribute('defaultLayoutType');

//  ----------------------------------------------------------------------------

TP.log.Appender.Type.defineMethod('getDefaultLayout',
function() {

    /**
     * Returns an instance of the default layout type for the receiver.
     * @returns {TP.log.Layout} The default layout instance.
     */

    var name,
        type,
        inst;

    inst = this.$get('defaultLayout');
    if (TP.isValid(inst)) {
        return inst;
    }

    name = this.$get('defaultLayoutType');
    if (TP.notValid(name)) {
        name = TP.sys.cfg('log.layout');
    }

    if (TP.notEmpty(name)) {
        type = TP.sys.getTypeByName(name);
    }

    if (TP.notValid(type)) {
        type = TP.sys.getTypeByName('TP.log.ConsoleLayout');
    }

    //  If the types in question can't be located use one from this file...
    if (TP.notValid(type)) {
        type = TP.sys.getTypeByName('TP.log.Layout');
    }

    inst = type.construct();
    this.set('defaultLayout', inst);

    return inst;
});

//  ----------------------------------------------------------------------------
//  Appender - Instance Definition
//  ----------------------------------------------------------------------------

/**
 * The layout used by the appender to format any entries it may process.
 * @type {TP.log.Layout}
 */
TP.log.Appender.Inst.defineAttribute('layout');

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('append',
function(anEntry) {

    /**
     * @method append
     * @summary Formats the entry data using the receiver's layout, if any, and
     *     then outputs the content as appropriate. The default implementation
     *     simply returns (so TP.log.Appender is a "NullAppender" as it were).
     * @param {TP.log.Entry} anEntry The log entry to format and append.
     * @returns {TP.log.Appender} The receiver.
     */

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('getLayout',
function() {

    /**
     * @method getLayout
     * @summary Returns the layout used by the receiver. If no specific layout
     *     has been assigned TP.log.Appender.DEFAULT_LAYOUT_TYPE is used.
     * @param {TP.log.Layout} aLayout The layout to use.
     * @returns {TP.log.Layout} The receiver's layout.
     */

    var layout;

    layout = this.$get('layout');
    if (TP.notValid(layout)) {
        layout = this.getType().getDefaultLayout();
    }

    return layout;
});

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('log',
function(anEntry) {

    /**
     * @method log
     * @summary Invokes the receiver's filter method to filter anEntry and then
     *     invokes append() if the entry passes all the filters.
     * @param {TP.log.Entry} anEntry The log entry to output.
     * @returns {TP.log.Appender} The receiver.
     */

    if (TP.notTrue(this.filter(anEntry))) {
        return;
    }

    this.append(anEntry);

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('setLayout',
function(aLayout) {

    /**
     * @method setLayout
     * @summary Defines the layout formatter the receiver will use to format
     *     log entries prior to being appended.
     * @param {TP.log.Layout} aLayout The layout to use.
     * @returns {TP.log.Appender} The receiver.
     */

    this.$set('layout', aLayout);

    return this;
});

//  ============================================================================
//  TP.log.Entry
//  ============================================================================

/**
 * A container for all information related to a specific logging method
 * invocation. Log entries know their logger, level, time, and content and may
 * be annotated via a TP.log.Marker for easier filtering.
 */
TP.lang.Object.defineSubtype('log.Entry');

//  ----------------------------------------------------------------------------
//  Entry - Instance Definition
//  ----------------------------------------------------------------------------

/**
 * An array of the original arguments (not including level) being logged.
 * @type {arguments}
 */
TP.log.Entry.Inst.defineAttribute('arglist');

//  ----------------------------------------------------------------------------

/**
 * The date/time of the entry. Defaults to creation time.
 * @type {Date}
 */
TP.log.Entry.Inst.defineAttribute('date');

//  ----------------------------------------------------------------------------

/**
 * The entry's level. All entries have a level assigned when they are created.
 * @type {TP.log.Level}
 */
TP.log.Entry.Inst.defineAttribute('level');

//  ----------------------------------------------------------------------------

/**
 * The logger instance responsible for constructing this entry. Useful as a way
 * of accessing the logger name and other context data as needed.
 * @type {TP.log.Logger}
 */
TP.log.Entry.Inst.defineAttribute('logger');

//  ----------------------------------------------------------------------------

/**
 * Set to the first item of the arglist if that item is a Marker instance.
 * @type {TP.log.Marker}
 */
TP.log.Entry.Inst.defineAttribute('marker');

//  ----------------------------------------------------------------------------

TP.log.Entry.Inst.defineMethod('getArglist',
function() {

    /**
     * @method getArgList
     * @summary Returns the original arguments passed to the logging function.
     * @returns {Object[]} The argument list in array form.
     */

    return this.$get('arglist');
});

//  ----------------------------------------------------------------------------

TP.log.Entry.Inst.defineMethod('getDate',
function() {

    /**
     * @method getDate
     * @summary Returns the entry date. The millisecond data from this is often
     *     used as part of logging output, or to compute log entry delta times.
     * @returns {Date} The entry's date.
     */

    return this.$get('date');
});

//  ----------------------------------------------------------------------------

TP.log.Entry.Inst.defineMethod('getLevel',
function() {

    /**
     * @method getLevel
     * @summary Returns the level for the entry.
     * @returns {TP.log.Level} The entry's level.
     */

    return this.$get('level');
});

//  ----------------------------------------------------------------------------

TP.log.Entry.Inst.defineMethod('getLogger',
function() {

    /**
     * @method getLogger
     * @summary Returns the logger for the entry.
     * @returns {TP.log.Logger} The entry's logger.
     */

    return this.$get('logger');
});

//  ----------------------------------------------------------------------------

TP.log.Entry.Inst.defineMethod('getMarker',
function() {

    /**
     * @method getMarker
     * @summary Returns the entry marker, which contains possible data for
     *     filtering.
     * @returns {TP.log.Marker} The entry's marker.
     */

    return this.$get('marker');
});

//  ----------------------------------------------------------------------------

TP.log.Entry.Inst.defineMethod('init',
function(aLogger, aLevel, arglist) {

    /**
     * @method init
     * @summary Initializes a new log entry instance, assigning it the proper
     *     values for level, date/time, arguments, and marker. If there is a
     *     marker it must be the first item in the argument list to be used.
     * @param {TP.log.Logger} aLogger The logger responsible for this entry.
     * @param {TP.log.Level} aLevel The level this entry is relevant for.
     * @param {Object[]} arglist A list of all message items etc. provided
     *     to the initial logging method.
     * @returns {TP.log.Entry} The receiver.
     */

    var arg0,
        marker,
        str;

    this.callNextMethod();

    this.date = new Date();

    this.set('logger', aLogger);
    this.set('level', aLevel);
    this.set('arglist', arglist);

    //  See if we have a marker or marker name as the first entry. If so we
    //  shift that off our argument list and treat it as our marker value.
    if (arglist && arglist.length > 0) {
        arg0 = arglist.at(0);
        if (TP.isString(arg0)) {
            marker = TP.log.Marker.getInstanceByName(arg0);
            if (TP.isValid(marker)) {
                this.set('marker', marker);
                arglist.shift();
            }
        } else if (TP.isKindOf(arg0, TP.log.Marker)) {
            this.set('marker', arglist.shift());
        }

        //  With marker check in place see if we have a sprintf string. If so we
        //  replace the current argument list with the result of invocation.
        arg0 = arglist.at(0);
        if (arglist.length > 1 && TP.isString(arg0) &&
                TP.regex.HAS_PERCENT.match(arg0)) {
            try {
                str = TP.sprintf.apply(null, arglist);
                arglist.empty();
                arglist.push(str);
            } catch (e) {
                //  Ignore cases where the string wasn't valid. The result
                //  should be that the string will show up unprocessed if it was
                //  an attempt to use sprintf with bad formatting, but what the
                //  user expected if the string just said "foo is at 23%".
                void 0;
            }
        }
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Entry.Inst.defineMethod('isError',
function() {

    /**
     * @method isError
     * @summary Returns whether or not this log entry represents an error
     *     condition.
     * @returns {Boolean} Whether or not this entry represents an error.
     */

    //  NB: The boot system expects to see these in all uppercase. For example,
    //  TP.boot.ERROR.
    return TP.boot.Log.isErrorLevel(this.getLevel().get('name').toUpperCase());
});

//  ============================================================================
//  TP.log.Filter
//  ============================================================================

/**
 * A type whose specific subtypes provide different log Entry filtering options.
 * @type {TP.log.Filter}
 */
TP.lang.Object.defineSubtype('log.Filter');

//  ----------------------------------------------------------------------------
//  Filter - Instance Definition
//  ----------------------------------------------------------------------------

TP.log.Filter.Inst.defineMethod('filter',
function(anEntry) {

    /**
     * @method filter
     * @summary Runs one or more checks on anEntry to decide whether it can be
     *     passed forward to an appender. The default implementation is intended
     *     to be overridden by subtype versions.
     * @param {TP.log.Entry} anEntry The entry to filter.
     * @returns {Boolean} True if the entry is valid.
     */

    return true;
});

//  ============================================================================
//  TP.log.Layout
//  ============================================================================

/**
 * A type whose specific subtypes provide alternative ways to format a log
 * Entry. Some common options include browser console form, TDC form, etc.
 */
TP.lang.Object.defineSubtype('log.Layout');

//  ----------------------------------------------------------------------------
//  Layout - Instance Definition
//  ----------------------------------------------------------------------------

TP.log.Layout.Inst.defineMethod('layout',
function(anEntry) {

    /**
     * @method layout
     * @summary Formats an entry. The various data fields in the entry may be
     *     processed in virtually any fashion as a result. The default format is
     *     whatever is produced by TP.str() which relies on the Entry type.
     * @param {TP.log.Entry} anEntry The entry to format.
     * @returns {TP.core.Hash} A hash of output containing at least one key,
     *     'content'.
     */

    return TP.hc('content', TP.str(anEntry));
});

//  ============================================================================
//  TP.log.Level
//  ============================================================================

/**
 * A simple type for managing logging levels and their behavior. Level
 * instances are placed on TP.log and are given an uppercase name to set
 * them off as "pseudo-constants" once they're created.
 */
TP.lang.Object.defineSubtype('log.Level');

//  ----------------------------------------------------------------------------

/**
 * A dictionary of the level instances which have been created, by name.
 * @type {TP.core.Hash}
 */
TP.log.Level.defineAttribute('levels', TP.hc());

//  ----------------------------------------------------------------------------

TP.log.Level.Type.defineMethod('construct',
function(aName, anIndex) {

    /**
     * @method construct
     * @summary Creates and returns unique Level instances based on the
     * combination of name and index.
     * @param {String} aName The string used when logging for this level.
     * @param {Number} anIndex The integer value for this level, used for
     *     comparisons to other levels.
     */

    var key,
        level;

    key = aName.toUpperCase();
    level = this.levels.at(key);

    if (TP.isValid(level)) {
        if (level.getLevel() === anIndex) {
            return level;
        } else {
            return this.raise('InvalidOperation',
                'TP.log.' + key + ' index cannot be changed.');
        }
    }

    //  Verify we can place the new level key on TP.log for access.
    if (TP.log.hasOwnProperty(key)) {
        return this.raise('InvalidLevel',
            'TP.log[' + key + '] already exists.');
    }

    level = this.callNextMethod();

    //  Register the new instance.
    this.levels.atPut(key, level);

    //  NOTE we also put the instance on TP.log as a pseudo-constant value.
    TP.log[key] = level;

    return level;
});

//  ----------------------------------------------------------------------------

TP.log.Level.Type.defineMethod('getLevel',
function(aName) {

    /**
     * @method getLevel
     * @summary Returns the Level instance with the given name, if it exists.
     * @param {String} aName The level name to retrieve.
     * @returns {TP.log.Level} The level instance with the given name.
     */

    var key;

    if (TP.isEmpty(aName)) {
        return;
    }

    key = aName.toUpperCase();

    return this.levels.at(key);
});

//  ----------------------------------------------------------------------------
//  Level - Instance Definition
//  ----------------------------------------------------------------------------

/**
 * The index value of the level. Used for comparing level ordering.
 * @type {Number}
 */
TP.log.Level.Inst.defineAttribute('index');

//  ----------------------------------------------------------------------------

/**
 * The name of the level. Used by some formatters as part of logging output.
 * @type {String}
 */
TP.log.Level.Inst.defineAttribute('name');

//  ----------------------------------------------------------------------------

TP.log.Level.Inst.defineMethod('compareTo',
function(aLevel) {

    /**
     * @method compareTo
     * @summary Returns an integer defining whether the receiver is less than
     *     (-1), equal to (0), or greater than (1) the level provided.
     * @returns {Number} The comparison value.
     */

    var level,
        index;

    level = TP.isString(aLevel) ? TP.log.Level.getLevel(aLevel) : aLevel;
    if (!TP.canInvoke(level, 'get')) {
        return -1;
    }

    index = level.get('index');

    if (this.get('index') === index) {
        return 0;
    } else if (this.get('index') < index) {
        return -1;
    } else {
        return 1;
    }
});

//  ----------------------------------------------------------------------------

TP.log.Level.Inst.defineMethod('equalTo',
function(aLevel) {

    /**
     * @method equalTo
     * @summary Returns true if the two levels are equal in terms of their
     *     index values.
     * @returns {Boolean} True if the levels are equal.
     */

    var level;

    if (!TP.canInvoke(aLevel, 'get')) {
        if (!TP.isNumber(aLevel)) {
            return false;
        } else {
            level = aLevel;
        }
    } else {
        level = aLevel.get('index');
    }

    return this.get('index') === level;
});

//  ----------------------------------------------------------------------------

TP.log.Level.Inst.defineMethod('getName',
function(aLevel) {

    /**
     * @method getName
     * @summary Returns the level name, typically one of 'TRACE', 'DEBUG', etc.
     * @returns {String} The level name.
     */

    return this.$get('name');
});

//  ----------------------------------------------------------------------------

TP.log.Level.Inst.defineMethod('init',
function(aName, anIndex) {

    /**
     * @method init
     * @summary Initializes a new instance. The name is used by certain
     *     formatters as part of the logging output. The index provides a means
     *     for comparing different level values.
     *     Note that the name must be a valid JavaScript identifier and must be
     *     unique since it will be placed on TP.log for ease-of-use.
     * @constructor
     * @param {String} aName The string used when logging for this level.
     * @param {Number} anIndex The integer value for this level, used for
     *     comparisons to other levels.
     */

    this.callNextMethod();

    this.set('name', aName.toUpperCase());
    this.set('index', anIndex);

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Level.Inst.defineMethod('isVisibleAt',
function(aLevel) {

    /**
     * @method isVisibleAt
     * @summary Returns true if the receiver is visible when the level
     *     threshold is set to the level provided.
     * @returns {Boolean} True if the the level is "greater than or equal to"
     *     the receiving level.
     */

    if (this === TP.log.OFF) {
        return false;
    }

    if (this === TP.log.ALL && aLevel !== TP.log.OFF) {
        return true;
    }

    //  If the receiver's index is greater than or equal to the threshold the
    //  receiver should be visible.
    return this.compareTo(aLevel) >= 0;
});

//  ============================================================================
//  TP.log.Level - Standard Instances
//  ============================================================================

TP.log.Level.construct('ALL', Number.NEGATIVE_INFINITY);
TP.log.Level.construct('OFF', Number.POSITIVE_INFINITY);

TP.log.Level.construct('TRACE', 100);
TP.log.Level.construct('DEBUG', 200);
TP.log.Level.construct('INFO', 300);
TP.log.Level.construct('WARN', 400);
TP.log.Level.construct('ERROR', 500);
TP.log.Level.construct('FATAL', 600);
TP.log.Level.construct('SYSTEM', 700);

//  ============================================================================
//  TP.log.Marker
//  ============================================================================

/**
 * A named object which can be used as a form of log entry annotation. Log
 * entries containing markers can optionally be filtered or formatted based on
 * their marker content.
 */
TP.log.Nestable.defineSubtype('log.Marker');

//  ----------------------------------------------------------------------------

/**
 * A dictionary of the marker instances which have been created, by name.
 * @type {TP.core.Hash}
 */
TP.log.Marker.defineAttribute('markers', TP.hc());

//  ----------------------------------------------------------------------------

TP.log.Marker.Type.defineMethod('construct',
function(aName) {

    /**
     * @method construct
     * @summary Allocates and initializes a new marker instance.
     * @constructor
     * @param {String} aName The marker name.
     * @returns {TP.log.Marker} The new instance.
     */

    var marker;

    marker = TP.log.Marker.markers.at(aName);
    if (TP.isValid(marker)) {
        return marker;
    }

    marker = this.callNextMethod();

    //  Register the new instance.
    TP.log.Marker.markers.atPut(aName, marker);

    return marker;
});

//  ----------------------------------------------------------------------------

TP.log.Marker.Type.defineMethod('getInstanceByName',
function(aName) {

    /**
     * @method getInstanceByName
     * @summary Returns the instance whose name matches the name provided. If
     *     the instance doesn't exist this method will not create it.
     * @returns {TP.log.Logger} The named instance.
     */

    return this.getMarker(aName);
});

//  ----------------------------------------------------------------------------

TP.log.Marker.Type.defineMethod('getMarker',
function(aName) {

    /**
     * @method getMarker
     * @summary Returns the Marker instance with the given name, if it exists.
     * @param {String} aName The marker name to search for.
     * @returns {TP.log.Marker} The marker instance with the given name.
     */

    if (TP.isEmpty(aName)) {
        return;
    }

    return TP.log.Marker.markers.at(aName);
});

//  ----------------------------------------------------------------------------

TP.log.Marker.Type.defineMethod('getMarkerNames',
function(aName) {

    /**
     * @method getMarkerNames
     * @summary Returns the list of all known marker names.
     * @returns {String[]} The marker name list.
     */

    return TP.log.Marker.markers.getKeys();
});

//  ----------------------------------------------------------------------------

TP.log.Marker.Inst.defineMethod('isCategoryOf',
function(nameOrMarker) {

    /**
     * @method isCategoryOf
     * @summary Returns true if the marker is a "more specific category" of the
     *     marker or marker name provided.
     * @param {String|Marker} nameOrMarker The marker or marker name to test.
     * @returns {Boolean} Whether or not the marker is a more specific category.
     */

    if (TP.isString(name)) {
        return this.getAncestorNames().contains(nameOrMarker);
    } else if (TP.isKindOf(nameOrMarker, TP.log.Marker)) {
        return this.getAncestors().contains(nameOrMarker);
    }

    return false;
});

//  ============================================================================
//  TP.log.Timer
//  ============================================================================

/**
 * A type which allows the construction of named timers, objects which can track
 * elapsed time across operations. Timers are uniqued by name.
 */
TP.lang.Object.defineSubtype('log.Timer');

//  ----------------------------------------------------------------------------

/**
 * A dictionary of all known timers.
 * @type {TP.core.Hash}
 */
TP.log.Timer.defineAttribute('timers', TP.hc());

//  ----------------------------------------------------------------------------

TP.log.Timer.Type.defineMethod('construct',
function(aName) {

    /**
     * @method construct
     * @summary Creates a new timer with the name provided. If the timer
     *     already exists it is simply returned.
     * @param {String} aName The name of the timer being requested.
     * @returns {TP.log.Timer} A new instance.
     */

    var timer;

    timer = TP.log.Timer.timers.at(aName);
    if (TP.isValid(timer)) {
        return timer;
    }

    timer = this.callNextMethod();

    TP.log.Timer.timers.atPut(aName, timer);

    return timer;
});

//  ----------------------------------------------------------------------------
//  Timer - Instance Definition
//  ----------------------------------------------------------------------------

/**
 * The name of the timer so it can be acquired later.
 * @type {String}
 */
TP.log.Timer.Inst.defineAttribute('name');

//  ----------------------------------------------------------------------------

/**
 * The ending timestamp.
 * @type {Date}
 */
TP.log.Timer.Inst.defineAttribute('end');

//  ----------------------------------------------------------------------------

/**
 * The starting timestamp.
 * @type {Date}
 */
TP.log.Timer.Inst.defineAttribute('start');

//  ----------------------------------------------------------------------------

TP.log.Timer.Inst.defineMethod('getElapsedTime',
function() {

    /**
     * @method getElapsedTime
     * @summary Returns the amount of time recorded by the timer. If the timer
     *     is still running this uses the current time, otherwise it is computed
     *     from the end time set at the time stop() was called.
     * @returns {Number} The milliseconds the timer has recorded.
     */

    var end;

    end = this.end;
    if (TP.notValid(end)) {
        end = Date.now();
    }

    return end.getTime() - this.start.getTime();
});

//  ----------------------------------------------------------------------------

TP.log.Timer.Inst.defineMethod('init',
function(aName) {

    /**
     * @method init
     * @summary Initializes a new instance.
     * @param {String} aName The new timer's name.
     * @returns {TP.log.Timer} The receiver.
     */

    this.callNextMethod();

    //  NB: Leave this to be pure property syntax, as we're capturing timing
    //  results here.
    this.name = aName;

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Timer.Inst.defineMethod('reset',
function() {

    /**
     * @method reset
     * @summary Resets the timer, clearing any end timestamp and updating the
     *     start time to the present.
     * @returns {TP.log.Timer} The receiver.
     */

    //  NB: Leave this to be pure property syntax, as we're capturing timing
    //  results here.
    this.start = Date.now();
    this.end = null;

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Timer.Inst.defineMethod('stop',
function() {

    /**
     * @method stop
     * @summary Stops the timer, recording an end timestamp.
     * @returns {TP.log.Timer} The receiver.
     */

    //  NB: Leave this to be pure property syntax, as we're capturing timing
    //  results here.
    this.end = Date.now();

    return this;
});

//  ============================================================================
//  TP Logging Methods
//  ============================================================================

TP.defineMetaInstMethod('shouldLog',
function(aFlag, aLogName) {

    /**
     * @method shouldLog
     * @summary Defines whether the receiver should log to the activity log
     *     relative to a particular log type. When no type is provided the
     *     setting takes effect for all logging for the receiver.
     * @param {Boolean} aFlag The optional state of the flag to be set as a
     *     result of this call.
     * @param {String} aLogName One of the TIBET log type names, or a custom
     *     name if custom logging is being used. See TP.*_LOG for names.
     * @returns {Boolean} The value of the flag after any optional set.
     */

    var flag,
        owner;

    //  TODO: the logic here should check the type, if the type is off then
    //  there's no point in doing things at an instance level. We can rework
    //  this as a way to override type settings.

    //  specific instruction/query regarding a particular log
    if (TP.isString(aLogName)) {
        if (TP.isBoolean(aFlag)) {
            this['$shouldLog' + aLogName] = TP.bc(aFlag);
        }

        flag = this['$shouldLog' + aLogName];
    } else {
        if (TP.isBoolean(aFlag)) {
            this['$shouldLog' + TP.LOG] = TP.bc(aFlag);
        }

        flag = this['$shouldLog' + TP.LOG];
    }

    if (TP.isBoolean(flag)) {
        return flag;
    } else if (TP.isMethod(this)) {
        //  functions that are methods can test their owners to see if
        //  logging is turned off for specific types or instances
        if (TP.isValid(owner = this[TP.OWNER])) {
            if (TP.canInvoke(owner, 'shouldLog')) {
                return owner.shouldLog(aFlag, aLogName);
            }
        }

        return true;
    } else {
        return true;
    }
});

//  ----------------------------------------------------------------------------
//
//  ----------------------------------------------------------------------------

//  TODO: migrate to housekeeping...
TP.definePrimitive('$$log', TP.$$log);

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('$$log',
function(argList, aLogLevel, logRoot) {

    /**
     * @method $$log
     * @summary Directs an incoming set of logging parameters to the appropriate
     *     logger for processing.
     * @param {arguments} argList A list of arguments from a logging call.
     * @param {Number} aLogLevel TP.INFO or a similar level name.
     * @param {Object} logRoot The root to use (TP or APP usually).
     * @returns {Boolean} True if the logging operation succeeded.
     */

    var args,
        marker,
        logger,
        level;

    args = TP.args(argList);

    if (args.length > 1) {
        marker = args.first();
        if (TP.isString(marker)) {

            if (TP.log.Manager.exists(marker)) {
                logger = TP.log.Manager.getLogger(marker);
            } else if (TP.log.Manager.exists('APP.' + marker)) {
                logger = APP.getLogger(marker);
            } else if (TP.log.Manager.exists('TP.' + marker)) {
                logger = TP.getLogger(marker);
            }

            if (TP.isValid(logger)) {
                //  NOTE we trim off that argument so we don't log it below.
                args = args.slice(1);
            }
        }
    }

    if (TP.notValid(logger)) {
        if (TP.canInvoke(logRoot, 'getDefaultLogger')) {
            logger = logRoot.getDefaultLogger();
        } else {
            logger = TP.getDefaultLogger();
        }
    }

    level = TP.isString(aLogLevel) ? TP.log[aLogLevel] : aLogLevel;
    level = TP.ifInvalid(level, TP.log.INFO);

    logger.$logArglist(level, args);

    return true;
});

//  ============================================================================
//  TP Logging Extensions
//  ============================================================================

/**
 * TODO
 */

//  ----------------------------------------------------------------------------
//
//  ----------------------------------------------------------------------------

TP.definePrimitive('getDefaultLogger',
function() {

    /**
     * @method getDefaultLogger
     * @summary Returns the default application logger instance.
     * @returns {TP.log.Logger} The default logger instance.
     */

    return TP.log.Manager.getLogger(this.getID());
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('getLogger',
function(aName) {

    /**
     * @method getLogger
     * @summary Returns a logger for the library side of operation. All loggers
     *     returned by this method will inherit (ultimately) from the TP or APP
     *     logger.
     * @param {String} aName The logger to return, or create and return.
     * @returns {TP.log.Logger} The named logger instance.
     */

    var name,
        id;

    id = this.getID();
    name = TP.ifEmpty(aName, id);

    if (aName !== id && aName.indexOf(id + '.') !== 0) {
        name = id + '.' + aName;
    }

    name = TP.ifInvalid(name, aName);

    return TP.log.Manager.getLogger(name);
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('getLogLevel',
function(aLogger) {

    /**
     * @method getLogLevel
     * @summary Returns the logging level for the logger provided, or the
     *     default logger for the receiver.
     * @param {TP.log.Logger} aLogger The logger to retrive the level for.
     * @returns {Number} The current logging level for the logger provided.
     */

    if (TP.notEmpty(aLogger)) {
        return this.getLogger(aLogger).getLevel();
    } else {
        return this.getDefaultLogger().getLevel();
    }
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('setLogLevel',
function(aLevel, aLogger) {

    /**
     * @method setLogLevel
     * @summary Sets the logging level for the logger provided, or the
     *     default logger for the receiver.
     * @param {String} aLevel A logging level name to be set.
     * @param {TP.log.Logger} aLogger The logger to set the level for.
     * @returns {TP.log.Logger} The logger the level was set for.
     */

    var level;

    level = TP.isString(aLevel) ? TP.log[aLevel.toUpperCase()] : aLevel;
    if (TP.notValid(level)) {
        this.raise('InvalidLevel');
    }

    if (TP.notEmpty(aLogger)) {
        return this.getLogger(aLogger).setLevel(level);
    } else {
        return this.getDefaultLogger().setLevel(level);
    }
});

//  ----------------------------------------------------------------------------
//  BRANCH DETECTION
//  ----------------------------------------------------------------------------

/*
 *  Utility functions to help limit message construction overhead when needed.
 *
 *  The versions here replace the boot system versions and verify that the level
 *  is enabled for the log name provided (the boot system versions don't since
 *  there are no loggers at that point in the startup process).
*/

//  ----------------------------------------------------------------------------

TP.definePrimitive('ifTrace',
function(aLogName) {

    /**
     * @method ifTrace
     * @summary Returns true if logging is enabled for TP.log.TRACE level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>
     *          TP.ifTrace() ? TP.trace(...) : 0;
     *     </code>
     *     This idiom can help performance in cases where message construction
     *     overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if trace-level logging is active.
     */

    var logger;

    logger = aLogName ? this.getLogger(aLogName) : this.getDefaultLogger();

    return logger.isEnabled(TP.log.TRACE);

}, null, 'TP.ifTrace');

//  ----------------------------------------------------------------------------

TP.definePrimitive('ifDebug',
function(aLogName) {

    /**
     * @method ifDebug
     * @summary Returns true if logging is enabled for TP.log.DEBUG level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>
     *          TP.ifDebug() ? TP.debug(...) : 0;
     *     </code>
     *     This idiom can help performance in cases where message construction
     *     overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if debug-level logging is active.
     */

    var logger;

    logger = aLogName ? this.getLogger(aLogName) : this.getDefaultLogger();

    return logger.isEnabled(TP.log.DEBUG);

}, null, 'TP.ifDebug');

//  ----------------------------------------------------------------------------

TP.definePrimitive('ifInfo',
function(aLogName) {

    /**
     * @method ifInfo
     * @summary Returns true if logging is enabled for TP.log.INFO level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>
     *          TP.ifInfo() ? TP.info(...) : 0;
     *     </code>
     *     This idiom can help performance in cases where message construction
     *     overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if info-level logging is active.
     */

    var logger;

    logger = aLogName ? this.getLogger(aLogName) : this.getDefaultLogger();

    return logger.isEnabled(TP.log.INFO);

}, null, 'TP.ifInfo');

//  ----------------------------------------------------------------------------

TP.definePrimitive('ifWarn',
function(aLogName) {

    /**
     * @method ifWarn
     * @summary Returns true if logging is enabled for TP.log.WARN level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>
     *          TP.ifWarn() ? TP.warn(...) : 0;
     *     </code>
     *     This idiom can help performance in cases where message construction
     *     overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if warn-level logging is active.
     */

    var logger;

    logger = aLogName ? this.getLogger(aLogName) : this.getDefaultLogger();

    return logger.isEnabled(TP.log.WARN);

}, null, 'TP.ifWarn');

//  ----------------------------------------------------------------------------

TP.definePrimitive('ifError',
function(aLogName) {

    /**
     * @method ifError
     * @summary Returns true if logging is enabled for TP.log.ERROR level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>
     *          TP.ifError() ? TP.error(...) : 0;
     *     </code>
     *     This idiom can help performance in cases where message construction
     *     overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if error-level logging is active.
     */

    var logger;

    logger = aLogName ? this.getLogger(aLogName) : this.getDefaultLogger();

    return logger.isEnabled(TP.log.ERROR);

}, null, 'TP.ifError');

//  ----------------------------------------------------------------------------

TP.definePrimitive('ifFatal',
function(aLogName) {

    /**
     * @method ifFatal
     * @summary Returns true if logging is enabled for TP.log.FATAL level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>
     *          TP.ifFatal() ? TP.fatal(...) : 0;
     *     </code>
     *     This idiom can help performance in cases where message construction
     *     overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if fatal-level logging is active.
     */

    var logger;

    logger = aLogName ? this.getLogger(aLogName) : this.getDefaultLogger();

    return logger.isEnabled(TP.log.FATAL);

}, null, 'TP.ifFatal');

//  ----------------------------------------------------------------------------

TP.definePrimitive('ifSystem',
function(aLogName) {

    /**
     * @method ifSystem
     * @summary Returns true if logging is enabled for TP.log.SYSTEM level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>
     *          TP.ifSystem() ? TP.system(...) : 0;
     *     </code>
     *     This idiom can help performance in cases where message construction
     *     overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if system-level logging is active.
     */

    var logger;

    logger = aLogName ? this.getLogger(aLogName) : this.getDefaultLogger();

    return logger.isEnabled(TP.log.SYSTEM);

}, null, 'TP.ifSystem');

//  ----------------------------------------------------------------------------
//  Level Loggers
//  ----------------------------------------------------------------------------

/*
 * The methods here are defined in the boot code and delegate through a simple
 * branching routine which targets TP.boot.$$log during startup and TP.sys.$$log
 * once the system has started (and can leverage all this nice TP.log stuff :)).
 */

//  TODO: migrate to housekeeping
TP.definePrimitive('trace', TP.trace);
TP.definePrimitive('debug', TP.debug);
TP.definePrimitive('info', TP.info);
TP.definePrimitive('warn', TP.warn);
TP.definePrimitive('error', TP.error);
TP.definePrimitive('fatal', TP.fatal);
TP.definePrimitive('system', TP.system);

//  ============================================================================
//  APP Logging Extensions
//  ============================================================================

/**
 * Extensions specifically for the APP branch of logging. The methods here
 * mirror the basic if[Level] and APP[level] methods found on the TP object but
 * they leverage the APP logger as their primary root rather than the TP logger.
 */

//  ----------------------------------------------------------------------------
//  TODO: convert these into traits, or some other approach for sharing...
//  ----------------------------------------------------------------------------

APP.getDefaultLogger = TP.getDefaultLogger;
APP.getLogger = TP.getLogger;
APP.getLogLevel = TP.getLogLevel;
APP.setLogLevel = TP.setLogLevel;

APP.ifTrace = TP.ifTrace;
APP.ifDebug = TP.ifDebug;
APP.ifInfo = TP.ifInfo;
APP.ifWarn = TP.ifWarn;
APP.ifError = TP.ifError;
APP.ifFatal = TP.ifFatal;
APP.ifSystem = TP.ifSystem;

APP.$log = TP.$log;
APP.trace = TP.trace;
APP.debug = TP.debug;
APP.info = TP.info;
APP.warn = TP.warn;
APP.error = TP.error;
APP.fatal = TP.fatal;
APP.system = TP.system;

//  ============================================================================
//  TP.sys
//  ============================================================================

//  ----------------------------------------------------------------------------
//  CSS LOGGING
//  ----------------------------------------------------------------------------

/**
 * All CSS processor output can be captured in the CSS log for review provided
 * that TP.sys.shouldLogCSS() is true.
 */

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('logCSS',
function(anObject, aLogLevel) {

    /**
     * @method logCSS
     * @summary Adds anObject to the CSS log. This method will have no effect
     *     if the TP.sys.shouldLogCSS() flag is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     */

    if (!TP.sys.shouldLogCSS()) {
        return false;
    }

    TP.sys.$$log(TP.ac(TP.CSS_LOG, anObject), aLogLevel);

    return true;
});

//  ----------------------------------------------------------------------------
//  INFERENCE LOGGING
//  ----------------------------------------------------------------------------

/*
The inference log is a simple log for tracking activity of the inferencing
engine. All messages generated by the inference engine show up here, with
content that often includes the message, target, arguments, etc.
*/

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('logInference',
function(anObject, aLogLevel) {

    /**
     * @method logInference
     * @summary Adds anObject to the inference log. This method will have no
     *     effect if the TP.sys.shouldLogInferences() flag is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     */

    if (!TP.sys.shouldLogInferences()) {
        return false;
    }

    TP.sys.$$log(TP.ac(TP.INFERENCE_LOG, anObject), aLogLevel);

    return true;
});

//  ----------------------------------------------------------------------------
//  IO LOGGING
//  ----------------------------------------------------------------------------

/*
The IO log tracks activity of communication primitives for both file and http
access. All messages generated by communication calls show up here allowing you
to see a single view of all server or host communication.
*/

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('logIO',
function(anObject, aLogLevel) {

    /**
     * @method logIO
     * @summary Logs anObject to the IO log. Note that this method will have no
     *     effect if TP.sys.shouldLogIO() is false.
     * @summary This call is used by various file and http access routines
     *     to log their activity. The object argument can provide data in one or
     *     more keys including:
     *
     *     'uri'            the targetUrl
     *     'uriparams'      optional parameters for url-encoding,
     *     'separator'      optional uri parameter separator
     *
     *     'headers'        http headers, or response headers,
     *     'async'          true or false
     *     'method'         the command method (GET/POST/PUT/DELETE etc)
     *     'body'           any data content for the call,
     *
     *     'noencode'       turns off body content encoding 'mimetype'
     *     'mimetype'       used for body encoding 'encoding'
     *     'charset'        encoding used for multi-part
     *     'multiparttypes' used for multi-part encodings
     *
     *     'commObj'        the XMLHttpRequest object used, if any
     *
     *     'request'        TP.sig.Request reference
     *     'response'       TP.sig.Response reference
     *
     *     'direction'      TP.SEND or TP.RECV
     *     'message'        the log message
     *     'object'         any Error object which might be related,
     *
     *     'finaluri'       the fully expanded uri w/parameters
     *     'finalbody'      the TP.str(body) value actually sent
     *
     *     Note that IO log entries will only be pushed to the activity log (and
     *     stdout) when the logging level is INFO.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     */

    if (!TP.sys.shouldLogIO()) {
        return false;
    }

    TP.sys.$$log(TP.ac(TP.IO_LOG, anObject), aLogLevel);

    return true;
});

//  ----------------------------------------------------------------------------
//  JOB LOGGING
//  ----------------------------------------------------------------------------

/*
The job log contains information on all TP.core.Job processing done by TIBET.
The TP.core.Job type manages virtually all setInterval/setTimeout style
processing in TIBET so that all asynchronous processing can be managed
consistently.
*/

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('logJob',
function(anObject, aLogLevel) {

    /**
     * @method logJob
     * @summary Logs a job-related event. This method has no effect if
     *     TP.sys.shouldLogJobs() is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     */

    if (!TP.sys.shouldLogJobs()) {
        return false;
    }

    TP.sys.$$log(TP.ac(TP.JOB_LOG, anObject), aLogLevel);

    return true;
});

//  ----------------------------------------------------------------------------
//  KEY LOGGING
//  ----------------------------------------------------------------------------

/*
The key log contains information on all key events being logged. Logging keys
can be a useful way to help adjust keyboard map entries.
*/

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('logKey',
function(anObject, aLogLevel) {

    /**
     * @method logKey
     * @summary Logs a key event. This method has no effect if
     *     TP.sys.shouldLogKeys() is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     */

    if (!TP.sys.shouldLogKeys()) {
        return false;
    }

    TP.sys.$$log(TP.ac(TP.KEY_LOG, anObject), aLogLevel);

    return true;
});

//  ----------------------------------------------------------------------------
//  LINK LOGGING
//  ----------------------------------------------------------------------------

/*
The link log contains information on all links traversed via TIBET's link
methods such as TP.go2(). This information can be used to provide valuable
usability analysis data, user tracking data, or debugging information on the
path a user took up to the point of an error.
*/

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('logLink',
function(anObject, aLogLevel) {

    /**
     * @method logLink
     * @summary Logs a link activation event. This method has no effect if
     *     TP.sys.shouldLogLinks() is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     */

    if (!TP.sys.shouldLogLinks()) {
        return false;
    }

    TP.sys.$$log(TP.ac(TP.LINK_LOG, anObject), aLogLevel);

    return true;
});

//  ----------------------------------------------------------------------------
//  MOUSE LOGGING
//  ----------------------------------------------------------------------------

/*
The mouse log contains information on all mouse events being logged. Logging
mouse events can be a useful way to debug code like drag and drop.
*/

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('logMouse',
function(anObject, aLogLevel) {

    /**
     * @method logMouse
     * @summary Logs a mouse event. This method has no effect if
     *     TP.sys.shouldLogMouse() is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     */

    if (!TP.sys.shouldLogMouse()) {
        return false;
    }

    TP.sys.$$log(TP.ac(TP.MOUSE_LOG, anObject), aLogLevel);

    return true;
});

//  ----------------------------------------------------------------------------
//  SECURITY LOGGING
//  ----------------------------------------------------------------------------

/*
Security events such as requesting permissions on Mozilla or performing a
cross-domain HTTP request can be logged separately (and are by default).
*/

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('logSecurity',
function(anObject, aLogLevel) {

    /**
     * @method logSecurity
     * @summary Logs a security event. This method has no effect if
     *     TP.sys.shouldLogSecurity() is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     */

    if (!TP.sys.shouldLogSecurity()) {
        return false;
    }

    TP.sys.$$log(TP.ac(TP.SECURITY_LOG, anObject), aLogLevel);

    return true;
});

//  ----------------------------------------------------------------------------
//  SIGNAL LOGGING
//  ----------------------------------------------------------------------------

/*
The signal log tracks the activity of the TIBET signaling engine. This subset of
log entries can be critical to understanding how your application operates. The
log entries typically contain the signal object itself.
*/

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('logSignal',
function(anObject, aLogLevel) {

    /**
     * @method logSignal
     * @summary Logs a signaling message to the activity log. The signal string
     *     typically contains the origin, signal name, context, and any
     *     arguments which were passed.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     */

    if (!TP.sys.shouldLogSignals()) {
        return false;
    }

    TP.sys.$$log(TP.ac(TP.SIGNAL_LOG, anObject.get('message')), aLogLevel);

    return true;
});

//  ----------------------------------------------------------------------------
//  TRANSFORM LOGGING
//  ----------------------------------------------------------------------------

/*
The transform log contains all output from the content processing system. The
TP.sys.shouldLogTransforms() method controls whether logging actually occurs.
*/

//  ----------------------------------------------------------------------------

TP.sys.defineMethod('logTransform',
function(anObject, aLogLevel) {

    /**
     * @method logTransform
     * @summary Logs a content transfomation event to the transform log.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     */

    if (!TP.sys.shouldLogTransforms()) {
        return false;
    }

    TP.sys.$$log(TP.ac(TP.TRANSFORM_LOG, anObject), aLogLevel);

    return true;
});

//  ============================================================================
//  Console Appender
//  ============================================================================

/**
 * An appender specific to output to the typical JavaScript console object.
 */
TP.log.Appender.defineSubtype('ConsoleAppender');

//  ----------------------------------------------------------------------------

/**
 * The default layout type for this appender.
 * @type {TP.log.Layout}
 */
TP.log.ConsoleAppender.Type.$set('defaultLayoutType', 'TP.log.ConsoleLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.ConsoleAppender.Inst.defineMethod('append',
function(anEntry) {

    /**
     * @method append
     * @summary Formats the entry data using the receiver's layout and writes it
     *     to the console using the best console API method possible.
     * @param {TP.log.Entry} anEntry The log entry to format and append.
     * @returns {TP.log.Appender} The receiver.
     */

    var name,
        writer,
        layout,
        content;

    //  Remap our logging level to the standardized browser console logging
    //  level. TIBET semantics and browser semantics sometimes differ...
    name = anEntry.getLevel().get('name').toLowerCase();
    switch (name) {
        case 'error':
        case 'fatal':
            writer = 'error';
            break;
        case 'info':
            writer = 'info';
            break;
        case 'trace':
            //  Chrome at least treats 'debug' as a 'verbose' mode so use that
            //  if found, otherwise just use standard logging.
            writer = TP.isValid(top.console.debug) ? 'debug' : 'log';
            break;
        default:
            //  debug, system, all
            writer = 'log';
            break;
    }

    //  If the entry contains multiple parts and we have access to a
    //  group/groupEnd api via the console we'll group our output to help show
    //  that it's all the result of a single logging call...
    //  TODO:

    //  Format the little critter...
    layout = this.getLayout();
    content = layout.layout(anEntry).at('content');

    //  If the content matches the TSH_NO_VALUE, exit here - we don't log that
    //  value.
    if (TP.regex.TSH_NO_VALUE_MATCHER.test(content)) {
        return this;
    }

    try {
        top.console[writer](content);
    } catch (e) {
        top.console.log(content);
    }

    //  Verify one last thing...we didn't just blow the stack did we? For some
    //  reason, possibly a catch block in the wrong place we've yet to find,
    //  this is the only way we can ensure certain code can trap recusion
    //  errors.
    if (/maximum call stack/i.test(content)) {
        $STATUS = TP.FAILED;
    }

    return this;
});

//  ============================================================================
//  Console Layout
//  ============================================================================

/**
 * A layout specific to JavaScript console output.
 */
TP.log.Layout.defineSubtype('ConsoleLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.ConsoleLayout.Inst.defineMethod('layout',
function(anEntry) {

    /**
     * @method layout
     * @summary Formats an entry. The default output format for top.console is:
     *     {ms} - {level} {logger} - {string}
     * @param {TP.log.Entry} anEntry The entry to format.
     * @returns {TP.core.Hash} A hash of output containing at least one key,
     *     'content'.
     */

    var str,
        marker,
        arglist;

    str = '' + anEntry.getDate().asTimestamp() + ' - ' +
                anEntry.getLogger().get('name') + ' ' +
                anEntry.getLevel().get('name');

    //  If there's a marker we can output that as well...
    marker = anEntry.getMarker();
    if (TP.isValid(marker)) {
        str += ' [' + marker.get('name') + ']';
    }

    //  The arglist may have multiple elements in it which we need to handle.
    arglist = anEntry.getArglist();
    if (TP.isValid(arglist)) {
        str += ' - ';
        arglist.forEach(function(item) {
            str += TP.str(item);
            str += ' ';
        });
        str = str.trim();
        if (str.charAt(str.getSize() - 1) !== '.') {
            str += '.';
        }
    }

    return TP.hc('content', str);
});

//  ============================================================================
//  Arglist Layout
//  ============================================================================

/**
 * A simple layout specific to JavaScript console output which doesn't include
 * any timestamp or leveling data, just the content of the Entry argument list.
 */
TP.log.Layout.defineSubtype('ArglistLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.ArglistLayout.Inst.defineMethod('layout',
function(anEntry) {

    /**
     * @method layout
     * @summary Formats an entry using only the argument list, no timestamp,
     *     level, or other information.
     * @param {TP.log.Entry} anEntry The entry to format.
     * @returns {TP.core.Hash} A hash of output containing at least one key,
     *     'content'.
     */

    var str,
        arglist;

    str = '';

    //  The arglist may have multiple elements in it which we need to handle.
    arglist = anEntry.getArglist();

    if (TP.isValid(arglist)) {
        arglist.forEach(function(item) {
            str += TP.str(item);
            str += ' ';
        });
        str = str.trim();
    }

    return TP.hc('content', str);
});

//  ============================================================================
//  CHANGE LOG
//  ============================================================================

TP.sys.defineMethod('logCodeChange',
function(anObject, aLogLevel) {

    /**
     * @method logCodeChange
     * @summary Adds source code to the change log. Returns true if the log
     *     entry is successful. This method will have no effect when the
     *     TP.sys.shouldLogCodeChanges() flag is false.
     * @param {Object} anObject The source code change to log.
     * @param {Number} aLogLevel The logging level. Ignored for this call. Code
     *     changes are always logged at TP.SYSTEM level.
     * @returns {Boolean} True if the logging operation succeeded.
     */

    if (!TP.sys.shouldLogCodeChanges()) {
        return false;
    }

    TP.sys.$$log(TP.ac(TP.CHANGE_LOG, anObject), TP.SYSTEM);

    return true;
});

//  ----------------------------------------------------------------------------
//  ChangeLog Appender
//  ----------------------------------------------------------------------------

/**
 * An appender specific to tracking code changes that have been logged.
 */
TP.log.Appender.defineSubtype('ChangeLogAppender');

//  ----------------------------------------------------------------------------

/**
 * The default layout type for this appender.
 * @type {TP.log.Layout}
 */
TP.log.ChangeLogAppender.Type.$set('defaultLayoutType', 'TP.log.ArglistLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.ChangeLogAppender.Inst.defineMethod('append',
function(anEntry) {

    /**
     * @method append
     * @summary Formats the entry data using the receiver's layout and writes it
     *     to the console. Logging is always done using the default 'log' call
     *     rather than a call which might alter the output in any form.
     * @param {TP.log.Entry} anEntry The log entry to format and append.
     * @returns {TP.log.Appender} The receiver.
     */

    var layout,
        content;

    layout = this.getLayout();
    content = layout.layout(anEntry).at('content');

    //  If the content matches the TSH_NO_VALUE, exit here - we don't log that
    //  value.
    if (TP.regex.TSH_NO_VALUE_MATCHER.test(content)) {
        return this;
    }

    top.console.log(content);

    return this;
});

//  ----------------------------------------------------------------------------
//  Configuration
//  ----------------------------------------------------------------------------

(function() {
    var logger,
        appender;

    logger = TP.getLogger(TP.CHANGE_LOG);
    appender = TP.log.ChangeLogAppender.construct();

    logger.inheritsAppenders(false);
    logger.addAppender(appender);
    logger.setLevel(TP.log.ALL);
}());

//  ============================================================================
//  TEST LOG
//  ============================================================================

TP.sys.defineMethod('logTest',
function(anObject, aLogLevel) {

    /**
     * @method logTest
     * @summary Adds an entry to the test log. Note that there is no level
     *     filtering in test logging, the level parameter only filters parallel
     *     entries which might be made to the activity log.
     * @param {Object} anObject The test data to log. This can range from a
     *     simple object to a hash, TP.test.Suite, or TP.test.Case. Common
     *     keys should follow TP.core.JobControl standards such as statusCode,
     *     statusText, etc. Note that not all appenders designed for the test
     *     log will use all keys.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     */

    if (TP.isString(anObject)) {
        TP.sys.$$log(TP.ac(TP.TEST_LOG,
            TP.hc('statusCode', TP.ACTIVE, 'statusText', anObject)), aLogLevel);

        return true;
    }

    TP.sys.$$log(TP.ac(TP.TEST_LOG, anObject), aLogLevel);

    return true;
});

//  ----------------------------------------------------------------------------
//  TestLog Layout
//  ----------------------------------------------------------------------------

/**
 * A simple layout specific to processing test log input data.
 */
TP.log.Layout.defineSubtype('TestLogLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.TestLogLayout.Inst.defineMethod('layout',
function(anEntry) {

    /**
     * @method layout
     * @summary Extracts the first object logged in the log entry to produce a
     *     hash containing that object as the 'content' to be logged.
     * @param {TP.log.Entry} anEntry The entry to format.
     * @returns {TP.core.Hash} A hash of output containing at least one key,
     *     'content'.
     */

    var arglist;

    //  TODO:   we currently rely on historical TAP output being generated by
    //  the logging system rather than generating it ourselves. Probably need to
    //  adjust that so we do the TAP formatting in the layout. That would mean
    //  processing the entry argument list more here.
    arglist = anEntry.getArglist();

    //  The first object in the list is the one with status info for the test.
    return TP.hc('content', arglist.first());
});

//  ----------------------------------------------------------------------------
//  TestLog Appender
//  ----------------------------------------------------------------------------

/**
 * An appender specific to outputting test log data to the browser console.
 */
TP.log.Appender.defineSubtype('TestLogAppender');

//  ----------------------------------------------------------------------------

/**
 * The default layout type for this appender.
 * @type {TP.log.Layout}
 */
TP.log.TestLogAppender.Type.$set('defaultLayoutType', 'TP.log.TestLogLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.TestLogAppender.Inst.defineMethod('append',
function(anEntry) {

    /**
     * @method append
     * @summary Processes a test log entry and logs it to either the system
     *     console or to the appropriate TIBET stdio function.
     * @param {TP.log.Entry} anEntry The log entry to format and append.
     * @returns {TP.log.Appender} The receiver.
     */

    var name,
        writer,

        layout,
        results,
        content,
        message,
        asIs,
        cmdID,
        stdio,

        rootRequest;

    //  Try to find a matching console API method to our level name. If we find
    //  it we'll use that to output the message content.
    name = anEntry.getLevel().get('name').toLowerCase();
    switch (name) {
        case 'warn':
            writer = 'warn';
            stdio = 'stdout';
            break;
        case 'error':
        case 'fatal':
            writer = 'error';
            stdio = 'stderr';
            break;
        default:
            //  trace, debug, info, system, all
            writer = 'log';
            stdio = 'stdout';
            break;
    }

    //  If the entry contains multiple parts and we have access to a
    //  group/groupEnd api via the console we'll group our output to help show
    //  that it's all the result of a single logging call...
    //  TODO:

    //  Format the little critter...
    layout = this.getLayout();

    results = layout.layout(anEntry);
    content = results.at('content');

    //  Content should be either a hash containing job status-like data, or an
    //  Error object if reporting on a failed/errored test condition.
    if (TP.isString(content)) {
        message = content;
    } else if (TP.canInvoke(content, 'at')) {
        message = content.at('statusText');
    } else if (TP.isError(content)) {
        message = content.message || content.name;
    } else {
        message = TP.str(content);
    }

    asIs = results.at('cmdAsIs');

    //  If we don't use the console (but rely on stdio) PhantomJS won't be
    //  happy.
    if (TP.sys.cfg('boot.context') === 'phantomjs') {

        //  If the content matches the TSH_NO_VALUE, exit here - we don't log
        //  that value.
        if (TP.regex.TSH_NO_VALUE_MATCHER.test(message)) {
            return this;
        }

        try {
            top.console[writer](message);
        } catch (e) {
            top.console.log(message);
        }
    } else {

        rootRequest = TP.test.Suite.get('$rootRequest');

        if (TP.isValid(rootRequest)) {
            cmdID = rootRequest.getRootID();
        }

        TP[stdio](
            message,
            TP.hc('cmdTAP', true, 'cmdAsIs', asIs, 'cmdID', cmdID));
    }

    return this;
});

//  ----------------------------------------------------------------------------
//  Configuration
//  ----------------------------------------------------------------------------

(function() {
    var logger,
        appender;

    logger = TP.getLogger(TP.TEST_LOG);

    appender = TP.log.TestLogAppender.construct();

    logger.inheritsAppenders(false);
    logger.addAppender(appender);
    logger.setLevel(TP.log.ALL);
}());

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
