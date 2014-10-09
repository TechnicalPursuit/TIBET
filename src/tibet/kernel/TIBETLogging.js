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

    this.loggers.atPut(aLogger.getName(), aLogger);

    return this;
});


//  ============================================================================
//  Logger
//  ============================================================================

/**
 * The primary logging type whose filter/appender/layout configurations define
 * how log entries are processed.
 * @type {TP.log.Logger}
 */
TP.lang.Object.defineSubtype('log.Logger');

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
 * The logger's full name including any hierarchy.
 * @type {String}
 */
TP.log.Logger.Inst.defineAttribute('name');

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

    this.callNextMethod();

    this.$set('name', aName);

    // We have some special setup for the root logger to ensure it acts as a
    // proper backstop for level and parent searching.
    if (this.name === TP.log.Manager.ROOT_LOGGER_NAME) {
        this.level = TP.log.Level.DEFAULT;
        this.additiveAppenders = false;
        this.additiveFilters = false;
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
    var parent;

    if (TP.notValid(anEntry)) {
        return;
    }

    if (!this.isEnabled(anEntry.getLevel())) {
        return;
    }

    filters = this.filters;
    if (TP.notEmpty(filters)) {
        results = filters.map(function(filter) {
            return filter.filter(anEntry);
        });

        if (results.contains(false)) {
            return;
        }
    }

    if (!this.inheritsFilters()) {
        return anEntry;
    }

    parent = this.getParent();
    if (TP.notValid(parent)) {
        return;
    }

    return parent.filter(anEntry);
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('getLevel', function() {

    /**
     * @name getLevel
     * @summary Returns the logging level for the receiver. This search may
     *     include traversing up the parent chain.
     * @return {Number} The current logging level.
     */

    if (TP.isValid(this.level)) {
        return this.level;
    }

    return this.getParent().getLevel();
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('getName', function() {

    /**
     * @name getName
     * @summary Returns the name of the logger.
     * @return {String} The logger name.
     */

    return this.name;
});

//  ----------------------------------------------------------------------------

TP.log.Logger.Inst.defineMethod('getParent', function() {

    /**
     * @name getParent
     * @summary Returns the receiver's parent logger, if any. The root logger
     *     will not have one, for example.
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

     this.logEntry(TP.log.Entry.construct(aLevel, arglist));
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

    appenders = this.appenders;
    if (TP.notEmpty(appenders)) {
        appenders.forEach(function(appender) {
            appender.log(entry);
        });
    }

    if (!this.inheritsAppenders()) {
        return;
    }

    parent = this.getParent();
    if (TP.notValid(parent)) {
        return;
    }

    parent.logEntry(entry);
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

/**
 * The type name to use by default if no appender layout has been defined.
 * @type {String}
 */
TP.log.Appender.Type.defineConstant('DEFAULT_LAYOUT_TYPE',
    'TP.log.DefaultLayout');

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

TP.log.Appender.Inst.defineMethod('append', function(content) {

    /**
     * @name append
     * @summary Performs the actual work of appending content. This method is
     *     intended to be overridden by subtypes.
     * @param {String} content The string content to append.
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

    return this.layout || TP.sys.getTypeByName(
        TP.log.Appender.DEFAULT_LAYOUT_TYPE);
});

//  ----------------------------------------------------------------------------

TP.log.Appender.Inst.defineMethod('log', function(anEntry) {

    /**
     * @name log
     * @summary Filters and formats anEntry and then invokes append() with the
     *     resulting data.
     * @param {TP.log.Entry} anEntry The log entry to output.
     * @return {TP.log.Appender} The receiver.
     */

    var filters;
    var results;
    var layout;
    var content;

    // First task is to filter the entry to see if we should output it.
    filters = this.filters;
    if (TP.notEmpty(filters)) {
        results = filters.map(function(filter) {
            return filter.filter(anEntry);
        });

        if (results.contains(false)) {
            return;
        }
    }

    // Format the content in the entry so we can do the append.
    layout = this.getLayout();
    content = layout.layout(anEntry);

    return this.append(content);
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

    return this.level;
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

TP.log.Entry.Inst.defineMethod('init', function(aLevel, arglist) {

    /**
     * @name init
     * @summary Initializes a new log entry instance, assigning it the proper
     *     values for level, date/time, arguments, and marker.
     * @return {TP.log.Entry}
     */

    this.callNextMethod();

    this.date = Date.now();

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
     * @summary Returns true if the receiver is loggable relative to the level
     *     provided, ie. it's at least as specific as the level given.
     * @return {Boolean} True if the receiver's index is >= the level provided.
     */

    return this.compareTo(aLevel) >= 0;
});

//  ----------------------------------------------------------------------------
//  Level - Standard Instances
//  ----------------------------------------------------------------------------

TP.log.Level.construct('ALL', Number.NEGATIVE_INFINITY);
TP.log.Level.construct('TRACE', 100);
TP.log.Level.construct('DEBUG', 200);
TP.log.Level.construct('INFO', 300);
TP.log.Level.construct('WARN', 400);
TP.log.Level.construct('ERROR', 500);
TP.log.Level.construct('SEVERE', 600);
TP.log.Level.construct('FATAL', 700);
TP.log.Level.construct('SYSTEM', 800);
TP.log.Level.construct('OFF', Number.POSITIVE_INFINITY);

// Assign the default level used by the root logger on creation.
TP.log.Level.defineConstant('DEFAULT', TP.log.INFO);


//  ============================================================================
//  Marker
//  ============================================================================

TP.lang.Object.defineSubtype('log.Marker');

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
//  Marker - Instance Definition
//  ----------------------------------------------------------------------------

/**
 * The list of ancestor markers for the receiver. This is computed once and
 * cached.
 * @type {Array.<TP.log.Marker>}
 */
TP.log.Marker.Inst.defineAttribute('ancestors');

//  ----------------------------------------------------------------------------

/**
 * The list of ancestor names for the receiver. This is computed once and
 * cached.
 * @type {Array.<String>}
 */
TP.log.Marker.Inst.defineAttribute('ancestorNames');

//  ----------------------------------------------------------------------------

/**
 * The marker's full name including any hierarchy.
 * @type {String}
 */
TP.log.Marker.Inst.defineAttribute('name');

//  ----------------------------------------------------------------------------

TP.log.Marker.Inst.defineMethod('getName', function() {

    /**
     * @name getName
     * @summary Returns the name of the marker.
     * @return {String} The marker name.
     */

    return this.name;
});

//  ----------------------------------------------------------------------------

TP.log.Marker.Inst.defineMethod('getAncestors', function() {

    /**
     * @name getAncestors
     * @summary Returns a list of all ancestor markers for the receiver.
     * @return {Array.<TP.log.Marker>} The ancestor list.
     */

    var ancestors;

    ancestors = this.$get('ancestors');
    if (TP.isValid(ancestors)) {
        return ancestors;
    }

    ancestors = this.getAncestorNames().map(function(name) {
        TP.log.Marker.getMarker(name);
    });

    this.$set('ancestors', ancestors);

    return ancestors;
});

//  ----------------------------------------------------------------------------

TP.log.Marker.Inst.defineMethod('getAncestorNames', function() {

    /**
     * @name getAncestorNames
     * @summary Returns a list of all ancestor marker names for the receiver.
     * @return {Array.<TP.log.Marker>} The ancestor list.
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

//  ----------------------------------------------------------------------------

TP.log.Marker.Inst.defineMethod('init', function(aName) {

    /**
     * @name init
     * @summary Initializes new instances, configuring their default values etc.
     * @param {String} aName The marker's name. May include '.' for hierarchy.
     * @return {TP.log.Marker} The new marker instance.
     */

    this.callNextMethod();

    this.name = aName;

    return this;
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
