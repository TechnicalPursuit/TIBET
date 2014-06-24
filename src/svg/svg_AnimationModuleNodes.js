//  ========================================================================
/*
NAME:   svg_AnimationModuleNodes.js
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
//  TP.svg.animate
//  ========================================================================

/**
 * @type {TP.svg.animate}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:animate');

TP.svg.animate.addTraitsFrom(TP.svg.Element);

TP.svg.animate.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.set
//  ========================================================================

/**
 * @type {TP.svg.set}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:set');

TP.svg.set.addTraitsFrom(TP.svg.Element);

TP.svg.set.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.animateMotion
//  ========================================================================

/**
 * @type {TP.svg.animateMotion}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:animateMotion');

TP.svg.animateMotion.addTraitsFrom(TP.svg.Element);

TP.svg.animateMotion.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.animateTransform
//  ========================================================================

/**
 * @type {TP.svg.animateTransform}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:animateTransform');

TP.svg.animateTransform.addTraitsFrom(TP.svg.Element);

TP.svg.animateTransform.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.animateColor
//  ========================================================================

/**
 * @type {TP.svg.animateColor}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:animateColor');

TP.svg.animateColor.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.mpath
//  ========================================================================

/**
 * @type {TP.svg.mpath}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:mpath');

TP.svg.mpath.addTraitsFrom(TP.svg.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
