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
 * @type {TP.sherpa.Element}
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa.Element');

TP.sherpa.Element.addTraits(TP.core.NonNativeUIElementNode);

TP.sherpa.Element.Inst.resolveTraits(
        TP.ac('$setAttribute', 'removeAttribute', 'select', 'signal'),
        TP.core.UIElementNode);

//  This tag has no associated CSS. Note how this property is TYPE_LOCAL, by
//  design.
TP.sherpa.Element.defineAttribute('styleURI', TP.NO_RESULT);

//  Note how this property is *not* TYPE_LOCAL, by design. 'sherpa:' elements,
//  by default, do *not* use theming.
TP.sherpa.Element.Type.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Halo focusing methods
//  ------------------------------------------------------------------------

TP.sherpa.Element.Inst.defineMethod('haloCanBlur',
function(aHalo) {

    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.Element.Inst.defineMethod('haloCanFocus',
function(aHalo) {

    return false;
});

//  ========================================================================
//  TP.sherpa.TemplatedTag
//  ========================================================================

/**
 * @type {TP.sherpa.TemplatedTag}
 * @summary A tag type that is templated and also has the common aspect of all
 *     XControls tags.
 */

//  ------------------------------------------------------------------------

TP.core.TemplatedTag.defineSubtype('sherpa.TemplatedTag');

TP.sherpa.TemplatedTag.addTraits(TP.sherpa.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
