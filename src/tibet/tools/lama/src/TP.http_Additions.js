//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  TP.http.* Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.http.service.Inst.defineMethod('getContentForDomHUDTileBody',
function() {

    /**
     * @method getContentForDomHUDTileBody
     * @summary Returns the content that the Lama's 'domhud' panel will use
     *     as the 'tile body' when displaying it's 'tile' panel for this node.
     * @returns {Element} The Element that will be used as the content for the
     *     'body' of the domhud tile panel.
     */

    return TP.elem('<lama:domhud_TP_http_serviceContent/>');
});

//  ------------------------------------------------------------------------

TP.http.service.Inst.defineMethod('getContentForDomHUDTileFooter',
function() {

    /**
     * @method getContentForDomHUDTileFooter
     * @summary Returns the content that the Lama's 'domhud' panel will use
     *     as the 'tile footer' when displaying it's 'tile' panel for this node.
     * @returns {Element} The Element that will be used as the content for the
     *     'footer' of the domhud tile panel.
     */

    return null;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
