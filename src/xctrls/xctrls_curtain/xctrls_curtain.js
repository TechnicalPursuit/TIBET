//  ========================================================================
/*
NAME:   xctrls_curtain.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.2, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.1
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

/**
 * @type {TP.xctrls.curtain}
 * @synopsis Manages curtain XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:curtain');

TP.xctrls.curtain.addTraitsFrom(TP.xctrls.Element,
                                TP.core.TemplatedNode);
TP.xctrls.curtain.Type.resolveTrait('tshCompile', TP.core.TemplatedNode);

//  This is necessary to avoid a warning when we set() the traited-in attribute
//  below - we need it to be defined.
TP.xctrls.curtain.executeTraitResolution();

//  xctrls:curtain controls are initially hidden, so we ensure that here.
TP.xctrls.curtain.set('requiredAttrs', TP.hc('pclass:hidden', true));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
