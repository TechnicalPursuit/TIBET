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

TP.dom.UIElementNode.defineSubtype('tibet:sherpa');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.tibet.sherpa.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest. For this
     *     tag this means setting the location of the current document to
     *     contain the framing for the Sherpa.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        elemWin,
        sherpaURI,
        request;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    elemWin = TP.nodeGetWindow(elem);

    //  Get the URI we need to force into the window/frame.
    sherpaURI = TP.uc('~ide_root/xhtml/sherpa_framing.xhtml');

    //  Set up an onload handler that will complete the construction process.
    request = TP.request();
    request.atPut(
        TP.ONLOAD,
        function(aDocument) {
            var newSherpa;

            //  This performs some initial setup. The first time the Sherpa is
            //  triggered, it will complete this sequence.
            newSherpa = TP.sherpa.IDE.construct();
            newSherpa.setID('Sherpa');

            TP.sys.registerObject(newSherpa);

            //  Refresh controllers now that we have a registered Sherpa
            //  instance.
            TP.sys.getApplication().refreshControllers();

            //  Register the new Sherpa instance to observe 'ToggleSherpa'. This
            //  will be thrown by various objects in the system to toggle the
            //  Sherpa in and out.
            newSherpa.observe(TP.ANY, 'TP.sig.ToggleSherpa');
        });

    //  NOTE: We wait for the next repaint here to allow the Mutation Observer
    //  machinery to settle down. Otherwise, strange things start happening
    //  around parentNodes, etc.
    /* eslint-disable no-extra-parens */
    (function() {
        TP.wrap(elemWin).setContent(sherpaURI, request);
    }).queueBeforeNextRepaint(elemWin);
    /* eslint-enable no-extra-parens */

    return this;
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
