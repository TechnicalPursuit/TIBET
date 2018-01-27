//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.sherpa.domhud_TP_tibet_serviceContent}
 */

//  ------------------------------------------------------------------------

TP.sherpa.domhud_elementContent.defineSubtype('domhud_TP_tibet_serviceContent');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.domhud_TP_tibet_serviceContent.Inst.defineHandler('RefreshFromRemote',
function(aSignal) {

    var targetTPElem;

    targetTPElem =
        TP.uc('urn:tibet:domhud_target_source').getResource().get('result');
    if (TP.notValid(targetTPElem)) {
        return this;
    }

    targetTPElem.activate();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
