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

/**
 * Flag signifying whether the path.lib_vcards data has been loaded.
 * @type {Boolean}
 */
TP.vcard_temp.vCard.Type.defineAttribute('loaded', false);

/**
 * The dictionary of registered vcards.
 * @type {TP.core.Hash}
 */
TP.vcard_temp.vCard.Type.defineAttribute('vcards', TP.hc());

/**
 * The default Guest vCard, which has no permission keys by default.
 * @type {Element}
 */
TP.vcard_temp.vCard.Type.defineConstant('DEFAULT',
    TP.elementFromString(TP.join(
        '<vCard>',
            '<VERSION>1.1</VERSION>',
            '<FN>', TP.sys.cfg('user.default_name'), '</FN>',
            '<N>', TP.sys.cfg('user.default_name'), '</N>',
            '<ROLE>', TP.sys.cfg('user.default_role'), '</ROLE>',
            '<ORG>',
                '<ORGNAME>', TP.sys.cfg('user.default_org'), '</ORGNAME>',
                '<ORGUNIT>', TP.sys.cfg('user.default_unit'), '</ORGUNIT>',
            '</ORG>',
        '</vCard>')));


//  ------------------------------------------------------------------------
//  Types Methods
//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Type.defineMethod('getInstanceById',
function(anID) {

    /**
     * @method getInstanceById
     * @summary Returns the vCard instance whose FN value matches the ID
     *     provided. If the ID matches that of the user.default_name value and
     *     the vCard isn't found a default version will be created.
     * @returns {vcard_temp.vCard} A vCard element wrapper.
     */

    var path,
        fname,
        url,
        node,
        vcards,
        inst;

    if (!TP.vcard_temp.vCard.get('loaded')) {
        path = TP.sys.cfg('path.lib_vcards');
        if (TP.notEmpty(path)) {
            try {
                fname = TP.uriExpandPath(TP.sys.cfg('path.lib_vcards'));
                if (TP.isURI(url = TP.uc(fname))) {
                    //  NOTE: We do *not* use 'url.getNativeNode()' here
                    //  since it causes a recursion when it tries to
                    //  instantiate a TP.core.RESTService which then tries
                    //  to configure itself from a vCard which then leads us
                    //  back here...
                    //  Note that this is a *synchronous* load.
                    node = TP.$fileLoad(url.getLocation(), TP.hc('resultType', TP.DOM));
                    if (TP.isDocument(node)) {
                        TP.vcard_temp.vCard.initVCards(node);
                    }
                }
            } catch (e) {
                TP.ifError() ? TP.error(TP.ec(e, 'Error loading vCards.')) : 0;
            }
        }
        TP.vcard_temp.vCard.$set('loaded', true);
    }

    //  NOTE the access to the top-level type here, not 'this'.
    vcards = TP.vcard_temp.vCard.get('vcards');

    inst = vcards.at(anID);
    if (TP.isValid(inst)) {
        return inst;
    }

    //  Due to startup sequencing we may need to create the default instance on
    //  demand. Role/Unit initializers trigger a call to this method.
    if (anID === TP.sys.cfg('user.default_name')) {
        inst = this.construct(this.DEFAULT);
    }

    return inst;
});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Type.defineMethod('initVCards',
function(aDocument) {

    /**
     * @method initVCards
     * @summary Initializes instances of vCard based on vCard elements found
     *     in the document provided. This method is usually invoked after a call
     *     to loadVCards to acquire a vCard-containing document.
     * @param {Document} aDocument A TIBET vCards document. See the
     *     documentation on TIBET vCard files for more information.
     * @return {Array.<TP.vcard_temp.vCard>} An array of vCard instances.
     */

    var vcards,
        type,
        list;

    if (!TP.isDocument(aDocument)) {
        return this.raise('InvalidDocument', aDocument);
    }

    type = TP.vcard_temp.vCard;

    vcards = TP.nodeEvaluateXPath(aDocument, '//$def:vCard', TP.NODESET);
    list = vcards.collect(function(elem) {
        return type.construct(elem);
    });

    return list;
});

