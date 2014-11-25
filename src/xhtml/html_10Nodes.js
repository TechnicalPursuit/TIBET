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
 * @description This file contains the definitions for the various XHTML 1.0
 *     node subtypes that were not categorized by the W3C into modules in XHTML
 *     1.1. This is mostly because these tags are formatting tags that have been
 *     deprecated by the W3C in favor of using style sheets or they are
 *     frame/frameset related. They are included in TIBET for completeness, but
 *     their use is discouraged.
 * @subject XHTML 1.0 Nodes
 * @todo
 */

//  ========================================================================
//  TP.html.applet
//  ========================================================================

/**
 * @type {TP.html.applet}
 * @synopsis 'applet' tag. An applet.
 */

//  ------------------------------------------------------------------------

TP.html.CoreAttrs.defineSubtype('applet');

TP.html.applet.Type.set('uriAttrs', TP.ac('src'));

//  ========================================================================
//  TP.html.basefont
//  ========================================================================

/**
 * @type {TP.html.basefont}
 * @synopsis 'basefont' tag. Base font size.
 */

//  ------------------------------------------------------------------------

TP.html.CoreAttrs.defineSubtype('basefont');

//  ========================================================================
//  TP.html.center
//  ========================================================================

/**
 * @type {TP.html.center}
 * @synopsis 'center' tag. Center content.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('center');

//  ========================================================================
//  TP.html.dir
//  ========================================================================

/**
 * @type {TP.html.dir}
 * @synopsis 'dir' tag. Multiple column list. (Deprecated)
 */

//  ------------------------------------------------------------------------

TP.html.List.defineSubtype('dir');

TP.html.dir.Type.set('booleanAttrs', TP.ac('compact'));

//  ========================================================================
//  TP.html.font
//  ========================================================================

/**
 * @type {TP.html.font}
 * @synopsis 'font' tag. Local font change.
 */

//  ------------------------------------------------------------------------

TP.html.CoreAttrs.defineSubtype('font');

//  ========================================================================
//  TP.html.frame
//  ========================================================================

/**
 * @type {TP.html.frame}
 * @synopsis 'frame' tag. An individual frame.
 */

//  ------------------------------------------------------------------------

TP.html.CoreAttrs.defineSubtype('frame');

TP.html.frame.Type.set('booleanAttrs', TP.ac('noResize'));

//  ========================================================================
//  TP.html.frameset
//  ========================================================================

/**
 * @type {TP.html.frameset}
 * @synopsis 'frameset' tag.
 */

//  ------------------------------------------------------------------------

TP.html.CoreAttrs.defineSubtype('frameset');

//  ========================================================================
//  TP.html.iframe
//  ========================================================================

/**
 * @type {TP.html.iframe}
 * @synopsis 'iframe' tag. Inline frame (subwindow). Note that this type mixes
 *     in TP.core.UICanvas which allows iframe elements to work as UICanvas
 *     elements.
 */

//  ------------------------------------------------------------------------

//  an IFRAME is an element...
TP.html.CoreAttrs.defineSubtype('iframe');

TP.html.iframe.Type.set('booleanAttrs', TP.ac('seamless', 'allowFullscreen'));

//  IFRAME elements are also UI canvases just like windows
TP.html.iframe.addTraits(TP.core.UICanvas);

TP.html.iframe.Type.resolveTraits(
    TP.ac('cmdGetContent', 'cmdSetContent', 'constructContentObject',
            'getConcreteType', 'fromObject', 'fromString', 'fromTP_sig_Signal',
            'handleSignal', 'construct'),
        TP.html.CoreAttrs);

