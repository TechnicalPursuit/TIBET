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

TP.sherpa.domhud_TP_tibet_serviceContent.Inst.defineHandler('BrowseToURI',
function(aSignal) {

    /**
     * @method handleBrowseToURI
     * @summary Handles when the user wants to browse to the selected URI.
     * @param {TP.sig.BrowseToURI} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud_TP_tibet_serviceContent} The receiver.
     */

    var fieldName,

        loc,
        cmdText;

    fieldName =
        TP.wrap(aSignal.getTarget()).getParentNode().getAttribute('for');

    loc = TP.byId(fieldName, this).get('value');

    //  Make sure to escape any slashes - this is important as the Sherpa
    //  inspector can use '/' as a 'path separator' and we want the URI to be
    //  treated as a 'whole'.
    loc = TP.stringEscapeSlashes(loc);

    cmdText = ':inspect --path=\'_URIS_/' + loc + '\'';
    TP.signal(null,
                'ConsoleCommand',
                TP.hc('cmdText', cmdText,
                        'showBusy', true));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud_TP_tibet_serviceContent.Inst.defineHandler('RefreshFromRemote',
function(aSignal) {

    /**
     * @method handleRefreshFromRemote
     * @summary Handles when the user wants to refresh the result from the
     *     remote URI.
     * @param {TP.sig.RefreshFromRemote} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.domhud_TP_tibet_serviceContent} The receiver.
     */

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
