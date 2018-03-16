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
 * @type {TP.xctrls.FramedElement}
 * @summary A common supertype for various DHTML controls that require a
 *     'frame' to wrap around them.
 */

//  ------------------------------------------------------------------------

TP.xctrls.Element.defineSubtype('FramedElement');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  A URI to the 'frame file' - the file that will be loaded into the iframe
//  that this type builds to hold the custom control.
TP.xctrls.FramedElement.Type.defineAttribute('frameFileURI');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The element.
     */

    var elem,

        theID,

        frameElem;

    //  Make sure to 'call up', since 'xctrls:Element' types do processing
    //  for this step.
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Obtain the (or compute a unique) ID for the produced element.
    theID = TP.lid(elem, true);

    //  Build an iframe element to contain our custom element.
    frameElem = TP.elem(
                    TP.join('<iframe xmlns="', TP.w3.Xmlns.XHTML, '"',
                            ' id="', theID, '_frame"',
                            ' style="position: relative; border: none;',
                            ' width: 100%; height: 100%"></iframe>'));

    TP.nodeAppendChild(elem, frameElem, false);

    return elem;
});

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        elemTPNode,

        stubHref,
        stubURI;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Get a handle to a TP.dom.ElementNode representing an instance of this
    //  element type wrapped around elem.
    elemTPNode = TP.tpnode(elem);

    if (TP.notEmpty(stubHref = TP.elementGetAttribute(elem, 'stubHref'))) {
        stubURI = TP.uc(stubHref);
    } else {
        stubURI = this.get('frameFileURI');
    }

    //  Begin the iframe load sequence
    elemTPNode.startIFrameLoad(stubURI);

    return;
});

//  ------------------------------------------------------------------------
//  TSH Execution Content
//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @method cmdRunContent
     * @summary Invoked by the TIBET Shell when the tag is being "run" as part
     *     of a pipe or command sequence. For a UI element like an HTML element
     *     this effectively means to render itself onto the standard output
     *     stream.
     * @param {TP.sig.Request|TP.core.Hash} aRequest The request/param hash.
     */

    var elem;

    //  Make sure that we have a node to work from.
    if (TP.notValid(elem = aRequest.at('cmdNode'))) {
        return;
    }

    aRequest.atPut('cmdAsIs', true);
    aRequest.atPut('cmdBox', false);

    aRequest.atPut('cmdMinHeight', 200);

    aRequest.complete(elem);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Inst.defineAttribute('tpIFrame');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Inst.defineMethod('init',
function(aNode, aURI) {

    /**
     * @method init
     * @summary Returns a newly initialized instance.
     * @param {Node} aNode A native node.
     * @param {TP.uri.URI|String} aURI An optional URI from which the Node
     *     received its content.
     * @returns {TP.xctrls.FramedElement} A new instance.
     */

    var iFrame;

    this.callNextMethod();

    //  Grab a TP.dom.ElementNode reference to the iframe that we built.
    iFrame = this.getDocument().getElementById(
                            this.getAttribute('id') + '_frame');

    if (TP.isKindOf(iFrame, 'TP.dom.ElementNode')) {
        this.set('tpIFrame', iFrame);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Inst.defineMethod('configure',
function() {

    /**
     * @method configure
     * @summary Configure the custom element as part of the startup process.
     *     This is called from the iframe's 'onload' hook and provides a
     *     mechanism for further processing after the content in the iframe has
     *     been completely loaded and initialized.
     * @returns {TP.xctrls.FramedElement} The receiver.
     * @fires TP.sig.DOMReady
     */

    //  Dispatch 'TP.sig.DOMReady' for consistency with other elements that
    //  dispatch this when their 'dynamic content' is resolved. Note that we use
    //  'dispatch()' here because this is a DOM signal and we want all of the
    //  characteristics of a DOM signal.
    this.dispatch('TP.sig.DOMReady');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Inst.defineMethod('getNativeContentDocument',
function() {

    /**
     * @method getNativeContentDocument
     * @summary Returns the content document (that is the contained 'document')
     *     of the receiver in a TP.dom.Document wrapper.
     * @returns {Document} The Document object contained by the receiver.
     */

    return this.get('tpIFrame').getNativeContentDocument();
});

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Inst.defineMethod('getNativeContentWindow',
function() {

    /**
     * @method getNativeContentWindow
     * @summary Returns the content window (that is the 'contained window') of
     *     the receiver.
     * @returns {Window} The Window object contained by the receiver.
     */

    return this.get('tpIFrame').getNativeContentWindow();
});

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Inst.defineMethod('setID',
function(anID) {

    /**
     * @method setID
     * @summary Sets the public ID of the receiver.
     * @description This method is overridden from its supertype to set the ID
     *     of it's underlying frame to something consistent with the supplied
     *     ID.
     * @param {String} anID The value to use as a public ID.
     * @returns {String} The ID that was set.
     */

    this.get('tpIFrame').setID(anID + '_frame');

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Inst.defineMethod('startIFrameLoad',
function(stubURI) {

    /**
     * @method startIFrameLoad
     * @summary Begins the iframe loading of the receiver. This method loads
     *     the content from the supplied URI into the iframe constructed by this
     *     type and sets up a callback handler that will call this type's
     *     'configure' method when the content from the iframe is all loaded and
     *     initialized.
     * @param {TP.uri.URI} stubURI The URI to load the 'stub' HTML from.
     * @returns {TP.xctrls.FramedElement} The receiver.
     */

    var tpIFrame,

        natIFrameWin;

    tpIFrame = this.get('tpIFrame');

    //  Set up the 'frameLoad' Function to call our 'configure' method
    //  indicating that iframe is completely loaded and ready to go. The
    //  'frameLoad' function should be invoked by logic in the iframe's
    //  'onload' machinery when everything is complete in there.
    tpIFrame.getNativeNode().frameLoad = function() {

        this.configure();

        tpIFrame.getNativeNode().tpObj = this;
    }.bind(this);

    if (TP.notEmpty(stubURI)) {
        natIFrameWin = tpIFrame.getNativeContentWindow();
        natIFrameWin.location = stubURI.getLocation();
    } else {
        //  TODO: Log an error.
        void 0;
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
