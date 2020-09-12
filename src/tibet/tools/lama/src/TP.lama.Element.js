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
 * @type {TP.lama.Element}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('lama.Element');

TP.lama.Element.addTraits(TP.dom.NonNativeUIElementNode);

TP.lama.Element.Inst.resolveTraits(
        TP.ac('$setAttribute', 'removeAttribute', 'select', 'signal'),
        TP.dom.UIElementNode);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how this property is TYPE_LOCAL, by
//  design.
TP.lama.Element.defineAttribute('styleURI', TP.NO_RESULT);

//  Note how this property is *not* TYPE_LOCAL, by design. 'lama:' elements,
//  by default, do *not* use theming.
TP.lama.Element.Type.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Halo focusing methods
//  ------------------------------------------------------------------------

TP.lama.Element.Inst.defineMethod('haloCanBlur',
function(aHalo) {

    /**
     * @method haloCanBlur
     * @summary Returns whether or not the halo can blur (i.e. no longer focus
     *     on) the receiver.
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can blur the receiver.
     * @returns {Boolean} Whether or not the halo can blur the receiver.
     */

    //  By default, Lama elements themselves cannot be haloed on.
    return false;
});

//  ------------------------------------------------------------------------

TP.lama.Element.Inst.defineMethod('haloCanFocus',
function(aHalo) {

    /**
     * @method haloCanFocus
     * @summary Returns whether or not the halo can focus on the receiver.
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can focus the receiver.
     * @returns {Boolean} Whether or not the halo can focus the receiver.
     */

    //  By default, Lama elements themselves cannot be haloed on.
    return false;
});

//  ========================================================================
//  TP.lama.ComputedTag
//  ========================================================================

/**
 * @type {TP.lama.ComputedTag}
 * @summary A tag type that has its structure computed and also has the common
 *     aspect of all Lama tags.
 */

//  ------------------------------------------------------------------------

TP.tag.ComputedTag.defineSubtype('lama.ComputedTag');

TP.lama.ComputedTag.addTraits(TP.lama.Element);

//  ========================================================================
//  TP.lama.TemplatedTag
//  ========================================================================

/**
 * @type {TP.lama.TemplatedTag}
 * @summary A tag type that is templated and also has the common aspect of all
 *     Lama tags.
 */

//  ------------------------------------------------------------------------

TP.tag.TemplatedTag.defineSubtype('lama.TemplatedTag');

TP.lama.TemplatedTag.addTraits(TP.lama.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
