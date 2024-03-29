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
 * @type {TP.xctrls.jsonview}
 * @summary A subtype of TP.xctrls.FramedElement that wraps the CodeMirror code
 *     editor.
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls:jsonview');

//  Events:
//      xctrls-jsonview-selected

TP.xctrls.jsonview.addTraitTypes(TP.html.textUtilities);

TP.xctrls.jsonview.Type.resolveTrait('booleanAttrs', TP.html.textUtilities);
TP.xctrls.jsonview.Type.resolveTrait('getResourceURI', TP.xctrls.jsonview);

TP.xctrls.jsonview.Inst.resolveTraits(
        TP.ac('getDisplayValue', 'setDisplayValue'),
        TP.xctrls.jsonview);
TP.xctrls.jsonview.Inst.resolveTraits(
        TP.ac('getValue', 'setValue'),
        TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.jsonview.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.xctrls.jsonview.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
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

TP.xctrls.jsonview.Inst.defineAttribute('$discoverySheetReady');
TP.xctrls.jsonview.Inst.defineAttribute('$discoveryObj');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.jsonview.Inst.defineMethod('allOtherRealmAssetsLoaded',
function(resources) {

    /**
     * @method allOtherRealmAssetsLoaded
     * @summary This method is called on each instance of this type when all of
     *     the type's 'other realm' assets have been loaded.
     * @param {TP.core.Hash} resources A hash of the 'other realm' assets that
     *     were loaded. This will have the path of the asset as the key and the
     *     'asset object' (usually an Element) that was inserted to represent
     *     that asset in the other realm.
     * @returns {TP.xctrls.jsonview} The receiver.
     */

    var styleElem;

    styleElem = resources.at(
                    TP.uriExpandPath('~lib_deps/discovery/discovery.css'));

    TP.elementSetAttribute(styleElem, 'id', 'discoveryStyle', true);

    this.setup();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.jsonview.Inst.defineMethod('configDiscovery',
function(aDiscoveryObj) {

    /**
     * @method configDiscovery
     * @summary Configures the supplied Discovery object with pages, views and
     *     nav items.
     * @returns {TP.xctrls.jsonview} The receiver.
     */

    var thisref;

    thisref = this;

    //  ---

    const {complexViews} = this.getNativeWindow().discovery;

    aDiscoveryObj.apply(complexViews);

    //  ---

    aDiscoveryObj.page.define('default', [
        {
            view: 'struct',
            expanded: parseInt(4, 10) || 0
        }
    ]);

    //  ---

    aDiscoveryObj.view.define('raw', (el) => {
        var raw;

        raw = thisref.get('value');
        if (TP.isValid(raw)) {
            raw = TP.json(raw, undefined, 4);
        } else {
            raw = '';
        }

        el.classList.add('user-select');
        el.textContent = raw;
    }, {tag: 'pre'});

    //  ---

    aDiscoveryObj.page.define('raw', 'raw');

    //  ---

    aDiscoveryObj.nav.append({
        content: 'text:"Index"',
        onClick: () => {
            return aDiscoveryObj.setPage('default');
        },
        when: () => {
            return aDiscoveryObj.pageId !== 'default';
        }
    });

    //  ---

    aDiscoveryObj.nav.append({
        content: 'text:"Make report"',
        onClick: () => {
            return aDiscoveryObj.setPage('report');
        },
        when: () => {
            return aDiscoveryObj.pageId !== 'report';
        }
    });

    //  ---

    aDiscoveryObj.nav.append({
        content: 'text:"Raw"',
        onClick: () => {
            return aDiscoveryObj.setPage('raw');
        },
        when: () => {
            return aDiscoveryObj.pageId !== 'raw';
        }
    });

    //  ---

    aDiscoveryObj.nav.append({
        content: 'text:"Copy raw"',
        onClick: async function() {
            var raw;

            raw = thisref.get('value');
            if (TP.isValid(raw)) {
                raw = TP.json(raw);
            } else {
                raw = '';
            }

            try {
                await navigator.clipboard.writeText(raw);
            } catch (err) {
                console.error(err); // eslint-disable-line no-console
            }
        },
        when: () => {
            if (aDiscoveryObj.pageId === 'raw') {
                document.body.classList.add('no-user-select');
            } else {
                document.body.classList.remove('no-user-select');
            }

            return aDiscoveryObj.pageId === 'raw';
        }
    });

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.jsonview.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    var discoveryObj;

    discoveryObj = this.$get('$discoveryObj');
    if (TP.notValid(discoveryObj)) {
        return '';
    }

    if (TP.isValid(discoveryObj.data)) {
        return discoveryObj.data;
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.xctrls.jsonview.Inst.defineMethod('isReadyToRender',
function() {

    /**
     * @method isReadyToRender
     * @summary Whether or not the receiver is 'ready to render'. Normally, this
     *     means that all of the resources that the receiver relies on to render
     *     have been loaded.
     * @returns {Boolean} Whether or not the receiver is ready to render.
     */

    //  We're ready to render when we have both a valid Discovery object and the
    //  matching stylesheet for it.
    return TP.isValid(this.$get('$discoveryObj')) &&
            TP.isTrue(this.get('$discoverySheetReady'));
});

//  ------------------------------------------------------------------------

TP.xctrls.jsonview.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver. At this type level, this method does
     *     nothing.
     * @returns {TP.xctrls.jsonview} The receiver.
     */

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.jsonview.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.jsonview} The receiver.
     */

    var setData,

        discoveryObj,
        handler;

    //  Define a function that will set the data. This is either called
    //  immediately if the 'discovery' object is already available or when this
    //  object is ready.
    setData =
        function(val) {
            var json,
                obj;

            //  Grab the supplied value - if it's not a JSON string, then get
            //  it's 'JSON source' representation.
            json = val;
            if (!TP.isJSONString(json)) {
                json = TP.jsonsrc(val);
            }

            //  Turn that back into a JavaScript object *without* converting
            //  POJOs to TP.core.Hash objects.
            obj = TP.json2js(json, false);

            discoveryObj.setData(
                obj,
                {
                    createdAt: new Date().toISOString()
                }
            );
        };

    discoveryObj = this.$get('$discoveryObj');
    if (TP.notValid(discoveryObj)) {
        handler = function() {
            handler.ignore(this, 'TP.sig.DOMReady');

            discoveryObj = this.$get('$discoveryObj');
            setData(aValue);
        }.bind(this);

        handler.observe(this, 'TP.sig.DOMReady');
    } else {
        setData(aValue);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.jsonview.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.xctrls.jsonview} The receiver.
     */

    var discoveryElem,
        discoveryObj;

    const {Widget} = this.getNativeWindow().discovery;

    //  The Element that we'll attach the Discovery view to. This is the 'div'
    //  that we supply in our associated markup.
    discoveryElem = this.getNativeNode().firstElementChild;

    //  Create a new Discovery widget. For now, we force dark mode to true.

    /* eslint-disable new-cap */
    discoveryObj = new Widget(discoveryElem,
                                null,
                                {
                                    darkmode: true
                                });
    /* eslint-enable new-cap */

    this.$set('$discoveryObj', discoveryObj);

    //  Configure the Discovery object. This will define Discovery pages, views,
    //  nav items, etc.
    this.configDiscovery(discoveryObj);

    //  We're all set up and ready - signal that.
    this.dispatch('TP.sig.DOMReady');

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.jsonview.Inst.defineMethod('stylesheetReady',
function(aStyleTPElem) {

    /**
     * @method stylesheetReady
     * @summary A method that is invoked when the supplied stylesheet is
     *     'ready', which means that it's attached to the receiver's Document
     *     and all of it's style has been parsed and applied.
     * @description Typically, the supplied stylesheet Element is the one that
     *     the receiver is waiting for so that it can finalized style
     *     computations. This could be either the receiver's 'core' stylesheet
     *     or it's current 'theme' stylesheet, if the receiver is executing in a
     *     themed environment.
     * @param {TP.html.style} aStyleTPElem The XHTML 'style' element that is
     *     ready.
     * @returns {TP.xctrls.jsonview} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.jsonview.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver.
     * @returns {TP.xctrls.jsonview} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
