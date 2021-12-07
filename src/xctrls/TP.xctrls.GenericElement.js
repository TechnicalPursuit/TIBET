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
 * @type {TP.xctrls.GenericElement}
 * @summary
 */

//  ------------------------------------------------------------------------

TP.xctrls.Element.defineSubtype('GenericElement');

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.GenericElement.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.GenericElement.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
