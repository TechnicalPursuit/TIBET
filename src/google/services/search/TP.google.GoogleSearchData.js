//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.google.GoogleSearchData
//  ========================================================================

/**
 * @type {TP.google.GoogleSearchData}
 */

//  ------------------------------------------------------------------------

TP.core.JSONContent.defineSubtype('google.GoogleSearchData');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.google.GoogleSearchData.Type.defineMethod('canConstruct',
function(data) {

    /**
     * @method canConstruct
     * @summary Returns true if the receiver can construct a valid instance
     *     given the parameters provided.
     * @returns {Boolean}
     */

    //  Must be JSON for starters...but we also want to restrict it to
    //  JSON with keys hopefully unique to the Google result dataset.
    return TP.isJSONString(data) &&
            /responseData/.test(data) &&
            /estimatedResultCount/.test(data);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.google.GoogleSearchData.Inst.defineAttribute(
    'results', {
        value: TP.apc('responseData.results')
    });

TP.google.GoogleSearchData.Inst.defineAttribute(
    'resultsFromTo', {
        value: TP.apc('responseData.results[{{0}}:{{1}}]')
    });

TP.google.GoogleSearchData.Inst.defineAttribute(
    'estimatedResultCount', {
        value: TP.apc('responseData.cursor.estimatedResultCount', TP.hc('shouldCollapse', true))
    });

TP.google.GoogleSearchData.Inst.defineAttribute(
    'currentPageIndex', {
        value: TP.apc('responseData.cursor.currentPageIndex', TP.hc('shouldCollapse', true))
    });

TP.google.GoogleSearchData.Inst.defineAttribute(
    'moreResultsUrl', {
        value: TP.apc('responseData.cursor.moreResultsUrl', TP.hc('shouldCollapse', true))
    });

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
