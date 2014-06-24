//  ========================================================================
/*
NAME:   html_ScriptingModuleNodes.js
AUTH:   Scott Shattuck (ss)
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
//  TP.html.command (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.command}
 * @synopsis 'command' tag. Represents a command the user can invoke.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('command');

//  ========================================================================
//  TP.html.keygen (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.keygen}
 * @synopsis 'keygen' tag. Key pair generation.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('keygen');

//  ========================================================================
//  TP.html.noscript
//  ========================================================================

/**
 * @type {TP.html.noscript}
 * @synopsis 'noscript' tag. When client-side scripts disabled/unsupported.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('noscript');

//  ========================================================================
//  TP.html.script
//  ========================================================================

/**
 * @type {TP.html.script}
 * @synopsis 'script' tag. Embedded programming -- hmmm sounds familiar ;)
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('script');

TP.html.script.set('uriAttrs', TP.ac('src'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.script.Type.defineMethod('$xmlifyContent',
function(src) {

    //  TODO:   optimize for sugared XHTML input
    return src;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
