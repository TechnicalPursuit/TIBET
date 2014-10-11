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
 * including Manager, Logger, Appender, Layout, Filter, and Marker types. An
 * Entry type takes on the role of Message in log4j. Some API changes have been
 * made where we either wanted to maintain consistency with TIBET API or extend
 * the functionality of the logging system, otherwise we've tried to maintain
 * consistency with the core log4j 2.0 interface.
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
     * @summary Returns true if the named logger exists.
     * @param {String} aName The logger to verify.
     * @return {Boolean} True if the named logger exists.
     */

    var logger;

    logger = this.loggers.at(aName);

    return TP.isKindOf(logger, TP.log.Logger);
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

    if (this.exists(aName)) {
        return this.loggers.at(aName);
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
//  Parented
//  ============================================================================

/**
 * A common root type for objects in the logging system whose naming represents
 * a hierarchy of sorts. Two examples are Logger and Marker instances.
 */
TP.lang.Object.defineSubtype('log.Parented');

//  ----------------------------------------------------------------------------

TP.log.Parented.Type.defineMethod('getInstanceByName', function(aName) {

    /**
     * Returns the instance whose name matches the name provided. If the
     * instance doesn't exist this method will not create it.
     * @return {TP.log.Logger} The named instance.
     */

    TP.override();
});

//  ----------------------------------------------------------------------------
//  Parented - Instance Definition
//  ----------------------------------------------------------------------------

/**
 * The list of ancestors for the receiver. This is computed once and cached.
 * @type {Array.<TP.log.Parented>}
 */
TP.log.Parented.Inst.defineAttribute('ancestors');

//  ----------------------------------------------------------------------------

/**
 * The list of ancestor names for the receiver. This is computed once and
 * cached.
 * @type {Array.<String>}
 */
TP.log.Parented.Inst.defineAttribute('ancestorNames');

//  ----------------------------------------------------------------------------

/**
 * The receiver's full name including any ancestor portions.
 * @type {String}
 */
TP.log.Parented.Inst.defineAttribute('name');

//  ----------------------------------------------------------------------------

TP.log.Parented.Inst.defineMethod('getName', function() {

    /**
     * @name getName
     * @summary Returns the name of the marker.
     * @return {String} The marker name.
     */

    return this.name;
});

//  ----------------------------------------------------------------------------

TP.log.Parented.Inst.defineMethod('init', function(aName) {

    /**
     * @name init
     * @summary Initializes new instances, configuring their default values etc.
     * @param {String} aName The marker's name. May include '.' for hierarchy.
     * @return {TP.log.Parented} The new marker instance.
     */

    this.callNextMethod();

    this.name = aName;

    return this;
});

//  ----------------------------------------------------------------------------

TP.log.Parented.Inst.defineMethod('getAncestors', function() {

    /**
     * @name getAncestors
     * @summary Returns a list of all ancestor instances for the receiver.
     * @return {Array.<TP.log.Parented>} The ancestor list.
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

    this.$set('ancestors', ancestors);

    return ancestors;
});

//  ----------------------------------------------------------------------------

TP.log.Parented.Inst.defineMethod('getAncestorNames', function() {

    /**
     * @name getAncestorNames
     * @summary Returns a list of all ancestor instance names for the receiver.
     * @return {Array.<TP.log.Parented>} The ancestor list.
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

    this.$set('ancestorNames', names);

    return this.ancestorNames;
});


//  ============================================================================
//  Logger
//  ============================================================================

/**
 * The primary logging type whose filter/appender/layout configurations define
 * how log entries are processed.
 * @type {TP.log.Logger}
 */
TP.log.Parented.defineSubtype('log.Logger');

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
     * @summary Allocates and initializes a new logger instance.
     * @param {String} aName The new logger's name.
     * @return {TP.log.Logger} The newly created Logger.
     */

    var logger;

    if (TP.log.Manager.exists(aName)) {
        return TP.log.Manager.getLogger(aName);
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

    inst = this.$get('defaultAppender');
    if (TP.isValid(inst)) {
        return inst;
    }

    name = TP.sys.cfg('log.default_appender');
    if (TP.notEmpty(name)) {
        type = TP.sys.getTypeByName(name);
    }

    if (TP.notValid(type)) {
        switch (TP.sys.cfg('boot.context')) {
            case 'phantomjs':
                type =  TP.sys.getTypeByName('TP.log.PhantomAppender');
                break;
            default:
                type = TP.sys.getTypeByName('TP.log.ConsoleAppender');
                break;
        }
    }

    // If the types in question can't be located use one from this file...
    if (TP.notValid(type)) {
        type = TP.sys.getTypeByName('TP.log.Appender');
    }

    inst = type.construct();
    this.$set('defaultAppender', inst);

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
 * The logger's list of filters. Can be empty.
 @type {Array.<TP.log.Filter>}
 */
TP.log.Logger.Inst.defineAttribute('filters');

//  ----------------------------------------------------------------------------

/**
 * The logger's current logging level. Messages logged at this level and above
 * will be visible.
 * @type {TP.log.Level}
 */
TP.log.Logger.Inst.defineAttribute('level');    // Null so we inherit.

//  ----------------------------------------------------------------------------

/**
 * The parent logger for the receiver. Only the root logger will have a null
 * value here.
 * @type {TP.log.Logger}
 */
TP.log.Logger.Inst.defineAttribute('parent');

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
    if (this.name === TP.log.Manager.ROOT_LOGGER_NAME) {

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
        this.$set('appenders', TP.ac());
    }

    this.appenders.push(anAppender);
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('addFilter', function(aFilter) {

    /**
     * @name addfilter
     * @summary Adds a new filter to the logger. Loggers can have 0 to N
     *     filters. If the type of the new filter matches that of any
     *     filter already configured for the receiver or one of its ancestors
     *     that filter is not added.
     * @param {TP.log.Filter} aFilter The new filter to add.
     * @return {TP.log.Logger} The receiver.
     */

    if (TP.notValid(this.filters)) {
        this.$set('filters', TP.ac());
    }

    this.filters.push(aFilter);
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('filter', function(anEntry) {

    /**
     * @name filter
     * @summary Verifies that the entry should be logged by the receiver. The
     *     first check is the entry level but the entry is also checked by any
     *     filters for the receiver or its parent chain (if filters inherit).
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

TP.log.Logger.Inst.defineMethod('getAppenders', function() {

    /**
     * @name getAppenders
     * @summary Returns an array of appenders for the receiver. If the receiver
     *     inheritsAppenders() the list includes all inherited appenders.
     * @return {Array<.TP.log.Appender>} The appender list.
     */

    var appenders;

    appenders = this.appenders ? this.appenders.slice(0) : TP.ac();

    if (this.inheritsAppenders()) {
        appenders = appenders.concat(this.getParent().getAppenders());
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

    filters = this.filters ? this.filters.slice(0) : TP.ac();

    if (this.inheritsFilters()) {
        filters = filters.concat(this.getParent().getFilters());
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

    this.$set('parent', parent);

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

TP.log.Logger.Inst.defineMethod('isEnabled', function(aLevel) {

    /**
     * @name isEnabled
     * @summary Returns true if the receiver can log at the level provided.
     * @param {TP.log.Level} aLevel The level to verify.
     * @return {Boolean} True if the receiver can log at aLevel.
     */

    return this.getLevel().isEnabled(aLevel);
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('setLevel', function(aLevel) {

    /**
     * @name setLevel
     * @summary Sets the logging level for the receiver.
     * @param {TP.log.Level} aLevel The new level to set.
     * @return {TP.log.Appender} The receiver.
     */

    this.$set('level', aLevel);
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('logArglist', function(aLevel, arglist) {

    /**
     * @name logArglist
     * @summary Logs one or more objects based on the argument list. This method
     *     is typically invoked via one of the common logging methods such as
     *     warn() or error() and therefore the arglist has a specific format.
     * @param {TP.log.Level} aLevel The level to log at.
     * @param {Array} arglist An array of arguments from the invoking function.
     *     Content should follow [aLevel, aMarkerOrObject, ..., anError]
     *     where the marker and error elements are optional but checked by this
     *     routine and processed if found. All other items are treated as
     *     content to be logged regardless of it particular type.
     */

     this.logEntry(TP.log.Entry.construct(this, aLevel, arglist));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('logEntry', function(anEntry) {

    /**
     * @name logEntry
     * @summary Logs an entry based on the level, marker, and message content
     *     data found in the entry. This is the routine that handles the lower
     *     level work involved in filtering and forwarding to appenders.
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
     * @summary Log all arguments provided at trace level.
     * @param {Object} varargs One or more arguments as desired.
     */

    return this.logArglist(TP.log.TRACE, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('debug', function(varargs) {

    /**
     * @name debug
     * @summary Log all arguments provided at debug level.
     * @param {Object} varargs One or more arguments as desired.
     */

    return this.logArglist(TP.log.DEBUG, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('info', function(varargs) {

    /**
     * @name info
     * @summary Log all arguments provided at info level.
     * @param {Object} varargs One or more arguments as desired.
     */

    return this.logArglist(TP.log.INFO, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('warn', function(varargs) {

    /**
     * @name warn
     * @summary Log all arguments provided at warn level.
     * @param {Object} varargs One or more arguments as desired.
     */

    return this.logArglist(TP.log.WARN, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('error', function(varargs) {

    /**
     * @name error
     * @summary Log all arguments provided at error level.
     * @param {Object} varargs One or more arguments as desired.
     */

    return this.logArglist(TP.log.ERROR, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('severe', function(varargs) {

    /**
     * @name severe
     * @summary Log all arguments provided at severe level.
     * @param {Object} varargs One or more arguments as desired.
     */

    return this.logArglist(TP.log.SEVERE, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('fatal', function(varargs) {

    /**
     * @name fatal
     * @summary Log all arguments provided at fatal level.
     * @param {Object} varargs One or more arguments as desired.
     */

    return this.logArglist(TP.log.FATAL, TP.ac(arguments));
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('system', function(varargs) {

    /**
     * @name system
     * @summary Log all arguments provided at system level.
     * @param {Object} varargs One or more arguments as desired.
     */

    return this.logArglist(TP.log.SYSTEM, TP.ac(arguments));
});


//  ============================================================================
//  Appender
//  ============================================================================

TP.lang.Object.defineSubtype('log.Appender');

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

    inst = this.$get('defaultLayout');
    if (TP.isValid(inst)) {
        return inst;
    }

    name = TP.sys.cfg('log.default_layout');
    if (TP.notEmpty(name)) {
        type = TP.sys.getTypeByName(name);
    }

    if (TP.notValid(type)) {
        switch (TP.sys.cfg('boot.context')) {
            case 'phantomjs':
                type =  TP.sys.getTypeByName('TP.log.PhantomLayout');
            default:
                type = TP.sys.getTypeByName('TP.log.ConsoleLayout');
        }
    }

    // If the types in question can't be located use one from this file...
    if (TP.notValid(type)) {
        type = TP.sys.getTypeByName('TP.log.Layout');
    }

    inst = type.construct();
    this.$set('defaultLayout', inst);

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

/**
 * The appender's list of filters. Can be empty.
 @type {Array.<TP.log.Filter>}
 */
TP.log.Appender.Inst.defineAttribute('filters');

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('addFilter', function(aFilter) {

    /**
     * @name addLayout
     * @summary Adds a new filter to the appender. Appenders can have 0 to N
     *     filters. Note that the logger making use of an appender may choose to
     *     filter log entries across all appenders as well.
     * @param {TP.log.Filter} aFilter The new filter to add.
     */

    if (TP.notValid(this.filters)) {
        this.$set('filters', TP.ac());
    }

    this.filters.push(aFilter);
});

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('append', function(anEntry) {

    /**
     * @name append
     * @summary Formats the entry data using the receiver's layout, if any, and
     *     invokes appendFormattedContent() to output the result.
     * @param {TP.log.Entry} anEntry The log entry to format and append.
     * @return {TP.log.Appender} The receiver.
     */

    var layout;
    var content;

    // Format the content in the entry so we can do the append.
    layout = this.getLayout();
    content = layout.layout(anEntry);

    this.appendFormattedContent(content);
});

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('appendFormattedContent', function(content) {

    /**
     * @name appendFormattedContent
     * @summary Performs the actual work of appending content. This method is
     *     intended to be overridden by subtypes.
     * @param {Object} content The formatted content to append. This may be a
     *     string, a DOM node, or pretty much anything specific to the appender.
     */

    TP.override();
});

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('filter', function(anEntry) {

    /**
     * @name filter
     * @summary Verifies that the entry should be logged by the receiver. The
     *     first check is the entry level but the entry is also checked by any
     *     filters for the receiver or its parent chain (if filters inherit).
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

TP.log.Appender.Inst.defineMethod('getFilters', function() {

    /**
     * @name getFilters
     * @summary Returns an array of filters for the receiver. If the receiver
     *     inheritsFilters() the list includes all inherited filters.
     * @return {Array<.TP.log.Filter>} The filter list.
     */

    return this.filters || TP.ac();
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

TP.log.Appender.Inst.defineMethod('getLevel', function() {

    /**
     * @name getLevel
     * @summary Returns the logging level for the receiver. Defaults to
     *     TP.log.ALL for appenders so no level filtering is done by default.
     * @return {Number} The current logging level.
     */

    return this.level || TP.log.ALL;
});

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('isEnabled', function(aLevel) {

    /**
     * @name isEnabled
     * @summary Returns true if the receiver can log at the level provided.
     * @param {TP.log.Level} aLevel The level to verify.
     * @return {Boolean} True if the receiver can log at aLevel.
     */

    return this.getLevel().isEnabled(aLevel);
});

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('log', function(anEntry) {

    /**
     * @name log
     * @summary Invokes the receiver's filter method to filter anEntry and then
     *     invokes append() if the entry passes all the filters.
     * @param {TP.log.Entry} anEntry The log entry to output.
     * @return {TP.log.Appender} The receiver.
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

    this.layout = aLayout;
});


//  ============================================================================
//  Entry
//  ============================================================================

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
     *     values for level, date/time, arguments, and marker.
     * @param {TP.log.Logger} aLogger The logger responsible for this entry.
     * @param {TP.log.Level} aLevel The level this entry is relevant for.
     * @param {Array.<Object>} arglist A list of all message items etc. provided
     *     to the initial logging method.
     * @return {TP.log.Entry}
     */

    this.callNextMethod();

    this.date = Date.now();

    this.logger = aLogger;
    this.level = aLevel;
    this.arglist = arglist;

    if (arglist && arglist.length > 0) {
        if (TP.isKindOf(arglist.at(0), TP.log.Marker)) {
            this.marker = arglist.at(0);
        }
    }

    return this;
});


//  ============================================================================
//  Filter
//  ============================================================================

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

    return TP.str(anEntry);
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
            return this.raise('InvalidOperation', arguments,
                'TP.log.' + key + ' index cannot be changed.');
        }
    }

    // Verify we can place the new level key on TP.log for access.
    if (TP.log.hasOwnProperty(key)) {
        return this.raise('InvalidLevel', arguments,
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

TP.log.Level.Inst.defineMethod('isEnabled', function(aLevel) {

    /**
     * @name isEnabled
     * @summary Returns true if, given the receiver as a "threshold level", the
     *     level provided can be logged. Note that messages with ALL will pass
     *     any filter, while messages with OFF will fail all comparisions.
     * @return {Boolean} True if the the level is "greater than or equal to" the
     *     receiving level.
     */

    if (aLevel === TP.log.ALL) {
        return true;
    }

    if (aLevel === TP.log.OFF) {
        return false;
    }

    // To be enabled the inbound level must be greater than or equal to the
    // receiver.
    return this.compareTo(aLevel) <= 0;
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

// Assign the default level used by the root logger on creation.
TP.log.Level.defineConstant('DEFAULT', TP.log.INFO);


//  ============================================================================
//  Marker
//  ============================================================================

TP.log.Parented.defineSubtype('log.Marker');

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

TP.log.Appender.defineSubtype('ConsoleAppender');

TP.log.ConsoleAppender.Inst.defineMethod('appendFormattedContent',
function(content) {

    /**
     * TODO:    probably override append() so we can match level to console API
     * options....
     */

    top.console.log(content);
});

//  ============================================================================
//  TP and APP Extensions
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
//  end
//  ============================================================================
