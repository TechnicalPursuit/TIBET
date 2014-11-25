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
 * @type {TP.xctrls.button}
 * @synopsis Manages button XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:button');

TP.xctrls.button.addTraits(TP.xctrls.Element, TP.core.TemplatedNode);

TP.xctrls.button.Type.resolveTrait('cmdRunContent', TP.xctrls.Element);
TP.xctrls.button.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

TP.xctrls.button.Inst.resolveTraits(
        TP.ac('$setAttribute', 'getNextResponder', 'isResponderFor',
                'removeAttribute', 'select', 'signal'),
        TP.xctrls.Element);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.button.finalizeTraits();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