TP.html.iframe.Inst.resolveTraits(
    TP.ac('getContentNode', 'canResolveDNU', 'resolveDNU', 'getContentMIMEType',
            'asSource', 'getKeys', 'isResponderFor', 'getNextResponder',
            'asDumpString', 'asHTMLString', 'asJSONSource', 'asPrettyString',
            'asXMLString', 'getName', 'getID', 'setID', 'getLocalName',
            'asString', 'changed', 'shouldSignalChange', 'at', 'atPut',
            'signal', 'observe', 'resume', 'suspend', 'getSize', 'getValues',
            'first', 'last', 'getPairs', 'getKVPairs', 'getItems', 'equalTo',
            'getProperty', 'get', 'getContent', 'getValue', 'setProperty',
            'set', 'setValue', 'perform', 'collect', 'collectGet',
            'collectInvoke', 'convert', 'detectInvoke', 'detectMax',
            'detectMin', 'flatten', 'grep', 'grepKeys', 'groupBy', 'injectInto',
            'orderedBy', 'partition', 'performInvoke', 'performOver',
            'performSet', 'performUntil', 'performWhile', 'reject', 'select',
            'containsKey', 'containsValue', 'contains', 'init',
            'processTP_sig_Request', 'asArray', 'asHTMLNode', 'asXHTMLNode',
            'asXHTMLString', 'asXMLNode', 'collapse', 'asHash', 'removeKey',
            'removeKeys', 'transform', 'identicalTo', 'defineBinding',
            'destroyBinding', 'refresh'),
        TP.html.CoreAttrs);

