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
 * @type {TP.log.SherpaTestLogLayout}
 */

//  ----------------------------------------------------------------------------

TP.log.SherpaLayout.defineSubtype('SherpaTestLogLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.SherpaTestLogLayout.Inst.defineMethod('layout',
function(anEntry) {

    /**
     * @method layout
     * @summary Formats an entry, specifically extracting message content.
     * @param {TP.log.Entry} anEntry The entry to format.
     * @returns {Object} The formatted output. Can be String, Node, etc.
     */

    var arglist;

    //  The arglist may have multiple elements in it which we need to handle.
    arglist = anEntry.getArglist();

    return TP.hc('content', arglist.at(0).at('statusText'), 'cmdAsIs', false);
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
