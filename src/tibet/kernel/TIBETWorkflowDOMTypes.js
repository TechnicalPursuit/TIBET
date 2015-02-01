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
//  TP.vcard_temp.vCard
//  ========================================================================

/**
 * @type {TP.vcard_temp.vCard}
 * @summary A VCard based on the Jabber/XEP-0054 vcard-temp specification.
 * @description The primary purpose of this type in TIBET is to support
 *     TP.core.User instances in the definition of their organization and role
 *     affiliations. By virtue of vCard association types can autoload
 *     organization-specific role/unit types which serve as delegates for
 *     permission-specific behaviors and as keepers of associated keys/keyrings.
 *
 *     Given the relatively limited goals for this type at the present time we
 *     focus only on the FN, ROLE, and ORG elements and their associated
 *     children. Additional aspect mappings, and an expanded node template,
 *     would allow this type to be a full-featured wrapper for the full XEP-0054
 *     vCard element.
 *
 *     See http://www.xmpp.org/extensions/xep-0054.html for more info.
 *
 *     See the vcards.xml sample file for specific markup examples.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('vcard_temp:vCard');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Type.defineConstant('template',
    TP.elementFromString(TP.join(
        '<vCard>',
            '<VERSION>1.1</VERSION>',
            '<FN>fullname</FN>',
            '<N>name</N>',
            '<ROLE>role;role;role</ROLE>',
            '<ORG>',
                '<ORGNAME>org</ORGNAME>',
                '<ORGUNIT>unit;unit;unit</ORGUNIT>',
            '</ORG>',
        '</vCard>')
    ));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Type.defineMethod('getInstanceById',
function(anID) {

    /**
     * @method getInstanceById
     * @summary Returns the vCard instance whose FN entry matches the ID
     *     provided. NOTE that the FN data doesn't have to match the ID of the
     *     TP.core.User you'll associate it with, allowing you to reuse commonly
     *     named vCard instances across numerous users.
     * @description This method defaults to loading the shared vCard data
     *     normally found at ~app_dat/vcards.xml. When your needs are simple
     *     this is probably adequate, but in more complex applications you
     *     probably want to override this method and replace it with one that
     *     calls a web service to return a single TP.vcard_temp.vCard element
     *     with the requested ID/FN.
     * @returns {TP.vcard_temp.vCard} A vCard element wrapper.
     */

    var xml,
        elem;

    xml = this.getVCardXML();
    if (TP.notValid(xml)) {
        return this.raise('TP.sig.InvalidXML',
                                    'Unable to acquire vCard XML');
    }

    elem = TP.nodeEvaluateXPath(
                xml,
                TP.join('//$def:FN[text()="', anID, '"]/..'),
                TP.FIRST_NODE);

    if (TP.notValid(elem)) {
        //  ignore missing vcard entries
        return;
    }

    return this.construct(elem);
});

