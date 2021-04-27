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
 * @type {TP.electron.dialog}
 */

//  ------------------------------------------------------------------------

TP.electron.ActionTag.defineSubtype('electron.dialog');

//  Note how this property is TYPE_LOCAL, by design.
TP.electron.dialog.defineAttribute('styleURI', TP.NO_RESULT);
TP.electron.dialog.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.electron.dialog.Type.set('bidiAttrs', TP.ac('value'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.electron.dialog.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, showing the proper dialog based on the 'type'
     *     attribute (or lack of one).
     * @param {TP.sig.Request} aRequest The TP.sig.TSHRunRequest or other shell
     *     related request responsible for this tag.
     * @returns {TP.sig.Request|Number} The request or a TSH shell loop control
     *     constant which controls how the outer TSH processing loop should
     *     continue. Common values are TP.CONTINUE, TP.DESCEND, and TP.BREAK.
     */

    var elem,
        tpElem,

        type,

        attrList,
        configPOJO,

        labelTPElem,
        buttonTPElems;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    tpElem = TP.wrap(elem);

    type = TP.elementGetAttribute(elem, 'type', true);

    switch (type) {
        case 'open':
            attrList = TP.ac('title', 'defaultPath', 'buttonLabel', 'filters',
                                'properties');
            configPOJO = this.buildConfigObjectFromAttributes(elem, attrList);

            TP.electron.ElectronMain.signalMain('TP.sig.ShowNativeOpenDialog',
                configPOJO).then(
                function(dialogResult) {
                    var filePaths;

                    if (!dialogResult.canceled) {
                        filePaths = dialogResult.filePaths;

                        //  If the element is bound, then update its bound value.
                        tpElem.setBoundValueIfBound(filePaths);
                    }
                });
            break;

        case 'save':
            attrList = TP.ac('title', 'defaultPath', 'buttonLabel', 'filters',
                                'properties');
            configPOJO = this.buildConfigObjectFromAttributes(elem, attrList);

            TP.electron.ElectronMain.signalMain('TP.sig.ShowNativeSaveDialog',
                configPOJO).then(
                function(dialogResult) {
                    var filePath;

                    if (!dialogResult.canceled) {
                        filePath = dialogResult.filePath;

                        //  If the element is bound, then update its bound value.
                        tpElem.setBoundValueIfBound(filePath);
                    }
                });
            break;

        case 'error':

            attrList = TP.ac('title');
            configPOJO = this.buildConfigObjectFromAttributes(elem, attrList);

            //  Note use of descendant selector
            labelTPElem = tpElem.get(TP.cpc(' label'));

            if (TP.isValid(labelTPElem)) {
                configPOJO.message = TP.str(labelTPElem.getValue());
            }

            //  Note use of descendant selector and that we don't collapse the
            //  result - we always want an Array, even if it's just 1 item.
            buttonTPElems = tpElem.get(TP.cpc(' button',
                                        TP.hc('shouldCollapse', false)));

            TP.electron.ElectronMain.signalMain('TP.sig.ShowNativeErrorDialog',
                configPOJO);
            break;

        default:
            attrList = TP.ac('title', 'type', 'defaultId');
            configPOJO = this.buildConfigObjectFromAttributes(elem, attrList);

            //  Note use of descendant selector
            labelTPElem = tpElem.get(TP.cpc(' label'));

            if (TP.isValid(labelTPElem)) {
                configPOJO.message = TP.str(labelTPElem.getValue());
            }

            //  Note use of descendant selector and that we don't collapse the
            //  result - we always want an Array, even if it's just 1 item.
            buttonTPElems = tpElem.get(TP.cpc(' button',
                                        TP.hc('shouldCollapse', false)));

            if (TP.notEmpty(buttonTPElems)) {
                configPOJO.buttons = TP.ac();

                //  For some reason, showing the native dialog orders the
                //  buttons in reverse order - so we reverse them before we
                //  process them.
                buttonTPElems.reverse();

                buttonTPElems.forEach(
                    function(aButtonTPElem) {
                        configPOJO.buttons.push(
                            TP.str(aButtonTPElem.getValue()));
                    });
            }

            TP.electron.ElectronMain.signalMain('TP.sig.ShowNativeDialog',
                configPOJO).then(
                function(dialogResult) {
                    var buttonIndex;

                    buttonIndex = dialogResult.response;

                    if (TP.isNumber(buttonIndex)) {
                        //  If the element is bound, then update its bound value.
                        tpElem.setBoundValueIfBound(buttonIndex);
                    }
                });
            break;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
