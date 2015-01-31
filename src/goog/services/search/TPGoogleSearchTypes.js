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
//  TP.goog.GoogleSearchData
//  ========================================================================

/**
 * @type {TP.goog.GoogleSearchData}
 */

//  ------------------------------------------------------------------------

TP.core.JSONContent.defineSubtype('goog.GoogleSearchData');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.goog.GoogleSearchData.Inst.defineAttribute(
        'results',
        {'value':
                TP.apc('responseData.results')});

TP.goog.GoogleSearchData.Inst.defineAttribute(
        'resultsFromTo',
        {'value':
                TP.apc('responseData.results[{{0}}:{{1}}]')});

TP.goog.GoogleSearchData.Inst.defineAttribute(
        'estimatedResultCount',
        {'value':
                TP.apc('responseData.cursor.estimatedResultCount', true)});

TP.goog.GoogleSearchData.Inst.defineAttribute(
        'currentPageIndex',
        {'value':
                TP.apc('responseData.cursor.currentPageIndex', true)});

TP.goog.GoogleSearchData.Inst.defineAttribute(
        'moreResultsUrl',
        {'value':
                TP.apc('responseData.cursor.moreResultsUrl', true)});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
