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
 * @type {TP.dom.ReactElement}
 * @summary Manages custom elements that use ReactJS components.
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('dom.ReactElement');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.dom.ReactElement.Type.defineAttribute('$$loading');

TP.dom.ReactElement.Type.defineAttribute('$$componentsNeedingSetup');

//  Note how these properties are TYPE_LOCAL, by design.
TP.dom.ReactElement.defineAttribute('$$nameNeedingProxy');
TP.dom.ReactElement.defineAttribute('$$initialProps');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.dom.ReactElement.Type.defineMethod('buildProxyFor',
function(anObject) {

    /**
     * @method buildProxyFor
     * @summary Builds an ECMAScript 6 Proxy object around the supplied React
     *     constructor Function object.
     * @param {Function} anObject A React constructor Function object that needs
     *     to trap instance creation so that component lifecycle methods can be
     *     hooked.
     * @returns {Proxy} The Proxy wrapping the supplied React constructor
     *     Function.
     */

    var proxyConfig,
        reactProxy;

    //  Now, because we need to 'hook' a number of lifecycle methods to forward
    //  over to us, we build an ECMAScript Proxy that will have its 'construct'
    //  trap invoked when React builds a new instance.
    proxyConfig = {
        construct: function(target, args) {
            var newInst;

            //  Do the normal thing to build a new instance (of the target - the
            //  'real' constructor object).
            newInst = new target(...args);

            //  Now hook these methods but make sure to 'capture' any existing
            //  versions authored by the component author so that we can invoke
            //  them as well.

            newInst.__oldComponentDidMount = newInst.componentDidMount;
            newInst.componentDidMount = function() {
                this.props.TIBETPeer.reactDidMount(this);
                if (this.__oldComponentDidMount) {
                    return this.__oldComponentDidMount.apply(this, arguments);
                }
            };

            newInst.__oldComponentDidUpdate = newInst.componentDidUpdate;
            newInst.componentDidUpdate = function(prevProps, prevState) {
                this.props.TIBETPeer.reactDidUpdate(this, prevProps, prevState);
                if (this.__oldComponentDidUpdate) {
                    return this.__oldComponentDidUpdate.apply(this, arguments);
                }
            };

            newInst.__oldComponentWillUnmount = newInst.componentWillUnmount;
            newInst.componentWillUnmount = function() {
                this.props.TIBETPeer.reactWillUnmount(this);
                if (this.__oldComponentWillUnmount) {
                    return this.__oldComponentWillUnmount.apply(
                                                            this, arguments);
                }
            };

            //  Return the newly constructed instance.
            return newInst;
        }
    };

    //  Create the Proxy, supplying the constructor (resolved by using the
    //  target window global context and referenced by the ECMAScript class
    //  name) and the Proxy configuration.
    reactProxy = TP.constructProxyObject(anObject, proxyConfig);

    return reactProxy;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Type.defineMethod('getComponentScriptLocations',
function(aRequest) {

    /**
     * @method getComponentScriptLocations
     * @summary Returns an Array of URL locations that contain JavaScript code
     *     used to implement the React component that the receiver is
     *     representing.
     * @returns {String[]} An Array of script URL locations containing the React
     *     component code.
     */

    return TP.ac();
});

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.dom.ReactElement.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @description This method operates differently depending on a variety of
     *     factors:
     *          - If the current node has a 'tibet:ctrl', but not a
     *              'tibet:tag', and its operating in a native namespace,
     *              this method returns with no transformation occurring and no
     *              child content being processed.
     *          - If the request contains a command target document and that
     *              target document is not an HTML document, then this element
     *              remains untransformed but its children are processed.
     *          - Otherwise, the element is transformed into a 'div' or 'span',
     *              depending on the return value of the 'isBlockLevel' method.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The element that this tag has become.
     */

    var elem,
        tpElem,

        tagName,

        newElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    if (elem.tagName === 'span') {
        return elem;
    }

    tpElem = TP.wrap(elem);

    tagName = tpElem.getTagName();

    //  Create a new XHTML span element from elem
    newElem = TP.elementBecome(elem, 'span');

    //  Set the 'tibet:tag' attribute on it so that the proper type is used to
    //  create the instance.
    TP.elementSetAttribute(newElem, 'tibet:tag', tagName, true);

    return newElem;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        thisref,

        doc,

        componentScripts,

        allScriptLocs;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    tpElem = TP.wrap(elem);

    //  If we're currently loading, then just add the element that needs to be
    //  set up into the type-level Array that we're keeping and exit.
    if (TP.isTrue(this.get('$$loading'))) {
        this.get('$$componentsNeedingSetup').push(tpElem);
        return this;
    } else {
        this.set('$$componentsNeedingSetup', TP.ac(tpElem));
    }

    thisref = this;

    //  If ReactDOM isn't loaded, then we must load it *into the target document
    //  of the element that we're processing*.
    if (TP.notValid(TP.nodeGetWindow(elem).ReactDOM)) {

        //  Set '$$loading' immediately so that if we're loading multiple
        //  components, we won't see multiple tries.
        this.set('$$loading', true);

        doc = TP.doc(elem);

        //  Grab all of the React 'component' script URL locations.
        componentScripts = this.getComponentScriptLocations();

        //  Build an Array starting with the core React & ReactDOM code and then
        //  concatenating all of the component scripts onto it.
        allScriptLocs = TP.ac(
            'https://unpkg.com/react@16/umd/react.development.js',
            'https://unpkg.com/react-dom@16/umd/react-dom.development.js',
            'https://unpkg.com/@babel/standalone/babel.min.js');

        allScriptLocs = allScriptLocs.concat(componentScripts);

        //  Iterate over all of the script locations, loading them one at a time
        //  via Promises. When everything is complete, then proceed with setting
        //  up the 'ReactDOM' object and set up each element that wanted to be
        //  set up.
        TP.extern.Promise.each(
            allScriptLocs,
            function(aScriptLoc) {
                return TP.sys.fetchScriptInto(
                        TP.uc(aScriptLoc),
                        doc,
                        null,
                        TP.hc('crossorigin', true));
            }).then(
            function() {

                var reactWin,
                    reactObj,
                    reactDOMObj;

                //  Unfortunately, due to the way that React works, we have to
                //  'hook' the React.createElement() call in order to insert our
                //  proxy standin for the React component constructor.
                reactWin = TP.nodeGetWindow(elem);
                reactObj = reactWin.React;
                reactObj.__hooked__createElement = reactObj.createElement;
                reactObj.createElement = function(type, props, children) {
                    var nameNeedingProxy,
                        typeName,
                        proxyType,
                        newProps,
                        newElem;

                    //  When we're evaluating code we need to know which
                    //  tag name corresponds to the component that we're trying
                    //  to hook/proxy the constructor Function for.
                    nameNeedingProxy =
                        TP.dom.ReactElement.$get('$$nameNeedingProxy');

                    //  Grab the name of what React thinks is the constructor
                    //  Function.
                    typeName = TP.name(type);

                    //  If the constructor Function's name matches the
                    //  constructor name we're looking for, then use a proxied
                    //  Type object to construct the React Element instance.
                    if (nameNeedingProxy === typeName) {

                        //  If the constructor Function is not a Proxy, then
                        //  construct a Proxy from the initial properties and
                        //  invoke the hooked React.createElement() with that
                        //  now proxied type object. Note how we reset the
                        //  global reference on the target Window to the proxy.
                        //  This is important for subsequent invocations to use
                        //  the proper constructor Function.
                        if (!TP.isProxy(type)) {
                            proxyType = thisref.buildProxyFor(type);
                            reactWin[typeName] = proxyType;
                        } else {
                            proxyType = type;
                        }

                        newProps =
                            TP.copy(
                                TP.ifInvalid(
                                    TP.dom.ReactElement.$get('$$initialProps'),
                                    {}));

                        newElem = this.__hooked__createElement(
                                                proxyType, newProps, children);
                        return newElem;
                    } else {
                        newElem = this.__hooked__createElement(
                                                type, props, children);
                    }

                    return newElem;
                };

                reactDOMObj = TP.nodeGetWindow(elem).ReactDOM;

                reactDOMObj[TP.LOAD_PATH] = 'inline';
                reactDOMObj[TP.LOAD_CONFIG] = 'base';
                reactDOMObj[TP.LOAD_PACKAGE] = thisref[TP.LOAD_PACKAGE];
                reactDOMObj[TP.LOAD_STAGE] = TP.PHASE_TWO;

                reactDOMObj[TP.SOURCE_PATH] = 'inline';
                reactDOMObj[TP.SOURCE_CONFIG] = 'base';
                reactDOMObj[TP.SOURCE_PACKAGE] = thisref[TP.SOURCE_PACKAGE];

                //  Iterate over the Array of the components that we were
                //  keeping to set up and set them up.
                thisref.get('$$componentsNeedingSetup').forEach(
                    function(aTPElem) {
                        aTPElem.setup();
                    });

                thisref.get('$$componentsNeedingSetup').empty();

                //  We're no longer loading.
                thisref.set('$$loading', false);
            });

    } else {
        tpElem.setup();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    TP.wrap(elem).teardown();

    //  this makes sure we maintain parent processing - but we need to do it
    //  last because it nulls out our wrapper reference.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineAttribute('$$updating');

TP.dom.ReactElement.Inst.defineAttribute('$reactPeer');
TP.dom.ReactElement.Inst.defineAttribute('$isMounted');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('buildReactComponent',
function() {

    /**
     * @method buildReactComponent
     * @summary Builds the React component and renders it into the receiver's
     *     document.
     * @returns {TP.dom.ReactElement} The receiver.
     */

    var sourceLoc,
        sourceURI,

        response,
        jsxText,

        reactComponentClassName,

        initialProps,

        elemWin,

        reactType,

        doc,
        componentScripts,

        reactComponent;

    //  If the receiver has a component definition location, then it's going be
    //  bringing in a file of React definitions, probably in JSX.
    sourceLoc = this.getComponentDefinitionLocation();
    if (TP.notEmpty(sourceLoc)) {
        sourceURI = TP.uc(sourceLoc);
        response = sourceURI.getResource(
                                TP.hc('async', false, 'resultType', TP.TEXT));
        jsxText = response.get('result');

        if (TP.isEmpty(jsxText)) {
            return this.raise(
                'TP.sig.InvalidString',
                'No React source code at: ' + sourceURI.getLocation());
        }

        this.setContent(jsxText);

    } else {

        //  Grab the component's ECMAScript class name. If it's empty, exit
        //  here.
        reactComponentClassName = this.getComponentClassName();
        if (TP.isEmpty(reactComponentClassName)) {
            return this.raise(
                'TP.sig.InvalidName', 'No React component class name defined');
        }

        elemWin = this.getNativeWindow();

        //  Grab the React constructor Function.
        reactType = elemWin[reactComponentClassName];
        if (TP.notValid(reactType)) {

            if (this.getType().get('$$loading') === true) {
                return this;
            }

            //  Set '$$loading' immediately so that if we're loading multiple
            //  components, we won't see multiple tries.
            this.getType().set('$$loading', true);

            doc = this.getNativeDocument();

            //  Grab all of the React 'component' script URL locations.
            componentScripts = this.getType().getComponentScriptLocations();

            //  Iterate over all of the script locations, loading them one at a
            //  time via Promises. When everything is complete, then proceed
            //  with setting up the 'ReactDOM' object and set up each element
            //  that wanted to be set up.
            TP.extern.Promise.each(
                componentScripts,
                function(aScriptLoc) {
                    return TP.sys.fetchScriptInto(
                            TP.uc(aScriptLoc),
                            doc,
                            null,
                            TP.hc('crossorigin', true));
                }).then(
                    function() {
                        //  We're no longer loading.
                        this.getType().set('$$loading', false);

                        //  Iterate over the Array of the components that we
                        //  were keeping to set up and set them up.
                        this.getType().get('$$componentsNeedingSetup').forEach(
                            function(aTPElem) {
                                aTPElem.setup();
                            });

                        this.getType().get('$$componentsNeedingSetup').empty();

                    }.bind(this));
        } else {

            //  Store this in our type so that our hooked React.createElement
            //  call can find it.
            TP.dom.ReactElement.set('$$nameNeedingProxy',
                                    reactComponentClassName);

            //  Grab any initial properties that we want our component to have.
            initialProps = this.getInitialProps();

            //  Store this in our type so that our hooked React.createElement
            //  call can find it.
            TP.dom.ReactElement.$set('$$initialProps', initialProps);

            //  Evaluate the code *in the context of this element's window*
            //  (which call React's 'createElement' method using the proxy as
            //  the constructor and supplying the props we computed above).
            reactComponent = elemWin.React.createElement(
                                            reactType, initialProps);

            //  If we got a valid component class, then invoke the render call
            //  with it. Note here how we provide ourself (transformed by our
            //  compilation method above into an XHTML span) as the 'root DOM
            //  node' for this React component.
            if (TP.isValid(reactComponent)) {
                elemWin.ReactDOM.render(
                        reactComponent,
                        this.getNativeNode(),
                        function() {
                            this.reactComponentCreationFinished();
                        }.bind(this));
            }

            TP.dom.ReactElement.$set('$$nameNeedingProxy', null);
            TP.dom.ReactElement.$set('$$initialProps', null);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('getNonAttributeProps',
function() {

    /**
     * @method getNonAttributeProps
     * @summary Returns a hash containing props that should be supplied to the
     *     React component that are not represented as element attributes. These
     *     will be added to the element's attributes and then supplied to React
     *     when the element is created.
     * @returns {TP.lang.Hash} A hash containing values that will be supplied to
     *     the React component upon instantiation.
     */

    return TP.hc();
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('getInitialProps',
function() {

    /**
     * @method getInitialProps
     * @summary Returns a POJO that contains the initial properties for the
     *     React component that underlies this object.
     * @returns {Object} A POJO containing the initial properties for the React
     *     component.
     */

    var initialProps;

    //  Grab the initial props by getting all of the attributes of the
    //  receiver as a hash.
    initialProps = this.getAttributes();

    //  Add in any 'non attribute' props.
    initialProps.addAll(this.getNonAttributeProps());

    //  Convert the initial hash into a POJO and add a reference to the
    //  receiver to it.
    initialProps = initialProps.asObject();
    initialProps.TIBETPeer = this;

    return initialProps;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('getComponentClassName',
function() {

    /**
     * @method getComponentClassName
     * @summary Returns the React component's ECMAScript class name. This is
     *     used by the TIBET machinery when invoking the ReactDOM.render call.
     * @returns {String} The React component's ECMAScript class name.
     */

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('getComponentDefinitionLocation',
function() {

    /**
     * @method getComponentDefinitionLocation
     * @summary Returns a location that will define the component. The resource
     *     pointed to by this URL may contain regular JavaScript or JSX.
     * @returns {String|null} The component definition location.
     */

    var src;

    //  Grab the source location from our attribute.
    src = this.getAttribute('src');
    if (TP.isEmpty(src)) {
        return null;
    }

    return this.qualifyToSourcePath(src);
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the underlying value of the resource we are
     *     currently editing changes.
     * @param {TP.sig.ValueChange} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    var newContent;

    newContent = aSignal.getOrigin().getContent().get('data');
    if (TP.notEmpty(newContent)) {
        this.setContent(newContent);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('isReadyToRender',
function() {

    /**
     * @method isReadyToRender
     * @summary Whether or not the receiver is 'ready to render'. Normally, this
     *     means that all of the resources that the receiver relies on to render
     *     have been loaded.
     * @returns {Boolean} Whether or not the receiver is ready to render.
     */

    //  If we have a valid ReactDOM instance in the window we render in, then
    //  we're ready to go.
    return TP.isValid(this.getNativeWindow().ReactDOM);
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('reactComponentCreationFinished',
function() {

    /**
     * @method reactComponentCreationFinished
     * @summary This method is invoked when React has finished creating the
     *     component.
     * @returns {TP.dom.ReactElement} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------
//  ReactJS lifecycle methods
//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('reactDidMount',
function(anObject) {

    /**
     * @method reactDidMount
     * @summary This method is invoked when the React peer component has mounted
     *     into its environment.
     * @param {Object} anObject The React peer component.
     * @returns {TP.dom.ReactElement} The receiver.
     */

    var vals;

    //  Grab all of the bound values into a TP.lang.Hash
    vals = this.getBoundValues('bind:io',
                                this.getBindingScopeValues(),
                                this.getAttribute('bind:io'));

    //  Set the state on the React peer using a POJO'ed version of the hash.
    anObject.setState(vals.asObject());

    this.set('$reactPeer', anObject);

    this.set('$isMounted', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('reactDidUpdate',
function(anObject, prevProps, prevState) {

    /**
     * @method reactDidUpdate
     * @summary This method is invoked when the React peer component has
     *     updated.
     * @param {Object} anObject The React peer component.
     * @returns {TP.dom.ReactElement} The receiver.
     */

    var vals;

    //  If the peer component isn't mounted, then just return.
    if (TP.notTrue(this.get('$isMounted'))) {
        return this;
    }

    //  If we're updating as part of the React update cycle, just return.
    if (this.get('$$updating')) {
        return this;
    }

    //  Grab the values of any bound values.
    vals = this.getBoundValues('bind:io',
                                this.getBindingScopeValues(),
                                this.getAttribute('bind:io'));

    if (TP.equal(vals.at('value'), anObject.state.value)) {
        return this;
    }

    this.set('$$updating', true);
    this.setBoundValueIfBound(anObject.state.value, true);
    this.set('$$updating', false);

    this.changed('value', TP.UPDATE);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('reactWillUnmount',
function(anObject) {

    /**
     * @method reactWillUnmount
     * @summary This method is invoked when the React peer component is getting
     *     ready to unmount from its environment.
     * @param {Object} anObject The React peer component.
     * @returns {TP.dom.ReactElement} The receiver.
     */

    this.set('$isMounted', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.dom.ReactElement} The receiver.
     */

    var sourceLoc,
        sourceURI;

    this.buildReactComponent();

    sourceLoc = this.getComponentDefinitionLocation();
    if (TP.notEmpty(sourceLoc)) {
        sourceURI = TP.uc(sourceLoc);
        this.observe(sourceURI, 'TP.sig.ValueChange');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('$setAttribute',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method setAttribute
     * @summary Sets the value of the named attribute. This version is a
     *     wrapper around the native element node setAttribute call which
     *     attempts to handle standard change notification semantics for native
     *     nodes as well as proper namespace management.
     * @param {String} attributeName The attribute name to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {undefined} Undefined according to the spec for DOM
     *     'setAttribute'.
     */

    var peer,

        state;

    //  If the peer component isn't mounted, then just return.
    if (TP.notTrue(this.get('$isMounted'))) {
        return this.callNextMethod();
    }

    //  If we're updating as part of the React update cycle, just return.
    if (this.get('$$updating')) {
        return this.callNextMethod();
    }

    //  If the React peer isn't valid, just return.
    peer = this.get('$reactPeer');
    if (TP.notValid(peer)) {
        return this.callNextMethod();
    }

    //  Build a POJO that we can use to set the React state.
    state = {};
    state[attributeName] = attributeValue;

    peer.setState(state);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the value supplied.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {TP.dom.Node} The result of setting the content of the
     *     receiver.
     */

    var str,

        elemWin,

        babel,
        componentCode,

        reactComponentClassName,

        initialProps;

    str = TP.str(aContentObject);

    if (TP.notEmpty(str)) {

        elemWin = this.getNativeWindow();

        //  Run the content through Babel, compiling both ES2015 and React
        //  constructs.
        babel = elemWin.Babel;
        if (TP.notValid(babel)) {
            return this.raise(
                'TP.sig.InvalidObject', 'No valid Babel compiler available');
        }

        //  componentCode will be a String containing the React compiled code.
        componentCode = babel.transform(
                            str, {presets: ['es2015', 'react']}).code;

        if (TP.isEmpty(componentCode)) {
            return this.raise(
                'TP.sig.InvalidString', 'No React code compilation output');
        }

        //  Grab the component's ECMAScript class name. If it's empty, exit
        //  here.
        reactComponentClassName = this.getComponentClassName();
        if (TP.isEmpty(reactComponentClassName)) {
            return this.raise(
                'TP.sig.InvalidName', 'No React component class name defined');
        }

        //  Store this in our type so that our hooked React.createElement call
        //  can find it.
        TP.dom.ReactElement.set('$$nameNeedingProxy', reactComponentClassName);

        //  Grab any initial properties that we want our component to have.
        initialProps = this.getInitialProps();

        //  Store this in our type so that our hooked React.createElement call
        //  can find it.
        TP.dom.ReactElement.$set('$$initialProps', initialProps);

        //  Evaluate the code *in the context of this element's window* (which
        //  should be the UI canvas window - that's where we loaded React into.
        //  React will invoke our hooked React.createElement call as part of
        //  this evaluation process.
        elemWin.eval(componentCode);
        this.reactComponentCreationFinished();

        TP.dom.ReactElement.$set('$$nameNeedingProxy', null);
        TP.dom.ReactElement.$set('$$initialProps', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For general node types
     *     this method sets the value/content of the node.
     * @description For common nodes the standard attribute list and the type of
     *     input determines what is actually manipulated. For element and
     *     document nodes the behavior is a little different. When the receiver
     *     has a pre-existing value attribute that's typically what is
     *     manipulated. When no value attribute is found the content of the node
     *     is changed. The type of node and input can alter how this actually is
     *     done. See the setContent call for more information.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {Boolean} Whether or not the value was changed from the value it
     *     had before this method was called.
     */

    var peer,

        newValue,
        newValueStr;

    //  If the value isn't valid, just return.
    if (TP.notValid(aValue)) {
        return false;
    }

    //  If the peer component isn't mounted, then just return.
    if (TP.notTrue(this.get('$isMounted'))) {
        return false;
    }

    //  If we're updating as part of the React update cycle, just return.
    if (this.get('$$updating')) {
        return false;
    }

    //  If the React peer isn't valid, just return.
    peer = this.get('$reactPeer');
    if (TP.notValid(peer)) {
        return false;
    }

    newValue = this.produceValue('value', aValue);

    newValueStr = TP.str(newValue);

    //  If the String value of newValue doesn't have Element markup in it, then
    //  we can just use the String value. Otherwise, we have to use the full
    //  value.
    if (!TP.regex.CONTAINS_ELEM_MARKUP.test(newValueStr)) {
        peer.setState({value: newValueStr});
    } else {
        peer.setState({value: newValue});
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver.
     * @returns {TP.dom.ReactElement} The receiver.
     */

    var sourceLoc,
        sourceURI;

    sourceLoc = this.getComponentDefinitionLocation();
    if (TP.notEmpty(sourceLoc)) {
        sourceURI = TP.uc(sourceLoc);
        this.ignore(sourceURI, 'TP.sig.ValueChange');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Sherpa Methods
//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
     * @summary Returns the object that is produced when resolving the aspect
     *     against the receiver.
     * @param {String} anAspect The aspect to resolve against the receiver to
     *     produce the return value.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Object} The object produced when resolving the aspect against
     *     the receiver.
     */

    var sourceLoc,
        sourceURI;

    switch (anAspect) {

        case 'Structure':
            sourceLoc = this.getComponentDefinitionLocation();
            if (TP.notEmpty(sourceLoc)) {
                sourceURI = TP.uc(sourceLoc);
                return sourceURI;
            }

            return this.callNextMethod();

        default:
            return this.callNextMethod();
    }
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
