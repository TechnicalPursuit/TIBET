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
 * @type {TP.log.TestLayout}
 * @summary A log layout specific to formatting results for the test appender.
 */

/**
 */
TP.log.Layout.defineSubtype('TestLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.TestLayout.Inst.defineMethod('layout',
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
        if (str.charAt(str.getSize() - 1) !== '.') {
            str += '.';
        }
    }

    //  Don't output entities...and do a little (error...) display cleanup.
    if (TP.sys.cfg('boot.context') === 'headless') {
        str = str.replace(/&#(\d+);/g, '').replace(/\) \)\.$/, ')).');
    }

    return TP.hc('content', str);
});

