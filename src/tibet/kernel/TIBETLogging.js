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
 * Loosely based on log4j 2.0 but adjusted to fit TIBET's unique requirements
 * and patterns.
 *
 * The major aspects of the log4js 2.0 architecture and API are supported
 * including Manager, Logger, Appender, Layout, Filter, Marker, and Entry types.
 * Some API changes have been made where we either wanted to maintain
 * consistency with TIBET API or extend the functionality of the logging system,
 * otherwise we've tried to maintain consistency with the core of log4j 2.0.
 */

//  ----------------------------------------------------------------------------

/**
 * The namespace responsible for all framework logging.
 */
TP.defineNamespace('log', 'TP');

//  ============================================================================
//  Manager
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
 * @type {TP.lang.Hash}
 */
TP.log.Manager.defineAttribute('loggers', TP.hc());

//  ----------------------------------------------------------------------------

/**
 * The name of the root logger. This is normally stripped from any logging
 * output.
 * @type {String}
 */
TP.log.Manager.Type.defineConstant('ROOT_LOGGER_NAME', 'LOG');

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('exists', function(aName) {

    /**
     * @name exists
     * @summary Returns true if the named logger exists. This method provides a
     *     way to check for existence without creating a new logger if it does
     *     not yet exist (as getLogger does).
     * @param {String} aName The logger to verify.
     * @return {Boolean} True if the named logger exists.
     */

    return TP.isValid(this.loggers.at(aName));
});

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('getLogger', function(aName) {

    /**
     * @name getLogger
     * @summary Returns the logger instance with the specified name. If the
     *     instance does not exist it is created, registered, and returned as a
     *     result of this call.
     * @param {String} aName The logger to return, or create and return.
     * @return {TP.log.Logger} The named logger instance.
     */

    var logger;

    logger = this.loggers.at(aName);
    if (TP.isValid(logger)) {
        return logger;
    }

    return TP.log.Logger.construct(aName);
});

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('getRootLogger', function() {

    /**
     * @name getRootLogger
     * @summary Returns the root logger for TIBET. This logger instance is the
     *     "parent" instance for the TP and APP log instances. This logger has
     *     no name with respect to logging output.
     * @return {TP.log.Logger} The root logger instance.
     */

    return this.getLogger(this.ROOT_LOGGER_NAME);
});

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('initialize', function(aName) {

    /**
     * @name initialize
     * @summary Initializes the class, ensuring that the initial root and
     *     primary logger instances are created.
     * @return {TP.log.Manager} The receiver.
     */

    // Force construction of the root logger on startup.
    TP.log.Manager.getRootLogger();

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('registerLogger', function(aLogger) {

    /**
     * @name registerLogger
     * @summary Registers a logger instance by name.
     * @param {TP.log.Logger} aLogger The logger to register.
     * @return {TP.log.Manager} The receiver.
     */

    if (this.exists(aLogger.getName())) {
        return this.raise('DuplicateRegistration');
    }

    this.loggers.atPut(aLogger.getName(), aLogger);

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Manager.Type.defineMethod('removeLogger', function(aLogger) {

    /**
     * @name removeLogger
     * @summary Removes a logger instance by name.
     * @param {TP.log.Logger} aLogger The logger to remove.
     * @return {TP.log.Manager} The receiver.
     */

    if (this.exists(aLogger.getName())) {
        this.loggers.removeKey(aLogger.getName());
    }

    return this;
});

//  ============================================================================
//  Nestable
//  ============================================================================

/**
 * A common root type for objects in the logging system whose naming represents
 * a hierarchy of sorts. Two examples are Logger and Marker instances.
 */
TP.lang.Object.defineSubtype('log.Nestable');

// TP.log.Nestable is an abstract supertype. You can't create instances
// directly.
TP.log.Nestable.isAbstract(true);

//  ----------------------------------------------------------------------------

TP.log.Nestable.Type.defineMethod('getInstanceByName', function(aName) {

    /**
     * Returns the instance whose name matches the name provided. If the
     * instance doesn't exist this method will not create it.
     * @return {TP.log.Logger} The named instance.
     */

    TP.override();
});

//  ----------------------------------------------------------------------------
//  Nestable - Instance Definition
//  ----------------------------------------------------------------------------

/**
 * The list of ancestors for the receiver. This is computed once and cached.
 * @type {Array.<TP.log.Nestable>}
 */
TP.log.Nestable.Inst.defineAttribute('ancestors');

//  ----------------------------------------------------------------------------

/**
 * The list of ancestor names for the receiver. This is computed once and
 * cached.
 * @type {Array.<String>}
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

TP.log.Nestable.Inst.defineMethod('getName', function() {

    /**
     * @name getName
     * @summary Returns the name of the marker.
     * @return {String} The marker name.
     */

    return this.name;
});

//  ----------------------------------------------------------------------------

TP.log.Nestable.Inst.defineMethod('init', function(aName) {

    /**
     * @name init
     * @summary Initializes new instances, configuring their default values etc.
     * @param {String} aName The marker's name. May include '.' for hierarchy.
     * @return {TP.log.Nestable} The new marker instance.
     */

    this.callNextMethod();

    this.name = aName;

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Nestable.Inst.defineMethod('getAncestors', function() {

    /**
     * @name getAncestors
     * @summary Returns a list of all ancestor instances for the receiver.
     * @return {Array.<TP.log.Nestable>} The ancestor list.
     */

    var ancestors;
    var type;

    ancestors = this.$get('ancestors');
    if (TP.isValid(ancestors)) {
        return ancestors;
    }

    type = this.getType();

    ancestors = this.getAncestorNames().map(function(name) {
        return type.getInstanceByName(name);
    });

    this.ancestors = ancestors;

    return ancestors;
});

//  ----------------------------------------------------------------------------

TP.log.Nestable.Inst.defineMethod('getAncestorNames', function() {

    /**
     * @name getAncestorNames
     * @summary Returns a list of all ancestor instance names for the receiver.
     * @return {Array.<TP.log.Nestable>} The ancestor list.
     */

    var str;
    var names;

    names = this.$get('ancestorNames');
    if (TP.isValid(names)) {
        return names;
    }

    str = this.getName();
    names = TP.ac();

    while (str.indexOf('.') !== TP.NOT_FOUND) {
        str = str.slice(0, str.lastIndexOf('.'));
        names.push(str);
    }

    this.ancestorNames = names;

    return this.ancestorNames;
});

//  ----------------------------------------------------------------------------

TP.log.Nestable.Inst.defineMethod('getParent', function() {

    /**
     * @name getParent
     * @summary Returns the receiver's parent instance, the instance whose name
     *     is one "level" above the receiver.
     * @return {TP.log.Nestable} The parent instance.
     */

    var pname;
    var parent;

    if (TP.isValid(this.parent)) {
        return this.parent;
    }

    if (this.name.indexOf('.') === TP.NOT_FOUND) {
        return;
    }

    pname = this.name.slice(0, this.name.lastIndexOf('.'));
    parent = this.getType().getInstanceByName(pname);

    this.parent = parent;

    return parent;
});

//  ============================================================================
//  Defaulted
//  ============================================================================

/**
 * A common type for default-able logger containers (APP and TP essentially).
 */

TP.lang.Object.defineSubtype('log.Defaulted');

// TP.log.Filtered is designed as a trait to be used/mixed in.
TP.log.Defaulted.isAbstract(true);

//  ----------------------------------------------------------------------------

/**
 * The default logger instance.
 * @type {TP.log.Logger}
 */
TP.log.Defaulted.defineAttribute('$defaultLogger');

//  ----------------------------------------------------------------------------

TP.log.Defaulted.defineMethod('getDefaultLogger', function() {

    /**
     * @name getDefaultLogger
     * @summary Returns the default application logger instance.
     * @return {TP.log.Logger} The default logger instance.
     */

    var logger;

    logger = this.$get('defaultLogger');
    if (TP.notValid(logger)) {
        logger = this.getLogger();
    }

    return logger;
});

//  ----------------------------------------------------------------------------

TP.log.Defaulted.defineMethod('setDefaultLogger', function(aLogger) {

    /**
     * @name setDefaultLogger
     * @summary Defines the default application logger instance.
     * @param {TP.log.Logger} aLogger The logger to register as the default.
     * @return {TP.log.Logger} The receiver.
     */

    if (!TP.isKindOf(aLogger, TP.log.Logger)) {
        return this.raise('InvalidParameter');
    }

    this.$set('$defaultLogger', aLogger);

    return this;
});

//  ============================================================================
//  Filtered
//  ============================================================================

/**
 * A trait intended to be leveraged by Logger and Appender which both rely on
 * filtering logic and TP.log.Filter instances.
 * @type {TP.log.Filtered}
 */
TP.lang.Object.defineSubtype('log.Filtered');

// TP.log.Filtered is designed as a trait to be used/mixed in.
TP.log.Filtered.isAbstract(true);

//  ----------------------------------------------------------------------------
//  Filtered - Instance Definition
//  ----------------------------------------------------------------------------

/**
 * The instance's list of filters. Can be empty.
 @type {Array.<TP.log.Filter>}
 */
TP.log.Filtered.Inst.defineAttribute('filters');

//  ----------------------------------------------------------------------------

TP.log.Filtered.Inst.defineMethod('addFilter', function(aFilter) {

    /**
     * @name addLayout
     * @summary Adds a new filter to the receiver. Instances can have 0 to N
     *     filters defined.
     * @param {TP.log.Filter} aFilter The new filter to add.
     */

    if (TP.notValid(this.filters)) {
        this.filters = TP.ac();
    }

    this.filters.push(aFilter);
});

//  ----------------------------------------------------------------------------

TP.log.Filtered.Inst.defineMethod('clearFilters', function() {

    /**
     * @name clearFilters
     * @summary Empties the receiver's filter list.
     * @return {TP.log.Filtered} The receiver.
     */

    this.filters = null;

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Filtered.Inst.defineMethod('filter', function(anEntry) {

    /**
     * @name filter
     * @summary Verifies that the entry should be logged by the receiver. The
     *     first check is the entry level but the entry is also checked by any
     *     filters for the receiver or its parent chain (if filters inherit).
     *     NOTE that unlike log4j TIBET filtering simply checks that no filter
     *     blocks the entry. There is no "neutral" or "pass and ignore others"
     *     option in our implementation of filters.
     * @return {TP.log.Entry} The entry, if it isn't filtered.
     */

    var filters;
    var results;

    if (TP.notValid(anEntry)) {
        return;
    }

    if (!this.isEnabled(anEntry.getLevel())) {
        return;
    }

    filters = this.getFilters();
    if (TP.notEmpty(filters)) {
        results = filters.map(function(filter) {
            return filter.filter(anEntry);
        });

        if (results.contains(false)) {
            return;
        }
    }

    return anEntry;
});

//  ----------------------------------------------------------------------------

TP.log.Filtered.Inst.defineMethod('getFilters', function() {

    /**
     * @name getFilters
     * @summary Returns an array of filters for the receiver. If the receiver
     *     inheritsFilters() the list includes all inherited filters.
     * @return {Array<.TP.log.Filter>} The filter list.
     */

    return this.filters || TP.ac();
});


//  ============================================================================
//  Leveled
//  ============================================================================

/**
 * A trait intended to be leveraged by types which can limit their logging based
 * on a log entry level.
 * @type {TP.log.Leveled}
 */
TP.lang.Object.defineSubtype('log.Leveled');

// TP.log.Leveled is designed as a trait to be used/mixed in.
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

TP.log.Leveled.Inst.defineMethod('getLevel', function() {

    /**
     * @name getLevel
     * @summary Returns the logging level for the receiver. Defaults to ALL.
     * @return {Number} The current logging level.
     */

    return this.level || TP.log.ALL;
});

//  ----------------------------------------------------------------------------

TP.log.Leveled.Inst.defineMethod('isEnabled', function(aLevel) {

    /**
     * @name isEnabled
     * @summary Returns true if the receiver can log at the level provided.
     * @param {TP.log.Level} aLevel The level to verify.
     * @return {Boolean} True if the receiver can log at aLevel.
     */

    // Is the level provided "enabled" eg. "visible" relative to our threshold.
    return aLevel.isVisibleAt(this.getLevel());
});

//  ----------------------------------------------------------------------------

TP.log.Leveled.Inst.defineMethod('setLevel', function(aLevel) {

    /**
     * @name setLevel
     * @summary Sets the logging level for the receiver.
     * @param {TP.log.Level} aLevel The new level to set.
     * @return {TP.log.Logger} The receiver.
     */

    this.$set('level', aLevel);
});


//  ============================================================================
//  Logger
//  ============================================================================

/**
 * The primary logging type whose filter/appender/layout configurations define
 * how log entries are processed.
 * @type {TP.log.Logger}
 */
TP.log.Nestable.defineSubtype('log.Logger');

//  ----------------------------------------------------------------------------

TP.log.Logger.addTraitsFrom(TP.log.Leveled);
TP.log.Logger.addTraitsFrom(TP.log.Filtered);

// Logger's inherit from their ancestor chain so we need to preserve getters.
TP.log.Logger.Inst.resolveTraits(
    TP.ac('getLevel', 'getFilters', 'getParent'),
    TP.log.Logger);

//  Resolve traits now that definition is complete.
TP.log.Logger.executeTraitResolution();

//  ----------------------------------------------------------------------------

/**
 * A default instance of appender which can be reused by loggers which don't
 * have one configured directly.
 * @type {TP.log.Appender}
 */
TP.log.Logger.Type.defineAttribute('defaultAppender');

//  ----------------------------------------------------------------------------

TP.log.Logger.Type.defineMethod('construct', function(aName) {

    /**
     * @name construct
     * @summary Allocates and initializes a new logger instance. Note that while
     *     aName can be in any case loggers are uniqued by their lower-case
     *     names so 'test', 'Test', and 'TEST' will all return the same logger.
     *     The first registered logger's name is the one preserved.
     * @param {String} aName The new logger's name.
     * @return {TP.log.Logger} The newly created Logger.
     */

    var name;
    var logger;

    if (TP.isEmpty(aName)) {
        return this.raise('InvalidName');
    }

    // We unique based on lower-case names to avoid confusion. The lower-case
    // name is only used as a key however, not as the logger's actual name.
    name = aName.toLowerCase();

    if (TP.log.Manager.exists(name)) {
        return TP.log.Manager.getLogger(name);
    }

    logger = this.callNextMethod();
    TP.log.Manager.registerLogger(logger);

    return logger;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Type.defineMethod('getDefaultAppender', function() {

    /**
     * Returns an instance of the default appender type for the receiver.
     * @return {TP.log.Appender} The default appender instance.
     */

    var name;
    var type;
    var inst;

    name = this.$get('defaultAppender');
    if (TP.notEmpty(name)) {
        type = TP.sys.getTypeByName(name);
    }

    if (TP.notValid(type)) {
        name = TP.sys.cfg('log.default_appender');
        if (TP.notEmpty(name)) {
            type = TP.sys.getTypeByName(name);
        }
    }

    if (TP.notValid(type)) {
        switch (TP.sys.cfg('boot.context')) {
            case 'phantomjs':
                type =  TP.sys.getTypeByName('TP.log.PhantomAppender');
                break;
            default:
                type = TP.sys.getTypeByName('TP.log.BrowserAppender');
                break;
        }
    }

    // If the types in question can't be located use one from this file...
    if (TP.notValid(type)) {
        type = TP.sys.getTypeByName('TP.log.Appender');
    }

    inst = type.construct();
    this.defaultAppender = inst;

    return inst;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Type.defineMethod('getInstanceByName', function(aName) {

    /**
     * Returns the instance whose name matches the name provided. If the
     * instance doesn't exist this method will not create it.
     * @return {TP.log.Logger} The named instance.
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
 @type {Array.<TP.log.Appender>}
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
 @type {Array.<TP.log.Entry>}
 */
TP.log.Logger.Inst.defineAttribute('entries');

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('init', function(aName) {

    /**
     * @name init
     * @summary Initializes new instances, configuring their default values etc.
     * @param {String} aName The logger's name. May include '.' for hierarchy.
     * @return {TP.log.Logger} The new logger instance.
     */

    var type;

    this.callNextMethod();

    // We have some special setup for the root logger to ensure it acts as a
    // proper backstop for level and parent searching.
    if (this.$get('name') === TP.log.Manager.ROOT_LOGGER_NAME) {

        // TODO: convert to log.level when ready.
        this.level = TP.log.Level.getLevel('info');

        // The root doesn't inherit anything.
        this.additiveAppenders = false;
        this.additiveFilters = false;

        // We need a default appender at the root level to backstop things.
        this.addAppender(this.getType().getDefaultAppender());
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('addAppender', function(anAppender) {

    /**
     * @name addAppender
     * @summary Adds a new appender to the logger. Loggers can have 0 to N
     *     appenders.
     * @param {TP.log.Appender} anAppender The new appender to add.
     * @return {TP.log.Logger} The receiver.
     */

    if (TP.notValid(this.appenders)) {
        this.appenders = TP.ac();
    }

    this.appenders.push(anAppender);
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('getAppenders', function() {

    /**
     * @name getAppenders
     * @summary Returns an array of appenders for the receiver. If the receiver
     *     inheritsAppenders() the list includes all inherited appenders.
     * @return {Array<.TP.log.Appender>} The appender list.
     */

    var appenders;

    if (!this.inheritsAppenders()) {
        return this.appenders;
    }

    appenders = this.getParent().getAppenders();
    if (TP.notEmpty(this.appenders) && TP.notEmpty(appenders)) {
        appenders = this.appenders.concat(appenders);
    } else {
        appenders = TP.ifInvalid(this.appenders, appenders);
    }

    return appenders;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('getFilters', function() {

    /**
     * @name getFilters
     * @summary Returns an array of filters for the receiver. If the receiver
     *     inheritsFilters() the list includes all inherited filters.
     * @return {Array<.TP.log.Filter>} The filter list.
     */

    var filters;

    if (!this.inheritsFilters()) {
        return this.filters;
    }

    filters = this.getParent().getFilters();
    if (TP.notEmpty(this.filters) && TP.notEmpty(filters)) {
        filters = this.filters.concat(filters);
    } else {
        filters = TP.ifInvalid(this.filters, filters);
    }

    return filters;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('getLevel', function() {

    /**
     * @name getLevel
     * @summary Returns the logging level for the receiver. This search may
     *     include traversing up the parent chain to return the first level
     *     which is specifically defined. Level is inherited bottom up.
     * @return {Number} The current logging level.
     */

    if (TP.isValid(this.level)) {
        return this.level;
    }

    return this.getParent().getLevel();
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('getParent', function() {

    /**
     * @name getParent
     * @summary Returns the receiver's parent logger, if any. The root logger
     *     will not have one but all other loggers will ultimately inherit from
     *     the root logger.
     * @return {TP.log.Logger} The parent logger.
     */

    var pname;
    var parent;

    if (TP.isValid(this.parent)) {
        return this.parent;
    }

    if (this.name === TP.log.Manager.ROOT_LOGGER_NAME) {
        return;
    }

    if (this.name.indexOf('.') === TP.NOT_FOUND) {
        parent = TP.log.Manager.getRootLogger();
    } else {
        pname = this.name.slice(0, this.name.lastIndexOf('.'));
        parent = TP.log.Manager.getLogger(pname);
    }

    this.parent = parent;

    return parent;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('inheritsAppenders', function(aFlag) {

    /**
     * @name inheritsAppenders
     * @summary Optionally updates and then returns the value for whether the
     *     receiver inherits appenders from ancestral loggers.
     * @param {Boolean} aFlag A new value for the inherited appender state.
     * @return {Boolean} The current inherited appender state.
     */

    if (aFlag !== undefined) {
        this.additiveAppenders = aFlag;
    }

    return this.additiveAppenders;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('inheritsFilters', function(aFlag) {

    /**
     * @name inheritsFilters
     * @summary Optionally updates and then returns the value for whether the
     *     receiver inherits filters from ancestral loggers.
     * @param {Boolean} aFlag A new value for the inherited filter state.
     * @return {Boolean} The current inherited filter state.
     */

    if (aFlag !== undefined) {
        this.additiveFilters = aFlag;
    }

    return this.additiveFilters;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('$logArglist', function(aLevel, arglist) {

    /**
     * @name $logArglist
     * @summary Logs one or more objects based on the argument list. This method
     *     is typically invoked via one of the common logging methods such as
     *     warn() or error() and therefore the arglist has a typical format.
     *     The result of this method is to invoke $logEntry() after constructing
     *     a logging entry for the inbound level and argument data.
     * @param {TP.log.Level} aLevel The level to log at.
     * @param {Array} arglist An array of arguments from the invoking function.
     *     Content should follow [aLevel, aMarkerOrObject, ..., anError]
     *     where the marker and error elements are optional but checked by this
     *     routine and processed if found. All other items are treated as
     *     content to be logged regardless of it particular type.
     */

     this.$logEntry(TP.log.Entry.construct(this, aLevel, arglist));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('$logEntry', function(anEntry) {

    /**
     * @name $logEntry
     * @summary Logs an entry based on the level, marker, and message content
     *     data found in the entry. This is the routine that handles the lower
     *     level work involved in filtering and forwarding to appenders. This
     *     method is invoked via $logArglist after that method constructs a log
     *     Entry owned by the receiver.
     * @param {TP.log.Entry} anEntry The log entry to output.
     */

    var entry;
    var appenders;

    entry = this.filter(anEntry);
    if (TP.notValid(entry)) {
        return;
    }

    appenders = this.getAppenders();
    if (TP.notEmpty(appenders)) {
        appenders.forEach(function(appender) {
            appender.log(entry);
        });
    }
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('trace', function(varargs) {

    /**
     * @name trace
     * @summary Log all arguments provided at trace level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {Object} varargs One or more arguments as desired.
     */

    if (!this.isEnabled(TP.log.TRACE)) {
        return;
    }

    return this.$logArglist(TP.log.TRACE, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('debug', function(varargs) {

    /**
     * @name debug
     * @summary Log all arguments provided at debug level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {Object} varargs One or more arguments as desired.
     */

    if (!this.isEnabled(TP.log.DEBUG)) {
        return;
    }

    return this.$logArglist(TP.log.DEBUG, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('info', function(varargs) {

    /**
     * @name info
     * @summary Log all arguments provided at info level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {Object} varargs One or more arguments as desired.
     */

    if (!this.isEnabled(TP.log.INFO)) {
        return;
    }

    return this.$logArglist(TP.log.INFO, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('warn', function(varargs) {

    /**
     * @name warn
     * @summary Log all arguments provided at warn level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {Object} varargs One or more arguments as desired.
     */

    if (!this.isEnabled(TP.log.WARN)) {
        return;
    }

    return this.$logArglist(TP.log.WARN, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('error', function(varargs) {

    /**
     * @name error
     * @summary Log all arguments provided at error level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {Object} varargs One or more arguments as desired.
     */

    if (!this.isEnabled(TP.log.ERROR)) {
        return;
    }

    return this.$logArglist(TP.log.ERROR, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('severe', function(varargs) {

    /**
     * @name severe
     * @summary Log all arguments provided at severe level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {Object} varargs One or more arguments as desired.
     */

    if (!this.isEnabled(TP.log.SEVERE)) {
        return;
    }

    return this.$logArglist(TP.log.SEVERE, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('fatal', function(varargs) {

    /**
     * @name fatal
     * @summary Log all arguments provided at fatal level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {Object} varargs One or more arguments as desired.
     */

    if (!this.isEnabled(TP.log.FATAL)) {
        return;
    }

    return this.$logArglist(TP.log.FATAL, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('system', function(varargs) {

    /**
     * @name system
     * @summary Log all arguments provided at system level. If there is a marker
     *     for this entry it should be the first argument.
     * @param {Object} varargs One or more arguments as desired.
     */

    if (!this.isEnabled(TP.log.SYSTEM)) {
        return;
    }

    return this.$logArglist(TP.log.SYSTEM, TP.ac(arguments));
});


//  ============================================================================
//  Appender
//  ============================================================================

/**
 * The core type for actual logging. Appender types and their instances do the
 * actual work of outputting log entries to various sinks such as the browser
 * console, the TIBET UI, or remote servers.
 */
TP.lang.Object.defineSubtype('log.Appender');

//  ----------------------------------------------------------------------------

// Appenders are leveled and filtered based on both level and filter content.
TP.log.Appender.addTraitsFrom(TP.log.Leveled);
TP.log.Appender.addTraitsFrom(TP.log.Filtered);

//  Resolve traits now that definition is complete.
TP.log.Appender.executeTraitResolution();

//  ----------------------------------------------------------------------------

/**
 * A default instance of layout which can be reused by appenders which don't
 * have one configured directly.
 * @type {TP.log.Layout}
 */
TP.log.Appender.Type.defineAttribute('defaultLayout');

//  ----------------------------------------------------------------------------

TP.log.Appender.Type.defineMethod('getDefaultLayout', function() {

    /**
     * Returns an instance of the default layout type for the receiver.
     * @return {TP.log.Layout} The default layout instance.
     */

    var name;
    var type;
    var inst;

    name = this.$get('defaultLayout');
    if (TP.notEmpty(name)) {
        type = TP.sys.getTypeByName(name);
    }

    if (TP.notValid(type)) {
        name = TP.sys.cfg('log.default_layout');
        if (TP.notEmpty(name)) {
            type = TP.sys.getTypeByName(name);
        }
    }

    if (TP.notValid(type)) {
        switch (TP.sys.cfg('boot.context')) {
            case 'phantomjs':
                type =  TP.sys.getTypeByName('TP.log.PhantomLayout');
            default:
                type = TP.sys.getTypeByName('TP.log.BrowserLayout');
        }
    }

    // If the types in question can't be located use one from this file...
    if (TP.notValid(type)) {
        type = TP.sys.getTypeByName('TP.log.Layout');
    }

    inst = type.construct();
    this.defaultLayout = inst;

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

TP.log.Appender.Inst.defineMethod('append', function(anEntry) {

    /**
     * @name append
     * @summary Formats the entry data using the receiver's layout, if any, and
     *     then outputs the content as appropriate. The default implementation
     *     simply returns (so TP.log.Appender is a "NullAppender" as it were).
     * @param {TP.log.Entry} anEntry The log entry to format and append.
     * @return {TP.log.Appender} The receiver.
     */

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('getLayout', function() {

    /**
     * @name getLayout
     * @summary Returns the layout used by the receiver. If no specific layout
     *     has been assigned TP.log.Appender.DEFAULT_LAYOUT_TYPE is used.
     * @param {TP.log.Layout} aLayout The layout to use.
     */

    return this.layout || this.getType().getDefaultLayout();
});

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('log', function(anEntry) {

    /**
     * @name log
     * @summary Invokes the receiver's filter method to filter anEntry and then
     *     invokes append() if the entry passes all the filters.
     * @param {TP.log.Entry} anEntry The log entry to output.
     */

    var entry;

    entry = this.filter(anEntry);
    if (TP.notValid(entry)) {
        return;
    }

    this.append(entry);
});

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('setLayout', function(aLayout) {

    /**
     * @name setLayout
     * @summary Defines the layout formatter the receiver will use to format log
     *     entries prior to being appended.
     * @param {TP.log.Layout} aLayout The layout to use.
     */

    this.$set('layout', aLayout);
});


//  ============================================================================
//  Entry
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
 * @type {Arguments}
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

TP.log.Entry.Inst.defineMethod('getArglist', function() {

    /**
     * Returns the original arguments passed to the logging function.
     * @return {Array.<Object>} The argument list in array form.
     */

    return this.$get('arglist');
});

//  ----------------------------------------------------------------------------

TP.log.Entry.Inst.defineMethod('getDate', function() {

    /**
     * Returns the entry date. The millisecond data from this is often used as
     * part of logging output, or to compute log entry delta times.
     * @return {Date}
     */

    return this.$get('date');
});

//  ----------------------------------------------------------------------------

TP.log.Entry.Inst.defineMethod('getLevel', function() {

    /**
     * @name getLevel
     * @summary Returns the level for the entry.
     * @return {TP.log.Level} The entry's level.
     */

    return this.$get('level');
});

//  ----------------------------------------------------------------------------

TP.log.Entry.Inst.defineMethod('getLogger', function() {

    /**
     * @name getLogger
     * @summary Returns the logger for the entry.
     * @return {TP.log.Logger} The entry's logger.
     */

    return this.$get('logger');
});

//  ----------------------------------------------------------------------------

TP.log.Entry.Inst.defineMethod('getMarker', function() {

    /**
     * Returns the entry marker, which contains possible data for filtering.
     * @return {TP.log.Marker}
     */

    return this.$get('marker');
});

//  ----------------------------------------------------------------------------

TP.log.Entry.Inst.defineMethod('init', function(aLogger, aLevel, arglist) {

    /**
     * @name init
     * @summary Initializes a new log entry instance, assigning it the proper
     *     values for level, date/time, arguments, and marker. If there is a
     *     marker it must be the first item in the argument list to be used.
     * @param {TP.log.Logger} aLogger The logger responsible for this entry.
     * @param {TP.log.Level} aLevel The level this entry is relevant for.
     * @param {Array.<Object>} arglist A list of all message items etc. provided
     *     to the initial logging method.
     * @return {TP.log.Entry}
     */

    this.callNextMethod();

    this.date = new Date();

    this.logger = aLogger;
    this.level = aLevel;
    this.arglist = arglist;

    if (arglist && arglist.length > 0) {
        if (TP.isKindOf(arglist.at(0), TP.log.Marker)) {
            this.marker = arglist.shift();
        }
    }

    return this;
});


//  ============================================================================
//  Filter
//  ============================================================================

/**
 * A type whose specific subtypes provide different log Entry filtering options.
 * @type {TP.log.Filter}
 */
TP.lang.Object.defineSubtype('log.Filter');

//  ----------------------------------------------------------------------------
//  Filter - Instance Definition
//  ----------------------------------------------------------------------------

TP.log.Filter.Inst.defineMethod('filter', function(anEntry) {

    /**
     * @name filter
     * @summary Runs one or more checks on anEntry to decide whether it can be
     *     passed forward to an appender. The default implementation is intended
     *     to be overridden by subtype versions.
     * @param {TP.log.Entry} anEntry The entry to filter.
     * @return {Boolean} True if the entry is valid.
     */

    return true;
});


//  ============================================================================
//  Layout
//  ============================================================================

/**
 * A type whose specific subtypes provide alternative ways to format a log
 * Entry. Some common options include browser console form, TIBET console form,
 * and TAP-formatted output for test logging.
 */
TP.lang.Object.defineSubtype('log.Layout');

//  ----------------------------------------------------------------------------
//  Layout - Instance Definition
//  ----------------------------------------------------------------------------

TP.log.Layout.Inst.defineMethod('layout', function(anEntry) {

    /**
     * @name layout
     * @summary Formats an entry. The various data fields in the entry may be
     *     processed in virtually any fashion as a result. The default format is
     *     whatever is produced by TP.str() which relies on the Entry type.
     * @param {TP.log.Entry} anEntry The entry to format.
     * @return {Object} The formatted output. Can be String, Node, etc.
     */

    var str;
    var marker;
    var arglist;

    str = '' + anEntry.getDate().asTimestamp() + ' - ' +
        anEntry.getLogger().getName() + ' ' +
        anEntry.getLevel().getName();

    // If there's a marker we can output that as well...
    marker = anEntry.getMarker();
    if (TP.isValid(marker)) {
        str += ' [' + marker.getName() + ']';
    }

    // The arglist may have multiple elements in it which we need to handle.
    arglist = anEntry.getArglist();
    if (TP.isValid(arglist)) {
        str += ' - ';
        arglist.forEach(function(item) {
            str += TP.str(item);
            str += ' ';
        });
        str = str.trim() + '.';
    }

    return str;
});


//  ============================================================================
//  Level
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
 * @type {TP.lang.Hash.<String, TP.log.Level>}
 */
TP.log.Level.defineAttribute('levels', TP.hc());

//  ----------------------------------------------------------------------------

TP.log.Level.Type.defineMethod('construct', function(aName, anIndex) {

    /**
     * @name construct
     * @summary Creates and returns unique Level instances based on the
     * combination of name and index.
     * @param {String} aName The string used when logging for this level.
     * @param {Number} anIndex The integer value for this level, used for
     *     comparisons to other levels.
     */

    var key;
    var level;

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

    // Verify we can place the new level key on TP.log for access.
    if (TP.log.hasOwnProperty(key)) {
        return this.raise('InvalidLevel',
            'TP.log[' + key + '] already exists.');
    }

    level = this.callNextMethod();

    // Register the new instance.
    this.levels.atPut(key, level);

    // NOTE we also put the instance on TP.log as a pseudo-constant value.
    TP.log[key] = level;

    return level;
});

//  ----------------------------------------------------------------------------

TP.log.Level.Type.defineMethod('getLevel', function(aName) {

    /**
     * Returns the Level instance with the given name, if it exists.
     * @param {String} aName The level name to retrieve.
     * @return {TP.log.Level}
     */

    var key;

    if (!aName) {
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

TP.log.Level.Inst.defineMethod('compareTo', function(aLevel) {

    /**
     * @name compareTo
     * @summary Returns an integer defining whether the receiver is less than
     *     (-1), equal to (0), or greater than (1) the level provided.
     * @return {Number} The comparison value.
     */

    var index;

    index = aLevel.getIndex();
    if (this.index === index) {
        return 0;
    } else if (this.index < index) {
        return -1;
    } else {
        return 1;
    }
});

//  ----------------------------------------------------------------------------

TP.log.Level.Inst.defineMethod('equalTo', function(aLevel) {

    /**
     * @name equalTo
     * @summary Returns true if the two levels are equal in terms of their index
     *     values.
     * @return {Boolean} True if the levels are equal.
     */

    return this.getIndex() === aLevel.getIndex();
});

//  ----------------------------------------------------------------------------

TP.log.Level.Inst.defineMethod('getIndex', function() {

    /**
     * @name getIndex
     * @summary Returns the index value of the level.
     * @return {String} The level index.
     */

    return this.index;
});

//  ----------------------------------------------------------------------------

TP.log.Level.Inst.defineMethod('getName', function() {

    /**
     * @name getName
     * @summary Returns the name of the level.
     * @return {String} The level name.
     */

    return this.name;
});

//  ----------------------------------------------------------------------------

TP.log.Level.Inst.defineMethod('init', function(aName, anIndex) {

    /**
     * @name init
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

    this.name = aName.toUpperCase();
    this.index = anIndex;

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Level.Inst.defineMethod('isVisibleAt', function(aLevel) {

    /**
     * @name isVisibleAt
     * @summary Returns true if the receiver is visible when the level threshold
     *     is set to the level provided.
     * @return {Boolean} True if the the level is "greater than or equal to" the
     *     receiving level.
     */

    if (this === TP.log.OFF) {
        return false;
    }

    if (this === TP.log.ALL && aLevel !== TP.log.OFF) {
        return true;
    }

    // If the receiver's index is greater than or equal to the threshold the
    // receiver should be visible.
    return this.compareTo(aLevel) >= 0;
});

//  ----------------------------------------------------------------------------
//  Level - Standard Instances
//  ----------------------------------------------------------------------------

TP.log.Level.construct('ALL', Number.NEGATIVE_INFINITY);
TP.log.Level.construct('OFF', Number.POSITIVE_INFINITY);

TP.log.Level.construct('TRACE', 100);
TP.log.Level.construct('DEBUG', 200);
TP.log.Level.construct('INFO', 300);
TP.log.Level.construct('WARN', 400);
TP.log.Level.construct('ERROR', 500);
TP.log.Level.construct('SEVERE', 600);
TP.log.Level.construct('FATAL', 700);
TP.log.Level.construct('SYSTEM', 800);


//  ============================================================================
//  Marker
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
 * @type {TP.lang.Hash.<String, TP.log.Marker>}
 */
TP.log.Marker.defineAttribute('markers', TP.hc());

//  ----------------------------------------------------------------------------

TP.log.Marker.Type.defineMethod('construct', function(aName) {

    /**
     * @name construct
     * @summary Allocates and initializes a new marker instance.
     * @constructor
     * @param {String} aName The marker name.
     * @return {TP.log.Marker} The new instance.
     */

    var marker;

    marker = TP.log.Marker.markers.at(aName);
    if (TP.isValid(marker)) {
        return marker;
    }

    marker = this.callNextMethod();

    // Register the new instance.
    TP.log.Marker.markers.atPut(aName, marker);

    return marker;
});

//  ----------------------------------------------------------------------------

TP.log.Marker.Type.defineMethod('getInstanceByName', function(aName) {

    /**
     * Returns the instance whose name matches the name provided. If the
     * instance doesn't exist this method will not create it.
     * @return {TP.log.Logger} The named instance.
     */

    return this.getMarker(aName);
});

//  ----------------------------------------------------------------------------

TP.log.Marker.Type.defineMethod('getMarker', function(aName) {

    /**
     * @name getMarker
     * @summary Returns the Marker instance with the given name, if it exists.
     * @param {String} aName The marker name to search for.
     * @return {TP.log.Marker}
     */

    if (!aName) {
        return;
    }

    return TP.log.Marker.markers.at(aName);
});

//  ----------------------------------------------------------------------------

TP.log.Marker.Inst.defineMethod('isCategoryOf', function(nameOrMarker) {

    /**
     * @name isCategoryOf
     * @summary Returns true if the marker is a "more specific category" of the
     *     marker or marker name provided.
     * @param {String|Marker} nameOrMarker The marker or marker name to test.
     * @return {Boolean}
     */

    if (TP.isString(name)) {
        return this.getAncestorNames().contains(nameOrMarker);
    } else if (TP.isKindOf(nameOrMarker, TP.log.Marker)) {
        return this.getAncestors().contains(nameOrMarker);
    }

    return false;
});

//  ============================================================================
//  Timer
//  ============================================================================

/**
 * A type which allows the construction of named timers, objects which can track
 * elapsed time across operations. Timers are uniqued by name.
 */
TP.lang.Object.defineSubtype('log.Timer');

//  ----------------------------------------------------------------------------

/**
 * A dictionary of all known timers.
 * @type {TP.lang.Hash.<String, TP.log.Timer}
 */
TP.log.Timer.defineAttribute('timers', TP.hc());

//  ----------------------------------------------------------------------------

TP.log.Timer.Type.defineMethod('construct', function(aName) {

    /**
     * @name construct
     * @summary Creates a new timer with the name provided. If the timer already
     *     exists it is simply returned.
     * @param {String} aName The name of the timer being requested.
     * @return {TP.log.Timer}
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

TP.log.Timer.Inst.defineMethod('getElapsedTime', function() {

    /**
     * @name getElapsedTime
     * @summary Returns the amount of time recorded by the timer. If the timer
     *     is still running this uses the current time, otherwise it is computed
     *     from the end time set at the time stop() was called.
     * @return {Number} The milliseconds the timer has recorded.
     */

    var end;

    end = this.end || Date.now();

    return end.getTime() - this.start.getTime();
});

//  ----------------------------------------------------------------------------

TP.log.Timer.Inst.defineMethod('init', function(aName) {

    /**
     * Creates a new instance.
     * @param {String} aName The new timer's name.
     * @return {TP.log.Timer}
     */

    this.callNextMethod();

    this.name = aName;

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Timer.Inst.defineMethod('reset', function() {

    /**
     * @name reset
     * @summary Resets the timer, clearing any end timestamp and updating the
     *     start time to the present.
     * @return {TP.log.Timer} The receiver.
     */

    this.start = Date.now();
    this.end = null;

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Timer.Inst.defineMethod('stop', function() {

    /**
     * @name stop
     * @summary Stops the timer, recording an end timestamp.
     * @return {TP.log.Timer} The receiver.
     */

    this.end = Date.now();

    return this;
});

//  ============================================================================
//  Default Appenders
//  ============================================================================

/**
 * An appender specific to output to the typical web browser console. We avoid
 * the term "console" in the name to avoid confusion with the TDC, which uses a
 * different appender since output to the TDC "console" is XHTML-based.
 */
TP.log.Appender.defineSubtype('BrowserAppender');

/**
 * The default layout type for this appender.
 * @type {TP.log.Layout}
 */
TP.log.BrowserAppender.Type.$set('defaultLayout', 'TP.log.BrowserLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.BrowserAppender.Inst.defineMethod('append', function(anEntry) {

    /**
     * @name append
     * @summary Formats the entry data using the receiver's layout.
     * @param {TP.log.Entry} anEntry The log entry to format and append.
     * @return {TP.log.Appender} The receiver.
     */

    var name;
    var writer;
    var layout;
    var content;

    // Try to find a matching console API method to our level name. If we find
    // it we'll use that to output the message content.
    name = anEntry.getLevel().getName().toLowerCase();
    if (TP.canInvoke(top.console, name)) {
        writer = name;
    } else {
        writer = 'log';
    }

    // If the entry contains multiple parts and we have access to a
    // group/groupEnd api via the console we'll group our output to help show
    // that it's all the result of a single logging call...
    // TODO:


    // Format the little critter...
    layout = this.getLayout();
    content = layout.layout(anEntry);

    try {
        top.console[writer](content);
    } catch (e) {
        top.console.log(content);
    }

    return this;
});


//  ============================================================================
//  Default Layouts
//  ============================================================================

/**
 * A layout specific to web browser console output.
 */
TP.log.Layout.defineSubtype('BrowserLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.BrowserLayout.Inst.defineMethod('layout', function(anEntry) {

    /**
     * @name layout
     * @summary Formats an entry. The default output format for top.console is:
     *     {ms} - {level} {logger} - {string}
     * @param {TP.log.Entry} anEntry The entry to format.
     * @return {Object} The formatted output. Can be String, Node, etc.
     */

    // TODO
    return this.callNextMethod();
});

//  ============================================================================
//  TP Extensions
//  ============================================================================

//  ------------------------------------------------------------------------
//  TP.sys
//  ------------------------------------------------------------------------

TP.sys.defineMethod('$$log',
function(anObject, aLogName, aLogLevel) {

    /**
     * @name $$log
     * @synopsis A private method for logging to the TIBET log. The log that
     *     will be modified is based on the supplied log name.
     * @param {Object} anObject The message/object to log.
     * @param {String} aLogName The log name, such as TP.IO_LOG,
     *     TP.INFERENCE_LOG, etc.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    var name,
        level,
        iserr,

        actflag,
        errflag,

        entry,
        stackInfo,

        stdioDict,
        format,
        output,
        str,
        msg;

    //  sometimes we can get lucky if a recursion includes logging
    TP.sys.trapRecursion();

    if (!TP.sys.shouldLogActivities()) {
        return false;
    }

    name = TP.ifInvalid(aLogName, TP.LOG);
    level = TP.ifInvalid(aLogLevel, TP.sys.getLogLevel());
    iserr = (level > TP.WARN) && (level < TP.SYSTEM);

    //  enclose the entire method in a try/finally block to mask off
    //  logging temporarily while ensuring it gets turned back on
    try {
        //  turn off logging while we log :)
        actflag = TP.sys.shouldLogActivities();
        errflag = TP.sys.shouldLogErrors();

        TP.sys.shouldLogActivities(false, false);
        TP.sys.shouldLogErrors(false, false);

        //  add entry to the low-level log container and grab that entry so
        //  we can augment it with stack and argument data as needed
        TP.sys.$activity.log(anObject, name, level);
        entry = TP.sys.$activity.last();

        //  NOTE that we never log stack information for SYSTEM messages
        if (level !== TP.SYSTEM) {
            if (TP.sys.shouldLogStack()) {

                try {
                    throw new Error();
                } catch (e) {
                    stackInfo = TP.getStackInfo(e);
                }

                //  the 3 here is intended to strip off the logging and
                //  stack functions themselves so we only see the portion of
                //  the stack not included in the infrastructure
                stackInfo.shift();
                stackInfo.shift();
                stackInfo.shift();

                //  adjust the entry to hold captured stack/arg data
                entry.push(stackInfo);
            }
        }

        //  keep log from growing without bound
        if (TP.sys.$activity.getSize() > TP.sys.cfg('log.size_max')) {
            TP.sys.$activity.shift();
        }

        stdioDict = TP.hc();
        stdioDict.atPut('messageLevel', level);
        stdioDict.atPut('messageType', 'log');

        //  these are for TP.tdp.Console support
        stdioDict.atPut('cmd',
                        TP.boot.Log.getStringForLevel(level).toLowerCase());

        format = TP.sys.cfg('log.default_format', 'tsh:pp');
        output = TP.format(anObject, format, stdioDict);

        stdioDict.atPut('cmdAsIs', true);
        stdioDict.atPut('cmdBox', false);

        stdioDict.atPut('echoRequest', true);

        if (iserr) {
            //  if we're still booting then announce it in the bootlog
            if (!TP.sys.hasStarted()) {
                if (TP.canInvoke(TP.boot, '$stderr')) {
                    TP.boot.$stderr(anObject);
                }
            } else {
              TP.stderr(output, stdioDict);
            }
        } else {
            //  NOTE that this logs the original message content
            //  regardless of what may have been done during this
            //  function
            TP.stdout(output, stdioDict);
        }

        //  allow observers of the log to see changes...
        TP.sys.$logChanged(name);
    } catch (e) {
        try {
            str = ' obj: ' + TP.str(anObject);
        } catch (e2) {
            str = '';
        }
        msg = 'Error in TP.sys.$$log: ' + TP.str(e) + str;

        // Make sure the error makes it to the browser console at least.
        top.console.error(msg);

        // Try to alert if TP.alert is currently active.
        TP.alert(msg);
    } finally {
        TP.sys.shouldLogActivities(actflag, false);
        TP.sys.shouldLogErrors(errflag, false);
    }

    //  last chance...invoke the debugger ?
    if (iserr && TP.sys.shouldUseDebugger()) {
        TP.sys.$launchDebugger(arguments);
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('log',
function(anObject, aLogName, aLogLevel) {

    /**
     * @name log
     * @synopsis A simple public wrapper for logging to a TIBET log. Normally
     *     you'll call a method specific to a particular log subset such as
     *     TP.sys.logInference, or a helper specific to a particular logging
     *     level such as TP.trace() or TP.warn(). This method largely provides
     *     symmetry with the TP.boot.log() call which logs to the boot log
     *     rather than the activity log.
     * @param {Object} anObject The message/object to log.
     * @param {String} aLogName The log name, such as TP.IO_LOG,
     *     TP.INFERENCE_LOG, etc.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    var level;

    level = TP.ifInvalid(aLogLevel, TP.WARN);
    if (TP.sys.getLogLevel() <= level) {
        return TP.sys.$$log(anObject, aLogName, aLogLevel);
    }

    return false;
});

//  ----------------------------------------------------------------------------
//
//  ----------------------------------------------------------------------------

/**
 * The default logger instance.
 * @type {TP.log.Logger}
 */
TP.$defaultLogger = null;

//  ----------------------------------------------------------------------------

TP.definePrimitive('getDefaultLogger', function() {

    /**
     * @name getDefaultLogger
     * @summary Returns the default application logger instance.
     * @return {TP.log.Logger} The default logger instance.
     */

    var logger;

    logger = this.$get('defaultLogger');
    if (TP.notValid(logger)) {
        logger = this.getLogger();
    }

    return logger;
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('setDefaultLogger', function(aLogger) {

    /**
     * @name setDefaultLogger
     * @summary Defines the default application logger instance.
     * @param {TP.log.Logger} aLogger The logger to register as the default.
     * @return {TP.log.Logger} The receiver.
     */

    if (!TP.isKindOf(aLogger, TP.log.Logger)) {
        return this.raise('InvalidParameter');
    }

    this.$set('$defaultLogger', aLogger);

    return this;
});

//  ----------------------------------------------------------------------------

// TODO: replace with defineMethod once API update for TP.defineMethod is done.
TP.definePrimitive('getLogger', function(aName) {

    /**
     * Returns a logger for the library side of operation. All loggers returned
     * by this method will inherit (ultimately) from the TP logger.
     */

    var name;

    if (TP.isEmpty(aName)) {
        name = 'TP';
    } else if (aName.indexOf('TP.') !== 0) {
        name = 'TP.' + aName;
    } else {
        name = aName;
    }

    return TP.log.Manager.getLogger(name);
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('getLogLevel', function(aLogger) {

    /**
     * @name getlogLevel
     * @summary Returns the logging level for the logger provided, or the
     *     default logger for the receiver.
     * @param {TP.log.Logger} aLogger The logger to retrive the level for.
     * @return {TP.log.Level}
     */

    return this.getLogger(aLogger).getLevel();
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('$$log',
function(anObject, aLogName, aLogLevel) {

    /**
     * @name $$log
     * @synopsis Logs anObject to the named log at the level provided. This
     *     method is a preliminary wrapper for invoking TP.sys.log once enough
     *     of the kernel has been loaded. Typically you'll use a shortcut for
     *     either a specific log or specific level as in TP.sys.logIO, or
     *     TP.warn() etc.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @param {Number} aLogLevel TP.INFO or a similar level ID.
     * @todo
     */

    var level,
        name;

    level = TP.ifInvalid(aLogLevel, TP.INFO);

    if (TP.sys.hasStarted()) {
        name = TP.ifInvalid(aLogName, TP.LOG);
        return TP.sys.log(anObject, name, level);
    } else if ((level >= TP.ERROR) && (level < TP.SYSTEM)) {
        return TP.boot.$stderr(anObject, level);
    } else {
        return TP.boot.$stdout(anObject, level);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('debug',
function(anObject, aLogName) {

    /**
     * @name debug
     * @synopsis Logs anObject at TP.DEBUG level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @todo
     */

    return TP.$$log(anObject,
                    aLogName || TP.LOG,
                    TP.DEBUG);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('error',
function(anObject, aLogName) {

    /**
     * @name error
     * @synopsis Logs anObject at TP.ERROR level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @todo
     */

    return TP.$$log(anObject,
                    aLogName || TP.LOG,
                    TP.ERROR);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('fatal',
function(anObject, aLogName) {

    /**
     * @name fatal
     * @synopsis Logs anObject at TP.FATAL level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @todo
     */

    return TP.$$log(anObject,
                    aLogName || TP.LOG,
                    TP.FATAL);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('info',
function(anObject, aLogName) {

    /**
     * @name info
     * @synopsis Logs anObject at TP.INFO level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @todo
     */

    return TP.$$log(anObject,
                    aLogName || TP.LOG,
                    TP.INFO);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('severe',
function(anObject, aLogName) {

    /**
     * @name severe
     * @synopsis Logs anObject at TP.SEVERE level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @todo
     */

    return TP.$$log(anObject,
                    aLogName || TP.LOG,
                    TP.SEVERE);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('system',
function(anObject, aLogName) {

    /**
     * @name system
     * @synopsis Logs anObject at TP.SYSTEM level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @todo
     */

    return TP.$$log(anObject,
                    aLogName || TP.LOG,
                    TP.SYSTEM);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('trace',
function(anObject, aLogName) {

    /**
     * @name trace
     * @synopsis Logs anObject at TP.TRACE level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @todo
     */

    return TP.$$log(anObject,
                    aLogName || TP.LOG,
                    TP.TRACE);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('warn',
function(anObject, aLogName) {

    /**
     * @name warn
     * @synopsis Logs anObject at TP.WARN level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @todo
     */

    return TP.$$log(anObject,
                    aLogName || TP.LOG,
                    TP.WARN);
});

//  ------------------------------------------------------------------------
//  BRANCH DETECTION
//  ------------------------------------------------------------------------

/*
There are some common idioms in TIBET methods related to logging. These
idioms are built to help support stripping these constructs for production
code to reduce overhead and code size. The idioms are:

    //  logging idiom(s)
    TP.ifTrace() ? TP.trace(...) : 0;
    TP.ifDebug() ? TP.debug(...) : 0;
    TP.ifInfo() ? TP.info(...) : 0;
    TP.ifWarn() ? TP.warn(...) : 0;
    TP.ifError() ? TP.error(...) : 0;
    TP.ifSevere() ? TP.severe(...) : 0;
    TP.ifFatal() ? TP.fatal(...) : 0;
    TP.ifSystem() ? TP.system(...) : 0;
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('ifEnabled',
function(aLevel, aFlag) {

    /**
     * @name ifEnabled
     * @synopsis Returns true if logging is set at or above aLevel. This
     *     function is a common routine used by ifError, ifTrace, ifInfo, etc.
     * @param {Constant} aLevel A TP error level constant such as TP.INFO or
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     TP.TRACE.
     * @returns {Boolean} True if error-level logging is active.
     * @todo
     */

    var level = TP.ifInvalid(aLevel, TP.ERROR);

    if (aFlag === undefined) {
        return TP.getLogLevel() <= level;
    }

    return aFlag && (TP.getLogLevel() <= level);
}, false, 'TP.ifEnabled');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifDebug',
function(aFlag) {

    /**
     * @name ifDebug
     * @synopsis Returns true if logging is set at or above TP.DEBUG level. This
     *     function is commonly used in the idiomatic expression:
     *     <code>TP.ifDebug() ? TP.debug(...) : 0;code> This idiom can be
     *     stripped by packaging tools to remove inline logging calls from
     *     production code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if error-level logging is active.
     * @todo
     */

    return TP.ifEnabled(TP.DEBUG, aFlag);
}, false, 'TP.ifDebug');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifError',
function(aFlag) {

    /**
     * @name ifError
     * @synopsis Returns true if logging is set at or above TP.ERROR level. This
     *     function is commonly used in the idiomatic expression:
     *     <code>TP.ifError() ? TP.error(...) : 0;code> This idiom can be
     *     stripped by packaging tools to remove inline logging calls from
     *     production code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if error-level logging is active.
     * @todo
     */

    return TP.ifEnabled(TP.ERROR, aFlag);
}, false, 'TP.ifError');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifFatal',
function(aFlag) {

    /**
     * @name ifFatal
     * @synopsis Returns true if logging is set at or above TP.FATAL level. This
     *     function is commonly used in the idiomatic expression:
     *     <code>TP.ifFatal() ? TP.error(...) : 0;code> This idiom can be
     *     stripped by packaging tools to remove inline logging calls from
     *     production code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if fatal-level logging is active.
     * @todo
     */

    return TP.ifEnabled(TP.FATAL, aFlag);
}, false, 'TP.ifFatal');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifInfo',
function(aFlag) {

    /**
     * @name ifInfo
     * @synopsis Returns true if logging is set at or above TP.INFO level. This
     *     function is commonly used in the idiomatic expression:
     *     <code>TP.ifInfo() ? TP.info(...) : 0;code> This idiom can be stripped
     *     by packaging tools to remove inline logging calls from production
     *     code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if info-level logging is active.
     * @todo
     */

    return TP.ifEnabled(TP.INFO, aFlag);
}, false, 'TP.ifInfo');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifSevere',
function(aFlag) {

    /**
     * @name ifSevere
     * @synopsis Returns true if logging is set at or above TP.SEVERE level.
     *     This function is commonly used in the idiomatic expression:
     *     <code>TP.ifSevere() ? TP.severe(...) : 0;code> This idiom can be
     *     stripped by packaging tools to remove inline logging calls from
     *     production code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if severe-level logging is active.
     * @todo
     */

    return TP.ifEnabled(TP.SEVERE, aFlag);
}, false, 'TP.ifSevere');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifSystem',
function(aFlag) {

    /**
     * @name ifSystem
     * @synopsis Returns true if logging is set at or above TP.SYSTEM level.
     *     This function is commonly used in the idiomatic expression:
     *     <code>TP.ifSystem() ? TP.system(...) : 0;code> This idiom can be
     *     stripped by packaging tools to remove inline logging calls from
     *     production code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if system-level logging is active.
     * @todo
     */

    return TP.ifEnabled(TP.SYSTEM, aFlag);
}, false, 'TP.ifSystem');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifTrace',
function(aFlag) {

    /**
     * @name ifTrace
     * @synopsis Returns true if logging is set at or above TP.TRACE level. This
     *     function is commonly used in the idiomatic expression:
     *     <code>TP.ifTrace() ? TP.trace(...) : 0;code> This idiom can be
     *     stripped by packaging tools to remove inline logging calls from
     *     production code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if trace-level logging is active.
     * @todo
     */

    return TP.ifEnabled(TP.TRACE, aFlag);
}, false, 'TP.ifTrace');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifWarn',
function(aFlag) {

    /**
     * @name ifWarn
     * @synopsis Returns true if logging is set at or above TP.WARN level. This
     *     function is commonly used in the idiomatic expression:
     *     <code>TP.ifWarn() ? TP.warn(...) : 0;code> This idiom can be stripped
     *     by packaging tools to remove inline logging calls from production
     *     code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if warn-level logging is active.
     * @todo
     */

    return TP.ifEnabled(TP.WARN, aFlag);
}, false, 'TP.ifWarn');

//  ------------------------------------------------------------------------
//  LOGGING - CORE METHODS
//  ------------------------------------------------------------------------

TP.sys.defineMethod('$logChanged',
function(aLogName) {

    /**
     * @name $logChanged
     * @synopsis Notifies observers, if any, that a particular log has changed.
     * @description This method provides common flag manipulations which are
     *     necessary to avoid recursive logging during notification of log
     *     changes. Note that the patch log and boot logs don't participate in
     *     this process since they're static by the time this function has been
     *     installed. Also note that TP.sys.shouldSignalLogChange() is false by
     *     default.
     * @param {The} aLogName name of the log that changed. The name provided is
     *     given a suffix of Log and a [name]LogChange signal is triggered.
     * @todo
     */

    var flag;

    TP.stop('break.change');

    if (TP.notValid(aLogName)) {
        return;
    }

    if (TP.sys.shouldSignalLogChange()) {
        try {
            flag = TP.sys.shouldLogActivities();
            TP.sys.shouldLogActivities(false);

            TP.signal(TP.sys, aLogName + 'LogChange');
        } catch (e) {
        } finally {
            TP.sys.shouldLogActivities(flag);
        }
    }

    return;
});

//  ------------------------------------------------------------------------
//  ACTIVITY (META) LOG
//  ------------------------------------------------------------------------

//  NOTE the activity log is a shared log containing all log content other
//  than boot/patch entries (found in the boot log), change entries (found
//  in the change log), and test entries (found in the test log). These two
//  secondary logs are separate since they contain information important to
//  the environment and data that should not be cleared without
//  confirmation.
TP.sys.$activity = TP.ifInvalid(TP.sys.$activity, new TP.boot.Log());

//  ------------------------------------------------------------------------
//  TEST LOG
//  ------------------------------------------------------------------------

//  NOTE that the test log is a separate log to ensure that it cannot be
//  cleared accidentally when clearing the larger activity log.
TP.sys.$testlog = TP.ifInvalid(TP.sys.$testlog, new TP.boot.Log());

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logTest',
function(anObject, aLogLevel) {

    /**
     * @name logTest
     * @synopsis Adds an entry to the test log. Note that there is no level
     *     filtering in test logging, the level parameter only filters parallel
     *     entries which might be made to the activity log.
     * @description This call is used by test harness routines to log their
     *     activity. The object argument can provide data in one or more keys
     *     including:
     *
     *     'name'               the test name
     *     'number'             the test number *in the reporting run*
     *     'test-status'        the test status. Should be one of:
     *                              TP.ACTIVE
     *                              TP.SKIP
     *                              TP.TODO
     *     'result-status'      the result status. Should be one of:
     *                              TP.SUCCEEDED
     *                              TP.FAILED
     *                              TP.CANCELLED
     *                              TP.SKIPPED
     *                              TP.TIMED_OUT
     *     'message'            the test message
     *     'failure-severity'   the severity level of the failure. Usually set
     *                          to 'fail'.
     *     'failure-data'       A hash with two keys containing the data:
     *                              TP.PRODUCED
     *                              TP.EXPECTED
     * @param {Object} anObject The test data to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    TP.sys.$testlog.log(anObject, TP.TEST_LOG, TP.SYSTEM);

    if (TP.sys.cfg('boot.context') === 'phantomjs') {
        console.log(TP.str(anObject));
    }

    TP.sys.log(anObject, TP.TEST_LOG, aLogLevel);

    //  with all logging complete signal change on the test log
    TP.sys.$logChanged(TP.TEST_LOG);

    return true;
});

//  ------------------------------------------------------------------------
//  CSS LOGGING
//  ------------------------------------------------------------------------

/**
 * All CSS processor output can be captured in the CSS log for review provided
 * that TP.sys.shouldLogCSS() is true.
 */

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logCSS',
function(anObject, aLogLevel) {

    /**
     * @name logCSS
     * @synopsis Adds anObject to the CSS log. This method will have no effect
     *     if the TP.sys.shouldLogCSS() flag is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogCSS()) {
        return false;
    }

    TP.sys.log(anObject, TP.CSS_LOG, aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  INFERENCE LOGGING
//  ------------------------------------------------------------------------

/*
The inference log is a simple log for tracking activity of the inferencing
engine. All messages generated by the inference engine show up here, with
content that often includes the message, target, arguments, etc.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logInference',
function(anObject, aLogLevel) {

    /**
     * @name logInference
     * @synopsis Adds anObject to the inference log. This method will have no
     *     effect if the TP.sys.shouldLogInferences() flag is false. The default
     *     logging level for messages of this type is TP.TRACE.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogInferences()) {
        return false;
    }

    TP.sys.log(anObject,
                TP.INFERENCE_LOG,
                aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  IO LOGGING
//  ------------------------------------------------------------------------

/*
The IO log tracks activity of communication primitives for both file and
http access. All messages generated by communication calls show up here
allowing you to see a single view of all server or host communication.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logIO',
function(anObject, aLogLevel) {

    /**
     * @name logIO
     * @synopsis Logs anObject to the IO log. Note that this method will have no
     *     effect if TP.sys.shouldLogIO() is false. Also note that this method
     *     logs information at TP.TRACE.
     * @description This call is used by various file and http access routines
     *     to log their activity. The object argument can provide data in one or
     *     more keys including:
     *
     *     'uri'        the targetUrl
     *     'uriparams'  optional parameters for url-encoding,
     *     'separator'  optional uri parameter separator
     *
     *     'headers'    http headers, or response headers,
     *     'async'      true or false
     *     'verb'       the command verb (GET/POST/PUT/DELETE etc)
     *     'body'       any data content for the call,
     *
     *     'noencode'   turns off body content encoding 'mimetype'
     *     'mimetype'   used for body encoding 'encoding'
     *     'charset'    encoding used for multi-part
     *     'mediatype'  used for multi-part encodings
     *
     *     'xhr'        the XMLHttpRequest object used, if any
     *
     *     'request'    TP.sig.Request reference
     *     'response'   TP.sig.Response reference
     *
     *     'direction'  TP.SEND or TP.RECV
     *     'message'    the log message
     *     'object'     any Error object which might be related,
     *
     *     'finaluri'   the fully expanded uri w/parameters
     *     'finalbody'  the TP.str(body) value actually sent
     *
     *     Note that IO log entries will only be pushed to the activity log
     *     (and stdout) when the logging level is INFO.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogIO()) {
        return false;
    }

    TP.sys.log(anObject, TP.IO_LOG, aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  JOB LOGGING
//  ------------------------------------------------------------------------

/*
The job log contains information on all TP.core.Job processing done by
TIBET. The TP.core.Job type manages virtually all setInterval/setTimeout
style processing in TIBET so that all asynchronous processing can be managed
consistently.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logJob',
function(anObject, aLogLevel) {

    /**
     * @name logJob
     * @synopsis Logs a job-related event. This method has no effect if
     *     TP.sys.shouldLogJobs() is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogJobs()) {
        return false;
    }

    TP.sys.log(anObject, TP.JOB_LOG, aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  KEY LOGGING
//  ------------------------------------------------------------------------

/*
The key log contains information on all key events being logged. Logging
keys can be a useful way to help adjust keyboard map entries.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logKey',
function(anObject, aLogLevel) {

    /**
     * @name logKey
     * @synopsis Logs a key event. This method has no effect if
     *     TP.sys.shouldLogKeys() is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogKeys()) {
        return false;
    }

    TP.sys.log(anObject, TP.KEY_LOG, aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  LINK LOGGING
//  ------------------------------------------------------------------------

/*
The link log contains information on all links traversed via TIBET's link
methods such as TP.go2(). This information can be used to provide valuable
usability analysis data, user tracking data, or debugging information on the
path a user took up to the point of an error.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logLink',
function(anObject, aLogLevel) {

    /**
     * @name logLink
     * @synopsis Logs a link activation event. This method has no effect if
     *     TP.sys.shouldLogLinks() is false. Also note that link logging occurs
     *     at TP.TRACE level.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogLinks()) {
        return false;
    }

    TP.sys.log(anObject, TP.LINK_LOG, aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  SECURITY LOGGING
//  ------------------------------------------------------------------------

/*
Security events such as requesting permissions on Mozilla or performing a
cross-domain HTTP request can be logged separately (and are by default).
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logSecurity',
function(anObject, aLogLevel) {

    /**
     * @name logSecurity
     * @synopsis Logs a security event. This method has no effect if
     *     TP.sys.shouldLogSecurity() is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogSecurity()) {
        return false;
    }

    TP.sys.log(anObject, TP.SECURITY_LOG, aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  SIGNAL LOGGING
//  ------------------------------------------------------------------------

/*
The signal log tracks the activity of the TIBET signaling engine. This
subset of log entries can be critical to understanding how your application
operates. The log entries typically contain the signal object itself.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logSignal',
function(anObject, aLogLevel) {

    /**
     * @name logSignal
     * @synopsis Logs a signaling message to the activity log. The signal string
     *     typically contains the origin, signal name, context, and any
     *     arguments which were passed. Note that the signal log data will only
     *     be pushed to the activity log (and stdout) if the log level is
     *     TP.TRACE.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    var level;

    if (!TP.sys.shouldLogSignals()) {
        return false;
    }

    //  since this method "does work" we avoid that unless we're at the
    //  right level.
    level = TP.ifInvalid(aLogLevel, TP.TRACE);
    if (TP.getLogLevel(TP.SIGNAL_LOG) <= level) {
        TP.sys.log(anObject.get('message'),
                    TP.SIGNAL_LOG,
                    level);
    }

    return true;
});

//  ------------------------------------------------------------------------
//  TRANSFORM LOGGING
//  ------------------------------------------------------------------------

/*
The transform log contains all output from the content processing system
The TP.sys.shouldLogTransforms() method controls whether logging actually
occurs.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logTransform',
function(anObject, aLogLevel) {

    /**
     * @name logTransform
     * @synopsis Logs a content transfomation event to the transform log.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogTransforms()) {
        return false;
    }

    TP.sys.log(anObject,
                TP.TRANSFORM_LOG,
                aLogLevel);

    return true;
});

//  ============================================================================
//  CHANGE LOG
//  ============================================================================

//  NOTE that the change log is a separate log to ensure that it cannot be
//  cleared accidentally when clearing the larger activity log.
TP.sys.$changes = TP.ifInvalid(TP.sys.$changes, new TP.boot.Log());

//  ------------------------------------------------------------------------

TP.defineMethod(TP.sys, 'logCodeChange',
function(anObject, aLogLevel) {

    /**
     * @name logCodeChange
     * @synopsis Adds source code to the change log. Returns true if the log
     *     entry is successful. This method will have no effect when the
     *     TP.sys.shouldLogCodeChanges() flag is false. NOTE that level does not
     *     affect what is written here, a call to logCodeChange will always
     *     update the change log.
     * @param {Object} anObject The source code change to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogCodeChanges()) {
        return false;
    }

    //  pure source code with no extras here...and notice that unlike the
    //  logs we trim, the change log grows without bound until cleared and
    //  is stored in sequence
    TP.sys.$changes.log(anObject, TP.CHANGE_LOG, TP.SYSTEM);

    TP.sys.log(anObject, TP.CHANGE_LOG, aLogLevel);

    //  with all logging complete signal change on the change log
    TP.sys.$logChanged(TP.CHANGE_LOG);

    return true;
}, TP.PRIMITIVE_TRACK, null, 'TP.sys.logCodeChange');

//  ------------------------------------------------------------------------

TP.defineMethod(TP.sys, '$logAttributeChange',
function(anObject, aTrack,
            attributeName, attributeValue, attributeDesc) {

    /**
     * @name $logAttributeChange
     * @synopsis Adds source code to the change log specific to an attribute
     *     operation. See logCodeChange() for more detail on change logging.
     * @param {Object} anObject The source object.
     * @param {String} aTrack A TIBET Track constant.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value.
     * @param {Object} attributeDesc An ECMA5 property descriptor.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    var str,
        id;

    if (!TP.sys.shouldLogCodeChanges()) {
        return false;
    }

    str = TP.ac();

    //  first step is to determine the ID of the object altering an
    //  attribute definition
    if (TP.isType(anObject)) {
        //  the type name is a useable identifier
        str.push(anObject.getTypeName());
    } else {
        //  harder, unless there's a unique ID that can find the object
        if (TP.canInvoke(anObject, 'getID')) {
            id = anObject.getID();

            //  is the object a global reference?
            if (TP.global[id] === anObject) {
                str.push(id);
            } else {
                if (TP.byOID(id) === anObject) {
                    str.push('TP.byOID(\'', id, '\')');
                } else {
                    //  not registered? this is an error
                    TP.ifWarn() ?
                        TP.warn('Unregistered object ' +
                                    id +
                                    ' can\'t log attribute changes.',
                                TP.CHANGE_LOG) : 0;

                    return false;
                }
            }
        }
    }

    if (aTrack === 'Type') {
        str.push('.Type.defineAttribute(\'', attributeName, '\'');
    } else if (aTrack === 'Inst') {
        str.push('.Inst.defineAttribute(\'', attributeName, '\'');
    } else if (aTrack !== 'Global') {
        str.push('.defineAttribute(\'', attributeName, '\'');
    } else {
        if (TP.canInvoke(anObject, 'getID')) {
            id = anObject.getID();
        } else {
            id = TP.str(anObject);
        }

        //  global track...this is a different deal and "shouldn't happen"
        TP.ifWarn() ?
            TP.warn(id + ' can\'t log global track attribute changes.',
                    TP.CHANGE_LOG) : 0;

        return false;
    }

    if (TP.isValid(attributeValue)) {
        str.push(', ');
        if (TP.canInvoke(attributeValue, 'asSource')) {
            str.push(attributeValue.asSource());
        } else if (TP.canInvoke(attributeValue, 'asString')) {
            str.push(attributeValue.asString());
        } else if (TP.canInvoke(attributeValue, 'toString')) {
            str.push(attributeValue.toString());
        } else if (TP.isString(attributeValue.nodeValue)) {
            str.push(attributeValue.nodeValue);
        } else {
            str.push('');
        }
    }

    str.push(');');

    str = str.join('');

    //  pure source code with no extras here...and notice that unlike the
    //  logs we trim, the change log grows without bound until cleared and
    //  is stored in sequence
    TP.sys.$changes.log(str,
                        TP.CHANGE_LOG,
                        TP.TRACE);
    TP.sys.$logChanged('Change');

    return true;
}, TP.PRIMITIVE_TRACK, null, 'TP.sys.$logAttributeChange');

//  ============================================================================
//  MOP Logging Methods
//  ============================================================================

TP.defineMetaInstMethod('shouldLog',
function(aFlag, aLogName) {

    /**
     * @name shouldLog
     * @synopsis Defines whether the receiver should log to the activity log
     *     relative to a particular log type. When no type is provided the
     *     setting takes effect for all logging for the receiver.
     * @param {Boolean} aFlag The optional state of the flag to be set as a
     *     result of this call.
     * @param {String} aLogName One of the TIBET log type names, or a custom
     *     name if custom logging is being used. See TP.*_LOG for names.
     * @returns {Boolean} The value of the flag after any optional set.
     * @todo
     */

    var flag,
        owner;

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

//  ============================================================================
//  APP Extensions
//  ============================================================================

/**
 * The default logger instance.
 * @type {TP.log.Logger}
 */
APP.$defaultLogger = null;

//  ----------------------------------------------------------------------------

APP.defineMethod('getDefaultLogger', function() {

    /**
     * @name getDefaultLogger
     * @summary Returns the default application logger instance.
     * @return {TP.log.Logger} The default logger instance.
     */

    var logger;

    logger = this.$get('defaultLogger');
    if (TP.notValid(logger)) {
        logger = this.getLogger();
    }

    return logger;
});

//  ----------------------------------------------------------------------------

APP.defineMethod('getLogLevel', function(aLogger) {

    /**
     * @name getlogLevel
     * @summary Returns the logging level for the logger provided, or the
     *     default logger for the receiver.
     * @param {TP.log.Logger} aLogger The logger to retrive the level for.
     * @return {TP.log.Level}
     */

    return this.getLogger(aLogger).getLevel();
});

//  ----------------------------------------------------------------------------

APP.defineMethod('getLogger', function(aName) {

    /**
     * Returns a logger for the library side of operation. All loggers returned
     * by this method will inherit (ultimately) from the APP logger.
     */

    var name;

    if (TP.isEmpty(aName)) {
        name = 'APP';
    } else if (aName.indexOf('APP.') !== 0) {
        name = 'APP.' + aName;
    } else {
        name = aName;
    }

    return TP.log.Manager.getLogger(name);
});

//  ----------------------------------------------------------------------------

APP.defineMethod('setDefaultLogger', function(aLogger) {

    /**
     * @name setDefaultLogger
     * @summary Defines the default application logger instance.
     * @param {TP.log.Logger} aLogger The logger to register as the default.
     * @return {TP.log.Logger} The receiver.
     */

    if (!TP.isKindOf(aLogger, TP.log.Logger)) {
        return this.raise('InvalidParameter');
    }

    this.$set('$defaultLogger', aLogger);

    return this;
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
