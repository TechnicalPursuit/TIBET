//  ========================================================================
/*
NAME:   TP.sig.UserOutputRequest.js
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
 * @type {TP.sig.UserOutputRequest}
 * @synopsis The primary type used to provide output to the user. In response to
 *     requests of this type the console will look up a template and use it to
 *     format output for display.
 */

//  ------------------------------------------------------------------------

TP.sig.UserIORequest.defineSubtype('UserOutputRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.UserOutputRequest.Type.defineAttribute('responseType', 'TP.sig.UserOutput');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  what type of message? help, request, success, error, etc.
TP.sig.UserOutputRequest.Inst.defineAttribute('messageType', 'message');

//  the node used to display the output for this request
TP.sig.UserOutputRequest.Inst.defineAttribute('outputNode');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.UserOutputRequest.Inst.defineMethod('getOutputNode',
function() {

    /**
     * @name getOutputNode
     * @synopsis Returns the output node used to display output for this
     *     request. Requestors can leverage this to get a handle to the actual
     *     output cell without having direct knowledge of the console used to
     *     perform the output itself.
     * @returns {Node} 
     */

    return this.$get('outputNode');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

