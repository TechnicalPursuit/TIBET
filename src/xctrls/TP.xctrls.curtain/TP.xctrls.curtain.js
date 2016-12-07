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
 * @type {TP.xctrls.curtain}
 * @summary Manages curtain XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:curtain');

TP.xctrls.curtain.addTraits(TP.xctrls.Element, TP.core.TemplatedNode);

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.curtain.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  xctrls:curtain controls are initially hidden, so we ensure that here.
TP.xctrls.curtain.set('requiredAttrs', TP.hc('pclass:hidden', true));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.curtain.Type.defineMethod('getSystemCurtainFor',
function(aTPDocument, aCurtainID) {

    /**
     * @method getSystemCurtain
     * @summary Returns (and, if necessary, creates) a 'shared system curtain'
     *     for use by the system on the supplied TP.core.Document.
     * @param {TP.core.Document} aTPDocument The document to create the curtain
     *     in, if it can't be found. Note that, in this case, the curtain will
     *     be created as the last child of the document's 'body' element.
     * @param {String} [aCurtainID=systemCurtain] The ID to use to query for the
     *     system curtain.
     * @returns {TP.xctrls.curtain} The system curtain on the supplied
     *     TP.core.Document.
     */

    var tpDocBody,
        curtainID,
        curtainElem,
        curtainTPElem;

    if (TP.notValid(aTPDocument)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    curtainID = TP.ifInvalid(aCurtainID, 'systemCurtain');

    curtainElem = aTPDocument.get('//*[@id="' + curtainID + '"]');

    //  If the 'get' expression above didn't find one, it hands back an empty
    //  Array. Otherwise it will hand back the TP.core.ElementNode that
    //  represents the curtain.
    if (TP.isEmpty(curtainElem)) {

        tpDocBody = aTPDocument.getBody();

        if (TP.isValid(tpDocBody)) {

            curtainElem = TP.elem('<xctrls:curtain id="' + curtainID + '"/>');

            curtainTPElem = tpDocBody.insertContent(
                                    curtainElem,
                                    TP.BEFORE_END,
                                    TP.hc('doc', aTPDocument.getNativeNode()));
        }
    }

    return curtainTPElem;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
