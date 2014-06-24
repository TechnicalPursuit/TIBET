//  ========================================================================
/*
NAME:   TP.sig.UserInputRequest.js
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
 * @type {TP.sig.UserInputRequest}
 * @synopsis The common type used to get direct input from the user. In response
 *     to TP.sig.UserInputRequests the console will give control over the input
 *     cell content to the request, skipping any parsing of content.
 */

//  ------------------------------------------------------------------------

TP.sig.UserIORequest.defineSubtype('UserInputRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.UserInputRequest.Type.defineAttribute('responseType', 'TP.sig.UserInput');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  what type of message? help, request, success, error, etc.
TP.sig.UserInputRequest.Inst.defineAttribute('messageType', 'prompt');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

