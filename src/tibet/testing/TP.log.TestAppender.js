//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.log.TestAppender}
 * @summary A log appender that will fail the currently executing test if any
 *     TIBET code that is currently executing in support of the test logs an
 *     error to the TIBET logging machinery.
 */

//  ----------------------------------------------------------------------------

TP.log.Appender.defineSubtype('TestAppender');

//  ----------------------------------------------------------------------------
//  Type Attributes
//  ----------------------------------------------------------------------------

/**
 * The default layout type for this appender. Note that we use the console
 * layout for this type since we want the plain text.
 * @type {TP.log.Layout}
 */
TP.log.TestAppender.Type.$set('defaultLayoutType', 'TP.log.TestLayout');

//  ----------------------------------------------------------------------------
//  Instance Attribute
//  ----------------------------------------------------------------------------

TP.log.TestAppender.Inst.defineAttribute('currentTestCase');

//  ----------------------------------------------------------------------------
//  Instance Methods
//  ----------------------------------------------------------------------------

TP.log.TestAppender.Inst.defineMethod('append',
function(anEntry) {

    /**
     * @method append
     * @summary Formats the entry data using the receiver's layout and writes
     *     it to the console using the best console API method possible.
     * @param {TP.log.Entry} anEntry The log entry to format and append.
     * @returns {TP.log.TestAppender} The receiver.
     */

    var layout,
        content,

        currentCase;

    //  If this flag is not true, then just bail out here.
    if (!TP.sys.cfg('test.fail_on_error_log')) {
        return this;
    }

    //  If the entry is an Error then we want to fail the test
    //  case.
    if (anEntry.isError()) {

        layout = this.getLayout();
        content = layout.layout(anEntry).at('content');
        currentCase = this.get('currentTestCase');

        currentCase.error(content);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
