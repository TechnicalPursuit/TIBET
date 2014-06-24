//  ========================================================================
/*
NAME:   ev:listener.js
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

/**
 * @type {ev:listener}
 * @synopsis A wrapper for the XML Events ev:listener element.
 * @description The official XML Events listener element is considered by some
 *     to be superfluous since you can place ev: attributes on elements to
 *     event-enable them. Of course, you can XInclude listener elements as one
 *     way of getting "value" from them by allowing you to factor them out into
 *     reusable blocks of event handler support.
 */

//  ------------------------------------------------------------------------

TP.core.InfoElementNode.defineSubtype('ev:listener');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