//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Type.defineMethod('getVCardXML',
function(forceRefresh) {

    /**
     * @method getVCardXML
     * @summary Returns the vCard XML containing the application's set of
     *     vCards. This method is typically used by applications that don't
     *     required a large number of unique vCard entries.
     * @description The vCard data file location can be altered by setting the
     *     environment parameter 'vcards', or by altering the tibet.vcard_file
     *     parameter. This URI is then loaded to provide the application vCard
     *     XML data.
     *
     *     NOTE that this call is only used by the getInstanceById call for
     *     vCard instances, so you can avoid the file-level approach by
     *     overriding that method and invoking a web service or using other
     *     means to locate a vCard by ID.
     * @param {Boolean} forceRefresh True will force the file content to be
     *     reloaded.
     * @returns {XMLDocument} An XML document containing vCard data. The root
     *     element is a vCards element, while each vCard is a vCard element
     *     conforming to the XMPP XEP-0054 specification.
     */

    var node,
        flag,
        fname,
        url;

    if (TP.ifInvalid(forceRefresh, false)) {
        TP.sys.$vcardXML = null;
    }

    if (TP.isNode(node = TP.sys.$vcardXML)) {
        return node;
    }

    flag = TP.sys.shouldLogRaise();
    TP.sys.shouldLogRaise(false);

    try {
        try {
            if (TP.notEmpty(fname = TP.sys.cfg('tibet.vcards'))) {
                fname = TP.uriExpandPath(fname);
                if (TP.isURI(url = TP.uc(fname))) {
                    //  NOTE: We do *not* use 'url.getNativeNode()' here
                    //  since it causes a recursion when it tries to
                    //  instantiate a TP.core.RESTService which then tries
                    //  to configure itself from a vCard which then leads us
                    //  back here...
                    //  Note that this is a *synchronous* load.
                    node = TP.$fileLoad(url.getLocation(),
                                        TP.hc('resultType', TP.DOM));
                }
            }
        } catch (e) {
        }

        try {
            if (TP.notValid(node)) {
                fname = TP.uriExpandPath(TP.sys.cfg('tibet.vcard_file'));
                if (TP.isURI(url = TP.uc(fname))) {
                    //  NOTE: We do *not* use 'url.getNativeNode()' here
                    //  since it causes a recursion when it tries to
                    //  instantiate a TP.core.RESTService which then tries
                    //  to configure itself from a vCard which then leads us
                    //  back here...
                    //  Note that this is a *synchronous* load.
                    node = TP.$fileLoad(url.getLocation(),
                                        TP.hc('resultType', TP.DOM));
                }
            }
        } catch (e) {
        }

        if (TP.notValid(node)) {
            node = TP.documentFromString(
                        '<vCards xmlns="vcard-temp"></vCards>');
        }

        TP.sys.$vcardXML = node;
    } catch (e) {
    } finally {
        TP.sys.shouldLogRaise(flag);
    }

    return node;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.vcard_temp.vCard.Inst.defineAttribute(
        'version',
        {'value': TP.xpc('./$def:VERSION', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'fullname',
        {'value': TP.xpc('./$def:FN', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'shortname',
        {'value': TP.xpc('./$def:N', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'jid',
        {'value': TP.xpc('./$def:JABBERID', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'url',
        {'value': TP.xpc('./$def:URL', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'role',
        {'value': TP.xpc('./$def:ROLE', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'orgname',
        {'value': TP.xpc('./$def:ORG/$def:ORGNAME', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'orgunit',
        {'value': TP.xpc('./$def:ORG/$def:ORGUNIT', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'key',
        {'value': TP.xpc('./$def:KEY', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'secretkey',
        {'value': TP.xpc('./$def:X-SECRET-KEY', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'username',
        {'value': TP.xpc('./$def:X-USERNAME', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'password',
        {'value': TP.xpc('./$def:X-PASSWORD', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'auth',
        {'value': TP.xpc('./$def:X-AUTH', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'iswebdav',
        {'value': TP.xpc('./$def:X-IS-WEBDAV', true).
                                    set('extractWith', 'value')});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Inst.defineMethod('getAccessKeys',
function() {

    /**
     * @method getAccessKeys
     * @summary Returns an array of permission keys defined by the receiver's
     *     role and unit definitions.
     * @returns {Array} An array of permission keys (strings).
     */

    var keys,
        roles,
        units;

    //  NOTE
    //  we cache the key string to avoid recomputation overhead
    if (TP.notEmpty(keys = this.getAttribute('keys'))) {
        return keys.split(' ');
    }

    keys = TP.ac();

    roles = this.getRoles();
    keys = roles.injectInto(
        keys,
        function(role, accum) {

            accum.push.apply(accum, role.getAccessKeys());

            return accum;
        });

    units = this.getUnits();
    keys = units.injectInto(
        keys,
        function(unit, accum) {

            accum.push.apply(accum, unit.getAccessKeys());

            return accum;
        });

    //  since we've blended keys from a number of sources, unique and sort
    //  for easier debugging in the UI
    return keys.unique().sort();
});

//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Inst.defineMethod('getRoleNames',
function() {

    /**
     * @method getRoleNames
     * @summary Returns an array of role names found in the vCard instance.
     *     NOTE that TIBET automatically "namespace-qualifies" the content of
     *     the ROLE element with the content of the ORGNAME element to produce
     *     these names.
     * @returns {Array} An array of role names (TP.core.Role subtype names).
     */

    var org,
        role,
        names;

    org = this.get('orgname');
    role = this.get('role');
    if (TP.isEmpty(role)) {
        return TP.ac();
    }

    names = role.split(';');
    return names.collect(
            function(name) {

                return TP.join(org, ':', name);
            });
});

//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Inst.defineMethod('getRoles',
function() {

    /**
     * @method getRoles
     * @summary Returns an array of TP.core.Role types that were found for the
     *     receiver. When a named role can't be loaded it won't be included in
     *     this list, and a warning will be logged.
     * @returns {Array} An array containing loadable TP.core.Role types.
     */

    var names;

    names = this.getRoleNames();

    return names.collect(
                function(name) {

                    return TP.sys.require(name);
                }).compact();
});

//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Inst.defineMethod('getUnitNames',
function() {

    /**
     * @summary Returns an array of unit names found in the vCard instance.
     *     NOTE that TIBET automatically "namespace-qualifies" the content of
     *     the ORGUNIT element with the content of the ORGNAME element in
     *     producing this list.
     * @returns {Array} An array of unit names (TP.core.Unit subtype names).
     * @method
     */

    var org,
        unit,
        names;

    org = this.get('orgname');
    unit = this.get('orgunit');
    if (TP.isEmpty(unit)) {
        return TP.ac();
    }

    names = unit.split(';');
    return names.collect(
            function(name) {

                return TP.join(org, ':', name);
            });
});

//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Inst.defineMethod('getUnits',
function() {

    /**
     * @method getUnits
     * @returns {Array}
     * @abstract
     */

    var names;

    names = this.getUnitNames();

    return names.collect(
                function(name) {

                    return TP.sys.require(name);
                }).compact();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

//  ========================================================================
//  TP.tibet.keyring
//  ========================================================================

/**
 * @type {TP.tibet.keyring}
 * @summary A keyring is a container for one or more keys, strings that
 *     represent individual permissions within an application.
 * @description To help manage permissions in the most flexible way possible
 *     TIBET uses the concept of keys, strings you define to have some meaning
 *     relative to permissions in your application. These keys can be grouped
 *     within keyrings, which can be nested to keep things easier to maintain in
 *     large systems.
 *
 *     When a user logs in you assign that user a vCard which defines the
 *     user's organization-qualified role and unit affiliations. The role and
 *     unit definitions found in the vCard provide one or more keyrings to their
 *     associated user(s), granting members their permissions.
 *
 *     See the keyrings.xml sample file for specific markup examples.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('tibet:keyring');

//  ------------------------------------------------------------------------
//  Types Methods
//  ------------------------------------------------------------------------

TP.tibet.keyring.Type.defineMethod('getInstanceById',
function(anID) {

    /**
     * @method getInstanceById
     * @summary Returns the keyring instance whose id attribute matches the ID
     *     provided.
     * @description This method defaults to loading the shared keyring data
     *     normally found at ~app_dat/keyrings.xml. When your needs are simple
     *     this is probably adequate, but in more complex applications you
     *     probably want to override this method and replace it with one that
     *     calls a web service to return a single keyring element with the
     *     requested ID.
     * @returns {tibet:keyring} A keyring element wrapper.
     */

    var xml,
        elem;

    xml = this.getKeyringXML();
    if (TP.notValid(xml)) {
        return this.raise('TP.sig.InvalidXML',
                                    'Unable to acquire keyring XML');
    }

    elem = TP.nodeGetElementById(xml, anID);
    if (TP.notValid(elem)) {
        return; //  ignore missing keyring entries
    }

    return this.construct(elem);
});

//  ------------------------------------------------------------------------

TP.tibet.keyring.Type.defineMethod('getKeyringXML',
function(forceRefresh) {

    /**
     * @method getKeyringXML
     * @summary Returns the keyring XML containing the application's set of
     *     keyrings. This method is typically used by applications that don't
     *     required a large number of unique keyring entries.
     * @description The keyring data file location can be altered by setting the
     *     environment parameter 'keyrings', or by altering the
     *     tibet.keyring_file setting. This URI is then loaded to provide the
     *     application keyring XML data.
     *
     *     NOTE that this call is only used by the getInstanceById call for
     *     keyring instances, so you can avoid the file-level approach by
     *     overriding that method and invoking a web service or using other
     *     means to locate a keyring by ID.
     * @param {Boolean} forceRefresh True will force the file content to be
     *     reloaded.
     * @returns {XMLDocument} An XML document containing vCard data. The root
     *     element is a vCards element, while each vCard is a vCard element
     *     conforming to the XMPP XEP-0054 specification.
     */

    var node,
        flag,
        fname,
        url;

    if (TP.ifInvalid(forceRefresh, false)) {
        TP.sys.$keyringXML = null;
    }

    if (TP.isNode(node = TP.sys.$keyringXML)) {
        return node;
    }

    flag = TP.sys.shouldLogRaise();
    TP.sys.shouldLogRaise(false);

    try {
        try {
            if (TP.notEmpty(fname = TP.sys.cfg('tibet.keyrings'))) {
                fname = TP.uriExpandPath(fname);
                if (TP.isURI(url = TP.uc(fname))) {
                    //  NOTE: We do *not* use 'url.getNativeNode()' here
                    //  since this gets loaded very early in the startup
                    //  process. Note that this is a *synchronous* load.
                    node = TP.$fileLoad(url.getLocation(),
                                        TP.hc('resultType', TP.DOM));
                }
            }
        } catch (e) {
        }

        try {
            if (TP.notValid(node)) {
                fname = TP.uriExpandPath(
                            TP.sys.cfg('tibet.keyring_file'));
                if (TP.isURI(url = TP.uc(fname))) {
                    //  NOTE: We do *not* use 'url.getNativeNode()' here
                    //  since this gets loaded very early in the startup
                    //  process. Note that this is a *synchronous* load.
                    node = TP.$fileLoad(url.getLocation(),
                                        TP.hc('resultType', TP.DOM));
                }
            }
        } catch (e) {
        }

        if (TP.notValid(node)) {
            node = TP.documentFromString(
                    TP.join('<keyrings xmlns="', TP.w3.Xmlns.TIBET, '">',
                            '</keyrings>'));
        }

        TP.sys.$keyringXML = node;
    } catch (e) {
    } finally {
        TP.sys.shouldLogRaise(flag);
    }

    return node;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.keyring.Inst.defineMethod('getAccessKeys',
function() {

    /**
     * @method getAccessKeys
     * @summary Returns an array of the string keys found in the receiver.
     * @returns {Array} An array containing the string keys of the receiver.
     */

    var keys,
        arr,
        rings;

    //  NOTE
    //  we cache the key string to avoid recomputation overhead,
    //  particularly around nested keyrings.
    //  ALSO
    //  since we use the keys attribute as a cache this can be leveraged by
    //  any web service you may write as a way to return an element of the
    //  form <keyring keys="ab cd ef"/> rather than a nested structure.
    if (TP.notEmpty(keys = this.getAttribute('keys'))) {
        return keys.split(' ');
    }

    //  build an empty array we can inject into the following processes
    keys = TP.ac();

    //  first we'll gather up any keys from our "child" keyrings
    rings = this.getKeyrings();
    keys = rings.injectInto(
        keys,
        function(ring, accum) {

            //  the apply will flatten the nested keys into the keyset
            accum.push.apply(accum, ring.getAccessKeys());

            //  injectInto requires that we return the injected data
            return accum;
        });

    //  now we want to add our local keys (make sure that we get an Array
    //  even if there's only one)
    arr = this.evaluateXPath('./$def:key/@id', TP.NODESET);
    keys = arr.injectInto(
        keys,
        function(attr, accum) {

            //  turn attribute nodes into string values
            accum.push(TP.str(attr.value));

            //  injectInto requires that we return the injected data
            return accum;
        });

    //  since we've blended keys from a number of sources, unique and sort
    //  for easier debugging in the UI
    keys = keys.unique().sort();

    //  cache the result
    this.setAttribute('keys', keys.join(' '));

    return keys;
});

//  ------------------------------------------------------------------------

TP.tibet.keyring.Inst.defineMethod('getKeyrings',
function() {

    /**
     * @method getKeyrings
     * @summary Returns an array of any nested keyrings found in the receiver.
     *     This list's related keys also become part of the overall key set
     *     returned by the getAccessKeys() method so you rarely need to call it
     *     directly.
     * @returns {Array} An array containing the string keys of the receiver.
     */

    var arr;

    //  NB: we make sure that we get an Array even if there's only one
    arr = this.evaluateXPath('./$def:keyring/@ref', TP.NODESET);
    arr.convert(
        function(attr) {

            return TP.tibet.keyring.getInstanceById(TP.str(attr.value));
        });

    return arr;
});

//  ------------------------------------------------------------------------

TP.tibet.keyring.Inst.defineMethod('hasAccessKey',
function(aKey) {

    /**
     * @method hasAccessKey
     * @summary Returns true if the receiving key ring has the named key.
     * @returns {Boolean} True if the key is found.
     */

    return this.getAccessKeys().contains(aKey);
});

//  ========================================================================
//  TP.core.TagProcessor
//  ========================================================================

/**
 * @type {TP.core.TagProcessor}
 * @summary The core engine responsible for processing tags (or any type of DOM
 *     construct like PIs or Text nodes, really). This object holds a set of
 *     processing phases and is responsible for executing them against a chunk
 *     of supplied content.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.TagProcessor');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  A set of phase types used when 'attaching' content to a visual DOM
TP.core.TagProcessor.Type.defineConstant(
    'ATTACH_PHASES',
    TP.ac(
    'TP.core.AttachDOMPhase',       //  Late additions to the DOM needed for
                                    //  visual structuring
    'TP.core.AttachEventsPhase',    //  ev: namespace. NOTE others can generate
    'TP.core.AttachDataPhase',      //  model construct et. al.
    'TP.core.AttachInfoPhase',      //  other info tags (acl:, dnd:, etc)
    'TP.core.AttachBindsPhase',     //  data bindings in the bind: namespace
    'TP.core.AttachStylePhase'      //  CSS is last so display: none can flip
                                    //  late
    ));

//  A set of phase types used when 'detaching' content from a visual DOM
TP.core.TagProcessor.Type.defineConstant(
    'DETACH_PHASES',
    TP.ac(
    'TP.core.DetachStylePhase',
    'TP.core.DetachDataPhase',
    'TP.core.DetachBindsPhase',
    'TP.core.DetachInfoPhase',
    'TP.core.DetachEventsPhase',
    'TP.core.DetachDOMPhase'
    ));

//  A set of phase types used when 'compiling' or transforming content from one
//  representation into another.
TP.core.TagProcessor.Type.defineConstant(
    'COMPILE_PHASES',
    TP.ac(
    'TP.core.IncludesPhase',        //  xi:includes, CSS @imports, etc.
    'TP.core.InstructionsPhase',    //  ?tibet, ?xsl-stylesheet, etc.
    'TP.core.PrecompilePhase',      //  conversion to compilable form
    'TP.core.CompilePhase',         //  tag/macro expansion (ACT)
    'TP.core.TidyPhase',            //  move non-DTD content out of html:head
                                    //  etc.

    'TP.core.UnmarshalPhase',       //  resolve xml:base TP.core.URI references,
                                    //  decode etc.

    'TP.core.LocalizePhase'         //  adjust for browser, lang, etc.
    ));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.TagProcessor.Type.defineMethod('constructWithPhaseTypes',
function(phaseTypesArray) {

    /**
     * @method constructWithPhaseTypes
     * @summary Returns an instance of a tag processor with a set of instances
     *     of phases constructed from the supplied Array of phase types.
     * @param {Array} phaseTypesArray The Array of phase type objects to
     *     construct the phases from.
     * @returns {TP.core.TagProcessor} A new instance configured with instances
     *     of the phase types as its phase list.
     */

    var phaseInstances,
        newInst;

    phaseInstances = phaseTypesArray.collect(
                        function(phaseType) {
                            return phaseType.construct();
                        });

    newInst = this.construct(phaseInstances);

    return newInst;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

/**
 * The list of phases to run over the content when this processor is used
 * @type {Array}
 */
TP.core.TagProcessor.Inst.defineAttribute('phases');

TP.core.TagProcessor.Inst.defineAttribute('$tagTypeDict');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.TagProcessor.Inst.defineMethod('init',
function(phases) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {Array} phases The list of phases to use when this processor is
     *     run over supplied content.
     * @returns {TP.core.TagProcessor} The receiver.
     */

    this.callNextMethod();

    this.set('phases', phases);

    //  Allocate a TP.lang.Hash to stick our tag types in as we find them -
    //  speeds up lookup in later stages of the processing considerably.
    this.set('$tagTypeDict', TP.hc());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.TagProcessor.Inst.defineMethod('processTree',
function(aNode, aRequest) {

    /**
     * @method processTree
     * @summary Processes the supplied tree of content through this processor's
     *     configured set of phases.
     * @param {Node} aNode The node tree to use as the root to start the
     *     processing.
     * @param {TP.sig.Request} aRequest The request containing control
     *     parameters which may or may not be used, depending on the phase
     *     involved.
     * @exception TP.sig.InvalidNode
     * @returns {TP.core.TagProcessor} The receiver.
     */

    var phases,

        len,
        i;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  Normalize the node to try to reduce the number of Text nodes as much as
    //  possible
    TP.nodeNormalize(aNode);

    phases = this.get('phases');

    //  Iterate over the phases, processing the content through each one.
    len = phases.getSize();
    for (i = 0; i < len; i++) {
        phases.at(i).processNode(aNode, this, aRequest);
    }

    return this;
});

//  ========================================================================
//  TP.core.TagProcessorPhase
//  ========================================================================

/**
 * @type {TP.core.TagProcessorPhase}
 * @summary The top-level tag processor 'phase' type, used in conjunction with
 *     the tag processor type. The tag processor holds 1...n phases and
 *     processes it's content through each one.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.TagProcessorPhase');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.TagProcessorPhase.Inst.defineMethod('getFilteredNodes',
function(aNode, aProcessor) {

    /**
     * @method getFilteredNodes
     * @summary Given the supplied node, this method queries it (using the
     *     'queryForNodes()' method) and then filters that set down to the nodes
     *     whose TIBET wrapper type can respond to this phase's target method.
     * @param {Node} aNode The root node to start the query from.
     * @param {TP.core.TagProcessor} aProcessor The processor that 'owns' this
     *     phase.
     * @exception TP.sig.InvalidNode, TP.sig.InvalidParameter
     * @returns {Array} An array containing a set of filtered Nodes.
     */

    var methodName,

        tagTypeDict,
        canInvokeInfo,

        queriedNodes,
        filteredNodes;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    if (!TP.isString(methodName = this.getTargetMethod())) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Grab the processor-wide tag type hash that is used to cache tag types.
    tagTypeDict = aProcessor.get('$tagTypeDict');

    //  Build a hash that will track whether certain tag types can invoke the
    //  target method for this phase.
    canInvokeInfo = TP.hc();

    //  Query the tree for the set of nodes to consider when processing. This
    //  can significantly reduce the number of nodes considered.
    queriedNodes = this.queryForNodes(aNode);

    //  Out of the batch of queried nodes, select only those whose TIBET wrapper
    //  type implement this phases's target method.
    filteredNodes = queriedNodes.select(
        function(node) {
            var type,
                elemName,

                canInvoke;

            //  If the considered node is an element, see if there are entries
            //  for it in the tag type hash and invocation tracking hash under
            //  its full name. This means this type of element has already been
            //  found once and queried as to whether it can respond to this
            //  phase's target method.
            if (TP.isElement(node)) {
                elemName = TP.elementGetFullName(node);
                if (tagTypeDict.hasKey(elemName) &&
                    canInvokeInfo.hasKey(elemName)) {
                    return canInvokeInfo.at(elemName);
                }
            }

            if (!TP.isType(type = TP.core.Node.getConcreteType(node))) {
                //  TODO: Log a warning - this is the 'teachable moment' :-)
                return false;
            }

            canInvoke = TP.canInvoke(type, methodName);

            //  If the considered node is an element, then we can make an entry
            //  for it in our tag type hash and invocation tracking hash under
            //  that name for later fast lookup for the same type of element in
            //  the tree of nodes being considered.
            if (TP.isElement(node)) {
                tagTypeDict.atPut(elemName, type);
                canInvokeInfo.atPut(elemName, canInvoke);
            }

            return canInvoke;
        });

    return filteredNodes;
});

//  ------------------------------------------------------------------------

TP.core.TagProcessorPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.TagProcessorPhase.Inst.defineMethod('processNode',
function(aNode, aProcessor, aRequest) {

    /**
     * @method processNode
     * @summary Processes the content of the supplied Node through this
     *     processor phase.
     * @param {Node} aNode The root node to start the processing from.
     * @param {TP.core.TagProcessor} aProcessor The processor that 'owns' this
     *     phase.
     * @param {TP.sig.Request} aRequest The request containing control
     *     parameters which may or may not be used, depending on the phase
     *     involved.
     * @exception TP.sig.InvalidNode, TP.sig.InvalidParameter
     * @returns {TP.core.TagProcessorPhase} The receiver.
     */

    var methodName,
        nodes,
        tagTypeDict,
        producedNodes,

        processingRequest,

        len,
        i,

        node,
        type,

        result,

        subPhases,
        subProcessor;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    if (!TP.isString(methodName = this.getTargetMethod())) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (TP.isEmpty(nodes = this.getFilteredNodes(aNode, aProcessor))) {
        return this;
    }

    //  Configure the processing request, starting with any parameters from the
    //  supplied request.
    processingRequest = TP.request(aRequest);

    processingRequest.atPut('currentPhase', this);
    processingRequest.atPut('phases', aProcessor.get('phases'));

    processingRequest.atPutIfAbsent('doc', TP.nodeGetDocument(aNode));
    processingRequest.atPut('root', aNode);

    //  Grab the processor-wide tag type hash that is used to cache tag types.
    tagTypeDict = aProcessor.get('$tagTypeDict');

    //  Any nodes that are actually newly-produced (and returned) by running the
    //  processor over the supplied content.
    producedNodes = TP.ac();

    len = nodes.getSize();
    for (i = 0; i < len; i++) {
        node = nodes.at(i);

        //  If one of the phases detached this node, then just continue on.
        if (TP.nodeIsDetached(node)) {
            continue;
        }

        processingRequest.atPut('node', node);

        //  If the considered node is an element, see if there are entries for
        //  it in the tag type hash under its full name. This means this type of
        //  element has already been found once. Otherwise, just go ahead and
        //  query it for it's TIBET wrapper type.
        if (TP.isElement(node)) {
            if (!TP.isType(type =
                            tagTypeDict.at(TP.elementGetFullName(node)))) {
                type = TP.core.Node.getConcreteType(node);
            }
        } else {
            type = TP.core.Node.getConcreteType(node);
        }

        //  Do the deed, invoking the target method against the wrapper type and
        //  supplying the request.
        result = type[methodName](processingRequest);

        //  The node that we got handed back was either identical to the node we
        //  handed in or it equals it, according to the W3C's definition of
        //  'node equality'. Therefore, we just continue without further
        //  processing of the result.
        if (TP.isNode(result) &&
            (result === node || TP.nodeEqualsNode(result, node) &&
             TP.notValid(node[TP.GENERATOR]))) {
            continue;
        }

        //  To reduce markup clutter, try to propagate namespaces as high up as
        //  possible.
        if (TP.isElement(result)) {
            TP.elementBubbleXMLNSAttributes(result);
        }

        //  If either a singular Node or Array of Nodes was returned, then push
        //  them onto our list of 'produced nodes'.
        if (TP.isNode(result)) {
            producedNodes.push(result);
        } else if (TP.isArray(result)) {
            producedNodes.addAll(result);
        }
    }

    //  If the list of nodes that executing this phase against the various
    //  target content Nodes is not empty, then we need to process them *from
    //  the processor's first phase up through ourself* (so as to have
    //  consistent results).
    if (TP.notEmpty(producedNodes)) {
        //  Grab the processor's phase list and slice a copy of it from the
        //  beginning to this phase (inclusive)
        subPhases = aProcessor.get('phases');

        subPhases = subPhases.slice(0, subPhases.indexOf(this) + 1);

        //  Configure a new processor with that phase list
        subProcessor = TP.core.TagProcessor.construct();
        subProcessor.set('phases', subPhases);

        //  Run the subprocessor on the produced nodes, thereby recursively
        //  processing the tree.
        len = producedNodes.getSize();
        for (i = 0; i < len; i++) {
            subProcessor.processTree(producedNodes.at(i));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.TagProcessorPhase.Inst.defineMethod('queryForNodes',
function(aNode) {

    /**
     * @method queryForNodes
     * @summary Given the supplied node, this method queries it using a query
     *     very specific to this phase.
     * @description This method should produce the sparsest result set possible
     *     for consideration by the next phase of the tag processing engine,
     *     which is to then filter this set by whether a) a TIBET wrapper type
     *     can be found for each result and b) whether that wrapper type can
     *     respond to this phase's target method.
     * @param {Node} aNode The root node to start the query from.
     * @returns {Array} An array containing the subset of Nodes from the root
     *     node that this phase should even consider to try to process.
     */

    var query,
        queriedNodes;

    //  According to DOM Level 3 XPath, we can't use DocumentFragments as the
    //  context node for evaluating an XPath expression.
    if (!TP.isNode(aNode) || TP.isFragment(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  The default phase grabs *all* nodes here - not just Elements. Note that
    //  this expression will also grab the aNode itself.
    query = './descendant-or-self::node()';

    queriedNodes = TP.nodeEvaluateXPath(aNode, query, TP.NODESET);

    return queriedNodes;
});

//  ========================================================================
//  TP.core.IncludesPhase
//  ========================================================================

/**
 * @type {TP.core.IncludesPhase}
 */

//  ------------------------------------------------------------------------

TP.core.TagProcessorPhase.defineSubtype('core.IncludesPhase');

//  ------------------------------------------------------------------------

TP.core.IncludesPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagIncludes';
});

//  ------------------------------------------------------------------------

TP.core.IncludesPhase.Inst.defineMethod('queryForNodes',
function(aNode) {

    /**
     * @method queryForNodes
     * @summary Given the supplied node, this method queries it using a query
     *     very specific to this phase.
     * @description This method should produce the sparsest result set possible
     *     for consideration by the next phase of the tag processing engine,
     *     which is to then filter this set by whether a) a TIBET wrapper type
     *     can be found for each result and b) whether that wrapper type can
     *     respond to this phase's target method.
     * @param {Node} aNode The root node to start the query from.
     * @returns {Array} An array containing the subset of Nodes from the root
     *     node that this phase should even consider to try to process.
     */

    var query,
        queriedNodes;

    //  According to DOM Level 3 XPath, we can't use DocumentFragments as the
    //  context node for evaluating an XPath expression.
    if (!TP.isNode(aNode) || TP.isFragment(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    query = 'descendant-or-self::*[namespace-uri() = "' +
                                        TP.w3.Xmlns.XINCLUDE +
                                        '"]';

    queriedNodes = TP.nodeEvaluateXPath(aNode, query, TP.NODESET);

    return queriedNodes;
});

//  ========================================================================
//  TP.core.InstructionsPhase
//  ========================================================================

/**
 * @type {TP.core.InstructionsPhase}
 */

//  ------------------------------------------------------------------------

TP.core.TagProcessorPhase.defineSubtype('core.InstructionsPhase');

//  ------------------------------------------------------------------------

TP.core.InstructionsPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagInstructions';
});

//  ------------------------------------------------------------------------

TP.core.InstructionsPhase.Inst.defineMethod('queryForNodes',
function(aNode) {

    /**
     * @method queryForNodes
     * @summary Given the supplied node, this method queries it using a query
     *     very specific to this phase.
     * @description This method should produce the sparsest result set possible
     *     for consideration by the next phase of the tag processing engine,
     *     which is to then filter this set by whether a) a TIBET wrapper type
     *     can be found for each result and b) whether that wrapper type can
     *     respond to this phase's target method.
     * @param {Node} aNode The root node to start the query from.
     * @returns {Array} An array containing the subset of Nodes from the root
     *     node that this phase should even consider to try to process.
     */

    var query,
        queriedNodes;

    //  According to DOM Level 3 XPath, we can't use DocumentFragments as the
    //  context node for evaluating an XPath expression.
    if (!TP.isNode(aNode) || TP.isFragment(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    query = './/processing-instruction(\'tibet-stylesheet\')';

    queriedNodes = TP.nodeEvaluateXPath(aNode, query, TP.NODESET);

    return queriedNodes;
});

//  ========================================================================
//  TP.core.PrecompilePhase
//  ========================================================================

/**
 * @type {TP.core.PrecompilePhase}
 */

//  ------------------------------------------------------------------------

TP.core.TagProcessorPhase.defineSubtype('core.PrecompilePhase');

//  ------------------------------------------------------------------------

TP.core.PrecompilePhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagPrecompile';
});

//  ========================================================================
//  TP.core.CompilePhase
//  ========================================================================

/**
 * @type {TP.core.CompilePhase}
 */

//  ------------------------------------------------------------------------

TP.core.TagProcessorPhase.defineSubtype('core.CompilePhase');

//  ------------------------------------------------------------------------

TP.core.CompilePhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagCompile';
});

//  ------------------------------------------------------------------------

TP.core.CompilePhase.Inst.defineMethod('queryForNodes',
function(aNode) {

    /**
     * @method queryForNodes
     * @summary Given the supplied node, this method queries it using a query
     *     very specific to this phase.
     * @description This method should produce the sparsest result set possible
     *     for consideration by the next phase of the tag processing engine,
     *     which is to then filter this set by whether a) a TIBET wrapper type
     *     can be found for each result and b) whether that wrapper type can
     *     respond to this phase's target method.
     * @param {Node} aNode The root node to start the query from.
     * @returns {Array} An array containing the subset of Nodes from the root
     *     node that this phase should even consider to try to process.
     */

    var queriedNodes;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  We're only interested in Element-type Nodes.
    queriedNodes = TP.nodeGetElementsByTagName(aNode, '*');
    queriedNodes.unshift(aNode);

    return queriedNodes;
});

//  ========================================================================
//  TP.core.TidyPhase
//  ========================================================================

/**
 * @type {TP.core.TidyPhase}
 */

//  ------------------------------------------------------------------------

TP.core.TagProcessorPhase.defineSubtype('core.TidyPhase');

//  ------------------------------------------------------------------------

TP.core.TidyPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagTidy';
});

//  ------------------------------------------------------------------------

TP.core.TidyPhase.Inst.defineMethod('queryForNodes',
function(aNode) {

    /**
     * @method queryForNodes
     * @summary Given the supplied node, this method queries it using a query
     *     very specific to this phase.
     * @description This method should produce the sparsest result set possible
     *     for consideration by the next phase of the tag processing engine,
     *     which is to then filter this set by whether a) a TIBET wrapper type
     *     can be found for each result and b) whether that wrapper type can
     *     respond to this phase's target method.
     * @param {Node} aNode The root node to start the query from.
     * @returns {Array} An array containing the subset of Nodes from the root
     *     node that this phase should even consider to try to process.
     */

    var queriedNodes;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  We're only interested in Element-type Nodes.
    queriedNodes = TP.nodeGetElementsByTagName(aNode, '*');

    return queriedNodes;
});

//  ========================================================================
//  TP.core.UnmarshalPhase
//  ========================================================================

/**
 * @type {TP.core.UnmarshalPhase}
 */

//  ------------------------------------------------------------------------

TP.core.TagProcessorPhase.defineSubtype('core.UnmarshalPhase');

//  ------------------------------------------------------------------------

TP.core.UnmarshalPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagUnmarshal';
});

//  ------------------------------------------------------------------------

TP.core.UnmarshalPhase.Inst.defineMethod('queryForNodes',
function(aNode) {

    /**
     * @method queryForNodes
     * @summary Given the supplied node, this method queries it using a query
     *     very specific to this phase.
     * @description This method should produce the sparsest result set possible
     *     for consideration by the next phase of the tag processing engine,
     *     which is to then filter this set by whether a) a TIBET wrapper type
     *     can be found for each result and b) whether that wrapper type can
     *     respond to this phase's target method.
     * @param {Node} aNode The root node to start the query from.
     * @returns {Array} An array containing the subset of Nodes from the root
     *     node that this phase should even consider to try to process.
     */

    var queriedNodes;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  We're only interested in Element-type Nodes.
    queriedNodes = TP.nodeGetElementsByTagName(aNode, '*');

    return queriedNodes;
});

//  ========================================================================
//  TP.core.LocalizePhase
//  ========================================================================

/**
 * @type {TP.core.LocalizePhase}
 */

//  ------------------------------------------------------------------------

TP.core.TagProcessorPhase.defineSubtype('core.LocalizePhase');

//  ------------------------------------------------------------------------

TP.core.LocalizePhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagLocalize';
});

//  ========================================================================
//  TP.core.MutationPhase
//  ========================================================================

/**
 * @type {TP.core.MutationPhase}
 */

//  ------------------------------------------------------------------------

TP.core.TagProcessorPhase.defineSubtype('core.MutationPhase');

TP.core.MutationPhase.isAbstract(true);

//  ========================================================================
//  TP.core.AttachDOMPhase
//  ========================================================================

/**
 * @type {TP.core.AttachDOMPhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.AttachDOMPhase');

//  ------------------------------------------------------------------------

TP.core.AttachDOMPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagAttachDOM';
});

//  ========================================================================
//  TP.core.AttachEventsPhase
//  ========================================================================

/**
 * @type {TP.core.AttachEventsPhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.AttachEventsPhase');

//  ------------------------------------------------------------------------

TP.core.AttachEventsPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagAttachEvents';
});

//  ------------------------------------------------------------------------

TP.core.AttachEventsPhase.Inst.defineMethod('queryForNodes',
function(aNode) {

    /**
     * @method queryForNodes
     * @summary Given the supplied node, this method queries it using a query
     *     very specific to this phase.
     * @description This method should produce the sparsest result set possible
     *     for consideration by the next phase of the tag processing engine,
     *     which is to then filter this set by whether a) a TIBET wrapper type
     *     can be found for each result and b) whether that wrapper type can
     *     respond to this phase's target method.
     * @param {Node} aNode The root node to start the query from.
     * @returns {Array} An array containing the subset of Nodes from the root
     *     node that this phase should even consider to try to process.
     */

    var query,
        queriedNodes;

    //  According to DOM Level 3 XPath, we can't use DocumentFragments as the
    //  context node for evaluating an XPath expression.
    if (!TP.isNode(aNode) || TP.isFragment(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  We're only interested in elements that either are in the 'ev:' namespace
    //  or have attributes in the 'ev:' namespace
    query = 'descendant-or-self::*' +
            '[' +
            'namespace-uri() = "' + TP.w3.Xmlns.XML_EVENTS + '"' +
            ' or ' +
            '@*[namespace-uri() = "' + TP.w3.Xmlns.XML_EVENTS + '"]' +
            ']';

    queriedNodes = TP.nodeEvaluateXPath(aNode, query, TP.NODESET);

    return queriedNodes;
});

//  ========================================================================
//  TP.core.AttachDataPhase
//  ========================================================================

/**
 * @type {TP.core.AttachDataPhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.AttachDataPhase');

//  ------------------------------------------------------------------------

TP.core.AttachDataPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagAttachData';
});

//  ========================================================================
//  TP.core.AttachInfoPhase
//  ========================================================================

/**
 * @type {TP.core.AttachInfoPhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.AttachInfoPhase');

//  ------------------------------------------------------------------------

TP.core.AttachInfoPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagAttachInfo';
});

//  ------------------------------------------------------------------------

TP.core.AttachInfoPhase.Inst.defineMethod('queryForNodes',
function(aNode) {

    /**
     * @method queryForNodes
     * @summary Given the supplied node, this method queries it using a query
     *     very specific to this phase.
     * @description This method should produce the sparsest result set possible
     *     for consideration by the next phase of the tag processing engine,
     *     which is to then filter this set by whether a) a TIBET wrapper type
     *     can be found for each result and b) whether that wrapper type can
     *     respond to this phase's target method.
     * @param {Node} aNode The root node to start the query from.
     * @returns {Array} An array containing the subset of Nodes from the root
     *     node that this phase should even consider to try to process.
     */

    var query,
        queriedNodes;

    //  According to DOM Level 3 XPath, we can't use DocumentFragments as the
    //  context node for evaluating an XPath expression.
    if (!TP.isNode(aNode) || TP.isFragment(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  We're only interested in elements that have a local name of 'info'.
    query = 'descendant-or-self::*[local-name() = "info"]';

    queriedNodes = TP.nodeEvaluateXPath(aNode, query, TP.NODESET);

    return queriedNodes;
});

//  ========================================================================
//  TP.core.AttachBindsPhase
//  ========================================================================

/**
 * @type {TP.core.AttachBindsPhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.AttachBindsPhase');

//  ------------------------------------------------------------------------

TP.core.AttachBindsPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagAttachBinds';
});

//  ------------------------------------------------------------------------

TP.core.AttachBindsPhase.Inst.defineMethod('queryForNodes',
function(aNode) {

    /**
     * @method queryForNodes
     * @summary Given the supplied node, this method queries it using a query
     *     very specific to this phase.
     * @description This method should produce the sparsest result set possible
     *     for consideration by the next phase of the tag processing engine,
     *     which is to then filter this set by whether a) a TIBET wrapper type
     *     can be found for each result and b) whether that wrapper type can
     *     respond to this phase's target method.
     * @param {Node} aNode The root node to start the query from.
     * @returns {Array} An array containing the subset of Nodes from the root
     *     node that this phase should even consider to try to process.
     */

    var query,
        queriedNodes;

    //  According to DOM Level 3 XPath, we can't use DocumentFragments as the
    //  context node for evaluating an XPath expression.
    if (!TP.isNode(aNode) || TP.isFragment(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  We're only interested in elements that either are in the 'bind:'
    //  namespace or have attributes in the 'bind:' namespace (or have the
    //  '[[...]]' sugar).
    query = 'descendant-or-self::*' +
            '[' +
            'namespace-uri() = "' + TP.w3.Xmlns.BIND + '"' +
            ' or ' +
            '@*[namespace-uri() = "' + TP.w3.Xmlns.BIND + '"]' +
            ' or ' +
            '@*[contains(., "[[")]' +
            ']';

    queriedNodes = TP.nodeEvaluateXPath(aNode, query, TP.NODESET);

    return queriedNodes;
});

//  ========================================================================
//  TP.core.AttachStylePhase
//  ========================================================================

/**
 * @type {TP.core.AttachStylePhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.AttachStylePhase');

//  ------------------------------------------------------------------------

TP.core.AttachStylePhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagAttachStyle';
});

//  ========================================================================
//  TP.core.DetachDOMPhase
//  ========================================================================

/**
 * @type {TP.core.DetachDOMPhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.DetachDOMPhase');

//  ------------------------------------------------------------------------

TP.core.DetachDOMPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagDetachDOM';
});

//  ========================================================================
//  TP.core.DetachEventsPhase
//  ========================================================================

/**
 * @type {TP.core.DetachEventsPhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.DetachEventsPhase');

//  ------------------------------------------------------------------------

TP.core.DetachEventsPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagDetachEvents';
});

//  ------------------------------------------------------------------------

TP.core.DetachEventsPhase.Inst.defineMethod('queryForNodes',
function(aNode) {

    /**
     * @method queryForNodes
     * @summary Given the supplied node, this method queries it using a query
     *     very specific to this phase.
     * @description This method should produce the sparsest result set possible
     *     for consideration by the next phase of the tag processing engine,
     *     which is to then filter this set by whether a) a TIBET wrapper type
     *     can be found for each result and b) whether that wrapper type can
     *     respond to this phase's target method.
     * @param {Node} aNode The root node to start the query from.
     * @returns {Array} An array containing the subset of Nodes from the root
     *     node that this phase should even consider to try to process.
     */

    var query,
        queriedNodes;

    //  According to DOM Level 3 XPath, we can't use DocumentFragments as the
    //  context node for evaluating an XPath expression.
    if (!TP.isNode(aNode) || TP.isFragment(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  We're only interested in elements that either are in the 'ev:' namespace
    //  or have attributes in the 'ev:' namespace
    query = 'descendant-or-self::*' +
            '[' +
            'namespace-uri() = "' + TP.w3.Xmlns.XML_EVENTS + '"' +
            ' or ' +
            '@*[namespace-uri() = "' + TP.w3.Xmlns.XML_EVENTS + '"]' +
            ']';

    queriedNodes = TP.nodeEvaluateXPath(aNode, query, TP.NODESET);

    return queriedNodes;
});

//  ========================================================================
//  TP.core.DetachDataPhase
//  ========================================================================

/**
 * @type {TP.core.DetachDataPhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.DetachDataPhase');

//  ------------------------------------------------------------------------

TP.core.DetachDataPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagDetachData';
});

//  ========================================================================
//  TP.core.DetachInfoPhase
//  ========================================================================

/**
 * @type {TP.core.DetachInfoPhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.DetachInfoPhase');

//  ------------------------------------------------------------------------

TP.core.DetachInfoPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagDetachInfo';
});

//  ------------------------------------------------------------------------

TP.core.DetachInfoPhase.Inst.defineMethod('queryForNodes',
function(aNode) {

    /**
     * @method queryForNodes
     * @summary Given the supplied node, this method queries it using a query
     *     very specific to this phase.
     * @description This method should produce the sparsest result set possible
     *     for consideration by the next phase of the tag processing engine,
     *     which is to then filter this set by whether a) a TIBET wrapper type
     *     can be found for each result and b) whether that wrapper type can
     *     respond to this phase's target method.
     * @param {Node} aNode The root node to start the query from.
     * @returns {Array} An array containing the subset of Nodes from the root
     *     node that this phase should even consider to try to process.
     */

    var query,
        queriedNodes;

    //  According to DOM Level 3 XPath, we can't use DocumentFragments as the
    //  context node for evaluating an XPath expression.
    if (!TP.isNode(aNode) || TP.isFragment(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  We're only interested in elements that have a local name of 'info'.
    query = 'descendant-or-self::*[local-name() = "info"]';

    queriedNodes = TP.nodeEvaluateXPath(aNode, query, TP.NODESET);

    return queriedNodes;
});

//  ========================================================================
//  TP.core.DetachBindsPhase
//  ========================================================================

/**
 * @type {TP.core.DetachBindsPhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.DetachBindsPhase');

//  ------------------------------------------------------------------------

TP.core.DetachBindsPhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagDetachBinds';
});

//  ------------------------------------------------------------------------

TP.core.DetachBindsPhase.Inst.defineMethod('queryForNodes',
function(aNode) {

    /**
     * @method queryForNodes
     * @summary Given the supplied node, this method queries it using a query
     *     very specific to this phase.
     * @description This method should produce the sparsest result set possible
     *     for consideration by the next phase of the tag processing engine,
     *     which is to then filter this set by whether a) a TIBET wrapper type
     *     can be found for each result and b) whether that wrapper type can
     *     respond to this phase's target method.
     * @param {Node} aNode The root node to start the query from.
     * @returns {Array} An array containing the subset of Nodes from the root
     *     node that this phase should even consider to try to process.
     */

    var query,
        queriedNodes;

    //  According to DOM Level 3 XPath, we can't use DocumentFragments as the
    //  context node for evaluating an XPath expression.
    if (!TP.isNode(aNode) || TP.isFragment(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  We're only interested in elements that either are in the 'bind:'
    //  namespace or have attributes in the 'bind:' namespace
    query = 'descendant-or-self::*' +
            '[' +
            'namespace-uri() = "' + TP.w3.Xmlns.BIND + '"' +
            ' or ' +
            '@*[namespace-uri() = "' + TP.w3.Xmlns.BIND + '"]' +
            ' or ' +
            '@*[starts-with(., "[[")]' +
            ']';

    queriedNodes = TP.nodeEvaluateXPath(aNode, query, TP.NODESET);

    return queriedNodes;
});

//  ========================================================================
//  TP.core.DetachStylePhase
//  ========================================================================

/**
 * @type {TP.core.DetachStylePhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.DetachStylePhase');

//  ------------------------------------------------------------------------

TP.core.DetachStylePhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagDetachStyle';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
