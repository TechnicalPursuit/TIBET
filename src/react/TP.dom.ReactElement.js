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
 * @summary Manages custom elements that use ReactJS components
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('dom.ReactElement');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.dom.ReactElement.Type.defineAttribute('$$loading');

TP.dom.ReactElement.Type.defineAttribute('$$componentsNeedingSetup');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.dom.ReactElement.Type.defineMethod('getComponentScriptURLs',
function(aRequest) {

    /**
     * @method getComponentScriptURLs
     * @summary Returns an Array of URLs that contain JavaScript code used to
     *     implement the React component that the receiver is representing.
     * @returns {String[]} An Array of script URLs containing the React
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

    //  Create a new XHTML element from elem, using either 'div' or 'span'
    //  depending on whether the element is block level or not
    newElem = TP.elementBecome(elem, 'span');

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

        //  Grab all of the React 'component' script URLs.
        componentScripts = this.getComponentScriptURLs();

        //  Build an Array starting with the core React & ReactDOM code and then
        //  concatenating all of the component scripts onto it.
        allScriptLocs = TP.ac(
            'https://unpkg.com/react@16/umd/react.development.js',
            'https://unpkg.com/react-dom@16/umd/react-dom.development.js');
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
                        TP.request());
                        //TP.hc('type', 'module'));
            }).then(
            function() {

                var reactDOMObj;

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

TP.dom.ReactElement.Inst.defineMethod('getNonAttributeProps',
function() {

    /**
     * @method getNonAttributeProps
     * @summary Returns a hash containing props that should be supplied to the
     *     React component that are not represented as element attributes. These
     *     will be added to the element's attributes and then supplied to React
     *     when the element is created.
     * @returns {TP.lang.Hash} A hash containing values that should be
     */

    return TP.hc();
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('getReactComponentClass',
function() {

    /**
     * @method getReactComponentClass
     * @summary Returns an object that will be used by React to create our peer
     *     instance of the component.
     * @returns {Function} The object to be used as the React component's class
     *     (i.e. constructor).
     */

    var reactComponentClassName,

        initialProps,

        elemWin,

        proxyConfig,
        reactProxy,

        reactComponent;

    //  Grab the component's ECMAScript class name. If it's empty, exit here.
    reactComponentClassName = this.getReactComponentClassName();
    if (TP.isEmpty(reactComponentClassName)) {
        //  TODO: Raise an exception.
        return this;
    }

    //  Grab the initial props by getting all of the attributes of the receiver
    //  as a hash.
    initialProps = this.getAttributes();

    //  Add in any 'non attribute' props.
    initialProps.addAll(this.getNonAttributeProps());

    //  Convert the initial hash into a POJO and add a reference to the receiver
    //  to it.
    initialProps = initialProps.asObject();
    initialProps.TIBETPeer = this;

    elemWin = this.getNativeWindow();

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
                    return this.__oldComponentWillUnmount.apply(this, arguments);
                }
            };

            //  Return the newly constructed instance.
            return newInst;
        }
    };

    //  Create the Proxy, supplying the constructor (resolved by using the
    //  target window global context and referenced by the ECMAScript class
    //  name) and the Proxy configuration..
    reactProxy = new Proxy(elemWin[reactComponentClassName], proxyConfig);

    //  Call React's 'createElement' method using the proxy as the constructor
    //  and supplying the props we computed above.
    reactComponent = elemWin.React.createElement(reactProxy, initialProps);

    return reactComponent;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('getReactComponentClassName',
function() {

    /**
     * @method getReactComponentClassName
     * @summary Returns the React component's ECMAScript class name. This is
     *     used by the TIBET machinery when invoking the ReactDOM.render call.
     * @returns {String} The React component's ECMAScript class name.
     */

    return null;
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
    vals = this.getBoundValues(this.getBindingScopeValues(),
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
    vals = this.getBoundValues(this.getBindingScopeValues(),
                                this.getAttribute('bind:io'));

    //  Set the state on the React peer using a POJO'ed version of the hash.
    anObject.setState(vals.asObject());

    this.set('$reactPeer', anObject);

    this.set('$isMounted', true);

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

    var elem,
        elemWin,

        reactComponentClass;

    elem = this.getNativeNode();
    elemWin = this.getNativeWindow();

    //  Grab the React component class (i.e. the constructor).
    reactComponentClass = this.getReactComponentClass();

    //  If we got a valid component class, then invoke the render call with it.
    //  Note here how we provide ourself (transformed by our compilation method
    //  above into an XHTML span) as the 'root DOM node' for this React
    //  component.
    if (TP.isValid(reactComponentClass)) {
        elemWin.ReactDOM.render(
                reactComponentClass,
                elem,
                function() {
                    this.reactComponentCreationFinished();
                }.bind(this));
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
     * @returns {TP.dom.ReactElement} The receiver.
     */

    var peer,

        newValue,
        newValueStr;

    //  If the value isn't valid, just return.
    if (TP.notValid(aValue)) {
        return this;
    }

    //  If the peer component isn't mounted, then just return.
    if (TP.notTrue(this.get('$isMounted'))) {
        return this;
    }

    //  If we're updating as part of the React update cycle, just return.
    if (this.get('$$updating')) {
        return this;
    }

    //  If the React peer isn't valid, just return.
    peer = this.get('$reactPeer');
    if (TP.notValid(peer)) {
        return this;
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

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ReactElement.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver.
     * @returns {TP.dom.ReactElement} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
