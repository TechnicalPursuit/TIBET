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
 * @type {sf:}
 * @summary This type represents the TIBET sf namespace
 *     (http://www.technicalpursuit.com/2020/sf) in the tag processing system.
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('sf.XMLNS');

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineConstant(
        'SF',
        'http://www.technicalpursuit.com/2020/sf');

//  ------------------------------------------------------------------------

TP.w3.Xmlns.registerNSInfo(TP.w3.Xmlns.SF,
                            TP.hc('prefix', 'sf',
                                    'native', false));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
