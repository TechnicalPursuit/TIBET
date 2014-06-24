//  ========================================================================
/*
NAME:   svg_GradientModuleNodes.js
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
//  TP.svg.linearGradient
//  ========================================================================

/**
 * @type {TP.svg.linearGradient}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:linearGradient');

TP.svg.linearGradient.addTraitsFrom(TP.svg.Element);

TP.svg.linearGradient.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.radialGradient
//  ========================================================================

/**
 * @type {TP.svg.radialGradient}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:radialGradient');

TP.svg.radialGradient.addTraitsFrom(TP.svg.Element);

TP.svg.radialGradient.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.stop
//  ========================================================================

/**
 * @type {TP.svg.stop}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:stop');

TP.svg.stop.addTraitsFrom(TP.svg.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
