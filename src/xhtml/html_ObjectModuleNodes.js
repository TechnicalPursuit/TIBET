//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.html.audio (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.audio}
 * @summary 'audio' tag. Embedded audio.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('audio');

//  ========================================================================
//  TP.html.canvas (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.canvas}
 * @summary A subtype of TP.html.Attrs that manages HTML Canvas objects.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('canvas');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.html.canvas.Type.defineConstant('TWO_D_CONTEXT_PROPERTY_NAMES',
        TP.ac(
            //  back-reference to canvas
            'canvas',
            //  compositing
            'globalAlpha', 'globalCompositeOperation',
            //  colors and styles
            'strokeStyle', 'fillStyle',
            //  line caps/joins
            'lineWidth', 'lineCap', 'lineJoin', 'miterLimit',
            //  shadows
            'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowColor',
            //  text
            'font', 'textAlign', 'textBaseline'
            ));
TP.html.canvas.Type.defineConstant('TWO_D_CONTEXT_METHOD_NAMES',
        TP.ac(
            //  state
            'save', 'restore',
            //  transformations
            'scale', 'rotate', 'translate', 'transform', 'setTransform',
            //  colors and styles
            'createLinearGradient', 'createRadialGradient', 'createPattern',
            //  rects
            'clearRect', 'fillRect', 'strokeRect',
            //  paths
            'beginPath', 'closePath', 'moveTo', 'lineTo',
                'quadraticCurveTo', 'bezierCurveTo', 'arcTo', 'rect', 'arc',
                'fill', 'stroke', 'clip', 'isPointInPath',
            //  drawing images
            'drawImage',
            //  pixel manipulation
            'createImageData', 'getImageData', 'putImageData',
            //  text
            'fillText', 'strokeText'
            ));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('toDataURL',
function(type) {

    /**
     * @method toDataURL
     * @summary Returns the data which contains a representation of the canvas
     *     as an image.
     * @param {String} type The MIME type indicating which data type to return.
     * @returns {String} The image data.
     */

    return this.getNativeNode().toDataURL(type);
});

//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('get2DContext',
function() {

    /**
     * @method get2DContext
     * @summary Returns the receiver's '2D graphics context'.
     * @returns {Object} The receiver's 2D graphics context.
     */

    return this.getNativeNode().getContext('2d');
});

//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('getContext',
function(contextId) {

    /**
     * @method getContext
     * @summary Returns the receiver's graphics context matching the supplied
     *     context id.
     * @param {String} contextId The ID of the context to fetch.
     * @returns {Object} The receiver's matching graphics context.
     */

    return this.getNativeNode().getContext(contextId);
});

//  ------------------------------------------------------------------------
//  DNU/Backstop
//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('canResolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @method canResolveDNU
     * @summary Provides an instance that has triggered DNU machinery with an
     *     opportunity to handle the problem itself.
     * @param {Object} anOrigin The object asking for help. The receiver in this
     *     case.
     * @param {String} aMethodName The method name that failed.
     * @param {Array} anArgArray Optional arguments to function.
     * @param {Function|Arguments} callingContext The calling context.
     * @returns {Boolean} TRUE means resolveDNU() will be called. FALSE means
     *     the standard DNU machinery will continue processing. The default is
     *     TRUE for TP.core.Node subtypes.
     */

    //  If the method name is in the list of method names that a 2D context
    //  (which is the object that we will redispatch to) can respond to,
    //  then we return true.
    if (this.getType().TWO_D_CONTEXT_METHOD_NAMES.contains(aMethodName)) {
        return true;
    }

    //  Couldn't find it in our list. Call up the chain.
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('resolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @method resolveDNU
     * @summary Invoked by the main DNU machinery when the instance has
     *     responded TRUE to canResolveDNU() for the parameters given.
     * @description Handles resolution of methods which have triggered the
     *     inferencer. For TP.core.Window the resolution process is used in
     *     conjunction with method aspects to allow the receiver to translate
     *     method calls.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name that failed.
     * @param {Array} anArgArray Optional arguments to function.
     * @param {Function|Arguments} callingContext The calling context.
     * @returns {Object} The result of invoking the method using the native
     *     window object.
     */

    var the2DContext,
        func;

    //  Make sure that we can obtain a valid 2D context. Without that, we're
    //  going nowhere.
    if (TP.notValid(the2DContext = this.get2DContext())) {
        return this.raise('TP.sig.InvalidContext');
    }

    try {
        if (!TP.isCallable(func = the2DContext[aMethodName])) {
            return this.raise('TP.sig.InvalidFunction');
        }
    } catch (e) {
        return this.raise('TP.sig.InvalidFunction', TP.ec(e));
    }

    //  If there weren't any arguments in the arg array, then we have only
    //  to call the func.
    if (TP.notValid(anArgArray) || anArgArray.length === 0) {
        //  Return the execution of the func
        return the2DContext.func();
    }

    //  Return the application of the func using the array of arguments as
    //  the argument array for  invocation.
    return func.apply(the2DContext, anArgArray);
});

