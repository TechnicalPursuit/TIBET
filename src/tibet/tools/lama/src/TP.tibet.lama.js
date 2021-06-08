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
 * @type {TP.tibet.lama}
 */

//  ----------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('tibet:lama');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.tibet.lama.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest. For this
     *     tag this means setting the location of the current document to
     *     contain the framing for the Lama.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        elemWin,
        lamaURI,
        request;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    elemWin = TP.nodeGetWindow(elem);

    //  Get the URI we need to force into the window/frame.
    lamaURI = TP.uc('~ide_root/xhtml/lama_framing.xhtml');

    //  Set up an onload handler that will complete the construction process.
    request = TP.request();
    request.atPut(
        TP.ONLOAD,
        function(aDocument) {
            var newLama;

            //  This performs some initial setup. The first time the Lama is
            //  triggered, it will complete this sequence.
            newLama = TP.lama.IDE.construct();
            newLama.setID('Lama');

            TP.sys.registerObject(newLama);

            //  Refresh controllers now that we have a registered Lama
            //  instance. Note that the Lama is specially registered as a
            //  controller by this method to avoid being put in a random
            //  location in the application's controller stack.
            TP.sys.getApplication().refreshControllers();

            //  Register the new Lama instance to observe 'ToggleLama'. This
            //  will be thrown by various objects in the system to toggle the
            //  Lama in and out.
            newLama.observe(TP.ANY, 'TP.sig.ToggleLama');
        });

    //  NOTE: We wait for the next repaint here to allow the Mutation Observer
    //  machinery to settle down. Otherwise, strange things start happening
    //  around parentNodes, etc.
    /* eslint-disable no-extra-parens */
    (function() {
        TP.wrap(elemWin).setContent(lamaURI, request);
    }).queueBeforeNextRepaint(elemWin);
    /* eslint-enable no-extra-parens */

    return this;
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
