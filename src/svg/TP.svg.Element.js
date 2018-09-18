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
 * @type {TP.svg.Element}
 */

//  ------------------------------------------------------------------------

TP.dom.ElementNode.defineSubtype('svg.Element');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.svg.Element.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.svg.Element.Type.defineMethod('cmdRunContent',
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

    //  Make sure that we have an Element to work from.
    if (!TP.isElement(elem = aRequest.at('cmdNode'))) {
        return;
    }

    aRequest.atPut('cmdAsIs', true);
    aRequest.atPut('cmdBox', false);

    aRequest.complete(elem);

    return;
});

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.svg.Element.Type.defineMethod('tagResolve',
function(aRequest) {

    /**
     * @method tagResolve
     * @summary Resolves the receiver's content. This includes resolving XML
     *     Base URIs and virtual URIs that may occur on the receiver's
     *     attributes.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        uriAttrs;

    //  Make sure that we have a node to work from.
    if (TP.notValid(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    //  Grab the element's 'URI attributes'. If that's empty, then just
    //  return.
    if (TP.isEmpty(uriAttrs = this.get('uriAttrs'))) {
        return;
    }

    //  update the XML Base references in the node

    //  This call is the reason we overrode this method from our supertype's
    //  definition - note how we pass a prefix and a suffix to be stripped
    //  before URI computation and then to be prepended/appended back on
    //  when setting the result.
    TP.elementResolveXMLBase(elem, uriAttrs, 'url(', ')');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.svg.Element.Inst.defineMethod('isReadyToRender',
function() {

    /**
     * @method isReadyToRender
     * @summary Whether or not the receiver is 'ready to render'. Normally, this
     *     means that all of the resources that the receiver relies on to render
     *     have been loaded.
     * @returns {Boolean} Whether or not the receiver is ready to render.
     */

    //  SVG elements are always ready to render (at least in modern browsers
    //  ;-))
    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
