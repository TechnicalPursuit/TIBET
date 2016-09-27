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
 * @type {TP.xctrls.curtain}
 * @summary Manages curtain XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:curtain');

TP.xctrls.curtain.addTraits(TP.xctrls.Element, TP.core.TemplatedNode);

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.curtain.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  xctrls:curtain controls are initially hidden, so we ensure that here.
TP.xctrls.curtain.set('requiredAttrs', TP.hc('pclass:hidden', true));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
