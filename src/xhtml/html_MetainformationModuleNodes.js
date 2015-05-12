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
//  TP.html.meta
//  ========================================================================

/**
 * @type {TP.html.meta}
 * @summary 'meta' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('meta');

TP.html.meta.addTraits(TP.core.EmptyElementNode);

TP.html.meta.Inst.resolveTraits(
        TP.ac('$setAttribute', 'getNextResponder', 'isResponderFor',
                'removeAttribute', 'select', 'signal'),
        TP.core.UIElementNode);

TP.html.meta.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.core.EmptyElementNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.html.meta.finalizeTraits();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
