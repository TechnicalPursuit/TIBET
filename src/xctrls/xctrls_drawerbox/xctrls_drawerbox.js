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
 * @type {TP.xctrls.drawerbox}
 * @summary Manages drawerbox XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:drawerbox');

TP.xctrls.drawerbox.addTraits(TP.xctrls.Element, TP.core.TemplatedNode);

TP.xctrls.drawerbox.Type.resolveTrait('cmdRunContent', TP.xctrls.Element);
TP.xctrls.drawerbox.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

TP.xctrls.drawerbox.Inst.resolveTraits(
        TP.ac('$setAttribute', 'getNextResponder', 'isResponderFor',
                'removeAttribute', 'select', 'signal'),
        TP.xctrls.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
