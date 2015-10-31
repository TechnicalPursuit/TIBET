//  ============================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ============================================================================

/**
 * @overview Provides the TIBET-side integrations required to report TIBET
 *     test output to the Karma test runner environment. The components here are
 *     all elements of the TIBET Logging subsystem, a filter, a layout, and an
 *     appender, which work together to transmit data flowing into the TIBET
 *     test log to the Karma environment. NOTE that overall start/stop data
 *     is provided via the tsh:test command used to invoke the overall tests.
 */

//  ============================================================================
//  TP.log.KarmaFilter
//  ============================================================================

/**
 *  A log filter specific to Karma. TIBET's test log runs on TAP format and not
 *  all data flowing into that system can be handled by Karma (for example the
 *  concept of a 'todo' item). The filter restricts the stream of entries
 */
TP.log.Filter.defineSubtype('KarmaFilter');

//  ----------------------------------------------------------------------------
//  Instance Methods
//  ----------------------------------------------------------------------------

TP.log.KarmaFilter.Inst.defineMethod('filter',
function(anEntry) {

    /**
     * @method filter
     * @summary Filters log entries to just those which can be handled by the
     *     Karma API. This reduces the list to largely ok/not-ok data along with
     *     information on total test counts.
     * @param {TP.log.Entry} anEntry The entry to filter.
     * @returns {Boolean} True if the entry is valid.
     */

    var arglist,
        entry,
        text;

    arglist = anEntry.getArglist();
    entry = arglist.first();

    //  Only pass along entries that are ok/not ok.
    if (TP.isKindOf(entry, TP.core.Hash)) {
        text = entry.at('statusText')
    } else {
        text = entry.get('statusText');
    }

    //  Allow either actual test info (ok or not ok) or count data (N..M).
    return /^(ok|not ok)/.test(text) ||
        /^(\d*?)\.\.(\d*?)$/.test(text);
});

//  ============================================================================
//  TP.log.KarmaLayout
//  ============================================================================

/**
 * Formats a log entry into a form suitable for sending to the Karma API. The
 * most common example is a karma result object which should appear as follows:
 *
 * karma.result({
 *     description: 'test karma-tibet',    // used even if undefined
 *     suite: ['karma-tibet adapter'],     // required even if empty
 *     log: [],                            // required even if empty
 *     success: true,                      // defaults to false
 *     skipped: false,                     // defaults to false
 *
 *     time: 10,
 *     id: 'sometest',
 *     coverage: null
 * });
 */
TP.log.Layout.defineSubtype('KarmaLayout');

//  ----------------------------------------------------------------------------
//  Instance Methods
//  ----------------------------------------------------------------------------

TP.log.KarmaLayout.Inst.defineMethod('layout',
function(anEntry) {

    /**
     * @method layout
     * @summary Formats a log entry in a format suitable for the Karma result
     *     function. See the Karma documentation for specifics.
     * @param {TP.log.Entry} anEntry The entry to format.
     * @returns {Object} An object whose keys match the requirements of calling
     *     Karma output functions such as the result call.
     */

    var arglist,
        entry,
        obj,
        text;

    arglist = anEntry.getArglist();
    entry = arglist.first();

    //  A bit of variation on input here. Hash, Case, or Suite. For Case/Suite
    //  we can use get() but for Hash we can just convert to object form.
    if (TP.isKindOf(entry, TP.core.Hash)) {
        //  Simple conversion to an object when using hashes.
        obj = entry.asObject();
        text = obj.statusText;
    } else {        //  TP.test.Suite or TP.test.Case typically.
        obj = {};
        text = entry.get('statusText');
    }

    if (TP.isValid(text)) {
        //  If this is an N..M count line capture count.
        if (/^(\d*?)\.\.(\d*?)$/.test(text)) {
            obj.total = text.split('..').last();
        } else {
            obj.log = [text];
            obj.success = /^ok/.test(text);
            obj.skipped = /# SKIP/.test(text);
        }
    }

    //  For 'info' output don't bother with extra values, they just get Karma
    //  onInfo output routines confused.
    if (TP.notValid(obj.total)) {
        obj.success = TP.ifInvalid(obj.success, false);
        obj.description = TP.ifInvalid(obj.description, '');
        obj.suite = TP.ifInvalid(obj.suite, []);
        obj.log = TP.ifInvalid(obj.log, []);
    }

    return obj;
});

//  ============================================================================
//  TP.log.KarmaAppender
//  ============================================================================

/**
 * A log appender which routes formatted log entries to the Karma API. Most log
 * entries result in either an info() or result() call on the Karma object.
 */
TP.log.Appender.defineSubtype('KarmaAppender');

//  ----------------------------------------------------------------------------

/**
 * The default layout type for this appender.
 * @type {TP.log.Layout}
 */
TP.log.KarmaAppender.Type.$set('defaultLayoutType', 'TP.log.KarmaLayout');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.log.KarmaAppender.Type.defineMethod('initialize', function() {

    /**
     * @method initialize
     * @summary Configures the Karma-related infrastructure on system startup,
     *     contingent on being loaded within a Karma-enabled environment.
     */

    if (TP.sys.hasFeature('karma')) {

        //  ---
        //  Configure appender on the test log specific to Karma reporting.
        //  ---

        TP.observe(TP.ANY, 'AppStart', function(aSignal) {
            var logger,
                appender;

            logger = TP.getLogger(TP.TEST_LOG);

            appender = TP.log.KarmaAppender.construct();
            appender.addFilter(TP.log.KarmaFilter.construct());

            logger.inheritsAppenders(false);
            logger.addAppender(appender);
            logger.setLevel(TP.log.ALL);
        });

        //  ---
        //  Trigger execution of tests once the application has started up.
        //  ---

        TP.observe(TP.ANY, 'AppDidStart', function(aSignal) {
            var script;

            script = TP.sys.cfg('karma.script', ':test');
            TP.shell(script);
        });
    }
});

//  ----------------------------------------------------------------------------
//  Instance Methods
//  ----------------------------------------------------------------------------

TP.log.KarmaAppender.Inst.defineMethod('append',
function(anEntry) {

    /**
     * @method append
     * @summary Formats the entry data using the receiver's layout and then
     *     passes it to the appropriate Karma method.
     * @param {TP.log.Entry} anEntry The log entry to format and append.
     * @returns {TP.log.Appender} The receiver.
     */

    var layout,
        results,
        karma;

    //  Get a handle to karma object, or ignore entire thing.
    karma = TP.extern.karma;
    if (TP.notValid(karma)) {
        return;
    }

    //  Format the little critter...
    layout = this.getLayout();
    results = layout.layout(anEntry);

    //  Entries like N..M are reformated for info(), all others are result().
    if (TP.isValid(results.total)) {
        karma.info(results);
    } else {
        karma.result(results);
    }

    return this;
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
