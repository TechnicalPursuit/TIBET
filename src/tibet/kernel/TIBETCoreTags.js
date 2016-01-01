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
 */

//  ========================================================================
//  TP.sys Primitives
//  ========================================================================

TP.sys.addFeatureTest('sherpa', function() {

    //  NB: For the system to be considered to have the 'sherpa' feature, it has
    //  to both have the 'TP.core.Sherpa' type loaded *and* have the Sherpa
    //  enabled for opening. The Sherpa HUD doesn't necessarily have to be open.
    return TP.isType(TP.sys.getTypeByName('TP.core.Sherpa')) &&
            TP.sys.cfg('sherpa.enabled') === true;
});

//  ========================================================================
//  TP.core.CustomTag
//  ========================================================================

/**
 * @type {TP.core.CompiledTag}
 * @summary A common supertype for compiled UI tags.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('TP.core.CustomTag');

TP.core.CustomTag.addTraits(TP.core.NonNativeUIElementNode);

TP.core.CustomTag.Inst.resolveTraits(
        TP.ac('$setAttribute', 'removeAttribute', 'select', 'signal'),
        TP.core.UIElementNode);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.CustomTag.Type.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles notification of a change.
     * @description If the origin is a URI that one of our 'reloadable
     *     attributes' has as the reference to its remote resource, then the
     *     'reloadFrom<Attr>' method is invoked on the receiver.
     * @param {TP.sig.Signal} aSignal The signal instance to respond to.
     */

    if (TP.canInvoke(this, 'refreshInstances')) {
        this.refreshInstances();
    }
});

//  ========================================================================
//  TP.core.CompiledTag
//  ========================================================================

/**
 * @type {TP.core.CompiledTag}
 * @summary A common supertype for compiled UI tags.
 */

//  ------------------------------------------------------------------------

TP.core.CustomTag.defineSubtype('TP.core.CompiledTag');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.CompiledTag.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert instances of the tag into their HTML representation.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The new element.
     */

    var elem,
        newElem;

    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    //  NOTE that we produce output which prompts for overriding and providing a
    //  proper implementation here.
    newElem = TP.xhtmlnode(
        '<a onclick="alert(\'Update the ' + this.getID() +
            '.Type tagCompile method.\')" href="#" tibet:tag="' +
            this.getCanonicalName() + '">' +
            '&lt;' + this.getCanonicalName() + '/&gt;' +
            '</a>');

    //  Note here how we return the *result* of this method due to node
    //  importing, etc.
    return TP.elementReplaceWith(elem, newElem);
});

//  ========================================================================
//  TP.core.TemplatedTag
//  ========================================================================

/**
 * @type {TP.core.TemplatedTag}
 * @summary A common supertype for templated UI tags. This type provides an
 * inheritance root for templated tags by mixing in TemplatedNode properly.
 */

TP.core.CustomTag.defineSubtype('TP.core.TemplatedTag');

//  ------------------------------------------------------------------------

//  Mix in templating behavior, resolving compile in favor of templating.
TP.core.TemplatedTag.addTraits(TP.core.TemplatedNode);

TP.core.TemplatedTag.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

TP.core.TemplatedTag.Type.defineAttribute('registeredForURIUpdates');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.TemplatedTag.Type.defineMethod('construct',
function(nodeSpec, varargs) {

    /**
     * @method construct
     * @summary Constructs a new instance to wrap a native node. The native node
     *     may have been provided or a String could have been provided. By far
     *     the most common usage is construction of a wrapper around an existing
     *     node.
     * @param {Node|URI|String|TP.core.Node} nodeSpec Some suitable object to
     *     construct a source node. See type discussion above. Can also be null.
     * @param {Array} varargs Optional additional arguments for the
     *     constructor.
     * @returns {TP.core.TemplatedTag} A new instance.
     */

    var retVal,

        elem,
        uri;

    //  Call up to get the instance of this type wrapping our native node.
    retVal = this.callNextMethod();

    //  Grab the native node
    elem = retVal.getNativeNode();

    //  If we haven't set up this type to register for updates coming from it's
    //  URI, do so now.
    if (TP.notTrue(this.get('registeredForURIUpdates'))) {

        uri = this.getResourceURI(
                        'template',
                        TP.elementGetAttribute(elem, 'tibet:mime', true));

        if (TP.isURI(uri)) {
            this.observe(uri, 'TP.sig.ValueChange');
            uri.watch();
        }

        //  Set the flag so that we don't do this again.
        this.set('registeredForURIUpdates', true);
    }

    return retVal;
});

