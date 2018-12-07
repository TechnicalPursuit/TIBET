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
//  TP.svg.font
//  ========================================================================

/**
 * @type {TP.svg.font}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:font');

TP.svg.font.addTraits(TP.svg.Element);

TP.svg.font.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.font.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.font_face
//  ========================================================================

/**
 * @type {TP.svg.font_face}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:font_face');

TP.svg.font_face.addTraits(TP.svg.Element);

TP.svg.font_face.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.font_face.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Local Attributes
//  ------------------------------------------------------------------------

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.font_face.set('localName', 'font-face');

//  ========================================================================
//  TP.svg.glyph
//  ========================================================================

/**
 * @type {TP.svg.glyph}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:glyph');

TP.svg.glyph.addTraits(TP.svg.Element);

TP.svg.glyph.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.glyph.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.missing_glyph
//  ========================================================================

/**
 * @type {TP.svg.missing_glyph}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:missing_glyph');

TP.svg.missing_glyph.addTraits(TP.svg.Element);

TP.svg.missing_glyph.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.missing_glyph.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Local Attributes
//  ------------------------------------------------------------------------

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.missing_glyph.set('localName', 'missing-glyph');

//  ========================================================================
//  TP.svg.hkern
//  ========================================================================

/**
 * @type {TP.svg.hkern}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:hkern');

TP.svg.hkern.addTraits(TP.svg.Element);

TP.svg.hkern.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.hkern.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.vkern
//  ========================================================================

/**
 * @type {TP.svg.vkern}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:vkern');

TP.svg.vkern.addTraits(TP.svg.Element);

TP.svg.vkern.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.vkern.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.font_face_src
//  ========================================================================

/**
 * @type {TP.svg.font_face_src}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:font_face_src');

TP.svg.font_face_src.addTraits(TP.svg.Element);

TP.svg.font_face.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.font_face.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Local Attributes
//  ------------------------------------------------------------------------

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.font_face_src.set('localName', 'font-face-src');

//  ========================================================================
//  TP.svg.font_face_uri
//  ========================================================================

/**
 * @type {TP.svg.font_face_uri}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:font_face_uri');

TP.svg.font_face_uri.addTraits(TP.svg.Element);

TP.svg.font_face_uri.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.font_face_uri.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Local Attributes
//  ------------------------------------------------------------------------

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.font_face_uri.set('localName', 'font-face-uri');

//  ========================================================================
//  TP.svg.font_face_format
//  ========================================================================

/**
 * @type {TP.svg.font_face_format}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:font_face_format');

TP.svg.font_face_format.addTraits(TP.svg.Element);

TP.svg.font_face_format.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.font_face_format.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Local Attributes
//  ------------------------------------------------------------------------

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.font_face_format.set('localName', 'font-face-format');

//  ========================================================================
//  TP.svg.font_face_name
//  ========================================================================

/**
 * @type {TP.svg.font_face_name}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:font_face_name');

TP.svg.font_face_name.addTraits(TP.svg.Element);

TP.svg.font_face_name.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.font_face_name.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Local Attributes
//  ------------------------------------------------------------------------

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.font_face_name.set('localName', 'font-face-name');

//  ========================================================================
//  TP.svg.definition_src
//  ========================================================================

/**
 * @type {TP.svg.definition_src}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:definition_src');

TP.svg.definition_src.addTraits(TP.svg.Element);

TP.svg.definition_src.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.definition_src.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Local Attributes
//  ------------------------------------------------------------------------

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.definition_src.set('localName', 'definition-src');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
