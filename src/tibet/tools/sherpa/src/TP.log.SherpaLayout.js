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
 * @type {TP.log.SherpaLayout}
 */

//  ----------------------------------------------------------------------------

TP.log.Layout.defineSubtype('SherpaLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.SherpaLayout.Inst.defineMethod('layout',
function(anEntry) {

    /**
     * @method layout
     * @summary Formats an entry. The default output format for top.console is:
     *     {ms} - {level} {logger} - {string}
     * @param {TP.log.Entry} anEntry The entry to format.
     * @returns {Object} The formatted output. Can be String, Node, etc.
     */

    var arglist;

    //  The arglist may have multiple elements in it which we need to handle.
    arglist = anEntry.getArglist();

    if (arglist.at(0).errorObj) {
        return TP.hc('content', arglist.at(0).errorObj, 'cmdAsIs', false);
    }

    return TP.hc('content', arglist.at(0), 'cmdAsIs', false);
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