//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('$get',
function(attributeName) {

    /**
     * @method $get
     * @summary Primitive $get() hook. Allows instances of this type to look up
     *     globals on their 2D context if a value for the attribute cannot be
     *     found on the receiver itself.
     * @param {String} attributeName The name/key of the attribute to return.
     * @returns {Object}
     * @exception TP.sig.InvalidContext
     */

    var val,
        the2DContext;

    //  Start by looking for the attribute (or a method) on this object.
    val = this.callNextMethod();

    //  If we got back an undefined value, then try to see if its a 'slot'
    //  on our content window (very useful if we've loaded our content
    //  window with other code bases).
    if (TP.notDefined(val)) {
        //  Make sure that we can obtain a valid 2D context. Without that,
        //  we're going nowhere.
        if (TP.notValid(the2DContext = this.get2DContext())) {
            return this.raise('TP.sig.InvalidContext');
        }

        val = the2DContext[attributeName];
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('$set',
function(attributeName, attributeValue) {

    /**
     * @method $set
     * @summary Primitive $set() hook. Allows instances of this type to set
     *     globals on their 2D context if the attribute cannot be found on the
     *     receiver itself.
     * @param {String} attributeName The attribute to set.
     * @param {Object} attributeValue The value to set it to.
     * @returns {Object}
     * @exception TP.sig.InvalidContext
     */

    var the2DContext;

    //  If the attribute name is not in the list of property names that a 2D
    //  context (which is the object that we will redispatch to) can respond
    //  to, then we return the result of calling up our chain.
    if (!this.getType().TWO_D_CONTEXT_PROPERTY_NAMES.contains(attributeName)) {
        return this.callNextMethod();
    }

    //  Make sure that we can obtain a valid 2D context. Without that, we're
    //  going nowhere.
    if (TP.notValid(the2DContext = this.get2DContext())) {
        return this.raise('TP.sig.InvalidContext');
    }

    the2DContext[attributeName] = attributeValue;

    return attributeValue;
});

//  ========================================================================
//  TP.html.embed (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.embed}
 * @summary 'embed' tag. Embedded object.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('embed');

TP.html.embed.Type.set('uriAttrs', TP.ac('src'));

//  ========================================================================
//  TP.html.object
//  ========================================================================

/**
 * @type {TP.html.object}
 * @summary 'object' tag. Embedded object.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('object');

TP.html.object.isAbstract(true);

TP.html.object.Type.set('booleanAttrs',
            TP.ac('declare', 'typeMustMatch', 'willValidate'));

TP.html.object.Type.set('uriAttrs', TP.ac('classid', 'codebase', 'usemap', 'data'));

//  ------------------------------------------------------------------------

TP.html.object.Type.defineMethod('getConcreteType',
function(aNodeOrId) {

    /**
     * @method getConcreteType
     * @summary Returns the subtype to use for the node provided. Note that for
     *     TP.html.object elements the specific type returned is based on the
     *     value of the type attribute.
     * @param {Node|String} aNodeOrId The native node to wrap or an ID used to
     *     locate it.
     * @returns {TP.lang.RootObject.<TP.html.object>} A TP.html.object subtype
     *     type object.
     */

    var typeName,
        type;

    if (TP.isString(aNodeOrId)) {
        return TP.byId(aNodeOrId);
    }

    typeName = TP.ietf.mime.get('info').at(
                TP.elementGetAttribute(aNodeOrId, 'type')).at('objectNodeType');

    type = TP.sys.getTypeByName(typeName);
    if (TP.isType(type) && !type.isAbstract()) {
        return type;
    }

    return this;
});

//  ========================================================================
//  TP.html.param
//  ========================================================================

/**
 * @type {TP.html.param}
 * @summary 'param' tag. Applet parameter.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('param');

TP.html.param.addTraits(TP.core.EmptyElementNode);

TP.html.param.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.core.EmptyElementNode);

//  ========================================================================
//  TP.html.source (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.source}
 * @summary 'source' tag. Video or audio source.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('source');

TP.html.source.Type.set('uriAttrs', TP.ac('src'));

//  ========================================================================
//  TP.html.track (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.track}
 * @summary 'track' tag. Tracks for media elements.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('track');

TP.html.track.Type.set('uriAttrs', TP.ac('src'));
TP.html.track.Type.set('booleanAttrs', TP.ac('default'));

TP.html.track.addTraits(TP.core.EmptyElementNode);

TP.html.track.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.core.EmptyElementNode);

//  ========================================================================
//  TP.html.video (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.video}
 * @summary 'video' tag. Embedded video.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('video');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