//  ========================================================================
//  TP.tibet.app
//  ========================================================================

/**
 * @type {TP.tibet.app}
 * @summary TP.tibet.app represents the 'non-Sherpa' application tag. It is
 *     usually generated by the TP.tibet.root tag type if Sherpa is not loaded
 *     or disabled.
 */

//  ------------------------------------------------------------------------

TP.core.CompiledTag.defineSubtype('tibet:app');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how this property is TYPE_LOCAL, by
//  design.
TP.tibet.app.defineAttribute('styleURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.app.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    // TODO: The UICANVAS should be set to be the UIROOT here.

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.tibet.app.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @description In this type, this method generates either a 'tibet:app' or
     *     a 'tibet:sherpa' tag, depending on whether or not the current boot
     *     environment is set to 'development' or not.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Element} The new element.
     */

    var elem,
        name,
        tag,
        newElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    if (TP.notEmpty(elem.getAttribute('tibet:appctrl'))) {
        return this.callNextMethod();
    }

    name = TP.sys.cfg('project.name');
    tag = TP.sys.cfg('tibet.apptag') || 'APP.' + name + ':app';

    newElem = TP.xhtmlnode(
    '<div tibet:tag="tibet:app" class="tag-defaulted">' +
        '<h1 class="tag-defaulted">' +
            'Application tag for ' + name + ' failed to render. ' +
            'Defaulted to &lt;tibet:app/&gt;' +
        '</h1>' +

        '<p>' +
        'If you are seeing this error message it usually means either:<br/><br/>' +
        '- The tag specified for your application (' + tag + ') is missing; or<br/>' +
        '- <b>The specified tag type has a syntax error or failed to load.</b>' +
        '</p>' +

        '<p>Source for that tag would typically be found in:</p>' +

        '<p><code>src/tags/' + tag.replace(/:/g, '.') + '.js</code></p>' +

        '<p>' +
        'Check that file for syntax errors if it is the right file, or check' +
        ' your tibet.apptag settings to ensure the right tag type is being' +
        ' specified along with your ~app_cfg/app.xml package to ensure you' +
        ' are loading it.' +
        '</p>' +

        '<p class="hint">' +
        'Hint: You can use Alt-Up to toggle the boot log/console.' +
        '</p>' +
    '</div>');

    //  Note here how we return the *result* of this method due to node
    //  importing, etc.
    return TP.elementReplaceWith(elem, newElem);
});

//  ========================================================================
//  TP.tibet.root
//  ========================================================================

/**
 * @type {TP.tibet.root}
 * @summary TP.tibet.root represents the tag placed in 'UIROOT' pages (i.e. the
 *     root page of the system). Depending on whether the Sherpa project is
 *     loaded/disabled, this tag will generate either a 'tibet:app' tag or a
 *     'tibet:sherpa' tag to handle the main UI.
 */

//  ------------------------------------------------------------------------

