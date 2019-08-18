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

    /**
     * @method getContentDocument
     * @summary Returns a TP.dom.Document instance wrapping the receiver's
     *     document object. To get the native document object use
     *     getNativeDocument().
     * @returns {TP.dom.Document} The TP.dom.Document object wrapping the
     *     receiver's native document object.
     */

    var iframeTPElem,
        iframeTPDoc;

    iframeTPElem = this.get('contentIFrame');
    iframeTPDoc = iframeTPElem.getContentDocument();

    return iframeTPDoc;
});

//  ------------------------------------------------------------------------

TP.sherpa.screen.Inst.defineMethod('getContentWindow',
function() {

    /**
     * @method getContentWindow
     * @summary Returns the content window (that is the 'contained window') of
     *     the receiver as a TP.core.Window wrapper. For TP.core.Window
     *     instances this returns the instance itself.
     * @returns {TP.core.Window} The Window contained by the receiver.
     */

    var iframeTPElem,
        iframeTPWin;

    iframeTPElem = this.get('contentIFrame');
    iframeTPWin = iframeTPElem.getContentWindow();

    return iframeTPWin;
});

//  ------------------------------------------------------------------------

TP.sherpa.screen.Inst.defineMethod('getLocation',
function() {

    /**
     * @method getLocation
     * @summary Returns the location (URL) currently set for the receiver's
     *     document. Note that this is often NOT the native window's location
     *     property due to TIBET's use of setContent/setLocation which are not
     *     always able to properly update the location value.
     * @returns {String} The window's document location.
     */

    var iframeTPElem,
        iframeTPDoc;

    iframeTPElem = this.get('contentIFrame');
    iframeTPDoc = iframeTPElem.getContentDocument();

    return iframeTPDoc.getLocation();
});

//  ------------------------------------------------------------------------

TP.sherpa.screen.Inst.defineMethod('setLocation',
function(aURL, aRequest) {

    /**
     * @method setLocation
     * @summary Sets the receiver's window's location to the URL provided. This
     *     method is similar to the native '<windowRef>.location =' call, except
     *     that it will process content at the end of the URL and set up proper
     *     TIBET constructs in the receiver's native window.
     * @param {String|TP.uri.URI} aURL The URL of the content to load into this
     *     object's window.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {TP.core.Window} The receiver.
     */

    var iframeTPElem,
        iframeTPWin;

    iframeTPElem = this.get('contentIFrame');
    iframeTPWin = iframeTPElem.getContentWindow();

    return iframeTPWin.setLocation(aURL, aRequest);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
