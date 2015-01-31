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
 * @type {TP.tibet.sherpa}
 */

//  ----------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('tibet:sherpa');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.tibet.sherpa.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        elemWin,

        sherpaURI,

        request,

        setContentFunc;

    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }
    elemWin = TP.nodeGetWindow(elem);

    sherpaURI = TP.uc('~ide_root/xhtml/sherpa_framing.xhtml');

    request = TP.request();

    request.atPut(TP.ONLOAD,
                function(aDocument) {
                    var newSherpa;

                    //  This performs some initial setup. The first time the
                    //  Sherpa is triggered, it will complete its setup
                    //  sequence.
                    newSherpa = TP.core.sherpa.construct();
                    newSherpa.setID('Sherpa');
                    TP.sys.registerObject(newSherpa);
                });

    /* eslint-disable no-wrap-func */
    (setContentFunc = function(aSignal) {
        setContentFunc.ignore(
            TP.wrap(elemWin.document), 'TP.sig.DOMContentLoaded');

        //  Set the content of this Window to the Sherpa content, but do so in a
        //  timeout giving the current attaching process time to finish.
        //  Otherwise, we end up in race conditions.
        (function() {
            TP.wrap(elemWin).setContent(sherpaURI, request);
        }).fork(100);

    }).observe(TP.wrap(elemWin.document), 'TP.sig.DOMContentLoaded');
    /* eslint-enable no-wrap-func */

    return this.callNextMethod();
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