TP.core.CompiledTag.defineSubtype('tibet:root');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how this property is TYPE_LOCAL, by
//  design.
TP.tibet.root.defineAttribute('styleURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.root.Type.defineMethod('computeAppTagTypeName',
function(wantsSherpa) {

    /**
     * @method computeAppTagName
     * @summary Computes the current tag type name by using system config
     *     information to try to find a type and, if that can't found, falling
     *     back to the 'tibet:sherpa' or 'tibet:app' tag.
     * @param {Boolean} wantsSherpa Whether or not to include the 'tibet:sherpa'
     *     tag in the result output. The default is true.
     * @returns {String} The name of the type to use as the 'app tag'.
     */

    var cfg,
        opts,

        sherpaOk,

        type,
        name;

    //  Build up a list of tag names to check. We'll use the first one we have a
    //  matching type for.
    opts = TP.ac();

    cfg = TP.sys.cfg('tibet.apptag');
    if (TP.notEmpty(cfg)) {
        opts.push(cfg);
    }

    cfg = TP.sys.cfg('project.name');
    if (TP.notEmpty(cfg)) {
        opts.push(cfg + ':app');
    }

    //  If the system is configured to run the sherpa, then push its tag into
    //  the list for consideration.
    sherpaOk = TP.ifInvalid(wantsSherpa, true);
    if (TP.sys.hasFeature('sherpa') && sherpaOk) {
        opts.unshift('tibet:sherpa');
    }

    //  When in doubt at least produce something :)
    opts.push('tibet:app');

    //  Keep string for error reporting.
    cfg = opts.join();

    while (TP.notValid(type) && TP.notEmpty(name = opts.shift())) {
        type = TP.sys.getTypeByName(name, false);
    }

    if (!TP.isType(type)) {
        this.raise('TypeNotFound', 'Expected one of: ' + cfg);
        return null;
    }

    return name;
});

//  ------------------------------------------------------------------------

TP.tibet.root.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @description In this type, if the Sherpa is not 'active' this method
     *     loads the URL pointed to by the TP.sys.getHomeURL method into the
     *     UIROOT frame. If a value hasn't been configured, then the standard
     *     system blank page is loaded into that frame.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        elemWin,
        request,
        homeURL;

    //  If the Sherpa is configured to be on (and we've actually loaded the
    //  Sherpa code), then exit here - the Sherpa does some special things to
    //  the 'tibet:root' tag.
    if (TP.sys.hasFeature('sherpa')) {
        return;
    }

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    //  Make sure that we have a Window to draw into.
    if (!TP.isWindow(elemWin = TP.nodeGetWindow(elem))) {
        return;
    }

    //  Capture the actual home page URL for loading which means passing true
    //  here to force session variables to be checked.
    homeURL = TP.uc(TP.sys.getHomeURL(true));

    request = TP.request();
    request.atPut(TP.ONLOAD,
                function(aDocument) {
                    //  Signal we are starting. This provides a hook for
                    //  extensions etc. to tap into the startup sequence before
                    //  routing or other behaviors but after we're sure the UI
                    //  is finalized.
                    TP.signal('TP.sys', 'AppWillStart');

                    //  Signal actual start. The default handler on Application
                    //  will invoke the start() method in response to this
                    //  signal.
                    TP.signal('TP.sys', 'AppStart');
                });

    //  NOTE that on older versions of Safari this could trigger crashes due to
    //  bugs in the MutationObserver implementation. It seems to work fine now.
    /* eslint-disable no-wrap-func,no-extra-parens */
    (function() {
        TP.wrap(elemWin).setContent(homeURL, request);
    }).afterUnwind();
    /* eslint-enable no-wrap-func,no-extra-parens */

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.root.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @description In this type, if the Sherpa is 'active' (not just loaded but
     *     active) this method converts the receiver (a 'tibet:root' tag) into a
     *     'tibet:sherpa' tag.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The new element.
     */


    var elem,
        newElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    //  If the Sherpa is configured to be on (and we've actually loaded the
    //  Sherpa code), then turn the receiver into a 'tibet:sherpa' tag.
    if (TP.sys.hasFeature('sherpa')) {

        newElem = TP.elementBecome(elem, 'tibet:sherpa');

        //  We're changing out the tag entirely, so remove any evidence via the
        //  tibet:tag reference.
        TP.elementRemoveAttribute(newElem, 'tibet:tag', true);

        return newElem;
    }

    return elem;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
