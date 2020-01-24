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
 * @type {aws:}
 * @summary This type represents the TIBET aws namespace
 *     (http://www.technicalpursuit.com/2020/aws) in the tag processing system.
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('aws.XMLNS');

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineConstant(
        'AWS',
        'http://www.technicalpursuit.com/2020/aws');

//  ------------------------------------------------------------------------

TP.w3.Xmlns.registerNSInfo(TP.w3.Xmlns.AWS,
                            TP.hc('prefix', 'aws',
                                    'native', false));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