//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Type.defineMethod('loadVCards',
function(aURI) {

    /**
     * @method loadVCards
     * @summary Loads vCard data from the URI provided, or from the default
     *     vcard path if one is defined. The resulting document can then be
     *     passed to initVCards() which will construct instances for each of
     *     the vCard elements found in the document.
     * @return {TP.sig.Response} A TIBET Response object (which is
     *     Promise-compatible) which will resolve on completion.
     */

    var url,
        fname;

    if (TP.notValid(aURI)) {
        //  If we don't have a viable setting for application vcards we don't
        //  have a path configured and should just return quietly.
        url = TP.sys.cfg('path.app_vcards');
        if (TP.isEmpty(url)) {
            return;
        }
    }

    //  If we got a URI or path of some kind it's time to validate it and create
    //  the URI instance needed to perform the data load.
    if (!TP.isKindOf(url, TP.core.URI)) {
        fname = TP.uriExpandPath(url);
        if (!TP.isURI(url = TP.uc(fname))) {
            return this.raise('InvalidURI', aURI);
        }
    }

    return url.getResource(TP.hc('resultType', TP.DOM));
});

//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Type.defineMethod('registerVCard',
function(aVCard) {

    /**
     * @method registerVCard
     * @summary Registers a single vCard with the vCard type. This method is
     *     invoked automatically during vcard instance creation so you don't
     *     normally need to call it yourself.
     * @param {TP.vcard_temp.vCard} aVCard The vcard instance to register.
     * @return {TP.vcard_temp.vCard} The registered vcard instance.
     */

    var id,
        keys;

    if (!TP.canInvoke(aVCard, 'get')) {
        return this.raise('InvalidVCard', aVCard);
    }

    id = aVCard.get('fullname');
    if (TP.isEmpty(id)) {
        return this.raise('InvalidVCard', aVCard);
    }

    //  NOTE the access to the top-level type here, not 'this'.
    keys = TP.vcard_temp.vCard.get('vcards');
    keys.atPut(id, aVCard);

    return aVCard;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.vcard_temp.vCard.Inst.defineAttribute(
        'version',
        {value: TP.xpc('./$def:VERSION',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.vcard_temp.vCard.Inst.defineAttribute(
        'fullname',
        {value: TP.xpc('./$def:FN',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.vcard_temp.vCard.Inst.defineAttribute(
        'shortname',
        {value: TP.xpc('./$def:N',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.vcard_temp.vCard.Inst.defineAttribute(
        'jid',
        {value: TP.xpc('./$def:JABBERID',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.vcard_temp.vCard.Inst.defineAttribute(
        'url',
        {value: TP.xpc('./$def:URL',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.vcard_temp.vCard.Inst.defineAttribute(
        'role',
        {value: TP.xpc('./$def:ROLE',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.vcard_temp.vCard.Inst.defineAttribute(
        'orgname',
        {value: TP.xpc('./$def:ORG/$def:ORGNAME',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.vcard_temp.vCard.Inst.defineAttribute(
        'orgunit',
        {value: TP.xpc('./$def:ORG/$def:ORGUNIT',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.vcard_temp.vCard.Inst.defineAttribute(
        'key',
        {value: TP.xpc('./$def:KEY',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.vcard_temp.vCard.Inst.defineAttribute(
        'secretkey',
        {value: TP.xpc('./$def:X-SECRET-KEY',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.vcard_temp.vCard.Inst.defineAttribute(
        'username',
        {value: TP.xpc('./$def:X-USERNAME',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.vcard_temp.vCard.Inst.defineAttribute(
        'password',
        {value: TP.xpc('./$def:X-PASSWORD',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.vcard_temp.vCard.Inst.defineAttribute(
        'auth',
        {value: TP.xpc('./$def:X-AUTH',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

TP.vcard_temp.vCard.Inst.defineAttribute(
        'iswebdav',
        {value: TP.xpc('./$def:X-IS-WEBDAV',
                        TP.hc('shouldCollapse', true,
                                'extractWith', 'value'))
        });

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Inst.defineMethod('init',
function(aVCard) {

    /**
     * @method  init
     * @summary Creates a new vCard instance from the input data provided.
     *     Note that if the inbound vCard has an FN matching one already
     *     registered the new vcard will override the existing one.
     * @param {Element} aVCard The vCard element to wrap in an instance.
     * @return {TP.vcard_temp.vCard} The newly created vCard instance.
     */

    this.callNextMethod();

    //  Must have an ID to be a viable instance.
    if (TP.isEmpty(this.get('fullname'))) {
        return this.raise('InvalidVCard', aVCard);
    }

    TP.vcard_temp.vCard.registerVCard(this);

    return this;
});

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
 *     represent individual permissions within an application. Obviously this
 *     isn't a security feature, it's designed more with allowing easy CSS
 *     and functionality switching based on user role assignments, helping to
 *     ease development of applications that have role-specific UI features.
 *     Data security is presumed to be managed at the server as appropriate.
 * @description To help manage permissions in the most flexible way possible
 *     TIBET uses the concept of keys, strings you define to have some meaning
 *     relative to permissions in your application. These keys can be grouped
 *     within keyrings, which can be nested to keep things easier to maintain.
 *
 *     After a user logs in you can supply a vCard which defines the user's
 *     organization-qualified role and unit affiliations. The role and unit
 *     definitions found in the vCard provide one or more keyrings to their
 *     associated user(s), granting members their permissions. The permission
 *     strings are added to TIBET's UICANVAS body element for help in driving
 *     CSS rules which alter UI based on a user's particular role/unit.
 *
 *     See the keyrings.xml sample file for specific markup examples.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('tibet:keyring');

//  ------------------------------------------------------------------------
//  Types Attributes
//  ------------------------------------------------------------------------

/**
 * The dictionary of registered keyrings.
 * @type {TP.core.Hash}
 */
TP.tibet.keyring.Type.defineAttribute('keyrings', TP.hc());

/**
 * Flag signifying whether the path.lib_keyrings data has been loaded.
 * @type {Boolean}
 */
TP.tibet.keyring.Type.defineAttribute('loaded', false);

/**
 * The default Public keyring, which has no permission keys by default.
 * @type {Element}
 */
TP.tibet.keyring.Type.defineConstant('DEFAULT',
TP.elementFromString(TP.join(
    '<keyring xmlns="http://www.technicalpursuit.com/1999/tibet" id="',
    TP.sys.cfg('user.default_keyring'),
    '"></keyring>')));

//  ------------------------------------------------------------------------
//  Types Methods
//  ------------------------------------------------------------------------

TP.tibet.keyring.Type.defineMethod('getInstanceById',
function(anID) {

    /**
     * @method getInstanceById
     * @summary Returns the keyring instance whose id attribute matches the ID
     *     provided. If the ID matches that of the user.default_keys value and
     *     the keyring isn't found a default version will be created.
     * @returns {tibet:keyring} A keyring element wrapper.
     */

    var path,
        fname,
        url,
        node,
        keyrings,
        inst;

    if (!TP.tibet.keyring.get('loaded')) {
        path = TP.sys.cfg('path.lib_keyrings');
        if (TP.notEmpty(path)) {
            try {
                fname = TP.uriExpandPath(TP.sys.cfg('path.lib_keyrings'));
                if (TP.isURI(url = TP.uc(fname))) {
                    //  NOTE: We do *not* use 'url.getNativeNode()' here
                    //  since it causes a recursion when it tries to
                    //  instantiate a TP.core.RESTService which then tries
                    //  to configure itself from a vCard which then leads us
                    //  back here...
                    //  Note that this is a *synchronous* load.
                    node = TP.$fileLoad(url.getLocation(), TP.hc('resultType', TP.DOM));
                    if (TP.isDocument(node)) {
                        TP.tibet.keyring.initKeyrings(node);
                    }
                }
            } catch (e) {
                TP.ifError() ? TP.error(TP.ec(e, 'Error loading keyrings.')) : 0;
            }
        }
        TP.tibet.keyring.$set('loaded', true);
    }

    //  NOTE the access to the top-level type here, not 'this'.
    keyrings = TP.tibet.keyring.get('keyrings');

    inst = keyrings.at(anID);
    if (TP.isValid(inst)) {
        return inst;
    }

    //  Due to startup sequencing we may need to create the default instance on
    //  demand. Role/Unit initializers trigger a call to this method.
    if (anID === TP.sys.cfg('user.default_keyring')) {
        inst = this.construct(this.DEFAULT);
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.tibet.keyring.Type.defineMethod('initKeyrings',
function(aDocument) {

    /**
     * @method initKeyrings
     * @summary Initializes instances of keyring based on keyring elements found
     *     in the document provided. This method is usually invoked after a call
     *     to loadKeyrings to acquire a keyrings document.
     * @param {Document} aDocument A TIBET keyrings document. See the
     *     documentation on TIBET Keyring files for more information.
     * @return {Array.<TP.tibet.keyring>} An array of keyring instances created.
     */

    var keyrings,
        type,
        list;

    if (!TP.isDocument(aDocument)) {
        return this.raise('InvalidDocument', aDocument);
    }

    type = TP.tibet.keyring;

    keyrings = TP.nodeEvaluateXPath(aDocument, '//$def:keyring', TP.NODESET);
    list = keyrings.collect(function(elem) {
        if (TP.isEmpty(TP.elementGetAttribute(elem, 'id'))) {
            return;
        }
        return type.construct(elem);
    });

    return list.compact();
});

//  ------------------------------------------------------------------------

TP.tibet.keyring.Type.defineMethod('loadKeyrings',
function(aURI) {

    /**
     * @method loadKeyrings
     * @summary Loads keyring data from the URI provided, or from the default
     *     keyring path if one is defined. The resulting document can then be
     *     passed to initKeyrings() which will construct instances for each of
     *     the keyring elements found in the document.
     * @return {TP.sig.Response} A TIBET Response object (which is
     *     Promise-compatible) which will resolve on completion.
     */

    var url,
        fname;

    if (TP.notValid(aURI)) {
        //  If we don't have a viable setting for application keyrings we don't
        //  have a path configured and should just return quietly.
        url = TP.sys.cfg('path.app_keyrings');
        if (TP.isEmpty(url)) {
            return;
        }
    }

    //  If we got a URI or path of some kind it's time to validate it and create
    //  the URI instance needed to perform the data load.
    if (!TP.isKindOf(url, TP.core.URI)) {
        fname = TP.uriExpandPath(url);
        if (!TP.isURI(url = TP.uc(fname))) {
            return this.raise('InvalidURI', aURI);
        }
    }

    return url.getResource(TP.hc('resultType', TP.DOM));
});

//  ------------------------------------------------------------------------

TP.tibet.keyring.Type.defineMethod('registerKeyring',
function(aKeyring) {

    /**
     * @method registerKeyring
     * @summary Registers a single keyring with the keyring type. This method is
     *     invoked automatically during keyring instance creation so you don't
     *     normally need to call it yourself.
     * @param {TP.tibet.keyring} aKeyring The keyring instance to register.
     * @return {TP.tibet.keyring} The registered keyring instance.
     */

    var id,
        keys;

    if (!TP.canInvoke(aKeyring, 'getID')) {
        return this.raise('InvalidKeyring', aKeyring);
    }

    id = aKeyring.getID();
    if (TP.isEmpty(id)) {
        //  Might be a ref to another one (which we ignore).
        if (TP.isEmpty(aKeyring.getNativeNode().getAttribute('ref'))) {
            return this.raise('InvalidKeyring', aKeyring);
        } else {
            return;
        }
    }

    //  NOTE the access to the top-level type here, not 'this'.
    keys = TP.tibet.keyring.get('keyrings');
    keys.atPut(id, aKeyring);

    return aKeyring;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.keyring.Inst.defineMethod('init',
function(aKeyring) {

    /**
     * @method  init
     * @summary Creates a new keyring instance from the input data provided.
     *     Note that if the inbound keyring has an ID matching one already
     *     registered the new keyring will override the existing one.
     * @param {Element} aKeyring The keyring element to wrap in an instance.
     * @return {TP.tibet.keyring} The newly created keyring instance.
     */

    this.callNextMethod();

    //  Must have an ID to be a viable instance.
    if (TP.isEmpty(this.getID())) {
        return this.raise('InvalidKeyring', aKeyring);
    }

    TP.tibet.keyring.registerKeyring(this);

    return this;
});

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

TP.tibet.keyring.Inst.defineMethod('getID',
function() {

    /**
     * @method getID
     * @summary Returns the receiver's ID, the unique keyring ID it uses.
     * @returns {String} The ID value.
     */

    return TP.elementGetAttribute(this.getNativeNode(), 'id');
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
    'TP.core.AttachStylePhase',     //  CSS is near end so display: none can
                                    //  flip late
    'TP.core.AttachCompletePhase'
    ));

//  A set of phase types used when 'detaching' content from a visual DOM
//  Note how these are reversed from the attach phases, to give things that rely
//  on these phases chance to unwind in reverse order.
TP.core.TagProcessor.Type.defineConstant(
    'DETACH_PHASES',
    TP.ac(
    'TP.core.DetachStylePhase',
    'TP.core.DetachDataPhase',
    'TP.core.DetachBindsPhase',
    'TP.core.DetachInfoPhase',
    'TP.core.DetachEventsPhase',
    'TP.core.DetachDOMPhase',
    'TP.core.DetachCompletePhase'
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

    'TP.core.ResolvePhase',         //  resolve xml:base TP.core.URI references,
                                    //  decode etc.

    'TP.core.LocalizePhase'         //  adjust for browser, lang, etc.
    ));

//  A common query used by some phases to find custom nodes - elements or
//  attributes.This query returns only nodes that are:
//      1. Element-type Nodes OR
//      2. Attribute-type Nodes that:
//          a. Have a namespace - most don't
//          b. Are not in the 'bind:' namespace
//          c. Are not in the 'ev:' namespace
TP.core.TagProcessor.Type.defineConstant(
    'CUSTOM_NODES_QUERY',
        'descendant-or-self::*' +
        ' | ' +
        '//@*[' +
        'namespace-uri() != ""' +
        ' and ' +
        'namespace-uri() != "' + TP.w3.Xmlns.XML + '"' +
        ' and ' +
        'namespace-uri() != "' + TP.w3.Xmlns.BIND + '"' +
        ' and ' +
        'namespace-uri() != "' + TP.w3.Xmlns.XML_EVENTS + '"' +
        ']');

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

    //  Allocate a TP.core.Hash to stick our tag types in as we find them -
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

        producedEntries,

        processingRequest,

        len,
        i,

        node,
        type,

        result,

        subPhases,
        subProcessor,
        subProcessingRequest,

        sources;

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

    //  Some invokers of this method will have the content in a 'processing
    //  root' element that takes into account that this engine holds onto the
    //  same node throughout the transformation process, so that's not the node
    //  that can itself be transformed. In any case, we want our 'root'
    //  parameter to be set to that root element's firstChild if it's present.
    if (TP.isElement(aNode) &&
        TP.elementGetLocalName(aNode) === 'processingroot') {
        processingRequest.atPut('root', aNode.firstChild);
    } else {
        processingRequest.atPut('root', aNode);
    }

    //  Grab the processor-wide tag type hash that is used to cache tag types.
    tagTypeDict = aProcessor.get('$tagTypeDict');

    //  Any nodes that are actually newly-produced (and returned) by running the
    //  processor over the supplied content.
    producedEntries = TP.ac();

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

        try {
            //  Do the deed, invoking the target method against the wrapper type
            //  and supplying the request.
            result = type[methodName](processingRequest);
        } catch (e) {
            TP.ifError() ?
                TP.error(TP.ec(e,
                        'Error in ' +
                        type.getTypeName() + ' for: ' + TP.str(node))) : 0;
        }

        //  If we got a node we need to inspect that node and compare to result
        //  to determine the right action to take.
        if (TP.isNode(result)) {

            //  To reduce markup clutter, try to propagate namespaces as high
            //  up as possible.
            if (TP.isElement(result)) {
                TP.elementBubbleXMLNSAttributes(result);
            }

            //  Compare result. If identical or equal we essentially have an
            //  "unprocessed" variation of the original node as our result.
            if (result === node || TP.nodeEqualsNode(result, node)) {

                //  If the node had a generator and it's not the same as the one
                //  for our result node we've got outstanding work to do due to
                //  the generator change, otherwise we're done here.
                if (TP.isValid(node[TP.GENERATOR]) &&
                    node[TP.GENERATOR] !== result[TP.GENERATOR]) {
                    void 0;
                } else {
                    //  If we were to reprocess here the likely result is an
                    //  endless recursion since we got back matching content the
                    //  first time through.
                    continue;
                }
            } else {
                //  We got back "processed" content, but that may have child
                //  content that includes unprocessed custom tags as part of
                //  either a template or tagCompile that generates new tags.

                //  If we got back a result node of the same concrete type as
                //  the original then we only want to process children,
                //  otherwise we want to process new tag type.
                if (TP.core.Node.getConcreteType(result) === type) {
                    //  The tricky part is we don't want to reprocess the top
                    //  node since it's already had it's change to alter itself,
                    //  we only want to descend if necessary.
                    result = TP.nodeGetChildElements(result);
                    if (result.getSize() === 0) {
                        continue;
                    } else {
                        //  have children that need additional processing so we
                        //  have to fall through and continue processing phases.
                        void 0;
                    }
                } else {
                    void 0;
                }
            }
        }

        //  If either a singular Node or Array of Nodes was returned, then push
        //  them onto our list of 'produced nodes', along with the node that
        //  produced it/them.
        if (TP.isNode(result)) {
            producedEntries.push(TP.ac(result, node));
        } else if (TP.isArray(result)) {
            /* eslint-disable no-loop-func */
            result.forEach(
                    function(resultNode) {
                        producedEntries.push(TP.ac(resultNode, node));
                    });
            /* eslint-enable no-loop-func */
        }
    }

    //  If the list of nodes that executing this phase against the various
    //  target content Nodes is not empty, then we need to process them *from
    //  the processor's first phase up through ourself* (so as to have
    //  consistent results).
    if (TP.notEmpty(producedEntries)) {
        //  Grab the processor's phase list and slice a copy of it from the
        //  beginning to this phase (inclusive)
        subPhases = aProcessor.get('phases');

        subPhases = subPhases.slice(0, subPhases.indexOf(this) + 1);

        //  Configure a new processor with that phase list
        subProcessor = TP.core.TagProcessor.construct();
        subProcessor.set('phases', subPhases);

        subProcessingRequest = TP.request(aRequest);

        //  The 'sources' Array provides processing sub nodes with a reference
        //  back to the node that produced them
        if (!TP.isArray(sources = subProcessingRequest.at('sources'))) {
            sources = TP.ac();
            subProcessingRequest.atPut('sources', sources);
        }

        //  Run the subprocessor on the produced nodes, thereby recursively
        //  processing the tree.
        len = producedEntries.getSize();
        for (i = 0; i < len; i++) {

            //  Push the node that produced the node we're going to process into
            //  the sources Array. See above to see how producedEntries is
            //  populated.
            sources.push(producedEntries.at(i).last());

            subProcessor.processTree(producedEntries.at(i).first(),
                                        subProcessingRequest);

            //  Pop the source that was in effect.
            sources.pop();
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
    query = 'descendant-or-self::node()';

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

    query = './/processing-instruction()[name()="tibet-stylesheet"]';

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

//  ------------------------------------------------------------------------

TP.core.PrecompilePhase.Inst.defineMethod('queryForNodes',
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

    //  NB: The attribute portion of this query does *not* pick attributes in
    //  the TP.w3.Xmlns.UI namespace - they might contain runtime formatting
    //  instructions (i.e. 'ui:display', etc.)
    queriedNodes = TP.nodeEvaluateXPath(
    aNode,
    './/@*[contains(.,"{{") and namespace-uri() != "' + TP.w3.Xmlns.UI + '"]' +
    ' | ' +
    './/text()[contains(.,"{{")]',
    TP.NODESET);

    return queriedNodes;
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

    return '$tagCompileAndRegister';
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

    var query,
        queriedNodes;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  See the type constants for a description of this query.
    query = TP.core.TagProcessor.CUSTOM_NODES_QUERY;

    queriedNodes = TP.nodeEvaluateXPath(aNode, query, TP.NODESET);

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
//  TP.core.ResolvePhase
//  ========================================================================

/**
 * @type {TP.core.ResolvePhase}
 */

//  ------------------------------------------------------------------------

TP.core.TagProcessorPhase.defineSubtype('core.ResolvePhase');

//  ------------------------------------------------------------------------

TP.core.ResolvePhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagResolve';
});

//  ------------------------------------------------------------------------

TP.core.ResolvePhase.Inst.defineMethod('queryForNodes',
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

//  ------------------------------------------------------------------------

TP.core.AttachDOMPhase.Inst.defineMethod('queryForNodes',
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

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  See the type constants for a description of this query.
    query = TP.core.TagProcessor.CUSTOM_NODES_QUERY;

    queriedNodes = TP.nodeEvaluateXPath(aNode, query, TP.NODESET);

    return queriedNodes;
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

    //  We're only interested in:
    //      - elements that are in the 'bind:' namespace
    //      - elements that have attributes in the 'bind:' namespace (or have
    //          the '[[...]]' sugar)
    //      - text nodes with [[...]] as their content (or part of their
    //          content)
    query = 'descendant-or-self::*' +
            '[' +
            'namespace-uri() = "' + TP.w3.Xmlns.BIND + '"' +
            ' or ' +
            '@*[namespace-uri() = "' + TP.w3.Xmlns.BIND + '"]' +
            ' or ' +
            '@*[contains(., "[[")]' +
            ']' +
            ' | ' +
            './/text()[contains(., "[[")]';

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
//  TP.core.AttachCompletePhase
//  ========================================================================

/**
 * @type {TP.core.AttachCompletePhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.AttachCompletePhase');

//  ------------------------------------------------------------------------

TP.core.AttachCompletePhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagAttachComplete';
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

//  ========================================================================
//  TP.core.DetachCompletePhase
//  ========================================================================

/**
 * @type {TP.core.DetachCompletePhase}
 */

//  ------------------------------------------------------------------------

TP.core.MutationPhase.defineSubtype('core.DetachCompletePhase');

//  ------------------------------------------------------------------------

TP.core.DetachCompletePhase.Inst.defineMethod('getTargetMethod',
function() {

    /**
     * @method getTargetMethod
     * @summary Returns the method that a target of this tag processor phase
     *     (usually a TIBET wrapper type for a node) needs to implement in order
     *     for this phase to consider that part of content in its processing.
     * @returns {String} The name of the method this phase will use to message
     *     the target content.
     */

    return 'tagDetachComplete';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
