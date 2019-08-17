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
 * @type {TP.sherpa.screen}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('screen');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.screen.Inst.defineAttribute('infoElement');

TP.sherpa.screen.Inst.defineAttribute('contentIFrame',
    TP.cpc('> iframe', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------

TP.sherpa.screen.Inst.defineMethod('getContentDocument',
function() {

    var iframeTPElem,
        iframeTPDoc;

    iframeTPElem = this.get('contentIFrame');
    iframeTPDoc = iframeTPElem.getContentDocument();

    return iframeTPDoc;
});

//  ------------------------------------------------------------------------

TP.sherpa.screen.Inst.defineMethod('getContentWindow',
function() {

    var iframeTPElem,
        iframeTPWin;

    iframeTPElem = this.get('contentIFrame');
    iframeTPWin = iframeTPElem.getContentWindow();

    return iframeTPWin;
});

//  ------------------------------------------------------------------------

TP.sherpa.screen.Inst.defineMethod('getLocation',
function() {

    var iframeTPElem,
        iframeTPDoc;

    iframeTPElem = this.get('contentIFrame');
    iframeTPDoc = iframeTPElem.getContentDocument();

    return iframeTPDoc.getLocation();
});

//  ------------------------------------------------------------------------

TP.sherpa.screen.Inst.defineMethod('setLocation',
function(aURL, aRequest) {

    var iframeTPElem,
        iframeTPWin;

    iframeTPElem = this.get('contentIFrame');
    iframeTPWin = iframeTPElem.getContentWindow();

    return iframeTPWin.setLocation(aURL, aRequest);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
