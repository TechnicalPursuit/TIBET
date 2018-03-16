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
 *     test output to the Karma test controller environment. The components here
 *     are all elements of the TIBET Logging subsystem, a filter, a layout, and
 *     an appender, which work together to transmit data flowing into the TIBET
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
        text,

        didPass;

    arglist = anEntry.getArglist();
    entry = arglist.first();

    //  Only pass along entries that are ok/not ok.
    if (TP.isHash(entry)) {
        text = entry.at('statusText');
    } else if (TP.isError(entry)) {
        text = TP.str(entry.stack);
    } else {
        text = entry.get('statusText');
    }

    //  Allow:

    //  actual test info (ok or not ok)
    //  count data (N..M)
    //  whole suite skip output
    //  per suite status lines
    didPass =
        /^(ok|not ok)/.test(text) ||
        /^(\d*?)\.\.(\d*?)$/.test(text) ||
        /# pass: 0 pass, 0 fail, 0 error, \d+ skip, 0 todo\./.test(text) ||
        /# (?:pass|fail): \d+ total, \d+ pass, \d+ fail, \d+ error, (\d+) skip, \d+ todo, (\d+) only\./.test(text);

    return didPass;
});

//  ============================================================================
//  TP.log.KarmaLayout
//  ============================================================================

/**
 * Formats a log entry into a form suitable for sending to the Karma API. The
 * most common example is a karma result object which should appear as follows:
 *
 * karma.result({
 *     description: 'test karma-tibet',    //   used even if undefined
 *     suite: ['karma-tibet adapter'],     //   required even if empty
 *     log: [],                            //   required even if empty
 *     success: true,                      //   defaults to false
 *     skipped: false,                     //   defaults to false
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
        text,

        wholeSuiteSkippedMatcher,
        suiteSummaryMatcher,

        numOnly,

        summaryData;

    arglist = anEntry.getArglist();
    entry = arglist.first();

    //  A bit of variation on input here. Hash, Case, or Suite. For Case/Suite
    //  we can use get() but for Hash we can just convert to object form.
    if (TP.isHash(entry)) {
        //  Simple conversion to an object when using hashes.
        obj = entry.asObject();
        text = obj.statusText;
    } else {        //  TP.test.Suite or TP.test.Case typically.
        obj = {};
        text = entry.get('statusText');
    }

    wholeSuiteSkippedMatcher =
        /# pass: 0 pass, 0 fail, 0 error, (\d+) skip, 0 todo./;

    suiteSummaryMatcher =
        /# (?:pass|fail): \d+ total, \d+ pass, \d+ fail, \d+ error, (\d+) skip, \d+ todo, (\d+) only\./;

    obj.isInfo = false;
    if (TP.isValid(text)) {
        //  If this is an N..M count line capture count.
        if (/^(\d*?)\.\.(\d*?)$/.test(text)) {

            obj.isInfo = true;
            obj.total = text.split('..').last();

        } else if (wholeSuiteSkippedMatcher.test(text)) {

            //  Otherwise, a whole suite was skipped. Capture its skip count.
            obj.numSkipped =
                wholeSuiteSkippedMatcher.exec(text).at(1).asNumber();

        } else if (suiteSummaryMatcher.test(text)) {

            summaryData = suiteSummaryMatcher.exec(text);
            obj.numSkipped = summaryData.at(1).asNumber();
            numOnly = summaryData.at(2).asNumber();

            //  If the number of 'only' test cases was 0, then we don't have any
            //  of the other test cases in this suite that we need to report as
            //  skipped.
            if (numOnly === 0) {
                delete obj.numSkipped;
                obj.isInfo = true;
            }

        } else {

            //  A regular per-test-case log message.
            obj.skipped = /# SKIP/.test(text);

            if (/^ok/.test(text)) {
                obj.success = true;
            } else if (/^not ok/.test(text)) {

                //  If it matches 'error:', then we need to mark it as 'info'
                //  only - it's already been logged as a failure.
                if (/error:/i.test(text)) {

                    //  Replace the 'error: Error:' text here with 'ERROR:' to
                    //  really call out the fact that it's an error.
                    text = text.replace('error: Error:', 'ERROR:');

                    obj.isError = true;
                }

                obj.success = false;
            }

            obj.log = TP.ac(text);
        }
    } else {
        return;
    }

    //  For 'info' output don't bother with extra values, they just get Karma
    //  onInfo output routines confused.
    if (!obj.isInfo) {
        obj.success = TP.ifInvalid(obj.success, false);
        obj.description = TP.ifInvalid(obj.description, '');
        if (TP.notValid(obj.suite)) {
            obj.suite = TP.ac();
        }
        if (TP.notValid(obj.log)) {
            obj.log = TP.ac();
        }
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

TP.log.KarmaAppender.Type.defineMethod('installControllers',
function() {

    /**
     * @method installControllers
     * @summary Configures the Karma-related controller infrastructure,
     *     contingent on being loaded within a Karma-enabled environment.
     */

    var controller;

    if (TP.sys.hasFeature('karma')) {

        //  ---
        //  Configure appender on the test log specific to Karma reporting.
        //  ---

        controller = TP.lang.Object.construct();

        controller.defineHandler('AppStart',
                function(aSignal) {
                    var logger,
                        appender;

                    logger = TP.getLogger(TP.TEST_LOG);

                    appender = TP.log.KarmaAppender.construct();
                    appender.addFilter(TP.log.KarmaFilter.construct());

                    logger.inheritsAppenders(false);
                    logger.addAppender(appender);
                    logger.setLevel(TP.log.ALL);
                });

        controller.defineHandler('AppDidStart',
                function(aSignal) {
                    var script;

                    script = TP.sys.cfg('karma.script', ':test');
                    TP.shellExec(script);
                });

        TP.sys.getApplication().pushController(controller);
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

    var karma,

        layout,
        results,

        outputResult,

        resultCount,
        i;

    //  Get a handle to karma object, or ignore entire thing.
    karma = TP.extern.karma;
    if (TP.notValid(karma)) {
        return;
    }

    //  Format the little critter...
    layout = this.getLayout();
    results = layout.layout(anEntry);

    //  If the layout process doesn't return data we don't output anything.
    if (TP.notValid(results)) {
        return;
    }

    //  Entries like N..M are reformated for info(), all others are result().
    if (results.isInfo) {
        delete results.isInfo;
        karma.info(results);
    } else if (results.isError) {
        delete results.isError;
        karma.result(results);
    } else {
        //  If we don't pass a valid number karma will NaN the net time calc.
        if (!TP.isNumber(results.time)) {
            results.time = 0;
        }

        outputResult = false;

        //  If there were skips, then iterate over how many they were and report
        //  them one-at-a-time. The reason that we don't report skips
        //  individually is that they can come in groups, either because a whole
        //  suite was skipped, or because a suite had an '.only()' on one of its
        //  test cases and the rest of the cases in that suite are considered
        //  skipped. Either way, skipped tests are tracked by reading the status
        //  line for the suite, which means they will come in batches.
        if (TP.isNumber(resultCount = results.numSkipped)) {

            outputResult = true;

            //  Remove this to avoid issues with Karma.
            delete results.numSkipped;

            results.skipped = true;
            for (i = 0; i < resultCount; i++) {
                karma.result(results);
            }
        }

        if (!outputResult) {
            karma.result(results);
        }
    }

    return this;
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
