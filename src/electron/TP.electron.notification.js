//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.electron.notification}
 */

//  ------------------------------------------------------------------------

TP.electron.ActionTag.defineSubtype('electron.notification');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.electron.notification.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, showing a native notification.
     * @param {TP.sig.Request} aRequest The TP.sig.TSHRunRequest or other shell
     *     related request responsible for this tag.
     * @returns {TP.sig.Request|Number} The request or a TSH shell loop control
     *     constant which controls how the outer TSH processing loop should
     *     continue. Common values are TP.CONTINUE, TP.DESCEND, and TP.BREAK.
     */

    var elem,
        tpElem,

        attrList,
        configPOJO,

        bodyTPElem;

    elem = aRequest.at('cmdNode');
    tpElem = TP.wrap(elem);

    attrList = TP.ac('title');
    configPOJO = this.buildConfigObjectFromAttributes(elem, attrList);

    //  Note use of descendant selector
    bodyTPElem = tpElem.get(TP.cpc(' label'));

    if (TP.isValid(bodyTPElem)) {
        configPOJO.body = TP.str(bodyTPElem.getValue());
    }

    TP.electron.ElectronMain.signalMain('TP.sig.ShowNativeNotification',
        configPOJO);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
