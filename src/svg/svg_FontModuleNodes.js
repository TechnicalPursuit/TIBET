//  ========================================================================
/*
NAME:   svg_FontModuleNodes.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.svg.font
//  ========================================================================

/**
 * @type {TP.svg.font}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:font');

TP.svg.font.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.font_face
//  ========================================================================

/**
 * @type {TP.svg.font_face}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:font_face');

TP.svg.font_face.addTraitsFrom(TP.svg.Element);


//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.font_face.set('localName', 'font-face');

//  ========================================================================
//  TP.svg.glyph
//  ========================================================================

/**
 * @type {TP.svg.glyph}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:glyph');

TP.svg.glyph.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.missing_glyph
//  ========================================================================

/**
 * @type {TP.svg.missing_glyph}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:missing_glyph');

TP.svg.missing_glyph.addTraitsFrom(TP.svg.Element);

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.missing_glyph.set('localName', 'missing-glyph');

//  ========================================================================
//  TP.svg.hkern
//  ========================================================================

/**
 * @type {TP.svg.hkern}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:hkern');

TP.svg.hkern.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.vkern
//  ========================================================================

/**
 * @type {TP.svg.vkern}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:vkern');

TP.svg.vkern.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.font_face_src
//  ========================================================================

/**
 * @type {TP.svg.font_face_src}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:font_face_src');

TP.svg.font_face_src.addTraitsFrom(TP.svg.Element);

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.font_face_src.set('localName', 'font-face-src');

//  ========================================================================
//  TP.svg.font_face_uri
//  ========================================================================

/**
 * @type {TP.svg.font_face_uri}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:font_face_uri');

TP.svg.font_face_uri.addTraitsFrom(TP.svg.Element);

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.font_face_uri.set('localName', 'font-face-uri');

//  ========================================================================
//  TP.svg.font_face_format
//  ========================================================================

/**
 * @type {TP.svg.font_face_format}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:font_face_format');

TP.svg.font_face_format.addTraitsFrom(TP.svg.Element);

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.font_face_format.set('localName', 'font-face-format');

//  ========================================================================
//  TP.svg.font_face_name
//  ========================================================================

/**
 * @type {TP.svg.font_face_name}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:font_face_name');

TP.svg.font_face_name.addTraitsFrom(TP.svg.Element);

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.font_face_name.set('localName', 'font-face-name');

//  ========================================================================
//  TP.svg.definition_src
//  ========================================================================

/**
 * @type {TP.svg.definition_src}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:definition_src');

TP.svg.definition_src.addTraitsFrom(TP.svg.Element);

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.definition_src.set('localName', 'definition-src');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