TP.html.iframe.Type.set('uriAttrs', TP.ac('src', 'longdesc'));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.iframe.Inst.defineMethod('setContentFromSource',
function() {

    /**
     * @name setContentFromSource
     * @synopsis Sets the content of the receiver to the content pointed to by
     *     it's 'src' attribute, running it through the content processor first.
     * @returns {TP.html.iframe} The receiver.
     */

    var srcPath;

    if (TP.notEmpty(srcPath = this.getAttribute('src'))) {
        this.setContentUsingRelativePath(srcPath);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.iframe.Inst.defineMethod('setContentUsingRelativePath',
function(aPath) {

    /**
     * @name setContentUsingRelativePath
     * @synopsis Sets the content of the receiver to the content pointed to by
     *     the supplied attribute, running it through the content processor
     *     first.
     * @description Note that the supplied path can be a relative URI, as the
     *     receiver will be asked to resolve it to an absolute URI. This is
     *     usually done by resolving it against the receiver's XML Base value or
     *     it's document baseURI if an XML Base value cannot be computed.
     * @param {String} aPath The URI to use as the path.
     * @returns {TP.html.iframe} The receiver.
     */

    var srcPath,
        srcURI;

    if (TP.notEmpty(aPath)) {

        //  This will compute an 'absolute path' using the value of our 'src'
        //  attribute and either our computed XML Base or our document's
        //  'baseURI'.
        srcPath = this.computeAbsoluteURIFromValue(aPath);

        //  See if we can turn the path value into a URI
        srcURI = TP.uc(srcPath);

        //  It may need a rewrite().
        srcURI = srcURI.rewrite();

        //  If we have a URI, set the content of our content window to it.
        if (TP.isURI(srcURI)) {

            //  Set our content to the fetched resource. This will cause content
            //  processing to occur.
            this.setContent(srcURI);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.UICanvas Interface
//  ------------------------------------------------------------------------

TP.html.iframe.Inst.defineMethod('getCanvasID',
function() {

    /**
     * @name getCanvasID
     * @synopsis Returns the canvas ID for the receiver. For an IFRAME this is
     *     computed differently than normal so that IFRAME elements appear to
     *     have canvas IDs similar to true frames.
     * @returns {String} The canvas's global ID.
     */

    return TP.join(this.getWindow().getCanvasID(), '.', this.getLocalID());
});

//  ------------------------------------------------------------------------

TP.html.iframe.Inst.defineMethod('getGlobalID',
function() {

    /**
     * @name getGlobalID
     * @synopsis Returns the global ID for the receiver.
     * @returns {String} The canvas's global ID.
     */

    //  we want the global ID for the iframe itself here, unlike the traited
    //  version which will return the global ID for the content window
    return TP.gid(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.html.iframe.Inst.defineMethod('getLocalID',
function() {

    /**
     * @name getLocalID
     * @synopsis Returns the local ID for the receiver.
     * @returns {String} The canvas's local ID.
     */

    //  we want to use the IFRAME element's 'id' attribute here, not an
    //  identifier for the content window as the traited version would do
    return TP.lid(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.html.iframe.Inst.defineMethod('getNativeContentDocument',
function() {

    /**
     * @name getNativeContentDocument
     * @synopsis Returns the content document (that is the contained 'document')
     *     of the receiver in a TP.core.Document wrapper.
     * @returns {Document} The Document object contained by the receiver.
     */

    var elem;

    if (TP.isElement(elem = this.getNativeNode())) {
        return TP.elementGetIFrameDocument(elem);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.html.iframe.Inst.defineMethod('getNativeContentWindow',
function() {

    /**
     * @name getNativeContentWindow
     * @synopsis Returns the content window (that is the 'contained window') of
     *     the receiver.
     * @returns {Window} The Window object contained by the receiver.
     */

    var elem;

    if (TP.isElement(elem = this.getNativeNode())) {
        return TP.elementGetIFrameWindow(elem);
    }

    return null;
});

//  ------------------------------------------------------------------------
//  GENERAL
//  ------------------------------------------------------------------------

TP.html.iframe.Inst.defineMethod('$get',
function(attributeName) {

    /**
     * @name $get
     * @synopsis Primitive $get() hook. Allows instances of this type to look up
     *     globals on their content window if a value for the attribute cannot
     *     be found on the receiver itself.
     * @param {String} attributeName The name/key of the attribute to return.
     * @returns {Object}
     */

    var val,
        win;

    //  Start by looking for the attribute (or a method) on this object.
    val = this.callNextMethod();

    //  If we got back an undefined value, then try to see if its a 'global
    //  slot' on our content window (very useful if we've loaded our content
    //  window with other code bases).
    if (TP.notDefined(val) &&
        TP.isWindow(win = this.getNativeContentWindow())) {
        val = win[attributeName];
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.html.iframe.Inst.defineMethod('constructObject',
function(constructorName) {

    /**
     * @name constructObject
     * @synopsis Constructs an object in the receiver's content window.
     * @description Note that all parameters to this method are passed along in
     *     the object creation process. Therefore, arguments to the 'new', if
     *     you will, should be passed after the constructorName. Note that this
     *     type's implementation of this method is different from
     *     TP.core.Window's in that this type tries to construct the object
     *     *inside* of it's content window, not in the window it's located in.
     * @param {String} constructorName The name of the constructor to use to
     *     construct the object.
     * @returns {Object} The object constructed in the receiver's content
     *     window.
     */

    var args,
        win;

    //  constructorName was only pointed out above for documentation
    //  purposes. We pass along *all* arguments after inserting our native
    //  window to the front of the Array.
    win = TP.elementGetIFrameWindow(this.getNativeNode());
    args = TP.args(arguments);
    args.unshift(win);

    return TP.windowConstructObject.apply(win, args);
});

//  ------------------------------------------------------------------------

/*
 * Although this method is defined in our TP.core.UICanvas trait, its also
 * defined on our 'TP.html.Element' supertype and we inherit the one from
 * 'TP.html.Element'. We want the version that TP.core.UICanvas has.
*/

TP.html.iframe.Inst.resolveTrait('setContent', TP.core.UICanvas);

//  ========================================================================
//  TP.html.isindex
//  ========================================================================

/**
 * @type {TP.html.isindex}
 * @synopsis 'isindex' tag. (Deprecated)
 */

//  ------------------------------------------------------------------------

TP.html.CoreAttrs.defineSubtype('isindex');

//  ========================================================================
//  TP.html.listing
//  ========================================================================

/**
 * @type {TP.html.listing}
 * @synopsis 'listing' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('listing');

//  ========================================================================
//  TP.html.menu
//  ========================================================================

/**
 * @type {TP.html.menu}
 * @synopsis 'menu' tag. Single column list. (Deprecated)
 */

//  ------------------------------------------------------------------------

TP.html.List.defineSubtype('menu');

TP.html.menu.Type.set('booleanAttrs', TP.ac('compact'));

//  ========================================================================
//  TP.html.noframes
//  ========================================================================

/**
 * @type {TP.html.noframes}
 * @synopsis 'noframes' tag. When frames are unsupported.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('noframes');

//  ========================================================================
//  TP.html.s
//  ========================================================================

/**
 * @type {TP.html.s}
 * @synopsis 's' tag. Strike-through.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('s');

//  ========================================================================
//  TP.html.strike
//  ========================================================================

/**
 * @type {TP.html.strike}
 * @synopsis 'strike' tag. Strike-through.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('strike');

//  ========================================================================
//  TP.html.u
//  ========================================================================

/**
 * @type {TP.html.u}
 * @synopsis 'u' tag. Underline.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('u');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
