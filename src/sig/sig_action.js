//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
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
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @summary For this type, this method merely returns TP.DESCEND,
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
