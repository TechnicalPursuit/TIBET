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
 * @synopsis Manages curtain XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:curtain');

TP.xctrls.curtain.addTraits(TP.xctrls.Element,
                                TP.core.TemplatedNode);
TP.xctrls.curtain.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

//  This is necessary to avoid a warning when we set() the traited-in attribute
//  below - we need it to be defined.
TP.xctrls.curtain.finalizeTraits();

//  xctrls:curtain controls are initially hidden, so we ensure that here.
TP.xctrls.curtain.set('requiredAttrs', TP.hc('pclass:hidden', true));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
