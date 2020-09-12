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
 * @type {TP.log.LamaLayout}
 */

//  ----------------------------------------------------------------------------

TP.log.Layout.defineSubtype('LamaLayout');

//  ----------------------------------------------------------------------------
//  Instance Definition
//  ----------------------------------------------------------------------------

TP.log.LamaLayout.Inst.defineMethod('layout',
function(anEntry) {

    /**
     * @method layout
     * @summary Formats an entry. The default output format for top.console is:
     *     {ms} - {level} {logger} - {string}
     * @param {TP.log.Entry} anEntry The entry to format.
     * @returns {Object} The formatted output. Can be String, Node, etc.
     */

    var arglist,
        str;

    arglist = anEntry.getArglist();

    if (anEntry.isError()) {
        str = TP.dump(arglist);
    } else {
        str = arglist.collect(
                function(item) {
                    return TP.str(item);
                }).join(' ');
    }

    //  Make sure to convert any embedded markup to entities before generating
    //  log entry.
    str = TP.xmlLiteralsToEntities(str);

    return TP.hc('content', str, 'cmdAsIs', false);
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
