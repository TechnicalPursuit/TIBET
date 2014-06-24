//  ========================================================================
/*
NAME:   TP.sig.UserIORequest.js
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
//  ========================================================================

/**
 * @type {TP.sig.UserIORequest}
 * @synopsis The common supertype used for all user IO requests. These requests
 *     are typically handled by the console, whose response is to provide the
 *     user with an input cell for entering a response.
 */

//  ------------------------------------------------------------------------

TP.sig.IORequest.defineSubtype('UserIORequest');

TP.sig.UserIORequest.addTraitsFrom(TP.sig.UserIOSignal);
TP.sig.UserIORequest.Type.resolveTraits(
    TP.ac('shouldLog', 'getSignalName'),
    TP.sig.UserIORequest);
TP.sig.UserIORequest.Inst.resolveTraits(
    TP.ac('asSource', 'asDumpString', 'asHTMLString', 'asJSONSource',
            'asPrettyString', 'asXMLString', 'asString', 'at', 'atPut',
            'getSignalName', 'getProperty', 'copy', 'shouldLog', 'init',
            'handle', 'isRecyclable', 'recycle'),
    TP.sig.UserIORequest);

//  Resolve the traits right away as subtypes of this type are used during the
//  booting process.
TP.sig.UserIORequest.executeTraitResolution();

TP.sig.UserIORequest.Type.defineAttribute('defaultPolicy', TP.INHERITANCE_FIRING);

TP.sig.UserIORequest.isSignalingRoot(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.UserIORequest.Type.defineAttribute('responseType', 'TP.sig.UserIOResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

