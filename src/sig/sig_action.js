//  ========================================================================
/*
NAME:   sig_action.js
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

/*
@type       TP.sig.action
@abstract   An XML Events v2 (draft) tag whose role is to run child actions
            contained within it.
@discussion The semantics of this tag do not include any transactional
            behavior such as that found in early XForms versions. Each
            action child is run independently. As a result the standard tag
            processing iteration handles running all contained children so
            this tag is effectively nothing but an event grouping construct
            with no functionality.
            Unfortunately, the extra attibutes defined by XML Events v2
            (draft) on this tag (specifically 'targetid' and 'declare') are
            not appropriate for TIBET's version of this element, so we
            define our own in the 'TP.sig.' namespace.
*/

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('sig:action');

//  ------------------------------------------------------------------------

TP.sig.action.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @name tshExecute
     * @synopsis Runs the receiver, effectively invoking its action.
     * @description For this type, this method merely returns TP.DESCEND,
     *     allowing all of its 'action' children to get their chance at
     *     processing the request.
     * @param {TP.sig.Request} aRequest The TP.sig.TSHRunRequest or other shell
     *     related request responsible for this tag.
     * @returns {Constant} A TSH shell loop control constant.
     */

    return TP.DESCEND;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

