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
 * @type {TP.xs.IDREF}
 * @summary An TP.xs.NCName-formatted value which must refer to a unique
 *     element within the document in which it is defined. Note that the current
 *     implementation does not check for this constraint but simply verifies
 *     that the IDREF value is a valid NCName.
 */

//  ------------------------------------------------------------------------

TP.xs.NCName.defineSubtype('IDREF');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
