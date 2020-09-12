//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.log.LamaTestLogLayout}
 */

//  ----------------------------------------------------------------------------

TP.log.LamaLayout.defineSubtype('LamaTestLogLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.LamaTestLogLayout.Inst.defineMethod('layout',
function(anEntry) {

    /**
     * @method layout
     * @summary Formats an entry, specifically extracting message content.
     * @param {TP.log.Entry} anEntry The entry to format.
     * @returns {Object} The formatted output. Can be String, Node, etc.
     */

    var arglist,
        entryArg,
        message;

    //  The arglist may have multiple elements in it which we need to handle.
    arglist = anEntry.getArglist();

    entryArg = arglist.at(0);

    //  entryArg should be either a hash containing job status-like data, or an
    //  Error object if reporting on a failed/errored test condition.
    if (TP.canInvoke(entryArg, 'at')) {
        message = entryArg.at('statusText');
    } else if (TP.isError(entryArg)) {
        message = entryArg.message;
    } else {
        message = TP.str(entryArg);
    }

    return TP.hc('content', message, 'cmdAsIs', false);
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
