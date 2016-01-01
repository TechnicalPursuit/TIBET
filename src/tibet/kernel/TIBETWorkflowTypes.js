//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/*
 * Types specific to workflow in terms of requests, resources, and their
 * responses. The types here, particularly TP.core.Request, TP.core.Service,
 * and TP.core.Response provide the foundation of TIBET's "service layer".
 *
 * Also included here are TIBET's Controller and Application types along with
 * helpers for things like History etc.
 */

//  ========================================================================
//  TP.core.Triggered
//  ========================================================================

TP.lang.Object.defineSubtype('TP.core.Triggered');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.core.Triggered.isAbstract(true);

//  the combination of origins/signals defining the triggers we observe.
//  note that the defaults are declared at the type level but each instance
//  can alter these as it chooses
TP.core.Triggered.Type.defineAttribute('triggerOrigins');
TP.core.Triggered.Type.defineAttribute('triggerSignals');

//  ------------------------------------------------------------------------
//  Instance Definition
//  ------------------------------------------------------------------------

//  these default to the values installed on the type, but can be altered
//  at the instance level
TP.core.Triggered.Inst.defineAttribute('triggerOrigins');
TP.core.Triggered.Inst.defineAttribute('triggerSignals');

//  ------------------------------------------------------------------------

TP.core.Triggered.Inst.defineMethod('addTrigger',
function(trigger) {

    /**
     * @method addTrigger
     * @summary Stores one or more trigger definitions in the receiver's list
     *     of triggers. The trigger should be a string containing a signal name
     *     and optional origin separated by a '#'.
     * @param {Object} trigger The trigger signal, string, or other object.
     * @return {TP.core.Triggered} The receiver.
     */

    var signals,
        origins,
        signal,
        origin,
        parts;

    if (/#/.test(trigger)) {
        parts = trigger.split('#');
        origin = parts.first();
        signal = parts.last();
    } else {
        signal = trigger;
    }

    if (TP.notValid(signals = this.$get('triggerSignals'))) {
        signals = this.getType().get('triggerSignals');
        if (TP.notEmpty(signals)) {
            signals = TP.ac().concat(signals);
        } else {
            signals = TP.ac();
            this.$set('triggerSignals', signals);
        }
    }
    signals.push(signal);

    if (TP.isEmpty(origin)) {
        return;
    }

    if (TP.notValid(origins = this.$get('triggerOrigins'))) {
        origins = this.getType().get('triggerOrigins');
        if (TP.notEmpty(origins)) {
            origins = TP.ac().concat(origins);
        } else {
            origins = TP.ac();
            this.$set('triggerOrigins', origins);
        }
    }
    origin.push(origin);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Triggered.Inst.defineMethod('getTriggerOrigins',
function() {

    /**
     * @method getTriggerOrigins
     * @summary Returns one or more origins for the TIBET signaling system
     *     which should cause the receiver to respond to requests.
     * @description The trigger origins are typically null meaning any origin is
     *     valid and responsiveness depends on the signal type. You can override
     *     this for specific types or instances of those types.
     * @returns {Object[]} An array of trigger origins.
     */

    var origins;

    if (TP.notValid(origins = this.$get('triggerOrigins'))) {
        return this.getType().get('triggerOrigins');
    }

    return origins;
});

//  ------------------------------------------------------------------------

TP.core.Triggered.Inst.defineMethod('getTriggerSignals',
function() {

    /**
     * @method getTriggerSignals
     * @summary Returns one or more trigger signals for the TIBET signaling
     *     system which should cause the receiver to respond to triggers.
     * @returns {String[]} An array of trigger signal names.
     */

    var signals;

    if (TP.notValid(signals = this.$get('triggerSignals'))) {
        return this.getType().get('triggerSignals');
    }

    return signals;
});

//  ------------------------------------------------------------------------

TP.core.Triggered.Inst.defineMethod('ignoreTriggers',
function() {

    /**
     * @method ignoreTriggers
     * @summary Turns off registration (ignores) the receivers triggers.
     * @returns {TP.core.Triggered} The receiver.
     */

    var origins,
        signals,

        i,
        j;

    origins = this.get('triggerOrigins') || TP.ANY;
    signals = this.get('triggerSignals') || 'TP.sig.Request';

    if (TP.isArray(origins)) {
        for (i = 0; i < origins.getSize(); i++) {
            if (TP.isArray(signals)) {
                for (j = 0; j < signals.getSize(); j++) {
                    this.ignore(origins.at(i), signals.at(j));
                }
            } else {
                this.ignore(origins.at(i), signals);
            }
        }
    } else {
        if (TP.isArray(signals)) {
            for (j = 0; j < signals.getSize(); j++) {
                this.ignore(origins, signals.at(j));
            }
        } else {
            this.ignore(origins, signals);
        }
    }

    return this;
});


//  ------------------------------------------------------------------------

TP.core.Triggered.Inst.defineMethod('observeTriggers',
function() {

    /**
     * @method observeTriggers
     * @summary Tells the receiver to observe its trigger signals so it can
     *     begin to respond to them.
     * @returns {TP.core.Triggered} The receiver.
     */

    var origins,
        signals,

        i,
        j;

    origins = this.get('triggerOrigins') || TP.ANY;
    signals = this.get('triggerSignals');

    //  Need at least one triggering signal to proceed.
    if (TP.isEmpty(signals)) {
        return;
    }

    if (TP.isArray(origins)) {
        for (i = 0; i < origins.getSize(); i++) {
            if (TP.isArray(signals)) {
                for (j = 0; j < signals.getSize(); j++) {
                    this.observe(origins.at(i), signals.at(j));
                }
            } else {
                this.observe(origins.at(i), signals);
            }
        }
    } else {
        if (TP.isArray(signals)) {
            for (j = 0; j < signals.getSize(); j++) {
                this.observe(origins, signals.at(j));
            }
        } else {
            this.observe(origins, signals);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Triggered.Inst.defineMethod('setTriggerOrigins',
function(origins) {

    /**
     * @method setTriggerOrigins
     * @summary Defines the array of origins the receiver should observe.
     * @param {Object[]} origins The array of origins, either objects or strings
     *     which should be observed.
     * @return {TP.core.Triggered} The receiver.
     */

    if (!TP.isArray(origins)) {
        return this.raise('InvalidParameter', 'Origins should be an array.');
    }

    this.$set('triggerOrigins', origins);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Triggered.Inst.defineMethod('setTriggerSignals',
function(signals) {

    /**
     * @method setTriggerSignals
     * @summary Defines the array of signals the receiver should observe.
     * @param {Object[]} signals The array of signals, either objects or strings
     *     which should be observed.
     * @return {TP.core.Triggered} The receiver.
     */

    if (!TP.isArray(signals)) {
        return this.raise('InvalidParameter', 'Signals should be an array.');
    }

    this.$set('triggerSignals', signals);

    return this;
});

//  ========================================================================
//  TP.core.Resource
//  ========================================================================

/**
 * @type {TP.core.Resource}
 * @summary Root type for TIBET resources.
 * @description In a strict workflow sense resources are elements which can
 *     perform tasks. Using that definition, specific resource types would
 *     include people and machines. In TIBET we model people as 'users' (note
 *     that each person may well have more than one login/username they use). We
 *     model machines as a collection of services. Each of these resources
 *     (TP.core.User or TP.core.Service) has the ability to respond to requests
 *     of various types and, in fact, there are times when they can stand in for
 *     each other.
 *
 *     To integrate the concept/requirement for permission-based resource
 *     allocation TIBET assigns TP.core.Role and TP.core.Unit objects to users
 *     and services, providing them with both permissions via the role and unit
 *     keyrings, and functionality through the various methods implemented on
 *     those roles and units.
 *
 *     When a resource is asked to handle a request it will first look locally
 *     for a viable method, but it will then defer to its roles and units (in
 *     that order) to see if there's a viable handler. This allows you to
 *     organize functionality around roles and units and then associate it with
 *     the current user via that user's assigned roles and units.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Resource');

//  add sync and async mode support along with necessary constants.
TP.core.Resource.addTraits(TP.core.SyncAsync);
TP.core.Resource.addTraits(TP.core.Triggered);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  keep a hash of all resource instances, by ID. this helps to ensure
//  we only construct one of each resource ID.
TP.core.Resource.Type.defineAttribute('instances', TP.hc());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Resource.Type.defineMethod('addResource',
function(aResource) {

    /**
     * @method addResource
     * @summary Adds a new resource instance to the global resource hash.
     * @param {TP.core.Resource} aResource The resource to add.
     */

    if (TP.notValid(aResource)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (this.getResourceById(aResource.get('resourceID'))) {
        return this.raise('TP.sig.NonUniqueID');
    }

    return this.get('instances').atPut(
                                aResource.get('resourceID'), aResource);
});

//  ------------------------------------------------------------------------

TP.core.Resource.Type.defineMethod('construct',
function(resourceID) {

    /**
     * @method construct
     * @summary Constructs a new instance of the receiver. If the resourceID
     *     provided is a duplicate an exception is thrown.
     * @param {TP.core.Resource} resourceID The resource ID for the new resource
     *     being constructed.
     * @exception TP.sig.NonUniqueID
     */

    var inst;

    //  no id means no resource instance
    if (TP.notValid(resourceID)) {
        return this.raise('TP.sig.InvalidResourceID');
    }

    if (TP.isValid(inst = TP.core.Resource.getResourceById(resourceID))) {
        return inst;
    }

    //  id looks unique? go ahead and process the request normally.
    inst = this.callNextMethod();

    //  note that this may actually be invoked multiple times, but only
    //  during the construct process itself so we still avoid ever putting a
    //  duplicate resource in
    if (TP.isValid(inst)) {
        this.get('instances').atPut(resourceID, inst);
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Type.defineMethod('getResourceById',
function(anID) {

    /**
     * @method getResourceById
     * @summary Returns the resource instance with the given ID.
     * @param {String} anID The resource ID to look up.
     * @returns {TP.core.Resource}
     */

    return this.get('instances').at(anID);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  has the resource registered for requests yet? registration isn't
//  strictly required except for signal-based invocation
TP.core.Resource.Inst.defineAttribute('registered', false);

//  Current access keys, which are essentially cached from the current vCard
//  and updated if the vCard data for the resource is altered.
TP.core.Resource.Inst.defineAttribute('accessKeys');

//  the current vCard associated with this resource, and indirectly the
//  resulting role and unit types
TP.core.Resource.Inst.defineAttribute('vCard');

//  Resource parameters that have default values. These are checked during
//  parameter population.
TP.core.Resource.Type.defineAttribute('defaultedParameters');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('init',
function(resourceID) {

    /**
     * @method init
     * @summary Initializes a new instance of the receiver.
     * @param {String} resourceID A unique TIBET identifier. By unique we mean
     *     an ID which will not conflict with any other ID registered using
     *     TIBET's object registration methods.
     * @exception TP.sig.InvalidResourceID
     * @returns {TP.core.Resource} A new instance.
     */

    //  construct the instance from the root down
    this.callNextMethod();

    //  our public name is our resource ID
    this.setID(resourceID);

    //  try to locate a matching vcard

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('acceptRequest',
function(aRequest) {

    /**
     * @method acceptRequest
     * @summary Does the work necessary to ensure that the receiver and the
     *     request are properly associated via responder links etc.
     * @param {TP.sig.Request} aRequest The request to accept.
     * @returns {TP.core.Resource} The receiver.
     */

    //  make sure the request can get back to us as the resource which
    //  responded to the request
    aRequest.set('responder', this);

    //  set the request's status code so we keep observers informed
    aRequest.isActive(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('getAccessKeys',
function() {

    /**
     * @method getAccessKeys
     * @summary Returns the receiver's permission keys, based on any vCard that
     *     may have been assigned.
     * @returns {TP.core.Hash} The receiver's permission keys.
     */

    var keys,
        vcard;

    keys = this.$get('accessKeys');
    if (TP.isValid(keys)) {
        return keys;
    }

    if (TP.isValid(vcard = this.getVCard())) {
        keys = vcard.getAccessKeys();
    } else {
        keys = TP.ac();
    }

    this.$set('accessKeys', keys);

    return keys;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('getPrimaryRole',
function() {

    /**
     * @method getPrimaryRole
     * @summary Returns the primary role, the first role in the receiver's
     *     vCard, if any.
     * @description Note the ordering here. Unlike unit assignments which
     *     typically go from least specific to most specific the presumption
     *     here is that the user's roles are defined in order from most-specific
     *     to least-specific (or at least to "least important") so the first
     *     role is considered to be the primary role.
     * @returns {TP.core.Role} A subtype of TP.core.Role.
     */

    var vcard;

    if (TP.isValid(vcard = this.getVCard())) {
        return vcard.getRoles().first();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('getPrimaryUnit',
function() {

    /**
     * @method getPrimaryUnit
     * @summary Returns the primary unit, the _last_ unit in the receiver's
     *     vCard, if any.
     * @description Note the subtle distinction here. Units are normally defined
     *     in hierarchy order, so the first unit is actually the least specific
     *     one. For that reason we return the last unit in line as the primary
     *     (most-specific) unit.
     * @returns {TP.core.Unit} A subtype of TP.core.Unit.
     */

    var vcard;

    if (TP.isValid(vcard = this.getVCard())) {
        return vcard.getUnits().last();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('getResourceID',
function() {

    /**
     * @method getResourceID
     * @summary Returns the unique resource identifier for the receiver.
     * @returns {String}
     */

    return this.getID();
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('getRoles',
function() {

    /**
     * @method getRoles
     * @summary Returns the list of roles in the receiver's vCard, if any.
     * @returns {Array.<TP.core.Role>} An array of TP.core.Role instances.
     */

    var vcard;

    if (TP.isValid(vcard = this.getVCard())) {
        return vcard.getRoles();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('getUnits',
function() {

    /**
     * @method getUnits
     * @summary Returns the list of units in the receiver's vCard, if any.
     * @returns {Array.<TP.core.Unit>} An array of TP.core.Unit instances.
     */

    var vcard;

    if (TP.isValid(vcard = this.getVCard())) {
        return vcard.getUnits().last();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('getVCard',
function() {

    /**
     * @method getVCard
     * @summary Returns the receiver's vCard, if one has been set.
     * @returns {TP.vcard_temp.vCard} A TIBET vCard wrapper element.
     */

    return this.$get('vCard');
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('handle',
function(aSignal) {

    /**
     * @method handle
     * @summary Handles notification of an incoming signal.
     * @description For TP.core.Resources this method provides the same lookup
     *     semantics as a normal TIBET object, but checks specifically for
     *     TP.sig.Request and TP.sig.Response objects to keep things moving as
     *     quickly as possible with respect to processing requests and
     *     responses.
     * @param {TP.sig.Signal} aSignal The specific signal to handle.
     * @returns {Object} The handler function's results.
     */

    var request,
        handler;

    //  not a request, defer to standard lookup semantics
    if (!TP.isKindOf(aSignal, 'TP.sig.Request')) {
        return this.callNextMethod();
    }

    request = aSignal;

    //  if the request is already being worked by another responder then we
    //  don't want to work on it twice
    if (request.isActive() || request.isCompleted()) {
        return;
    }

    //  if we can't handle the request let it go by and hope another
    //  resource picks it up and handles it
    if (!this.isAvailable(request)) {
        return;
    }

    //  look up a handler, forcing lookup to find only handlers that
    //  properly match custom signal name overrides
    handler = this.getBestHandler(
        request,
        {
            startSignal: null,
            dontTraverseSpoofs: true
        });

    if (TP.isCallable(handler)) {
        try {
            this.acceptRequest(request);

            return handler.apply(this, arguments);
        } catch (e) {
            TP.ifError() ?
                TP.error(TP.ec(e, 'Error in handler: ' + TP.str(handler))) : 0;

            return;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineHandler('Request',
function(aRequest) {

    /**
     * @method handleRequest
     * @summary Default request-type handling method. Intended to be overridden
     *     in specific resource subtypes, or to have a more specific handler
     *     catching requests before they reach this default handler.
     * @description When a handle call is received the search for a handler
     *     proceeds through the type hierarchy of the request and terminates at
     *     handleRequest. This implementation raises a MissingOverride
     *     Exception.
     * @param {TP.sig.Request} aRequest The request to be serviced.
     * @returns {TP.sig.Response}
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('hasAccessKey',
function(aKey) {

    /**
     * @method hasAccessKey
     * @summary Returns true if the receiver has the access key provided by
     *     virtue of their current vCard assignment.
     * @param {String} aKey The access key to check for.
     * @returns {Boolean} True if the receiver's vCard data includes the key
     *     provided.
     */

    return this.getAccessKeys().contains(aKey);
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('isAvailable',
function(aRequest) {

    /**
     * @method isAvailable
     * @summary Returns true if the receiver is available to service the
     *     request provided.
     * @param {TP.sig.Request} aRequest The request to be serviced.
     * @returns {Boolean}
     */

    var sync;

    sync = aRequest.isSynchronous(this);

    if (sync && this.getType().isAsyncOnly()) {
        return false;
    }

    if (!sync && this.getType().isSyncOnly()) {
        return false;
    }

    //  check whether we a) are the specified target, b) are runnable based
    //  on any prerequisite requirements etc.
    return this.isTargeted(aRequest) && this.isEnabled(aRequest);
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('isEnabled',
function(aRequest) {

    /**
     * @method isEnabled
     * @summary Returns a boolean defining whether the receiver is runnable. If
     *     the receiver has prerequisites this would be where testing for them
     *     would be appropriate.
     * @param {TP.sig.Request} aRequest The request to be serviced.
     * @returns {Boolean}
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('isRegistered',
function(aFlag) {

    /**
     * @method isRegistered
     * @summary Returns a boolean defining whether the receiver has registered
     *     to observe its triggers. Resources only need to register if they are
     *     going to be triggered by signals rather than by direct invocation.
     * @param {Boolean} aFlag A new value for this property. Optional.
     * @returns {Boolean}
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('registered', aFlag);
    }

    return this.$get('registered');
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('isTargeted',
function(aRequest) {

    /**
     * @method isTargeted
     * @summary Returns a boolean defining whether the receiver matches the
     *     target resourceID of the request. Not all requests target a specific
     *     ID and if they don't this call will return true.
     * @param {TP.sig.Request} aRequest The request to be serviced.
     * @returns {Boolean}
     */

    var resID;

    //  requests can target a specific resource ID. if this one does and we
    //  don't match that ID then return 'no'.
    if (TP.isValid(resID = aRequest.get('resourceID'))) {
        if (this.get('resourceID') !== resID) {
            return false;
        }
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('populateMissingVCardData',
function(aParamInfo, aRequest) {

    /**
     * @method populateMissingVCardData
     * @summary Populates any missing parameters in the request from the
     *     receiver's vCard.
     * @description This method uses the information in the supplied 'parameter
     *     info' to perform this process. This hash has the following format:
     *
     *     TP.hc('<name_of_param>', TP.ac('<vCard_name>', <prompt_message>'));
     *
     *
     * @param {TP.core.Hash} aParamInfo A parameter info hash that contains
     *     information on how to populate the request from the vCard.
     * @param {TP.sig.Request} aRequest The request to populate.
     * @returns {TP.core.Resource} The receiver.
     */

    var sourceCard,
        defaults,

        currentUser,
        credentials,
        resourceID,

        saveCredentials;

    if (TP.notValid(sourceCard = this.get('vCard')) &&
        TP.notValid(aParamInfo)) {
        return this;
    }

    defaults = TP.ifInvalid(this.getType().get('defaultedParameters'),
                            TP.hc());

    //  Grab our current user - we may need it later
    currentUser = TP.sys.getEffectiveUser();

    //  Our resource ID is our ID
    resourceID = this.getID();

    //  Initially, we don't need to save any credentials
    saveCredentials = false;

    //  Loop over the param info.
    aParamInfo.perform(
        function(kvPair) {

            var paramName,

                vcardPropName,
                promptText,
                isRequired,

                paramValue;

            //  The name of the parameter to populate on the request will be the
            //  key of the parameter info entry.
            paramName = kvPair.first();

            //  If that parameter is not also defined on the request, go ahead
            //  and try to populate it.
            if (TP.notValid(aRequest.at(paramName))) {
                //  First, we check to see if it is in our list of 'defaulted
                //  parameters'. If so, use that value.
                if (TP.notEmpty(paramValue = defaults.at(paramName))) {
                    aRequest.atPut(paramName, paramValue);

                    return;
                }

                //  The vCard property name is in the first position of the
                //  value Array
                vcardPropName = kvPair.last().at(0);

                //  The text to prompt the user with is in the second position
                //  of the value Array
                promptText = kvPair.last().at(1);

                isRequired = kvPair.last().at(2);

                //  If an entry was found on the vCard, use it as the value.
                if (TP.isValid(sourceCard) &&
                    TP.notEmpty(paramValue = sourceCard.get(vcardPropName))) {
                    //  If the parameter value is '{USER}', then the user object
                    //  should be queried for credentials matching this resource
                    //  and the value looked for there.
                    if (paramValue === '{USER}') {
                        //  Ask the user for credentials for ourself (as the
                        //  resource)
                        credentials = currentUser.getCredentialsFor(resourceID);

                        //  If there is no value for the property we're looking
                        //  for in the credentials, then prompt the user for it,
                        //  put that value in the credentials and make sure that
                        //  we flip the 'saveCredentials' flag to true.
                        if (TP.isEmpty(paramValue = credentials.at(
                                        vcardPropName))) {
                            if (TP.isEmpty(paramValue =
                                            TP.prompt(promptText))) {
                                paramValue = TP.isFalse(isRequired) ?
                                                TP.NULL : null;
                            }

                            credentials.atPut(vcardPropName, paramValue);
                            saveCredentials = true;
                        }
                    } else if (paramValue === '{PROMPT}') {
                        //  Otherwise, if the parameter value is '{PROMPT}',
                        //  then we prompt the user for it but *DO NOT* store it
                        //  in the credentials database.
                        paramValue = TP.prompt(promptText);
                    }
                } else {
                    //  Otherwise, ask the user for credentials for ourself (as
                    //  the resource)
                    credentials = currentUser.getCredentialsFor(resourceID);

                    //  If there is no value for the property we're looking for
                    //  in the credentials, then prompt the user for it, put
                    //  that value in the credentials and make sure that we flip
                    //  the 'saveCredentials' flag to true.
                    if (TP.isEmpty(paramValue =
                                    credentials.at(vcardPropName))) {
                        if (TP.isEmpty(paramValue =
                                        TP.prompt(promptText))) {
                            paramValue = TP.isFalse(isRequired) ?
                                            TP.NULL : null;
                        }

                        credentials.atPut(vcardPropName, paramValue);
                        saveCredentials = true;
                    }
                }
            }

            if (TP.isValid(paramValue)) {
                aRequest.atPut(paramName, paramValue);
            }
        });

    //  We must've modified the credential store above - tell the user object to
    //  save them to the credentials store.
    if (saveCredentials) {
        currentUser.saveCredentials();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('register',
function() {

    /**
     * @method register
     * @summary Registers the receiver and observes its trigger signals so that
     *     requests will cause activation of the service.
     * @returns {TP.core.Resource} The receiver.
     */

    TP.sys.registerObject(this);

    this.observeTriggers();

    this.isRegistered(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('setVCard',
function(aVCard) {

    /**
     * @method setVCard
     * @summary Sets the VCard description for the resource.
     * @param {TP.vcard_temp.vCard} aVCard The vCard description for the
     *     resource.
     * @returns {TP.core.Resource} The receiver.
     */

    this.$set('vCard', aVCard);

    //  Clear the access key cache. It will be refreshed if the getAccessKeys
    //  call is made again.
    this.$set('accessKeys', null);

    //  altering the vCard may alter role and unit which affect uri filters
    TP.sys.setcfg('tibet.uriprofile', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('unregister',
function() {

    /**
     * @method unregister
     * @summary Turns off registration (ignores) the receivers triggers.
     * @returns {TP.core.Resource} The receiver.
     */

    TP.sys.unregisterObject(this);

    this.ignoreTriggers();

    this.isRegistered(false);

    return this;
});

//  ========================================================================
//  TP.sig.WorkflowSignal
//  ========================================================================

/**
 * @type {TP.sig.WorkflowSignal}
 * @summary Top level workflow signal type.
 * @description The TP.sig.WorkflowSignal type is a root signal type for
 *     workflow request/response signal types such as TP.sig.Request and
 *     TP.sig.Response.
 */

//  ------------------------------------------------------------------------

TP.sig.Signal.defineSubtype('WorkflowSignal');

//  add job status behavior to the receiver so we can track progress. this
//  adds methods such as fail, complete, etc.
TP.sig.WorkflowSignal.addTraits(TP.core.JobStatus);

TP.sig.WorkflowSignal.Type.resolveTrait('getSignalName', TP.sig.Signal);

TP.sig.WorkflowSignal.Inst.resolveTrait('resume', TP.core.JobStatus);

TP.sig.WorkflowSignal.Inst.resolveTraits(
        TP.ac('asDumpString', 'asHTMLString', 'asJSONSource', 'asPrettyString',
                'asRecursionString', 'asSource', 'asString', 'asXMLString',
                'at', 'atPut', 'copy', 'getProperty', 'getSignalName', 'init',
                'isRecyclable', 'recycle', 'removeKey'),
        TP.sig.Signal);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.WorkflowSignal.Type.defineAttribute('defaultPolicy',
                                            TP.INHERITANCE_FIRING);

//  Turn off notification of WorkflowSignal and subtypes through controllers.
TP.sig.WorkflowSignal.Type.isControllerRoot(true);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.WorkflowSignal.Inst.defineMethod('fire',
function(anOrigin, aPayload, aPolicy) {

    /**
     * @method fire
     * @summary Fires the signal so that registered observers are notified.
     * @description For TP.sig.WorkflowSignals and their subtypes the firing
     *     policy is TP.INHERITANCE_FIRING meaning that observers of any form of
     *     TP.sig.WorkflowSignal are notified. Also, the origin is typically the
     *     request ID for the signal's associated request so that "processes"
     *     can be constructed using the request ID as the common reference.
     * @param {Object} anOrigin An optional firing origin for this activation.
     *     Defaults to the receiver's request ID.
     * @param {Object} aPayload Optional arguments.
     * @param {Function} aPolicy A firing policy. The default is INHERITANCE.
     * @returns {TP.sig.WorkflowSignal} The receiver.
     */

    var origin,
        policy;

    //  NOTE that we don't want to callNextMethod in this implementation
    //  since it will actually signal...and we need to control that
    //  ourselves here

    //  allow refiring. initial handling will turn off propagation so we
    //  need to re-enable it to reuse the signal
    this.stopPropagation(false);

    //  also, we don't want to preventDefault unless told to do so
    //  explicitly by one of our handlers
    this.preventDefault(false);

    //  workflow signals always use a request ID as their origin so that
    //  they can tie together "processes" which are embodied as signal
    //  chains related to an originating request, unless explicitly altered
    origin = TP.ifInvalid(anOrigin, this.getRequestID());
    this.setOrigin(origin);

    //  workflow signals are fired using an inheritance-based signal model
    //  unless specifically told otherwise
    policy = TP.ifInvalid(aPolicy, this.getType().getDefaultPolicy());

    //  instrument with current firing time
    this.$set('time', Date.now());

    //  fire using the firing origin (defaults to this) so we target better
    TP.signal(origin, this, aPayload, policy);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.WorkflowSignal.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the receiving signal's value, typically the 'result'
     *     data from either then request and/or response.
     * @returns {Object}
     */

    return this.get('result');
});

//  ========================================================================
//  TP.sig.Request
//  ========================================================================

/**
 * @type {TP.sig.Request}
 * @summary TIBET's main workflow request signal type. This type most closely
 *     relates to a 'work item' in a formal workflow model by binding a 'case'
 *     (the payload/args data) to a task (a set of one or more steps for
 *     processing a case -- i.e. the handler logic of the responding resource
 *     and the request type itself.
 * @description In workflow systems the binding between a particular 'case' and
 *     a particular 'task' is a 'work item'. In TIBET the tasks can be thought
 *     of as the specific handlers implemented by resource objects while the
 *     'case' is represented by the data contained within request signals, also
 *     known as the request's payload.
 *
 *     Creating a TP.sig.Request is therefore analogous to creating a work item
 *     which must then be allocated to a resource for processing.
 *
 *     TIBET's allocation scheme isn't as formal as most workflow systems.
 *     Instead TIBET uses a combination of subscription via observe and
 *     presence/acceptance (via isAvailable) to push work to the various
 *     resources which might be able to respond.
 *
 *     The TP.sig.Request signal type provides support for making and tracking
 *     a particular request throughout its lifecycle. All information about the
 *     request, the responder, and the response reside with this object.
 *
 *     When a request's response is being prepared by the lower-level
 *     services/resources the various TP.core.JobStatus methods fail, cancel,
 *     and complete are used to finalize the request and signal that it is
 *     complete (regardless of its success/failure state).
 */

//  ------------------------------------------------------------------------

TP.sig.WorkflowSignal.defineSubtype('Request');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  this type's response type, the type that will be created in response to
//  a getResponse message. this is typically redefined in subtypes so
//  that custom response manipulation logic can be implemented efficiently
TP.sig.Request.Type.defineAttribute('responseType', 'TP.sig.Response');

//  a template for the request, normally empty but subtypes can prebuild
//  reusable payload templates if desired
TP.sig.Request.Type.defineAttribute('requestTemplate');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.definePrimitive('request',
function(varargs) {

    /**
     * @method request
     * @summary Constructs a standard TP.sig.Request populated differently
     *     depending on the nature of the argument list.
     * @description When no arguments are given this is a synonym for
     *     TP.sig.Request.construct(), when a single argument is given if it's a
     *     TP.sig.Signal of any kind then the signal's payload becomes the
     *     request's payload, otherwise the object itself becomes the request
     *     payload. When multiple arguments are given they are passed to TP.hc()
     *     and the resulting hash becomes the request's payload.
     * @param {Object} varargs One or more objects to place in the request. The
     *     format is similar to that used by TP.hc() with alternating keys and
     *     values.
     * @returns {TP.sig.Request} A request whose payload is a hash containing
     *     the parameter values provided.
     */

    switch (arguments.length) {
        case 0:
            return TP.sig.Request.construct();

        case 1:
            if (TP.isKindOf(varargs, 'TP.sig.Request')) {
                return varargs;
            } else if (TP.canInvoke(varargs, 'getPayload')) {
                return TP.sig.Request.construct(varargs.getPayload());
            } else {
                return TP.sig.Request.construct(varargs);
            }
            break;

        default:
            return TP.sig.Request.construct(TP.hc.apply(null, arguments));
    }
});

//  ------------------------------------------------------------------------

TP.sig.Request.Type.defineMethod('isSynchronous',
function() {

    /**
     * @method isSynchronous
     * @summary Returns true if the instances of the receiver can support
     *     synchronous operation. This method is called from the instance-level
     *     'isSynchronous' method if a mode cannot be determined from the
     *     request instance or from the resource it is being fired against.
     * @returns {Boolean}
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Type.defineMethod('shouldLog',
function() {

    /**
     * @method shouldLog
     * @summary Returns whether or not this request should be logged. The
     *     default at this level is to return whether TIBET is logging request
     *     signals in general.
     * @returns {Boolean} Whether or not this signal will be logged.
     */

    return TP.sys.shouldLogRequestSignals();
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  NOTE: the request parameters themselves are contained in the payload

//  when using "targeted" requests this will hold the ID of the resource
//  being requested. If present, a resourceID should refer to a registered
//  TP.core.Resource such as a named TP.core.Service. Normally this is empty
//  so that the request can be handled by any resource instance that's
//  capable and available for processing
TP.sig.Request.Inst.defineAttribute('resourceID');

//  the 'who' in the request. this is the object that is responsible for
//  creating the request in the first place, but is an optional value. When
//  a request is complete its requestor is notified if that object isn't the
//  rqeuest itself
TP.sig.Request.Inst.defineAttribute('requestor');

//  the object/resource which ultimately responds to the request. this is
//  typically a TP.core.Resource of some type, usually a TP.core.Service
//  instance.
TP.sig.Request.Inst.defineAttribute('responder');

//  the associated response object for this request, typically a subtype of
//  TP.sig.Response, which may have had its response name configured to help
//  differentiate handler dispatch
TP.sig.Request.Inst.defineAttribute('response');

//  the specific signal name to use when signaling a response is ready.
//  used to differentiate responses without having to create custom response
//  types or when communicating to the resource or low-level service which
//  "callback channel" to use
TP.sig.Request.Inst.defineAttribute('responseName');

//  the status code, used to define current state of the request.
//  NOTE NOTE NOTE that we define this attribute only on TP.sig.Request, not
//  on TP.sig.WorkflowSignal so that TP.sig.Response instances defer to
//  their request.
TP.sig.Request.Inst.defineAttribute('statusCode', TP.READY);

//  the fault/failure code, used to provide information on a request failure
//  NOTE NOTE NOTE that we define this attribute only on TP.sig.Request, not
//  on TP.sig.WorkflowSignal so that TP.sig.Response instances defer to
//  their request.
TP.sig.Request.Inst.defineAttribute('faultCode', null);

//  the fault/failure message, providing a textual message about a failure.
TP.sig.Request.Inst.defineAttribute('faultText');

//  the fault/failure info, providing additional information about a failure.
TP.sig.Request.Inst.defineAttribute('faultInfo');

//  if the current signal is part of a thread of messages the threadID
//  should be set to the requestID of the initial (root) signal.
TP.sig.Request.Inst.defineAttribute('threadID');

//  optional hash of child requests used for simple workflow configurations
TP.sig.Request.Inst.defineAttribute('childJoins');

//  optional hash of parent requests used for simple workflow configurations
TP.sig.Request.Inst.defineAttribute('parentJoins');

//  optional hash of peer requests used for simple workflow configurations
TP.sig.Request.Inst.defineAttribute('peerJoins');

//  optional deferred Promise used for 'then' ('Promises/A+' compatible)
//  chaining
TP.sig.Request.Inst.defineAttribute('$deferredPromise');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('init',
function(aRequest, aResourceID, aThreadID) {

    /**
     * @method init
     * @summary Initialize a new request. Each request is composed of a request
     *     payload (usually a hash), and optional resourceID and threadID
     *     elements. The resourceID allows a request to target a particular
     *     resource while the threadID allows the request to be associated with
     *     an ongoing request/response 'conversation' between parties. When
     *     creating the instance TP.sig.Request will use any type-specific
     *     requestTemplate and merge it with any incoming request information.
     * @param {TP.core.Hash} aRequest An object containing specific request
     *     parameters which will by used by the request's responder to process
     *     the request. NOTE that this takes the same parameter slot as the root
     *     payload for TP.sig.Signal. This should be specific to the signal
     *     type.
     * @param {String} aResourceID A unique resource identifier.
     * @param {String} aThreadID A unique thread identifier.
     * @returns {TP.sig.Request} A new instance.
     */

    var request;

    //  assign the variables we can process without any extra effort
    this.$set('resourceID', aResourceID);
    this.$set('threadID', aThreadID);

    //  generate a viable request object using any template for this type
    request = this.$initTemplate(aRequest);

    //  note that we pass the 'request' up so it ends up in the payload
    //  since TP.sig.Requests are ultimately TP.sig.Signals
    //  (TP.sig.WorkflowSignals)
    return this.callNextMethod(request);
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('$initTemplate',
function(aRequest) {

    /**
     * @method $initTemplate
     * @summary Generates and returns a viable request payload from the
     *     incoming payload object and any local template for the receiver. When
     *     both a template and a request are provided the keys in the template
     *     missing in the request are merged to fill in those default values.
     * @param {TP.core.Hash} aRequest An object containing parameters for the
     *     request.
     * @param {A} TP.core.Hash viable payload object. NOTE that when no request
     *     or template exist the return value is NULL so no payload is implied
     *     for the call.
     */

    var template,
        request,
        keys,
        len,
        i,
        key;

    template = this.getType().get('requestTemplate');

    if (TP.notValid(aRequest)) {
        if (TP.isValid(template)) {
            request = template.copy();
        } else {
            request = TP.hc();
        }
    } else if (TP.isKindOf(aRequest, TP.sig.Request)) {
        request = TP.copy(aRequest.getPayload());
    } else if (TP.isKindOf(aRequest, TP.core.Hash)) {
        request = aRequest;
    } else {
        request = TP.hc(aRequest);
    }

    //  merge keys found in the template into the request, but don't
    //  overwrite existing keys
    if (TP.isValid(template)) {
        keys = TP.keys(template);
        len = keys.getSize();
        for (i = 0; i < len; i++) {
            key = keys.at(i);
            if (TP.notDefined(request.at(key))) {
                request.atPut(key, template.at(key));
            }
        }
    }

    //  map handle* "methods" in the payload into the receiver
    if (TP.canInvoke(request, TP.ac('at', 'getKeys'))) {
        keys = TP.keys(request);
        len = keys.getSize();
        for (i = 0; i < len; i++) {
            key = keys.at(i);
            if (TP.regex.HANDLER_NAME.test(key)) {
                this.defineMethod(key,
                    request.at(key),
                    null, null, true);
            }
        }
    }

    return request;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('asQueryString',
function() {

    /**
     * @method asQueryString
     * @summary Returns the receiver's "query string" content, the parameters
     *     which make up the query portion of an HTTP URI.
     * @returns {String} The query string, or an empty string.
     */

    var query;

    query = this.at('uriparams');

    return TP.isValid(query) ? query.asQueryString() : '';
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('configureSTDIO',
function(aRequest) {

    /**
     * @method configureSTDIO
     * @summary Maps STDIO functions and content from one request to another so
     *     the subrequest/peer can leverage the IO channels of the original
     *     request.
     * @param {TP.sig.Request} aRequest The object to map IO from.
     * @returns {TP.sig.Request} The receiver.
     */

    var obj;

    if (TP.isValid(aRequest)) {
        if (TP.isValid(obj = aRequest.at(TP.STDIO))) {
            this.atPut(TP.STDIO, obj);
        }

        if (TP.isValid(obj = aRequest.at(TP.STDIN))) {
            this.atPut(TP.STDIN, obj);
        }
        this.stdin = aRequest.stdin ? aRequest.stdin : this.stdin;

        if (TP.isValid(obj = aRequest.at(TP.STDOUT))) {
            this.atPut(TP.STDOUT, obj);
        }
        this.stdout = aRequest.stdout ? aRequest.stdout : this.stdout;

        if (TP.isValid(obj = aRequest.at(TP.STDERR))) {
            this.atPut(TP.STDERR, obj);
        }
        this.stderr = aRequest.stderr ? aRequest.stderr : this.stderr;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('fire',
function(anOrigin, aPayload, aPolicy) {

    /**
     * @method fire
     * @summary Fires the signal so that registered observers are notified.
     * @description For TP.sig.WorkflowSignal types the signaling origin is
     *     typically the request ID for the signal's associated request so that
     *     "processes" can be constructed using the request ID as the common
     *     reference.
     *     Note that, unlike it's supertype, this type returns it's *response*
     *     from this method.
     * @param {Object} anOrigin An optional firing origin for this activation.
     *     Defaults to the receiver's request ID.
     * @param {Object} aPayload Optional arguments.
     * @param {Function} aPolicy A firing policy. The default is INHERITANCE.
     * @returns {TP.sig.Response} The receiver's response.
     */

    //  If we're not done processing we shouldn't clear things like status,
    //  response, deferred, etc.
    if (this.isActive()) {
        return this.raise('InvalidOperation');
    }

    //  clear any response we may have from a prior execution
    this.$set('response', null);

    //  if we had a deferred it should be cleared.
    this.$set('$deferredPromise', null);

    //  clear status code back to original
    this.set('statusCode', TP.READY);

    //  clear failure/fault code/text/info back to original
    this.set('faultCode', null);
    this.set('faultText', null);
    this.set('faultInfo', null);

    this.callNextMethod();

    return this.getResponse();
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getDelegate',
function() {

    /**
     * @method getDelegate
     * @summary Returns the receiver's delegate, the object used by the
     *     TP.delegate utility function when constructing delegation methods.
     *     For TP.sig.Request this is the request's response.
     * @returns {Object} The receiver's delegation object.
     */

    return this.getResponse();
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getRequestID',
function() {

    /**
     * @method getRequestID
     * @summary Returns the request ID for this request. The request ID may be
     *     a standard OID, a URL, or whatever is appropriate for the type of
     *     request. The default is an OID. The important thing about a request
     *     ID is that they serve as origins for any response signals which are
     *     generated so they should be reasonably unique.
     * @returns {String} A request ID which can take any form.
     */

    return this.getID();
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getRequestor',
function() {

    /**
     * @method getRequestor
     * @summary Returns the receiver's requestor, the object that is configured
     *     to receive notifications of results/callbacks. The request itself is
     *     the default requestor, meaning without some explicit setter the
     *     request is called back with results when any low-level processing is
     *     complete.
     * @returns {Object} The requestor, often the TP.sig.Request itself.
     */

    var obj;

    obj = this.$get('requestor');

    //  NOTE the defaulting behavior here, we want the request to be thought
    //  of as the requestor when there isn't an explicit one
    return TP.isValid(obj) ? obj : this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getResponder',
function() {

    /**
     * @method getResponder
     * @summary Returns the object which responded to this request. Only viable
     *     after the request has been activated.
     * @returns {Object}
     */

    return this.$get('responder');
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getResponse',
function(aResult) {

    /**
     * @method getResponse
     * @summary The default method for getting a response instance for the
     *     request. This method is invoked automatically by services when
     *     building up responses to incoming requests. The returned instance is
     *     then updated with the result data and fired when ready.
     * @param {Object} aResult A result object.
     * @returns {TP.sig.Response}
     */

    var response,
        responseName;

    response = this.$get('response');

    //  don't allow a request to get more than one instance of response
    if (TP.isValid(response)) {
        if (TP.isDefined(aResult)) {
            response.set('result', aResult, null, true);
        }

        return response;
    }

    //  construct a new instance and hold on to it
    response = this.getResponseType().construct(this, aResult);
    this.$set('response', response, false);

    //  adjust the response instance built from our response type with the
    //  specific response name if they're different
    responseName = this.getResponseName();
    if (responseName !== response.getTypeName()) {
        response.setSignalName(responseName);
    }

    return response;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getResponseName',
function() {

    /**
     * @method getResponseName
     * @summary Returns the response name for this request. The response name
     *     is the signal name that should be used when signaling a response.
     *     Normally this defaults to the type name of the response type, but you
     *     can alter it when you want to fine tune handler lookup without having
     *     to create new subtypes of TP.sig.Response.
     * @returns {String} The response signal name.
     */

    var name;

    name = this.$get('responseName');

    return TP.ifEmpty(name, this.getResponseType().getName());
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getResponseType',
function() {

    /**
     * @method getResponseType
     * @summary Returns the type of response this request expects. By default
     *     this is TP.sig.Response but custom subtypes can be used to provide
     *     specific response processing.
     * @returns {TP.lang.RootObject.<TP.core.Response>} A TP.core.Response
     *     subtype type object.
     */

    var typename,
        type;

    //  value is taken from local instance backed up by the type
    typename = this.$get('responseType') ||
                this.getType().get('responseType');

    //  convert to a type if it was a string, loaded it as needed
    type = TP.sys.require(typename);

    if (TP.notValid(type)) {
        TP.ifWarn() ?
            TP.warn('Unable to locate response type: ' + typename +
                    '. Defaulting to TP.sig.Response.') : 0;

        return TP.sig.Response;
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getResult',
function() {

    /**
     * @method getResult
     * @summary Returns the request result, the object returned as a result of
     *     processing the receiver's request.
     * @returns {Object}
     */

    var response;

    response = this.get('response');
    if (TP.canInvoke(response, 'getResult')) {
        return response.getResult();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getResultNode',
function() {

    /**
     * @method getResultNode
     * @summary Returns the receiver's result in TP.core.Node form if possible.
     *     When the result isn't valid XML this method returns null.
     * @returns {Node} A valid Node instance.
     */

    var response;

    response = this.get('response');
    if (TP.canInvoke(response, 'getResultNode')) {
        return response.getResultNode();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getResultObject',
function() {

    /**
     * @method getResultObject
     * @summary Returns the receiver's result in object form.
     * @returns {Object}
     */

    var response;

    response = this.get('response');
    if (TP.canInvoke(response, 'getResultObject')) {
        return response.getResultObject();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getResultText',
function() {

    /**
     * @method getResultText
     * @summary Returns the receiver's content in text (String) form.
     * @returns {String}
     */

    var response;

    response = this.get('response');
    if (TP.canInvoke(response, 'getResultText')) {
        return response.getResultText();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('handle',
function(aSignal) {

    /**
     * @method handle
     * @summary The top-level signal hander for this type. To ensure proper
     *     response processing while allowing the default handleResponse method
     *     to be the override point we handle some response-specific
     *     housekeeping here. NOTE that it is still up to the individual
     *     response handling methods to fail, cancel, or complete the request.
     * @param {TP.sig.Signal} aSignal The signal to handle.
     * @returns {Object} The handler function's results.
     */

    var request,
        handler;

    //  not a response, defer to standard lookup semantics
    if (!TP.isKindOf(aSignal, 'TP.sig.Response')) {
        return this.callNextMethod();
    }

    //  the originating request will be the response signal's answer to
    //  getRequest. if that's not us then we shouldn't do anything
    request = aSignal.getRequest();
    if (TP.notValid(request) || request !== this) {
        return;
    }

    //  look up a handler, forcing lookup to find only handlers that
    //  properly match custom signal name overrides
    handler = this.getBestHandler(
        aSignal,
        {
            startSignal: null,
            dontTraverseSpoofs: true
        });

    if (TP.isCallable(handler)) {
        try {
            return handler.apply(this, arguments);
        } catch (e) {
            TP.ifError() ?
                TP.error(TP.ec(e, 'Error in handler: ' + TP.str(handler))) : 0;

            return;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineHandler('Response',
function(aSignal) {

    /**
     * @method handleResponse
     * @summary Generic response handling method. When using simple
     *     request/response processing it's possible to leverage the request
     *     instances themselves as responders so this method is often invoked to
     *     perform response processing.
     * @description Default response processing ensures that observation of the
     *     request/response ID are turned off, that the request is removed from
     *     any pending request queues, and that a RequestCompleted is signaled
     *     with the request's ID.
     * @param {TP.sig.Response} aSignal The TP.sig.Response instance.
     * @returns {TP.sig.Request} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('isSynchronous',
function(aResource) {

    /**
     * @method isSynchronous
     * @summary Returns true if the request specifies a synchronous response.
     * @param {TP.core.Resource} aResource The resource to check for
     *     synchronicity settings if the receiver has no explicit 'async'
     *     setting.
     * @returns {Boolean}
     */

    var async;

    //  NOTE that as a request we care about our async payload parameter
    //  rather than a specific type setting.

    if (TP.isValid(async = this.at('async'))) {
        return !TP.bc(async);
    }

    if (TP.canInvoke(aResource, 'isSynchronous')) {
        return aResource.isSynchronous();
    }

    return this.getType().isSynchronous();
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('recycle',
function() {

    /**
     * @method recycle
     * @summary Prepares the receiver for a new usage cycle.
     * @returns {Object} The receiver.
     */

    this.callNextMethod();

    //  reset job control parameters
    this.reset();

    //  clear any response we may have from a prior execution
    this.$set('response', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('setRequest',
function(aRequest) {

    /**
     * @method setRequest
     * @summary Sets the receiver's internal request hash. This is the same as
     *     setting the receiver's signal "payload" via setPayload.
     * @param {TP.core.Hash} aRequest A set of key/value pairs defining the
     *     request specifics.
     * @returns {TP.sig.Request} The receiver.
     */

    this.setPayload(aRequest);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('setRequestID',
function(aRequestID) {

    /**
     * @method setRequestID
     * @summary Sets the receiver's request ID. This effectively changes the
     *     request for purposes of most operations since requestors and
     *     responders use the request ID to correlate instances. If you are
     *     going to change this value you should do it once, prior to initiating
     *     the signal the first time. You might do this as a way of maintaining
     *     your own "well-known IDs" for requests.
     * @param {String} aRequestID A valid TIBET object ID.
     * @returns {TP.sig.Request} The receiver.
     */

    this.setID(aRequestID);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('setRequestor',
function(aRequestor) {

    /**
     * @method setRequestor
     * @summary Sets the receiver's requestor, the object that will be
     *     configured to receive notifications of results. NOTE that a null
     *     value is valid here as a way of clearing a requestor.
     * @param {Object} aRequestor The object to register for notifications.
     * @returns {TP.sig.Request} The receiver.
     */

    return this.$set('requestor', aRequestor);
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('setResponder',
function(aResource) {

    /**
     * @method setResponder
     * @summary Sets the receiver's responder, the object which is handling the
     *     request. This should be a valid TP.core.Resource, typically a
     *     TP.core.Service of some type. This is typically invoked by the
     *     responder itself when it accepts responsibility for the request.
     * @param {TP.core.Resource} aResource The receiver's responder.
     * @returns {TP.sig.Request} The receiver.
     */

    this.$set('responder', aResource, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('setResponse',
function(aResponse) {

    /**
     * @method setResponse
     * @summary Sets the associated response instance for the receiver.
     * @param {TP.sig.Response} aResponse The associated response instance.
     * @returns {TP.sig.Request} The receiver.
     */

    if (!TP.isKindOf(aResponse, 'TP.sig.Response')) {
        return this.raise('TP.sig.InvalidParameter',
                            'Must supply an instance of TP.sig.Response ' +
                            'or a suitable subtype.');
    }

    this.$set('response', aResponse);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('setResponseName',
function(aName) {

    /**
     * @method setResponseName
     * @summary Sets the receiver's response name, the name of the specific
     *     signal that should be used when signaling a response. Under normal
     *     circumstances this defaults to the receiving object type's response
     *     type name, but it can be changed to create more focused response
     *     handling scenarios that don't require construction of custom response
     *     types.
     * @param {String} aName The response name. Default is the receiving type's
     *     response type name.
     * @returns {TP.sig.Request} The receiver.
     */

    this.$set('responseName', aName, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('setResponseType',
function(aType) {

    /**
     * @method setResponseType
     * @summary Sets the receiver's response type, the type used to construct
     *     the receiver's response instance. This value is typically taken from
     *     the receiver's type, but it can be overridden for a specific request
     *     using this method.
     * @param {TP.lang.RootObject|String} aType The response type or type name.
     * @returns {TP.sig.Request} The receiver.
     */

    this.$set('responseType', aType, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('setResult',
function(aResult) {

    /**
     * @method setResult
     * @summary Defines the request's result, the object returned as a result
     *     of processing the request.
     * @param {Object} aResult The result of request processing.
     * @returns {Object}
     */

    //  calling getResponse will construct/get the response as needed
    this.getResponse(aResult);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('updateRequestMode',
function(aRequest) {

    /**
     * @method updateRequestMode
     * @summary Updates the receiver's request mode to match that of the
     *     supplied request, with particular regards to asynchronous behavior.
     * @description If the receiver is configured for synchronous operation, but
     *     the supplied request is configured for asynchronous operation, the
     *     receiver will be configured for asynchronous operation. NOTE: The
     *     reverse is *NOT* true - if the receiver is asynchronous, but the
     *     supplied request is synchronous, the receiver will be left as
     *     asynchronous.
     * @param {TP.sig.Request} aRequest The request to examine for
     *     (a)synchronous behavior.
     * @returns {TP.sig.Request} The receiver.
     */

    var async;

    //  If we're already set to be 'async=true', then we're good to go.
    if (TP.isTrue(this.at('async'))) {
        return this;
    }

    //  If the supplied request is not set to be 'async=true', then we're
    //  also good to go because it doesn't want async.
    if (TP.notTrue(async = aRequest.at('async'))) {
        return this;
    }

    //  Otherwise, we put a 'true' value in our 'async' slot.
    this.atPut('async', async);

    return this;
});

//  ------------------------------------------------------------------------
//  Simple Workflow
//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('andJoin',
function(aRequest, aState) {

    /**
     * @method andJoin
     * @summary Adds a peer request and state to the list of requests which
     *     must reach a prescribed state before the receiver will fire.
     * @description The andJoin call allows a request to wait on multiple
     *     request prerequisites before it will fire. Because most pipes should
     *     stop processing if an error occurs in an early segment the default
     *     state is TP.SUCCEEDED. A failed prerequisite request will typically
     *     not cause the receiver to "join" and hence the receiver will never
     *     fire.
     * @param {TP.sig.Request} aRequest A request instance to observe as a
     *     trigger.
     * @param {Number|String} aState A job control state or suffix such as
     *     TP.SUCCEEDED (the default) or TP.FAILED.
     * @returns {TP.sig.Request} The receiver.
     */

    var ands,
        state;

    state = TP.ifInvalid(aState, TP.SUCCEEDED);

    //  tell ourselves, the "waiting request", about our prerequisite
    ands = this.getJoins(TP.AND);
    ands.push(TP.ac(aRequest, state));

    //  tell the prerequisite about us so it can notify on state
    aRequest.$wrapupJoin(this, state);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('andJoinChild',
function(aChildRequest) {

    /**
     * @method andJoinChild
     * @summary Adds a child request to the list of requests which must
     *     complete before the receiver can complete. Note that a single failed
     *     child will cause the parent request to fail.
     * @param {TP.sig.Request} aChildRequest A request instance to observe for
     *     completion.
     * @returns {TP.sig.Request} The receiver.
     */

    var ands;

    //  tell ourselves, the "waiting request", about our child
    ands = this.getChildJoins(TP.AND);
    ands.push(aChildRequest);

    //  tell the child about us so it can notify on completion
    aChildRequest.$wrapupJoin(this, TP.COMPLETED, true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('$cancelJoin',
function(aChildRequest, aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method $cancelJoin
     * @summary Tells the receiver to cancel its join processing. This method
     *     is called internally to finalize processing for a parent request
     *     which had one or more child join requests.
     * @param {TP.sig.Request} aChildRequest A child request which cancelled.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode An optional object to set as the fault code.
     *     Usually a String or Number instance.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the cancellation.
     * @returns {TP.sig.Request} The receiver.
     */

    //  already done? don't go further
    if (this.didCancel() || this.didFail()) {
        return;
    }

    //  propagate child results upward
    this.$set('faultText', aChildRequest.getFaultText(), false);
    this.$set('faultCode', aChildRequest.getFaultCode(), false);
    this.$set('faultInfo', aChildRequest.getFaultInfo(), false);

    //  don't push empty values into the argument list or we risk creating
    //  'undefined' as one of the values inappropriately.
    switch (arguments.length) {
        case 2:
            return this.cancel(aFaultString);
        case 3:
            return this.cancel(aFaultString, aFaultCode);
        case 4:
            return this.cancel(aFaultString, aFaultCode, aFaultInfo);
        default:
            return this.cancel();
    }
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('canComplete',
function() {

    /**
     * @method canComplete
     * @summary Returns true if the receiver has no pending child joins haven't
     *     joined, meaning the receiver probably has pending asynchronous child
     *     requests and should not complete.
     * @returns {Array} The current and-joined or or-joined requests.
     */

    var joins,
        list;

    //  by checking if we're already complete we accomplish two things,
    //  first we canComplete if we already did. second we know that we
    //  don't have to iterate over our child joins individually, we just
    //  need to know if we have any.
    if (this.didComplete()) {
        return true;
    }

    joins = this.$get('childJoins');
    if (TP.isEmpty(joins)) {
        return true;
    }

    //  since we're not already complete if we have any OR children we can't
    //  complete.
    list = joins.at(TP.OR);
    if (TP.notEmpty(list)) {
        return false;
    }

    //  if all our AND children had joined we'd already be complete, but
    //  since we aren't we know at least one is still outstanding.
    list = joins.at(TP.AND);
    if (TP.notEmpty(list)) {
        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('$completeJoin',
function(aChildRequest, aResult) {

    /**
     * @method $completeJoin
     * @summary Tells the receiver to "complete" its join processing. This
     *     method is called internally to finalize processing for a parent
     *     request which had one or more child join requests.
     * @param {TP.sig.Request} aChildRequest A child request which completed.
     * @param {Object} aResult An optional result to output.
     * @returns {TP.sig.Request} The receiver.
     */

    //  already done? don't go further
    if (this.didCancel() || this.didFail()) {
        return;
    }

    //  propagate child results upward
    this.set('result', aChildRequest.getResult(), null, true);

    //  don't push an undefined into the complete call unless it's "real"
    if (arguments.length > 1) {
        return this.complete(aResult);
    }

    return this.complete();
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('$failJoin',
function(aChildRequest, aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method $failJoin
     * @summary Tells the receiver to fail its join processing. This method is
     *     called internally to finalize processing for a parent request which
     *     had one or more child join requests.
     * @param {TP.sig.Request} aChildRequest A child request which cancelled.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode An optional object to set as the fault code.
     *     Usually a String or Number instance.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.sig.Request} The receiver.
     */

    //  already done? don't go further
    if (this.didCancel() || this.didFail()) {
        return;
    }

    //  propagate child results upward
    this.$set('faultText', aChildRequest.getFaultText(), false);
    this.$set('faultCode', aChildRequest.getFaultCode(), false);
    this.$set('faultInfo', aChildRequest.getFaultInfo(), false);

    //  don't push empty values into the argument list or we risk creating
    //  'undefined' as one of the values inappropriately.
    switch (arguments.length) {
        case 2:
            return this.fail(aFaultString);
        case 3:
            return this.fail(aFaultString, aFaultCode);
        case 4:
            return this.fail(aFaultString, aFaultCode, aFaultInfo);
        default:
            return this.fail();
    }
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getChildJoins',
function(aJoinKey) {

    /**
     * @method getChildJoins
     * @summary Returns the joined requests which will be checked during join
     *     processing to see if the receiver 'hasJoined'.
     * @param {String} aJoinKey The key to look up, which should be either the
     *     TP.AND or TP.OR constant.
     * @returns {Array} The current and-joined or or-joined requests.
     */

    var joins,
        list;

    if (TP.isEmpty(aJoinKey)) {
        return this.raise('TP.sig.InvalidParameter', 'No valid join key.');
    }

    joins = this.$get('childJoins');
    if (TP.notValid(joins)) {
        joins = TP.hc();
        this.$set('childJoins', joins);
    }

    list = joins.at(aJoinKey);
    if (TP.notValid(list)) {
        list = TP.ac();
        joins.atPut(aJoinKey, list);
    }

    return list;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getDescendantJoins',
function(aJoinKey) {

    /**
     * @method getDescendantJoins
     * @summary Returns the joined requests which will be checked during join
     *     processing to see if the receiver 'hasJoined'.
     * @param {String} aJoinKey The key to look up, which should be either the
     *     TP.AND or TP.OR constant.
     * @returns {Array} The current and-joined or or-joined requests.
     */

    var childJoins,

        len,
        i,

        result;

    if (TP.isEmpty(aJoinKey)) {
        return this.raise('TP.sig.InvalidParameter', 'No valid join key.');
    }

    //  Get all of the child joins under a particular key (AND or OR)
    childJoins = this.getChildJoins(aJoinKey);
    len = childJoins.getSize();

    //  Loop over them and recursively call this method on the found child
    //  joins, concatenating them all up together into a single Array.
    result = TP.ac();
    if (TP.notEmpty(childJoins)) {
        for (i = 0; i < len; i++) {
            result = result.concat(
                        childJoins.at(i),
                        childJoins.at(i).getDescendantJoins(aJoinKey));
        }
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getJoins',
function(aJoinKey, aRequest) {

    /**
     * @method getJoins
     * @summary Returns the joined requests which will be checked during join
     *     processing to see if the receiver 'hasJoined'.
     * @param {String} aJoinKey The key to look up, which should be either the
     *     TP.AND or TP.OR constant, or a specific wrapup state code.
     * @param {TP.sig.Request} aRequest An optional request used when looking
     *     for joins specific to that request's completion.
     * @returns {Array} The current and-joined or or-joined requests.
     */

    var joins,
        list;

    if (TP.isEmpty(aJoinKey)) {
        return this.raise('TP.sig.InvalidParameter', 'No valid join key.');
    }

    joins = this.$get('peerJoins');
    if (TP.notValid(joins)) {
        joins = TP.hc();
        this.$set('peerJoins', joins);
    }

    list = joins.at(aJoinKey);
    if (TP.notValid(list)) {
        list = TP.ac();
        joins.atPut(aJoinKey, list);
    }

    return list;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getParentJoins',
function(aJoinKey) {

    /**
     * @method getParentJoins
     * @summary Returns the joined requests which will be checked during join
     *     processing to see if the receiver 'hasJoined'.
     * @param {String} aJoinKey The key to look up, which should be either the
     *     TP.AND or TP.OR constant.
     * @returns {Array} The current and-joined or or-joined requests.
     */

    var joins,
        list;

    if (TP.isEmpty(aJoinKey)) {
        return this.raise('TP.sig.InvalidParameter', 'No valid join key.');
    }

    joins = this.$get('parentJoins');
    if (TP.notValid(joins)) {
        joins = TP.hc();
        this.$set('parentJoins', joins);
    }

    list = joins.at(aJoinKey);
    if (TP.notValid(list)) {
        list = TP.ac();
        joins.atPut(aJoinKey, list);
    }

    return list;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('hasJoined',
function(aRequest, childJoin) {

    /**
     * @method hasJoined
     * @summary Invoked by requests which have been joined to the receiver in
     *     some form or another when those requests complete. If the receiver
     *     checks its join configuration and recognizes that conditions for
     *     triggering have been met it returns true so the invoker can
     *     subsequently trigger the receiver to fire.
     * @param {TP.sig.Request} aRequest The request whose state just changed.
     *     Typically the caller.
     * @param {Boolean} childJoin True when the join test is for child join
     *     completion.
     * @returns {Boolean} True if the receiver has reached a valid join state to
     *     support triggering.
     */

    var list,
        len,
        i,
        item;

    list = TP.isTrue(childJoin) ? this.getChildJoins(TP.OR) :
                                this.getJoins(TP.OR);
    len = list.getSize();
    for (i = 0; i < len; i++) {
        item = list.at(i);
        if (childJoin) {
            return item.didComplete();
        } else {
            //  NOTE we take the absolute value here because when we're
            //  checking a state we may be "pending" or "final" and those
            //  values are +/- of each other.
            if (Math.abs(item.first().get('statusCode')) ===
                Math.abs(item.last())) {
                return true;
            }
        }
    }

    list = TP.isTrue(childJoin) ? this.getChildJoins(TP.AND) :
                                this.getJoins(TP.AND);
    len = list.getSize();
    for (i = 0; i < len; i++) {
        item = list.at(i);
        if (childJoin) {
            if (item.didFail() || item.didCancel()) {
                return false;
            }
        } else {
            //  NOTE we take the absolute value here because when we're
            //  checking a state we may be "pending" or "final" and those
            //  values are +/- of each other.
            if (Math.abs(item.first().get('statusCode')) ===
                Math.abs(item.last())) {
                return false;
            }
        }
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('joinTo',
function(aRequest, aState, aCondition) {

    /**
     * @method joinTo
     * @summary Joins the receiver to a downstream peer request. When the
     *     receiver reaches aState it will check the downstream request to see
     *     if it should be triggered based on any other requests which might
     *     also be joined to that request. By default this method uses an orJoin
     *     mechanism so calling joinTo with just a request parameter results in
     *     a simple "call when done" kind of semantic.
     * @param {TP.sig.Request} aRequest A downstream request which should be
     *     triggered when the receiver reaches aState.
     * @param {Number|String} aState A job control state or suffix such as
     *     TP.SUCCEEDED or "Succeeded" (the default).
     * @param {String} aCondition TP.AND or TP.OR (default is TP.OR so only the
     *     receiver is necessary to trigger firing.
     * @returns {TP.sig.Request} The downstream request. This helps support
     *     chained calls like r1.joinTo(r2).joinTo(r3).
     */

    if (aCondition === TP.AND) {
        aRequest.andJoin(this, aState);
    } else {
        aRequest.orJoin(this, aState);
    }

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('orJoin',
function(aRequest, aState) {

    /**
     * @method orJoin
     * @summary Adds a request and state to the list of requests which may
     *     reach a prescribed state before the receiver can trigger. For orJoin
     *     requests only one pair must match for the receiver to trigger in
     *     response.
     * @param {TP.sig.Request} aRequest A request instance to observe as a
     *     trigger.
     * @param {Number|String} aState A job control state or suffix such as
     *     TP.SUCCEEDED or "Succeeded" (the default).
     * @returns {TP.sig.Request} The receiver.
     */

    var ors,
        state;

    state = TP.ifInvalid(aState, TP.SUCCEEDED);

    //  tell ourselves, the "waiting request", about our prerequisite
    ors = this.getJoins(TP.OR);
    ors.push(TP.ac(aRequest, state));

    //  tell the prerequisite about us so it can notify on state
    aRequest.$wrapupJoin(this, state);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('orJoinChild',
function(aChildRequest) {

    /**
     * @method orJoinChild
     * @summary Adds a child request to the list of requests which must
     *     complete before the receiver can complete. Note that a single failed
     *     child will cause the parent request to fail.
     * @param {TP.sig.Request} aChildRequest A request instance to observe for
     *     completion.
     * @returns {TP.sig.Request} The receiver.
     */

    var ors;

    //  tell ourselves, the "waiting request", about our child
    ors = this.getChildJoins(TP.OR);
    ors.push(aChildRequest);

    //  tell the child about us so it can notify on completion
    aChildRequest.$wrapupJoin(this, TP.COMPLETED, true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('$wrapupJoin',
function(aRequest, aState, childJoin) {

    /**
     * @method $wrapupJoin
     * @summary Invoked internally to register a request and state for join
     *     testing during job wrapup processing.
     * @param {TP.sig.Request} aRequest A request instance to observe as a
     *     trigger.
     * @param {Number|String} aState A job control state or suffix such as
     *     TP.SUCCEEDED or "Succeeded" (the default).
     * @param {Boolean} childJoin True to signify that this join is a child
     *     join.
     * @returns {TP.sig.Request} The receiver.
     */

    var state,
        list;

    state = TP.ifInvalid(aState, TP.SUCCEEDED);

    //  NOTE that when we're defining joins to check upon wrapup we are
    //  looking at our peers and parents in terms of other requests which
    //  should be notified.
    //  TODO: These calls normally take TP.AND or TP.OR... is 'state' correct
    //  here?
    list = TP.isTrue(childJoin) ? this.getParentJoins(state) :
                                this.getJoins(state);
    list.push(aRequest);

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.JobStatus Methods
//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('cancelJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method cancelJob
     * @summary Tells the receiver to "cancel", meaning whatever work is needed
     *     to get to a TP.CANCELLED state.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode An optional object to set as the fault code.
     *     Usually a String or Number instance.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the cancellation.
     * @returns {TP.sig.Request} The receiver.
     */

    var joins,
        len,
        i;

    //  if we've got child requests then cancel them...we're terminated
    joins = this.getChildJoins(TP.AND).addAll(
                        this.getChildJoins(TP.OR)).unique();

    len = joins.getSize();
    for (i = 0; i < len; i++) {
        //  NOTE that this won't do anything if the job already cancelled so
        //  we shouldn't see looping or extra overhead here.
        joins.at(i).cancel(aFaultString, aFaultCode, aFaultInfo);
    }

    //  don't push empty values into the argument list or we risk creating
    //  'undefined' as one of the values inappropriately.
    switch (arguments.length) {
        case 1:
            return this.$wrapupJob('Cancelled', TP.CANCELLED, aFaultString);
        case 2:
            return this.$wrapupJob('Cancelled', TP.CANCELLED, aFaultString,
                                    aFaultCode);
        case 3:
            return this.$wrapupJob('Cancelled', TP.CANCELLED, aFaultString,
                                    aFaultCode, aFaultInfo);
        default:
            return this.$wrapupJob('Cancelled', TP.CANCELLED);
    }
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('completeJob',
function(aResult) {

    /**
     * @method completeJob
     * @summary Tells the receiver to "complete", meaning whatever work is
     *     needed to get to a proper TP.SUCCEEDED state.
     * @param {Object} aResult An optional object to set as the result of the
     *     request.
     * @returns {TP.sig.Request} The receiver.
     */

    //  completing a job should ensure the result gets properly set in any
    //  response object we have.
    this.getResponse(aResult);

    //  don't push empty values into the argument list or we risk creating
    //  'undefined' as one of the values inappropriately.
    if (arguments.length > 0) {
        return this.$wrapupJob('Succeeded', TP.SUCCEEDED, aResult);
    }

    return this.$wrapupJob('Succeeded', TP.SUCCEEDED);
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('failJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method failJob
     * @summary Tells the receiver to "fail", meaning whatever work is needed
     *     to get to a TP.FAILED state.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode An optional object to set as the fault code.
     *     Usually a String or Number instance.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.sig.Request} The receiver.
     */

    var joins,
        len,
        i;

    //  if we've got child requests then cancel them...we're terminated
    joins = this.getChildJoins(TP.AND).addAll(
                        this.getChildJoins(TP.OR)).unique();

    len = joins.getSize();
    for (i = 0; i < len; i++) {
        //  NOTE that this won't do anything if the job already cancelled so
        //  we shouldn't see looping or extra overhead here.
        joins.at(i).cancel(aFaultString, aFaultCode, aFaultInfo);
    }

    //  don't push empty values into the argument list or we risk creating
    //  'undefined' as one of the values inappropriately.
    switch (arguments.length) {
        case 1:
            return this.$wrapupJob('Failed', TP.FAILED, aFaultString);
        case 2:
            return this.$wrapupJob('Failed', TP.FAILED, aFaultString,
                                    aFaultCode);
        case 3:
            return this.$wrapupJob('Failed', TP.FAILED, aFaultString,
                                    aFaultCode, aFaultInfo);
        default:
            return this.$wrapupJob('Failed', TP.FAILED);
    }
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('$wrapupJob',
function(aSuffix, aState, aResultOrFault, aFaultCode, aFaultInfo) {

    /**
     * @method $wrapupJob
     * @summary Handles notifying the common parties to a request, the request,
     *     responder, and requestor of request completion and ensures any joined
     *     requests are triggered properly based on the final request status.
     * @description The various job control methods (completeJob, failJob,
     *     cancelJob) invoke this wrapup method to handle their final
     *     notification and join work.
     * @param {String} aSuffix The suffix provided is typically based on the
     *     state and usually is 'Cancelled', 'Failed', or 'Succeeded' to match
     *     the common signal suffixes observed.
     * @param {Number} aState The job control state, usually TP.FAILED,
     *     TP.CANCELLED, or TP.SUCCEEDED.
     * @param {Object} aResultOrFault A valid result object when in a
     *     non-failure state and a fault string when in a failure state.
     * @param {Object} aFaultCode An optional object to set as the fault code.
     *     Usually a String or Number instance.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.sig.Request} The receiver.
     */

    var end,

        response,
        request,
        responder,
        requestor,

        id,
        suffixes,
        signals,

        signame,

        i,
        j,
        leni,
        lenj,
        suffix,

        handlerName,

        joins,
        ancestor,
        join,
        arglen,

        deferred;

    //  consider this to be "end of processing" time since what follows is
    //  largely about notifying rather than "real work" for the request
    if (TP.isValid(this.at('cmdStart'))) {
        end = Date.now();
        this.atPut('cmdEnd', end);
    }

    //  get a handle to the response object for the request.
    response = this.getResponse();

    //  three objects get special consideration with respect to notification
    //  to keep observe/ignore overhead to a minimum.
    request = this;
    responder = this.get('responder');
    requestor = this.get('requestor');

    //  now we ensure we don't have duplicate objects to notify, request and
    //  requestor will often default to the same request instance.
    responder = responder === request ? null : responder;
    requestor = requestor === request ? null : requestor;
    requestor = requestor === responder ? null : requestor;

    id = this.getRequestID();

    //  TODO: move this logic to a TP.sig.Request-specific method that can
    //  cache the result value for all instances of the request type.

    //  the request's signal name is our signal names' "body". Note that
    //  this returns all of the signal type names from the receiver's signal
    //  type up through TP.sig.Signal.
    signals = this.getTypeSignalNames().copy();

    //  Slice off all signal types before TP.sig.Request
    signals = signals.slice(0, signals.getPosition('TP.sig.Request') + 1);

    leni = signals.getSize();

    //  ensure we at least have a completed state to signal
    suffixes = TP.ac(aSuffix, 'Completed');
    lenj = suffixes.getSize();

    arglen = arguments.length;

    //  process each signal, letting first the request, then the requestor,
    //  and then signal observers know about each step in order
    for (i = 0; i < leni; i++) {
        signame = signals.at(i);

        for (j = 0; j < lenj; j++) {
            suffix = suffixes.at(j);

            //  Make sure that we have a real signal type.
            if (!TP.isType(TP.sys.getTypeByName(signame))) {
                continue;
            }

            handlerName = TP.composeHandlerName({signal: signame + suffix});

            response.setSignalName(signame + suffix);

            //  notify the request itself, it will often be locally
            //  programmed with custom callback hooks
            TP.handle(request, response, handlerName, true);
            if (response.shouldPrevent() || response.shouldStop()) {
                break;
            }

            //  notify responder...typically the service which did the
            //  actual processing. we give it one last chance to finish up
            //  any housekeeping for the request/response before requestor
            TP.handle(responder, response, handlerName, true);
            if (response.shouldPrevent() || response.shouldStop()) {
                break;
            }

            TP.handle(requestor, response, handlerName, true);
            if (response.shouldPrevent() || response.shouldStop()) {
                break;
            }

            //  signal the request for any remaining observers which might
            //  exist. NOTE that since we've been manipulating the signal
            //  name we don't use inheritance firing here... implying that
            //  observers of response signals have to be observing
            //  specifically.
            TP.signal(id, response, null, TP.FIRE_ONE);
        }
    }

    //  ---
    //  peer requests
    //  ---

    //  once all standard processing of the request has been completed we
    //  look for any joined requests and see which we should activate as
    //  members of a downstream pipeline.
    joins = this.getJoins(TP.ifInvalid(aState, this.get('statusCode')),
                            this);
    if (TP.notEmpty(joins)) {
        leni = joins.getSize();
        for (i = 0; i < leni; i++) {
            join = joins.at(i);
            if (join.hasJoined(this)) {
                //  Patch STDIO
                if (arglen > 2) {
                    join.atPut(TP.STDIN, TP.ac(aResultOrFault));
                }
                joins.at(i).fire();
            }
        }
    }

    //  ---
    //  parent requests
    //  ---

    //  after checking for peer requests we also want to look for parent
    //  requests which care about either our exact status code (success vs.
    //  failure), or which care simply that we're done processing.

    //  TODO: These calls normally take TP.AND or TP.OR... is 'state' correct
    //  here?
    joins = this.getParentJoins(
                    TP.ifInvalid(aState, this.get('statusCode'))).addAll(
                            this.getParentJoins(TP.COMPLETED)).unique();

    if (TP.notEmpty(joins)) {
        leni = joins.getSize();
        for (i = 0; i < leni; i++) {
            ancestor = joins.at(i);

            //  whether the parent thinks it has joined or not, if we failed
            //  or cancelled the parent should be told directly
            if (this.isFailing() || this.didFail()) {
                switch (arglen) {
                    case 3:
                        ancestor.$failJoin(this, aResultOrFault);
                        break;
                    case 4:
                        ancestor.$failJoin(this, aResultOrFault,
                                                aFaultCode);
                        break;
                    case 5:
                        ancestor.$failJoin(this, aResultOrFault,
                                                aFaultCode,
                                                aFaultInfo);
                        break;
                    default:
                        ancestor.$failJoin(this);
                        break;
                }
            } else if (this.isCancelling() || this.didCancel()) {
                switch (arglen) {
                    case 3:
                        ancestor.$cancelJoin(this, aResultOrFault);
                        break;
                    case 4:
                        ancestor.$cancelJoin(this, aResultOrFault,
                                                    aFaultCode);
                        break;
                    case 5:
                        ancestor.$cancelJoin(this, aResultOrFault,
                                                    aFaultCode,
                                                    aFaultInfo);
                        break;
                    default:
                        ancestor.$cancelJoin(this);
                        break;
                }
            } else if (ancestor.hasJoined(this, true)) {
                if (arglen > 2) {
                    ancestor.$completeJoin(this, aResultOrFault);
                } else {
                    ancestor.$completeJoin(this);
                }
            }
        }
    }

    //  If we had a deferred Promise hooked up to us, then (depending on success
    //  or not) resolve it or reject it.
    deferred = this.get('$deferredPromise');
    if (TP.isValid(deferred)) {
        if (aState === TP.SUCCEEDED) {
            deferred.resolve(aResultOrFault);
        } else {
            deferred.reject(TP.hc('faultText', response.getFaultText(),
                                    'faultCode', response.getFaultCode(),
                                    'faultInfo', response.getFaultInfo()));
        }
    }

    return this;
});

//  ========================================================================
//  TP.sig.Response
//  ========================================================================

/**
 * @type {TP.sig.Response}
 * @summary Top-level response signal for TP.sig.Request signals. All response
 *     signals are subtypes of this signal. When a TP.sig.Request is handled by
 *     a resource the resource's handle calls will construct and eventually
 *     signal a TP.sig.Response of the proper name/type to notify any observers.
 *     The response instance is also returned by the handler immediately as a
 *     way of providing consistent access to the response, pending or otherwise.
 *
 *     Note that by allowing different response types TIBET allows you to
 *     construct smart wrappers around the data that's returned by the various
 *     services you may access.
 */

//  ------------------------------------------------------------------------

TP.sig.WorkflowSignal.defineSubtype('Response');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the original request which drove this response's creation
TP.sig.Response.Inst.defineAttribute('request');

//  the result data managed by this response type
TP.sig.Response.Inst.defineAttribute('result');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('init',
function(aRequest, aResult) {

    /**
     * @method init
     * @summary Initialize a new instance. The request should be the original
     *     TP.sig.Request instance while the optional result is whatever data
     *     should be assigned to the request as the result.
     * @param {TP.sig.Request} aRequest A request object. In the case of
     *     TP.sig.Response instances the request object provided here must be a
     *     TP.sig.Request instance, not one of the more loosely typed "request
     *     hash" types used by other request-oriented methods.
     * @param {Object} aResult A result object.
     * @returns {TP.sig.Response} A new instance.
     */

    //  initialize the signal -- note we don't pass along the TP.sig.Request
    //  instance as payload or a 'request hash'
    this.callNextMethod(null);

    //  NOTE we force a request from either TP.sig.Request or TP.core.Hash
    //  here to ensure we've got something we can process effectively with
    this.$set('request', TP.request(aRequest), false);

    //  if we received a value (including null) as a result then set it.
    if (TP.isDefined(aResult)) {
        this.$set('result', aResult, false, true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('cancelJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method cancelJob
     * @summary Tells the receiver to "cancel", meaning whatever work is needed
     *     to get to a TP.CANCELLED state.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode An optional object to set as the fault code.
     *     Usually a String or Number instance.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the cancellation.
     * @returns {TP.sig.Response} The receiver.
     */

    var request;

    request = this.get('request');
    if (TP.canInvoke(request, 'cancelJob')) {
        return request.cancelJob(aFaultString, aFaultCode, aFaultInfo);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('completeJob',
function(aResult) {

    /**
     * @method completeJob
     * @summary Tells the receiver to "complete", meaning whatever work is
     *     needed to get to a proper TP.SUCCEEDED state.
     * @param {Object} aResult An optional object to set as the result of the
     *     request.
     * @returns {TP.sig.Response} The receiver.
     */

    var request;

    request = this.get('request');
    if (TP.canInvoke(request, 'completeJob')) {
        // Don't make the called routine thing we're setting 'undefined' as a
        // result by accident.
        if (arguments.length > 0) {
            return request.completeJob(aResult);
        } else {
            return request.completeJob();
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('failJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method failJob
     * @summary Tells the receiver to "fail", meaning whatever work is needed
     *     to get to a TP.FAILED state.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode An optional object to set as the fault code.
     *     Usually a String or Number instance.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.sig.Response} The receiver.
     */

    var request;

    request = this.get('request');
    if (TP.canInvoke(request, 'failJob')) {
        return request.failJob(aFaultString, aFaultCode, aFaultInfo);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('fire',
function(anOrigin, aPayload, aPolicy) {

    /**
     * @method fire
     * @summary Fires the response using either the request ID or null ID. NOTE
     *     that the request itself is considered a local listener and is
     *     notified directly via this call. Other response observers may exist
     *     however, so this call still fires the response signal as its last
     *     step.
     * @param {Object} anOrigin An optional firing origin for this activation.
     *     NOTE that this is only used when no request ID is available for the
     *     response's request object to ensure that responses can be properly
     *     matched to their requests.
     * @param {Object} aPayload Optional parameter(s).
     * @param {Function} aPolicy A firing policy defining how the response
     *     should propogate.
     * @returns {TP.sig.Response} The receiver.
     */

    var origin,
        request,
        policy,
        signame;

    //  make sure our payload is in place for the request's handler
    if (TP.isValid(aPayload)) {
        this.setPayload(aPayload);
    }

    //  workflow signals always use a request ID as their origin so that
    //  they can tie together "processes" which are embodied as signal
    //  chains related to an originating request, unless explicitly altered
    origin = TP.ifInvalid(anOrigin, this.getRequestID());
    this.setOrigin(origin);

    //  to avoid thrashing on request/response observations too much we
    //  don't actually register the request via the notification system,
    //  we invoke its handle call directly here. TP.handle() will deal with
    //  any ignore semantics etc to avoid calling the request multiple
    //  times.
    request = this.getRequest();
    TP.handle(request, this);

    //  check response see if we should continue with remaining signaling.
    //  this can be managed by the request to keep overhead down
    if (this.shouldPrevent() || this.shouldStop()) {
        return this;
    }

    policy = aPolicy;
    if (TP.notValid(policy)) {
        //  when a signal name is specified inheritance is "off" and we
        //  target a very specific handler or none at all, otherwise we
        //  presume that we should use the default policy to fire.
        signame = this.getSignalName();
        if (signame !== this.getTypeName()) {
            policy = TP.FIRE_ONE;
        } else {
            policy = this.getType().getDefaultPolicy();
        }
    }

    //  instrument with current firing time
    this.$set('time', Date.now());

    //  signal using the request id as a channel identifier. this is done
    //  primarily for external observers...the requestor should be notified
    //  in the logic above
    TP.signal(origin, this, aPayload, policy);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getDelegate',
function() {

    /**
     * @method getDelegate
     * @summary Returns the receiver's delegate, the object used by the
     *     TP.delegate utility function when constructing delegation methods.
     *     For TP.sig.Response this is the request object.
     * @returns {Object} The receiver's delegation object.
     */

    return this.getRequest();
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getFaultCode',
function() {

    /**
     * @method getFaultCode
     * @summary Returns the fault code of the receiver.
     * @returns {Number} A TIBET fault code constant.
     */

    var request;

    request = this.get('request');
    if (TP.canInvoke(request, 'getFaultCode')) {
        return request.getFaultCode();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getFaultInfo',
function() {

    /**
     * @method getFaultInfo
     * @summary Returns the fault info of the receiver.
     * @returns {TP.core.Hash} A hash that will contain additional information
     *     about the failure.
     */

    var request;

    request = this.get('request');
    if (TP.canInvoke(request, 'getFaultInfo')) {
        return request.getFaultInfo();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getFaultText',
function() {

    /**
     * @method getFaultText
     * @summary Returns the fault string (description) of the receiver.
     * @returns {String} A text description of the fault.
     */

    var request;

    request = this.get('request');
    if (TP.canInvoke(request, 'getFaultText')) {
        return request.getFaultText();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getPayload',
function() {

    /**
     * @method getPayload
     * @summary Returns the optional arguments to the signal. If the response
     *     contains a payload it is returned by this call, otherwise any payload
     *     used by the original request is returned.
     * @returns {Object} The receiver's payload.
     */

    var payload;

    if (TP.notValid(payload = this.callNextMethod())) {
        return this.getRequest().getPayload();
    }

    return payload;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getRequest',
function() {

    /**
     * @method getRequest
     * @summary Returns the receiver's original request object.
     * @returns {TP.sig.Request} The request this is the response for.
     */

    return this.$get('request');
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getRequestID',
function() {

    /**
     * @method getRequestID
     * @summary Returns the request ID for this request. The request ID may be
     *     a standard OID, a URL, or whatever is appropriate for the type of
     *     request. The default is an OID. The important thing about a request
     *     ID is that they serve as origins for any response signals which are
     *     generated so they should be reasonably unique.
     * @returns {String} A request ID which can take any form.
     */

    var request;

    request = this.get('request');
    if (TP.canInvoke(request, 'getRequestID')) {
        return request.getRequestID();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getResult',
function() {

    /**
     * @method getResult
     * @summary Returns the request result, the object returned as a result of
     *     processing the receiver's request.
     * @returns {Object}
     */

    return this.$get('result');
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getResultNode',
function() {

    /**
     * @method getResultNode
     * @summary Returns the receiver's result in TP.core.Node form if possible.
     *     When the result isn't valid XML this method returns null.
     * @returns {Node} A valid Node instance.
     */

    return TP.tpnode(this.getResult());
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getResultObject',
function() {

    /**
     * @method getResultObject
     * @summary Returns the receiver's result in object form.
     * @returns {Object}
     */

    return this.getResult();
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getResultText',
function() {

    /**
     * @method getResultText
     * @summary Returns the receiver's content in text (String) form.
     * @returns {String}
     */

    return TP.str(this.getResult());
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getStatusCode',
function() {

    /**
     * @method getStatusCode
     * @summary Returns the job status code of the receiver.
     * @returns {Number} A TIBET status code constant.
     */

    var request;

    request = this.get('request');
    if (TP.canInvoke(request, 'getStatusCode')) {
        return request.getStatusCode();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getStatusText',
function() {

    /**
     * @method getStatusText
     * @summary Returns the job status of the receiver in text form.
     * @returns {String} The current status in text form.
     */

    var request;

    request = this.get('request');
    if (TP.canInvoke(request, 'getStatusText')) {
        return request.getStatusText();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('setRequest',
function(aRequest) {

    /**
     * @method setRequest
     * @summary Sets the receiver's request object.
     * @param {TP.sig.Request} aRequest The response's request.
     * @returns {TP.sig.Response} The receiver.
     */

    this.$set('request', aRequest, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('setResult',
function(aResult) {

    /**
     * @method setResult
     * @summary Defines the request's result, the object returned as a result
     *     of processing the request. This method is often overridden in
     *     subtypes so they can manage how the result data is stored.
     * @param {Object} aResult The result of request processing.
     * @returns {Object}
     */

    this.$set('result', aResult, false, true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('then',
function(onFulfilled, onRejected) {

    /**
     * @method then
     * @summary A method which returns a 'Promises/A+' compliant Promise object
     *     after installing the supplied fulfillment/rejection Functions.
     * @description The returned Promise will be resolved (fulfilled or
     *     rejected) when the TP.sig.Request for this TP.sig.Response completes.
     * @param {Function} onFulfilled A Function that will be executed if the
     *     promise reaches it's fulfilled state.
     * @param {Function} onRejected A Function that will be executed if the
     *     promise reaches it's rejected state.
     * @returns {Promise} A promise that can be used to be the 'next step' in a
     *     chain of promises.
     */

    var myReq,

        result,

        deferred,
        promise;

    myReq = this.getRequest();

    //  If the request already completed (possibly it's a synchronous call),
    //  then test for success or failure
    if (myReq.didComplete()) {

        //  If the request succeeded, then grab the result and call the
        //  fulfillment handler (if its defined).
        if (this.didSucceed()) {
            result = this.get('result');

            //  If a callable fulfillment handler was supplied, then try to call
            //  it.
            if (TP.isCallable(onFulfilled)) {
                try {
                    result = onFulfilled(result);
                } catch (e) {
                    //  If the fulfillment handler threw an Error, then return a
                    //  rejected Promise with the error object for chainability.
                    return TP.extern.Promise.reject(e);
                }
            }

            //  If the result (either the original result or the result after
            //  the fulfillment handler was invoked) is a 'then()able' object,
            //  then return it.
            if (TP.canInvoke(result, 'then')) {
                return result;
            } else {
                //  Otherwise, return a resolved Promise with the result for
                //  chainability.
                return TP.extern.Promise.resolve(result);
            }
        } else {

            //  The 'result' data will be the fault text, fault code and fault
            //  info from the receiver.
            result = TP.hc('faultText', this.getFaultText(),
                            'faultCode', this.getFaultCode(),
                            'faultInfo', this.getFaultInfo());

            //  If a callable rejection handler was supplied, then try to call
            //  it.
            if (TP.isCallable(onRejected)) {
                try {
                    result = onRejected(result);
                } catch (e) {
                    //  If the rejection handler threw an Error, then return a
                    //  rejected Promise with the error object for chainability.
                    return TP.extern.Promise.reject(e);
                }
            }

            //  If the result (either the original result or the result after
            //  the rejection handler was invoked) is a 'then()able' object,
            //  then return it.
            if (TP.canInvoke(result, 'then')) {
                return result;
            } else {
                //  Otherwise, return a rejected Promise with the result for
                //  chainability.
                return TP.extern.Promise.reject(result);
            }
        }
    }

    //  Stash away a reference to the *deferred* (not its Promise). We'll need
    //  to resolve() or reject() this later then the request completes.
    deferred = TP.extern.Promise.pending();
    myReq.set('$deferredPromise', deferred);

    //  Grab the Promise from the deferred and hook up the supplied
    //  fulfillment/rejection Functions.
    promise = deferred.promise;
    promise.then(onFulfilled, onRejected);

    //  Return the Promise for chainability.
    return promise;
});

//  ========================================================================
//  TP.core.PermissionGroup
//  ========================================================================

/**
 * @type {TP.core.PermissionGroup}
 * @summary An object whose primary purpose is to hold permission-specific
 *     behavior and one or more keyrings that provide permissions to members of
 *     the group.
 * @description Roles and units in a workflow sense are mapped to permission
 *     groups in TIBET. These permission groups are then assigned by way of
 *     vCard entries which are typically assigned to TP.core.User instances
 *     representing the "real" and "effective" user.
 *
 *     One of the important things to note here is that the features of a
 *     permission group are type-level features. This is done so that
 *     permission-specific behavior is associated with an object that is easily
 *     autoloaded when needed.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.PermissionGroup');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.PermissionGroup.Type.defineAttribute('keyrings');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.PermissionGroup.Type.defineMethod('addKeyRing',
function(keyRingName) {

    /**
     * @method addKeyRing
     * @summary Adds a keyring to the receiver, granting it the permissions
     *     defined by the keys contained in the keyring. Note that this
     *     operation is typically done via an initialize method which defines
     *     the permissions related to each group type.
     * @description When defining different permission group types one of the
     *     operations needed is to define the keyrings which that group has
     *     access to. This is typically done by string name so that the keyrings
     *     don't have to exist at the time of the assignment -- allowing
     *     definitions to be made with less overhead. The individual keyrings
     *     will be loaded the first time a request is made for the actual keys.
     * @param {String} keyRingName The name of the keyring.
     * @returns {TP.core.Resource} The receiver.
     */

    var ring,
        rings;

    ring = TP.tibet.keyring.getInstanceById(keyRingName);
    if (TP.notValid(ring)) {
        return this.raise('TP.sig.InvalidParameter',
            'Keyring: \'' + keyRingName + '\' not found.');
    }

    rings = this.$get('keyrings');
    if (TP.notValid(rings)) {
        rings = TP.ac();

        //  Note here how we use 'Type.set()' so that this type and all of its
        //  subtypes can 'see' the value set here.

        this.Type.set('keyrings', rings);
    }

    rings.add(ring);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.PermissionGroup.Type.defineMethod('getAccessKeys',
function() {

    /**
     * @method getAccessKeys
     * @summary Returns an array of the permission keys associated with the
     *     receiver by virtue of its associated keyrings.
     * @returns {Array} An array containing the string keys of the receiver.
     */

    var keys,
        rings;

    //  build an empty array we can inject into the following processes
    keys = TP.ac();

    rings = this.get('keyrings');
    if (TP.notValid(rings)) {
        return TP.ac();
    }

    keys = rings.injectInto(
        keys,
        function(ring, accum) {

            //  the apply will flatten the nested keys into the keyset
            accum.push.apply(accum, ring.getAccessKeys());

            //  injectInto requires that we return the injected data
            return accum;
        });

    return keys;
});

//  ------------------------------------------------------------------------

TP.core.PermissionGroup.Type.defineMethod('getKeyrings',
function() {

    /**
     * @method getKeyrings
     * @summary Returns the list of keyring instances associated with the
     *     receiver.
     * @return {Array.<TP.tibet.keyring>} The array of keyrings.
     */

    return this.$get('keyrings');
});

//  ========================================================================
//  TP.core.Role
//  ========================================================================

/**
 * @type {TP.core.Role}
 * @summary A functionally-oriented permission group capable of providing both
 *     permissions and behavior to a TP.core.Resource.
 * @description Roles are typically used as a way of grouping capabilities
 *     related to a specific job function such as "Manager" or "Clerk" in an
 *     application. This is in contrast to TP.core.Unit, which allows you to
 *     organize functionality and permissions based on organizational boundaries
 *     such as "Sales" or "Development".
 */

//  ------------------------------------------------------------------------

TP.core.PermissionGroup.defineSubtype('Role');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Role.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Initializes the type, defining the baseline keyrings.
     */

    this.addKeyRing('Public');

    return;
});

//  ========================================================================
//  Public:Guest
//  ========================================================================

//  Build a default role for "Public" organization and "Guest" role.
TP.core.Role.defineSubtype('Public.Guest');

//  ========================================================================
//  TP.core.Unit
//  ========================================================================

/**
 * @type {TP.core.Unit}
 * @summary A organizationally-oriented permission group capable of providing
 *     both permissions and behavior to a TP.core.Resource.
 * @description Units are used as a way of grouping functionality along
 *     organizational lines and can be useful when designing applications which
 *     deploy across organizational boundaries.
 */

//  ------------------------------------------------------------------------

TP.core.PermissionGroup.defineSubtype('Unit');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Unit.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Initializes the type, defining the baseline keyrings.
     */

    this.addKeyRing('Public');

    return;
});

//  ========================================================================
//  Public:Public
//  ========================================================================

//  Build a default unit for "Public" organization and "Public" unit.
TP.core.Unit.defineSubtype('Public.Public');

//  ========================================================================
//  TP.sig.UserRequest
//  ========================================================================

/**
 * @type {TP.sig.UserRequest}
 */

//  ------------------------------------------------------------------------

TP.sig.Request.defineSubtype('UserRequest');

//  ========================================================================
//  TP.core.User
//  ========================================================================

/**
 * @type {TP.core.User}
 * @summary A resource specific to the application user.
 * @description TP.core.User is a somewhat special, and perhaps unexpected,
 *     resource.
 *
 *     TIBET thinks of the user as another resource, one that can service
 *     requests (i.e. act as a data "source") or one that can act as a data
 *     "sink" when the application is simply providing the user with output.
 *
 *     You can think of the various logins as being represented by different
 *     TP.core.User instances. Since each login may be found in a different
 *     portion of the application user interface it's quite conceivable that you
 *     may want application logic to "request" a specific user instance, which
 *     results in a TP.sig.UserIORequest. The TIBET console uses this model
 *     extensively as a way of communicating with you via the command prompt.
 *
 *     More commonly TP.core.User instances, by virtue of their associated
 *     vCards, define the permissions associated with a specific login by virtue
 *     of the vCard's role and unit definitions. When a user's vCard is altered,
 *     or the real/effective user settings are altered at the TP.core.User type
 *     level, TIBET updates the currently available body elements with the real
 *     and effective key strings for the current user instance(s). CSS rules
 *     built to take advantage of this automatic update can then drive
 *     permission-specific user interface operations.
 */

//  ------------------------------------------------------------------------

TP.core.Resource.defineSubtype('User');

//  ------------------------------------------------------------------------
//  Type Initialization
//  ------------------------------------------------------------------------

TP.core.User.set('mode', TP.core.SyncAsync.DUAL_MODE);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  what signals will trigger a TP.core.User instance?
TP.core.User.Type.defineAttribute('triggerSignals', 'TP.sig.UserRequest');

//  the current effective TP.core.User instance
TP.core.User.Type.defineAttribute('effectiveUser');

//  the current "real" TP.core.User instance, typically the instance mapped
//  to the currently logged in/session-enabled user (ie. the one the server
//  (when there's a server ;)) thinks is the client's user).
TP.core.User.Type.defineAttribute('realUser');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.User.Type.defineMethod('construct',
function(resourceID) {

    /**
     * @method construct
     * @summary Constructs and returns a new TP.core.User instance. Also
     *     ensures that the first TP.core.User instance constructed is
     *     automatically set to be the real user.
     * @param {String} aResourceID A unique resource identifier.
     * @returns {TP.core.User} A newly constructed user instance.
     */

    var inst;

    inst = this.callNextMethod();

    if (TP.notValid(this.$get('realUser'))) {
        this.setRealUser(inst);
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.core.User.Type.defineMethod('$distributeEffectiveAccessKeys',
function() {

    /**
     * @method $distributeEffectiveAccessKeys
     * @summary Updates all open window body elements to contain the current
     *     "effective user" key string value. This method is invoked any time
     *     the effective user is changed, or has its vCard set to a new value.
     */

    var windows;

    windows = TP.core.Window.getOpenWindows();
    windows.perform(
        function(win) {

            TP.windowAssignACLKeys(win, TP.ACL_EFFECTIVE);
        });

    return;
});

//  ------------------------------------------------------------------------

TP.core.User.Type.defineMethod('$distributeRealAccessKeys',
function() {

    /**
     * @method $distributeRealAccessKeys
     * @summary Updates all open window body elements to contain the current
     *     "real user" key string value. This method is invoked any time the
     *     real user is changed, or has its vCard set to a new value.
     */

    var windows;

    windows = TP.core.Window.getOpenWindows();
    windows.perform(
        function(win) {

            TP.windowAssignACLKeys(win, TP.ACL_REAL);
        });

    return;
});

//  ------------------------------------------------------------------------

TP.core.User.Type.defineMethod('getEffectiveAccessKeys',
function() {

    /**
     * @method getEffectiveAccessKeys
     * @summary Returns the effective access keys, the access keys owned by the
     *     effective user instance if there is one.
     * @returns {Array} An array of the effective user's access keys.
     */

    var keys,
        user;

    user = this.getEffectiveUser();
    if (TP.isValid(user)) {
        keys = user.getAccessKeys();
    } else {
        keys = TP.ac();
    }

    return keys;
});

//  ------------------------------------------------------------------------

TP.core.User.Type.defineMethod('getEffectiveUser',
function() {

    /**
     * @method getEffectiveUser
     * @summary Returns the current "effective" user instance. Defaults to the
     *     current real user when no effective user instance has been set.
     * @returns {TP.core.User} The current effective user instance.
     */

    var user;

    user = this.$get('effectiveUser');

    if (TP.notValid(user)) {
        return this.getRealUser();
    }

    return user;
});

//  ------------------------------------------------------------------------

TP.core.User.Type.defineMethod('getInstanceById',
function(aUserID) {

    /**
     * @method getInstanceById
     * @summary Returns the instance with the ID provided, if available.
     * @param {String} aUserID The user ID to look up.
     * @returns {TP.core.User} The user instance with the ID provided.
     */

    var res;

    if (TP.isValid(res = this.getResourceById(aUserID))) {
        if (TP.isKindOf(res, this)) {
            return res;
        }
    }

    return res;
});

//  ------------------------------------------------------------------------

TP.core.User.Type.defineMethod('getRealAccessKeys',
function() {

    /**
     * @method getRealAccessKeys
     * @summary Returns the real user access keys, the access keys owned by the
     *     real user instance if there is one.
     * @returns {Array} An array of the real user's access keys.
     */

    var keys,
        user;

    user = this.getRealUser();
    if (TP.isValid(user)) {
        keys = user.getAccessKeys();
    } else {
        keys = TP.ac();
    }

    return keys;
});

//  ------------------------------------------------------------------------

TP.core.User.Type.defineMethod('getRealUser',
function() {

    /**
     * @method getRealUser
     * @summary Returns the "real" user instance, the one most typically
     *     associated with the server session, when there is a server.
     * @returns {TP.core.User} The current real user instance.
     */

    var realUser,
        cookieUser;

    if (TP.notValid(realUser = this.$get('realUser'))) {

        cookieUser = TP.core.Cookie.getCookie(TP.sys.cfg('user.cookie'));
        TP.core.User.construct(
            TP.ifEmpty(cookieUser, TP.sys.cfg('user.default_name')));

        realUser = this.$get('realUser');
    }

    return realUser;
});

//  ------------------------------------------------------------------------

TP.core.User.Type.defineMethod('setEffectiveUser',
function(aUser) {

    /**
     * @method setEffectiveUser
     * @summary Sets the application's effective user to the instance provided.
     *     This will cause certain UI updates to potentially occur as TIBET
     *     updates the effective role/unit permissions.
     * @param {TP.core.User} aUser The instance to make effective.
     * @returns {TP.lang.RootObject.<TP.core.User>} The TP.core.User type
     *     object.
     */

    if (!TP.isKindOf(aUser, this)) {
        this.raise('TP.sig.InvalidUser');

        return;
    }

    this.$set('effectiveUser', aUser);

    //  altering the user may alter role and unit which affect uri filters
    TP.sys.setcfg('tibet.uriprofile', null);

    //  trigger the UI changes via a key update
    this.$distributeEffectiveAccessKeys();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.User.Type.defineMethod('setRealUser',
function(aUser) {

    /**
     * @method setRealUser
     * @summary Sets the application's real user to the instance provided. This
     *     will cause certain UI updates to potentially occur as TIBET updates
     *     the effective role/unit permissions.
     * @param {TP.core.User} aUser The instance to make "real".
     * @returns {TP.lang.RootObject.<TP.core.User>} The TP.core.User type
     *     object.
     */

    if (!TP.isKindOf(aUser, this)) {
        this.raise('TP.sig.InvalidUser');

        return;
    }

    this.$set('realUser', aUser);

    //  altering the user may alter role and unit which affect uri filters
    TP.sys.setcfg('tibet.uriprofile', null);

    //  trigger the UI changes via a key update
    this.$distributeRealAccessKeys();

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  A TP.core.Hash of remote pubsub topics that the user might be
//  subscribed.
TP.core.User.Inst.defineAttribute('remoteSubscriptions');

//  A TP.core.Hash of credential sets that the user has available to them.
//  These are sets of credentials used for things like logging into remote
//  servers. They are keyed by a 'resource ID'.
TP.core.User.Inst.defineAttribute('credentials');

//  The 'credentials password' used to access the credentials database.
TP.core.User.Inst.defineAttribute('credentialsPassword');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.User.Inst.defineMethod('init',
function(resourceID) {

    /**
     * @method init
     * @summary Initializes a new user instance. This method extends the
     *     default resource initializer to automatically search for a matching
     *     vCard entry for the user ID.
     * @param {String} resourceID A unique user identifier. This ID will be used
     *     to look for an initial vCard entry for the named user.
     * @returns {TP.core.User}
     */

    var vCard;

    this.callNextMethod();

    this.set('remoteSubscriptions', TP.hc());
    this.set('credentials', TP.hc());

    //  We do this last so any changes that we may want to add which trigger
    //  based on the current vCard will occur and override anything we defaulted
    //  to in the prior portion of this method.
    vCard = TP.vcard_temp.vCard.getInstanceById(resourceID);
    if (TP.isValid(vCard)) {
        this.setVCard(vCard);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.User.Inst.defineMethod('clearCredentialsFor',
function(resourceID) {

    /**
     * @method clearCredentialsFor
     * @summary Clears the credentials information for the specified resource.
     * @param {String} resourceID A unique TIBET identifier. By unique we mean
     *     an ID which will not conflict with any other ID registered using
     *     TIBET's object registration methods.
     * @returns {TP.core.User} The receiver.
     */

    if (TP.notEmpty(this.getCredentialsFor(resourceID))) {
        this.get('credentials').removeKey(resourceID);
        this.saveCredentials();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.User.Inst.defineMethod('getCredentialsFor',
function(resourceID) {

    /**
     * @method getCredentialsFor
     * @summary Returns the credentials information for the specified resource.
     * @param {String} resourceID A unique TIBET identifier. By unique we mean
     *     an ID which will not conflict with any other ID registered using
     *     TIBET's object registration methods.
     * @returns {TP.core.Hash} A hash containing the user's credentials for the
     *     specified resource.
     */

    var credentialsPW,

        credentials,

        credentialsStorage,

        credentialsDBStr,
        credentialsDB;

    //  If we can't find an existing hash in our credentials store for the
    //  specified resource, then build one.
    if (TP.notValid(credentials = this.get('credentials').at(resourceID))) {

        //  If the user was already prompted to enter a password for the
        //  credentials DB, but didn't, the password is set to TP.NULL. If this
        //  is the case, there is no sense in continuing.
        if ((credentialsPW = this.get('credentialsPassword')) === TP.NULL) {
            //  TODO: Should we warn?
            credentials = TP.hc();
            this.get('credentials').atPut(resourceID, credentials);

            return credentials;
        }

        //  Right now, we use TP.core.LocalStorage (i.e. 'localStorage')
        credentialsStorage = TP.core.LocalStorage.construct();

        //  See if there is a credentials store in the credentials storage place
        //  (named by TP.CREDENTIALS_DB_NAME) using our password. This will
        //  return a JSONified String of the credentials information.
        credentialsDBStr = credentialsStorage.atEncrypted(
                            TP.CREDENTIALS_DB_NAME,
                            credentialsPW);

        if (TP.isEmpty(credentialsDBStr)) {
            credentials = TP.hc();
        } else {
            //  We found an existing JSONified String... turn it into an object
            //  (i.e. a TP.core.Hash) if we can and grab the credentials at
            //  the specified resource ID. If we cannot, just allocate an empty
            //  hash.
            if (TP.isValid(credentialsDB = TP.json2js(credentialsDBStr))) {
                credentials = credentialsDB.at(resourceID);
            } else {
                credentials = TP.hc();
            }
        }

        this.get('credentials').atPut(resourceID, credentials);
    }

    return credentials;
});

//  ------------------------------------------------------------------------

TP.core.User.Inst.defineMethod('getCredentialsPassword',
function() {

    /**
     * @method getCredentialsPassword
     * @summary Returns the password used for saving the user's credentials.
     * @returns {TP.core.String} The credentials password.
     */

    var password;

    if (TP.isEmpty(password = this.$get('credentialsPassword'))) {

        if (TP.isEmpty(
            password = TP.prompt('Please enter your credentials password'))) {

            //  The user didn't enter a password - keep this from continuing to
            //  prompt by setting it to TP.NULL
            password = TP.NULL;
        }

        this.set('credentialsPassword', password);
    }

    return password;
});

//  ------------------------------------------------------------------------

TP.core.User.Inst.defineMethod('saveCredentials',
function() {

    /**
     * @method saveCredentials
     * @summary Saves the user's credentials information.
     * @returns {TP.core.User} The receiver.
     */

    var credentialsStorage;

    //  If the user was already prompted to enter a password for the credentials
    //  DB, but didn't, the password is set to TP.NULL. If this is the case,
    //  there is no sense in continuing.
    if (this.get('credentialsPassword') === TP.NULL) {
        //  TODO: Should we warn?
        return this;
    }

    //  Right now, we use TP.core.LocalStorage (i.e. 'localStorage')
    credentialsStorage = TP.core.LocalStorage.construct();

    //  Put the credentials into storage. Note how we convert our 'credentials'
    //  hash into a regular Object for more compact JSONification.
    credentialsStorage.atPutEncrypted(
                            TP.CREDENTIALS_DB_NAME,
                            this.get('credentials').asObject().asJSONSource(),
                            this.get('credentialsPassword'));

    return this;
});

//  ========================================================================
//  TP.core.Service
//  ========================================================================

/**
 * @type {TP.core.Service}
 * @summary A processing resource.
 */

//  ------------------------------------------------------------------------

TP.core.Resource.defineSubtype('Service');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  storage for a default instance that will take the ID of the type itself
//  with a suffix of 'Default' to identify it.
TP.core.Service.Type.defineAttribute('defaultInstance');

//  is the service registered to accept the initial request?
TP.core.Service.Type.defineAttribute('registered', false);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Service.Type.defineMethod('getDefaultInstance',
function(resourceID, aSignal) {

    /**
     * @method getDefaultInstance
     * @summary Returns the instance with the service ID provided, if
     *     available.
     * @param {String} resourceID A unique TIBET identifier. By unique we mean
     *     an ID which will not conflict with any other ID registered using
     *     TIBET's object registration methods.
     * @param {TP.sig.Signal} aSignal The signal which triggered this activity.
     * @returns {TP.core.Service} A valid service instance if one can be
     *     constructed.
     */

    var inst,
        id;

    inst = this.$get('defaultInstance');

    if (TP.notValid(inst)) {
        //  create as "typenameDefault" for identification unless otherwise
        //  specified; and make sure it's registered to take over as a
        //  handler for type-level triggers

        //  Note here how we use the type's 'local name' (i.e. without the
        //  namespace) to compute the default service ID
        id = TP.ifEmpty(resourceID, this.getLocalName() + 'Default');

        //  NOTE that not all services can construct instances without
        //  additional parameters...those that can't have to use constructed
        //  instances rather than a Default...
        TP.raise.$suspended = true;
        TP.signal.$suspended = true;

        try {
            //  note that it's up to the shell instances to get themselves
            //  ready to process real requests as part of the construct/init
            inst = this.construct(id, aSignal);
        } catch (e) {
            TP.ifWarn() ?
                TP.warn(TP.ec(e, 'Couldn\'t construct default instance: ')) : 0;

            if (TP.isValid(aSignal)) {
                //  can't construct an instance...have to let some other
                //  instance deal with it possibly
                if (aSignal.shouldStop()) {
                    //  if stop propagation was set during acceptRequest we
                    //  need to refire otherwise we should just return
                    return aSignal.fire();
                }
            }

            return;
        } finally {
            TP.raise.$suspended = false;
            TP.signal.$suspended = false;
        }

        if (TP.isValid(inst)) {
            this.$set('defaultInstance', inst, false);
            inst.register();
        }
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.core.Service.Type.defineMethod('getInstanceById',
function(aServiceID) {

    /**
     * @method getInstanceById
     * @summary Returns the instance with the service ID provided, if
     *     available.
     * @param {String} aServiceID The service ID to look up.
     * @returns {TP.core.Service} The instance whose ID matches the supplied
     *     service ID.
     */

    var res;

    if (TP.isValid(res = this.getResourceById(aServiceID))) {
        if (TP.isKindOf(res, this)) {
            return res;
        }
    }

    return res;
});

//  ------------------------------------------------------------------------

TP.core.Service.Type.defineHandler('Request',
function(aSignal) {

    /**
     * @method handleRequest
     * @summary Handles requests by creating a default instance on demand and
     *     forwarding the work to that instance. Once the instance has been
     *     constructed the receiver ignores future request signals so that it is
     *     no longer part of the request cycle.
     * @param {TP.sig.Request} aSignal The signal that triggered this handler.
     * @returns {Object} The result of processing the signal.
     */

    var id,
        inst;

    //  get the default instance, creating it as necessary so that it can
    //  take over for the type in terms of generic registrations
    //  Note here how we use the type's 'local name' (i.e. without the
    //  namespace) to compute the default service ID
    id = this.getLocalName() + 'Default';
    inst = this.getDefaultInstance(id, aSignal);

    //  turn off future invocations of the service as a request handler.
    //  the default instance should be handling that, and if we were unable
    //  to get the instance it's not likely we'll be successful in the
    //  future
    this.unregister();

    //  since the first section may fail we'll test again here
    if (TP.isValid(inst)) {
        //  delegate to the instance, but start at the outermost handle call
        //  so the instance can specialize as much as possible
        return TP.handle(inst, aSignal);
    }
});

//  ------------------------------------------------------------------------

TP.core.Service.Type.defineMethod('isRegistered',
function(aFlag) {

    /**
     * @method isRegistered
     * @summary Returns a boolean defining whether the receiver has registered
     *     to observe its triggers. Services register so they can avoid instance
     *     creation until the first request.
     * @param {Boolean} aFlag A new value for this property. Optional.
     * @returns {Boolean}
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('registered', aFlag);
    }

    return this.$get('registered');
});

//  ------------------------------------------------------------------------

TP.core.Service.Type.defineMethod('register',
function() {

    /**
     * @method register
     * @summary Registers the receiver observe its trigger signals so that
     *     requests will cause activation of the service. In the case of the
     *     type itself this is done by certain subtypes which want to avoid
     *     explicit instance creation/registration before a request can be
     *     serviced.
     * @returns {TP.core.Service} The receiver.
     */

    var signals,
        origins,

        i,
        j;

    //  Make sure to register this object with the system, if necessary, before
    //  we start observing things so that our registration URI will not be
    //  created as a 'handler URI' that will be cleared when 'ignore' is called.
    TP.sys.registerObject(this, null, true);

    signals = this.get('triggerSignals');
    if (TP.isValid(signals)) {
        origins = this.get('triggerOrigins') || TP.ANY;

        if (TP.isArray(origins)) {
            for (i = 0; i < origins.getSize(); i++) {
                if (TP.isArray(signals)) {
                    for (j = 0; j < signals.getSize(); j++) {
                        this.observe(origins.at(i), signals.at(j));
                    }
                } else {
                    this.observe(origins.at(i), signals);
                }
            }
        } else {
            if (TP.isArray(signals)) {
                for (j = 0; j < signals.getSize(); j++) {
                    this.observe(origins, signals.at(j));
                }
            } else {
                this.observe(origins, signals);
            }
        }
    }

    this.isRegistered(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Service.Type.defineMethod('unregister',
function() {

    /**
     * @method unregister
     * @summary Unregisters the receiver observe its trigger signals so that
     *     future requests will no longer trigger the type as a potential
     *     handler.
     * @returns {TP.core.Service} The receiver.
     */

    var signals,
        origins,

        i,
        j;

    if (!this.isRegistered()) {
        return;
    }

    signals = this.get('triggerSignals');
    if (TP.isValid(signals)) {
        origins = this.get('triggerOrigins') || TP.ANY;

        if (TP.isArray(origins)) {
            for (i = 0; i < origins.getSize(); i++) {
                if (TP.isArray(signals)) {
                    for (j = 0; j < signals.getSize(); j++) {
                        this.ignore(origins.at(i), signals.at(j));
                    }
                } else {
                    this.ignore(origins.at(i), signals);
                }
            }
        } else {
            if (TP.isArray(signals)) {
                for (j = 0; j < signals.getSize(); j++) {
                    this.ignore(origins, signals.at(j));
                }
            } else {
                this.ignore(origins, signals);
            }
        }
    }

    this.isRegistered(false);

    //  Reverse what we did above.
    TP.sys.unregisterObject(this);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  flag controlling whether the service is ready for requests
TP.core.Service.Inst.defineAttribute('serviceEnabled', true);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Service.Inst.defineMethod('init',
function(resourceID, aRequest) {

    /**
     * @method init
     * @summary Initializes a new instance of the receiver, providing it with a
     *     unique resourceID and any parameters that might be needed via an
     *     optional request/parameter hash.
     * @param {String} resourceID A unique TIBET identifier. By unique we mean
     *     an ID which will not conflict with any other ID registered using
     *     TIBET's object registration methods.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A hash or request object
     *     that should provide any additional parameters necessary to construct
     *     an instance.
     * @exception TP.sig.InvalidResourceID
     * @returns {TP.core.Resource} A new instance.
     */

    var vCard;

    //  construct the instance from the root down
    this.callNextMethod();

    //  if there's a service-level vcard which identifies the service then
    //  associate that with the service instance now. Note that we check
    //  even for default instances, since some external services like XMPP,
    //  etc. have vCards defined for their 'default' instance.
    vCard = TP.vcard_temp.vCard.getInstanceById(resourceID);
    if (TP.isValid(vCard)) {
        this.setVCard(vCard);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Service.Inst.defineMethod('clearAuthData',
function() {

    /**
     * @method clearAuthData
     * @summary Clears any stored authentication data from the receiver and any
     *     backing store.
     * @returns {TP.core.Service} The receiver.
     */

    TP.sys.getEffectiveUser().clearCredentialsFor(this.getID());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Service.Inst.defineMethod('configureAuthData',
function(aRequest) {

    /**
     * @method configureAuthData
     * @summary Configures authentication data for the receiver. This method
     *     should be overridden by subtypes to do something real.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional request or
     *     hash containing a serviceURI if the service is going to be tied to a
     *     particular target location.
     * @returns {TP.core.Service} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Service.Inst.defineMethod('isEnabled',
function() {

    /**
     * @method isEnabled
     * @summary Returns true if the service can process requests.
     * @returns {Boolean} Whether or not the service is enabled.
     */

    return this.get('serviceEnabled');
});

//  ------------------------------------------------------------------------

TP.core.Service.Inst.defineMethod('register',
function() {

    /**
     * @method register
     * @summary Registers the receiver observe its trigger signals.
     * @returns {TP.core.Service} The receiver.
     */

    this.callNextMethod();

    //  Make sure to unregister the type (if its registered). That way, the
    //  'default instance' of the service won't be created if it hasn't been
    //  created already. This allows this instance of the service to handle
    //  all (untargeted) requests of the types defined in 'triggerSignals'
    //  to be handled by this instance.
    this.getType().unregister();

    return this;
});

//  ========================================================================
//  TP.sig.FunctionRequest
//  ========================================================================

TP.sig.Request.defineSubtype('FunctionRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.FunctionRequest.Type.defineAttribute('responseType',
                                        'TP.sig.FunctionResponse');

//  ========================================================================
//  TP.sig.FunctionResponse
//  ========================================================================

TP.sig.Response.defineSubtype('FunctionResponse');

//  ========================================================================
//  TP.core.FunctionService
//  ========================================================================

TP.core.Service.defineSubtype('FunctionService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.FunctionService.Type.defineAttribute(
                        'triggerSignals', 'TP.sig.FunctionRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.FunctionService.Type.defineAttribute(
                        'supportedModes', TP.core.SyncAsync.DUAL_MODE);
TP.core.FunctionService.Type.defineAttribute(
                        'mode', TP.core.SyncAsync.DUAL_MODE);

TP.core.FunctionService.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.FunctionService.Inst.defineHandler('FunctionRequest',
function(aRequest) {

    /**
     * @method handleFunctionRequest
     * @summary Handles when an TP.sig.FunctionRequest is fired. Since
     *     this service will register itself as the default handler for these
     *     kinds of requests, the default instance of it will usually handle all
     *     of these kinds of requests.
     * @param {TP.sig.FunctionRequest} aRequest The request object to take
     *     the request parameters from.
     * @returns {TP.core.FunctionService} The receiver.
     */

    var request,
        handler,

        result;

    request = TP.request(aRequest);

    //  rewrite the mode, whether we're async or sync. This will only change
    //  the value if it hasn't been set to something already, but it may
    //  warn when the value appears to be inconsistent with what the service
    //  is capable of processing.
    request.atPut('async', this.rewriteRequestMode(request));

    //  For a Function request, we look in the 'handler' slot of the payload and
    //  make sure that the value there is callable. If not, we fail the request,
    //  but if it is we apply the Function with the supplied (or created)
    //  request as the only argument.
    if (!TP.isCallable(handler = request.at('handler'))) {
        request.fail('Handler not callable');
    } else {
        //  TODO: Need to handle when a Promise might be returned here for true
        //  asynchronicity. Also, can't this 'apply()' just be a regular
        //  invocation?
        result = handler.apply(request, TP.ac(request));
        request.complete(result);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Function Additions
//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asFunctionRequest',
function() {

    /**
     * @method asFunctionRequest
     * @summary A convenience wrapper method to turn a Function into a
     *     FunctionRequest.
     * @returns {TP.core.FunctionRequest} A new FunctionRequest containing the
     *     receiving Function.
     */

    return TP.sig.FunctionRequest.construct(TP.hc('handler', this));
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('fire',
function() {

    /**
     * @method fire
     * @summary A convenience wrapper method to 'fire' a Function. This first
     *     converts the a Function into a FunctionRequest and then 'fire()'s it.
     * @returns {TP.core.FunctionResponse} The supplied FunctionRequest's
     *     response object.
     */

    return this.asFunctionRequest().fire();
});

//  ========================================================================
//  TP.sig.IORequest
//  ========================================================================

/**
 * @type {TP.sig.IORequest}
 * @summary Common supertype for IO-related requests.
 */

//  ------------------------------------------------------------------------

TP.sig.Request.defineSubtype('IORequest');

//  ========================================================================
//  TP.sig.IOResponse
//  ========================================================================

/**
 * @type {TP.sig.IOResponse}
 * @summary Common supertype for IO-related responses.
 */

//  ------------------------------------------------------------------------

TP.sig.Response.defineSubtype('IOResponse');

//  ========================================================================
//  TP.core.IOService
//  ========================================================================

/**
 * @type {TP.core.IOService}
 * @summary Common supertype for IO-related responses.
 * @description This type adds polling capability to TP.core.Service.
 */

//  ------------------------------------------------------------------------

TP.core.Service.defineSubtype('IOService');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The TP.core.Job that is actually performing the polling.
TP.core.IOService.Inst.defineAttribute('$pollingJob');

//  The last request that was fired 'manually'. During polling, the last
//  signal that was fired manually is fired over and over by the polling
//  process.
TP.core.IOService.Inst.defineAttribute('lastRequest');

//  The 'starting' value for the interval controlling the polling. We start
//  at 3000ms. Note that you have to set this value before starting the
//  polling behavior.
TP.core.IOService.Inst.defineAttribute('firstInterval', 3000);

//  The 'maximum' value for the interval controlling the polling. We never
//  allow more than 60000ms (1 minute) to pass without polling. Note that
//  you have to set this value before starting the polling behavior.
TP.core.IOService.Inst.defineAttribute('maxInterval', 60000);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.IOService.Inst.defineMethod('isPolling',
function() {

    /**
     * @method isPolling
     * @summary Returns true if the receiver is currently 'actively polling'.
     *     This means that the receiver is a polling mode and is not paused.
     * @returns {Boolean} Whether or not the service is in a polling mode.
     */

    var pollingJob;

    pollingJob = this.get('$pollingJob');

    /* eslint-disable no-extra-parens */
    return (TP.isValid(pollingJob) &&
            pollingJob.isActive() &&
            !pollingJob.isPaused());
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.core.IOService.Inst.defineMethod('inPollMode',
function() {

    /**
     * @method inPollMode
     * @summary Returns true if the receiver is currently in a polling mode.
     * @description The receiver might not actually be polling at the time, but
     *     it is in an 'active poll' mode. Note also that pausing the polling
     *     behavior will cause this method to return false.
     * @returns {Boolean} Whether or not the service is in a polling mode.
     */

    var pollingJob;

    pollingJob = this.get('$pollingJob');

    return TP.isValid(pollingJob);
});

//  ------------------------------------------------------------------------

TP.core.IOService.Inst.defineMethod('$computeInterval',
function(aJob) {

    /**
     * @method $computeInterval
     * @summary Returns a value which grows slowly over time by adding 1 second
     *     to the delay with each iteration when the service did not get data
     *     the last time it polled. If it did get data, the initial interval
     *     value is used and the decay process starts all over again.
     * @param {TP.core.Job} aJob An instance whose processing data may be used
     *     to feed the computation of a new delay time.
     * @returns {Number} A computed delay time.
     */

    if (TP.notValid(this.get('lastRequest'))) {
        return aJob.get('firstInterval');
    }

    if (TP.notEmpty(this.get('lastRequest').getResponse().getResultText())) {
        return aJob.get('firstInterval');
    } else {
        return aJob.get('maxInterval').min(aJob.get('lastInterval') + 1000);
    }
});

//  ------------------------------------------------------------------------

TP.core.IOService.Inst.defineHandler('RequestFailed',
function(aSignal) {

    /**
     * @method handleRequestFailed
     * @summary Handles any signal being managed by this service that has
     *     unsuccessfully completed.
     * @param {TP.sig.Response} aSignal The response masquerading as a "Failed"
     *     signal.
     * @returns {TP.sig.Response} The supplied response signal.
     */

    //  The request failed - stop the polling.
    if (this.inPollMode()) {
        this.stopPolling();
    }

    return aSignal;
});

//  ------------------------------------------------------------------------

TP.core.IOService.Inst.defineHandler('RequestSucceeded',
function(aSignal) {

    /**
     * @method handleRequestSucceeded
     * @summary Handles any signal being managed by this service that has
     *     successfully completed.
     * @param {TP.sig.Response} aSignal The response masquerading as a
     *     "Succeeded" signal.
     * @returns {TP.sig.Response} The supplied response signal.
     */

    var request;

    request = aSignal.getRequest();

    if (this.inPollMode()) {
        //  Note the identity test - we want to know if 'request' is the
        //  exact same object as the one we're holding.
        if (request !== this.get('lastRequest')) {
            this.set('lastRequest', request);
        }
    }

    //  This parameter can either be a Boolean value or a Function.
    if (TP.isValid(request.at('poll'))) {
        //  If the 'poll' parameter has a value of false and we're polling,
        //  shut off polling.
        if (TP.isFalse(request.at('poll')) && this.inPollMode()) {
            this.stopPolling();
        } else if (TP.notFalse(request.at('poll') && !this.inPollMode())) {
            //  Otherwise, if the poll parameter is not false (either true
            //  or a Function), then start polling (supplying the request so
            //  that polling can be configured by using that request).
            this.startPolling(request);
            this.set('lastRequest', request);
        }
    }

    return aSignal;
});

//  ------------------------------------------------------------------------

TP.core.IOService.Inst.defineMethod('pausePolling',
function() {

    /**
     * @method pausePolling
     * @summary Pauses any current polling behavior.
     * @returns {TP.core.IOService} The receiver.
     */

    //  We're not actively polling - no sense in pausing anything.
    if (!this.isPolling()) {
        return this;
    }

    this.get('$pollingJob').pause();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.IOService.Inst.defineMethod('$poll',
function() {

    /**
     * @method $poll
     * @summary Polls the server for new data.
     * @returns {Boolean} Always returns true.
     */

    var lastRequest;

    if (TP.isValid(lastRequest = this.get('lastRequest'))) {
        //  Refire the last request.
        lastRequest.fire();
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.core.IOService.Inst.defineMethod('resumePolling',
function() {

    /**
     * @method resumePolling
     * @summary Resumes any previously paused polling behavior.
     * @returns {TP.core.IOService} The receiver.
     */

    //  We're already actively polling - no sense in resuming anything.
    if (this.isPolling()) {
        return this;
    }

    this.get('$pollingJob').resume();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.IOService.Inst.defineMethod('startPolling',
function(pollParams) {

    /**
     * @method startPolling
     * @summary Start the service's polling behavior.
     * @description The polling parameters supplied to this method can contain a
     *     'polling interval computation' Function in the 'poll' key. This
     *     Function will be bound to this object (so the 'this' reference point
     *     to this service) and will take the polling job as the only parameter.
     *     An example can be seen in the default Function that is used when this
     *     Function is not supplied in the polling parameters - this type's
     *     '$computeInterval' Function.
     * @param {TP.core.Hash|TP.sig.Request} pollParams Polling configuration
     *     parameters. These may include: 'poll' [true|false|Function]
     *     'pollFirstInterval' Number 'pollMaxInterval' Number.
     * @returns {TP.core.IOService} The receiver.
     */

    var firstInterval,
        maxInterval,

        controlParams,
        val,

        pollingJob;

    //  If we're already in 'poll mode', bail out.
    if (this.inPollMode()) {
        return this;
    }

    //  Construct the polling job with the following parameters:
    //      limit           TP.RETURN_FALSE         This job has no limit.
    //                                              It will not terminate
    //                                              until we explicitly tell
    //                                              it to do so.
    //      step            Polling function        The polling function.
    //                                              This should return true
    //                                              if data was received or
    //                                              false if not. That will
    //                                              be used by the decay
    //                                              function to determine
    //                                              whether it should decay
    //                                              more or reset to the
    //                                              firstInterval setting.
    //      interval        Interval function       Recomputed the polling
    //                                              interval after every
    //                                              poll. The default
    //                                              version of this function
    //                                              decays the interval by
    //                                              1000ms every time no
    //                                              data has been received
    //                                              by the polling process.
    //      firstInterval   firstInterval           The initial polling
    //                                              interval we should use.
    //                                              This will be adjusted by
    //                                              the decay function. The
    //                                              default is 3000ms.
    //      maxInterval     maxInterval             The maximum polling
    //                                              interval we should use.
    //                                              There will never be an
    //                                              interval longer than
    //                                              this between polls. The
    //                                              default is 60000ms.

    //  The initial job interval is whatever our 'firstInterval' is
    //  (defaults to 3000ms)
    firstInterval = this.get('firstInterval');

    //  The max interval is whatever our 'maxInterval' is (defaults to
    //  60000ms)
    maxInterval = this.get('maxInterval');

    if (TP.notValid(pollParams)) {
        controlParams = TP.hc('limit',
                                    TP.RETURN_FALSE,
                                'step',
                                    this.$poll.bind(this),
                                'interval',
                                    this.$computeInterval.bind(this),
                                'firstInterval',
                                    firstInterval,
                                'maxInterval',
                                    maxInterval);
    } else {
        controlParams = TP.hc('limit', TP.RETURN_FALSE,
                                'step', this.$poll.bind(this));

        if (TP.isValid(val = pollParams.at('poll')) && TP.isCallable(val)) {
            controlParams.atPut('interval', val.bind(this));
        } else {
            controlParams.atPut('interval',
                                this.$computeInterval.bind(this));
        }

        controlParams.atPut(
                    'firstInterval',
                    TP.isValid(pollParams.at('pollFirstInterval')) ?
                            pollParams.at('pollFirstInterval') :
                            firstInterval);

        controlParams.atPut(
                    'maxInterval',
                    TP.isValid(pollParams.at('pollMaxInterval')) ?
                            pollParams.at('pollMaxInterval') :
                            maxInterval);
    }

    pollingJob = TP.core.Job.construct(controlParams);

    this.set('$pollingJob', pollingJob);

    //  Start the polling job.
    pollingJob.start();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.IOService.Inst.defineMethod('stopPolling',
function() {

    /**
     * @method stopPolling
     * @summary Stop the service's polling behavior.
     * @returns {TP.core.IOService} The receiver.
     */

    //  If we're not already in 'poll mode', bail out.
    if (!this.inPollMode()) {
        return;
    }

    //  complete is the nice way to shut down a job
    this.get('$pollingJob').complete();

    //  Set all 'polling-related' ivars back to their pre-polling state, in
    //  case we start polling again.
    this.set('$pollingJob', null);
    this.set('lastRequest', null);

    return this;
});

//  ========================================================================
//  TP.sig.URIRequest
//  ========================================================================

/**
 * @type {TP.sig.URIRequest}
 * @summary Common supertype for URI-related requests.
 */

//  ------------------------------------------------------------------------

TP.sig.IORequest.defineSubtype('URIRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.URIRequest.Type.defineAttribute('responseType', 'TP.sig.URIResponse');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.URIRequest.Inst.defineMethod('getFinalURI',
function() {

    /**
     * @method getFinalURI
     * @summary Returns the final URI associated with this request.
     * @description There are effectively two URIs that are related to a
     *     request, the original "request URI" and the "final URI" which is the
     *     request URI with any uriparams expanded and applied to the URI query
     *     portion. This method returns the latter, the URI actually sent to the
     *     service during IO.
     * @returns {TP.core.URI} The final request URI.
     */

    return this.at('finaluri') || this.getRequestURI();
});

//  ------------------------------------------------------------------------

TP.sig.URIRequest.Inst.defineMethod('getRequestURI',
function() {

    /**
     * @method getRequestURI
     * @summary Returns the target URI associated with this request.
     * @description There are effectively two URIs that are related to a
     *     request, the original "request URI" and the "final URI" which is the
     *     request URI with any uriparams expanded and applied to the URI query
     *     portion. This method returns the former, the URI used as the "root"
     *     of the request.
     * @returns {TP.core.URI} The original request URI.
     */

    var responder;

    responder = this.get('responder');
    if (TP.isValid(responder)) {
        return responder.getRequestURI(this);
    }

    return this.at('uri');
});

//  ========================================================================
//  TP.sig.URIResponse
//  ========================================================================

/**
 * @type {TP.sig.URIResponse}
 * @summary Common supertype for URI-related responses.
 */

//  ------------------------------------------------------------------------

TP.sig.IOResponse.defineSubtype('URIResponse');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.URIResponse.Inst.defineMethod('getFinalURI',
function() {

    /**
     * @method getFinalURI
     * @summary Returns the final URI associated with this request.
     * @description There are effectively two URIs that are related to a
     *     request, the original "request URI" and the "final URI" which is the
     *     request URI with any uriparams expanded and applied to the URI query
     *     portion. This method returns the latter, the URI actually sent to the
     *     service during IO.
     * @returns {TP.core.URI} The final request URI.
     */

    var request;

    request = this.get('request');
    if (TP.canInvoke(request, 'getFinalURI')) {
        return request.getFinalURI();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.URIResponse.Inst.defineMethod('getRequestURI',
function() {

    /**
     * @method getRequestURI
     * @summary Returns the target URI associated with this request.
     * @description There are effectively two URIs that are related to a
     *     request, the original "request URI" and the "final URI" which is the
     *     request URI with any uriparams expanded and applied to the URI query
     *     portion. This method returns the former, the URI used as the "root"
     *     of the request.
     * @returns {TP.core.URI} The original request URI.
     */

    var request;

    request = this.get('request');
    if (TP.canInvoke(request, 'getRequestURI')) {
        return request.getRequestURI();
    }

    return;
});

//  ========================================================================
//  TP.core.URIService
//  ========================================================================

/**
 * @type {TP.core.URIService}
 * @summary Provides common functionality for services focused on processing
 *     URI-targeted requests. TP.core.URIServices can be given an initial URI
 *     which will be used for all requests they process, or they can be
 *     initialized to handle certain request types with a variety of specific
 *     URIs provided by the requests themselves.
 */

//  ------------------------------------------------------------------------

TP.core.IOService.defineSubtype('URIService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  type-level service URI, used by all instances without their own which
//  respond to requests without a uri key
TP.core.URIService.Type.defineAttribute('serviceURI');

//  This base type is configured to ignore username, pasword, auth and
//  iswebdav. Subtypes can provide an alternate hash.
TP.core.URIService.Type.defineAttribute('defaultedParameters',
                            TP.hc('username', TP.NONE,
                                    'password', TP.NONE,
                                    'auth', TP.NONE,
                                    'iswebdav', false));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  instance-specific service URI used by the instance when request doesn't
//  specify one
TP.core.URIService.Inst.defineAttribute('serviceURI');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.URIService.Inst.defineMethod('init',
function(resourceID, aRequest) {

    /**
     * @method init
     * @summary Returns an initialized instance of the receiver. If aRequest is
     *     provided it can help define the service's operation by providing a
     *     default serviceURI for the receiver. This uri is used when incoming
     *     requests don't provide a specific value.
     * @param {String} resourceID A unique service identifier.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional request or
     *     hash containing a serviceURI if the service is going to be tied to a
     *     particular target location.
     * @returns {TP.core.URIService} A new instance.
     */

    var paramDict,

        serviceURI,
        requestURI;

    //  get the basic instance ready, ensuring it gets its resourceID
    this.callNextMethod(resourceID);

    //  define the server name based on:
    //  a)  any incoming request object that might be used to
    //      template/initiate the service
    //  b)  any vCard entry that the server might have in the application's
    //      configuration
    //  c)  prompting the user for the value(s)

    //  If a request was supplied, we can use that to store the values.
    //  Otherwise, just construct a hash to store them.
    if (TP.isValid(aRequest)) {
        paramDict = aRequest;
    } else {
        paramDict = TP.hc();
    }

    //  Check first to see if the request has 'serviceURI' parameter. This
    //  will override all other mechanisms.
    serviceURI = paramDict.at('serviceURI');

    //  Didn't have a 'serviceURI' parameter
    if (TP.isEmpty(serviceURI)) {
        //  If the request has a 'uri' parameter and its an absolute path,
        //  then use that as the serviceURI
        if (TP.notEmpty(requestURI = paramDict.at('uri')) &&
            TP.uriIsAbsolute(requestURI)) {
            serviceURI = requestURI;
        } else {
            //  Otherwise to populate any missing 'serviceURI' parameter in
            //  the request from the receiver's vCard entry using the vCard
            //  property matching the 'url' key.
            this.populateMissingVCardData(
                        TP.hc('serviceURI',
                                TP.ac('url',
                                    'Enter service URI: ')
                            ),
                        paramDict);

            //  Still don't have a valid service URI.
            if (TP.isEmpty(serviceURI = paramDict.at('serviceURI'))) {
                aRequest.fail(
                    TP.sc('Missing required URI parameter in request: ') +
                        'serviceURI');

                return this;
            }
        }
    }

    this.set('serviceURI', serviceURI);

    //  Try to populate any missing 'username' and 'password' parameters in
    //  the request from the receiver's vCard entry.
    this.populateMissingVCardData(
        TP.hc(
            'username',
            TP.ac('username',
                'Enter username: '),
            'password',
                TP.ac('password',
                'Enter password: '),
            'auth',
                TP.ac('auth',
                'Enter authentication scheme ("BASIC" or "DIGEST"): '),
            'iswebdav',
                TP.ac(
                'iswebdav',
                'Should server comm use WebDAV verbs ("true or "false"): ')
            ),
        paramDict);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.URIService.Inst.defineMethod('getRequestURI',
function(aRequest) {

    /**
     * @method getRequestURI
     * @summary Returns the URI to use for the request. This method ensures
     *     that each request has a viable target URI by defaulting to the
     *     receiver's serviceURI value if the request doesn't specify a URI of
     *     its own.
     * @param {TP.sig.Request} aRequest The request to check for a URI.
     * @returns {TPURI} The request URI.
     */

    var url;

    if (TP.notValid(url = aRequest.at('uri'))) {
        if (TP.notValid(url = this.get('serviceURI'))) {
            this.raise('TP.sig.InvalidURI',
                                'Request has no service URI.');
            return;
        }
    }

    return url;
});

//  ------------------------------------------------------------------------

TP.core.URIService.Inst.defineMethod('getServiceURI',
function() {

    /**
     * @method getServiceURI
     * @summary Returns the default service URI for the receiver. This is the
     *     URI used when an individual request does not override it with an
     *     alternative URI.
     * @returns {TP.core.URI} The receiver's default URI.
     */

    //  start with instance and work outward to the type
    return this.$get('serviceURI') || this.getType().get('serviceURI');
});

//  ------------------------------------------------------------------------

TP.core.URIService.Inst.defineMethod('rewriteRequestURI',
function(aRequest) {

    /**
     * @method rewriteRequestURI
     * @summary Rewrites the request's URI, ensuring it defaults to the service
     *     URI and is rewritten to the current concrete location based on
     *     TIBET's rewriting rules.
     * @param {TP.sig.Request} aRequest The request to rewrite.
     * @returns {TP.core.URI} The new/updated URI instance.
     */

    var requestURI,
        serviceURI,

        url;

    //  this will ensure we get the serviceURI if the request doesn't have
    //  one and that proper URI rewriting will occur across all requests

    requestURI = aRequest.at('uri');
    serviceURI = this.get('serviceURI');

    if (TP.notValid(requestURI) && TP.notValid(serviceURI)) {
        this.raise('TP.sig.InvalidURI',
                    'Request has no service URI.');

        return;
    }

    //  if we had a valid request URI, try to use it.
    if (TP.isURI(requestURI)) {
        //  if request URI is absolute, we use that
        if (TP.uriIsAbsolute(requestURI)) {
            url = requestURI;
        } else if (TP.isURI(serviceURI)) {
            //  otherwise, the request URI must be relative - if we have a
            //  service URI, let's join paths with it.
            url = TP.uriJoinPaths(TP.uriCollectionPath(serviceURI),
                                    requestURI);
        } else {
            //  'requestURI' isn't absolute, but we don't have a service
            //  URI, so just use it and see what happens.
            url = requestURI;
        }
    } else {
        //  no request URI - just use the service URI.
        url = serviceURI;
    }

    //  do whatever rewriting we can to resolve to a concrete reference, but
    //  only if url is an absolute URI
    if (TP.uriIsAbsolute(url)) {
        url = TP.core.URI.rewrite(url, aRequest).getLocation();
    }

    return url;
});

//  ------------------------------------------------------------------------

TP.core.URIService.Inst.defineMethod('updateServiceURI',
function(aRequest) {

    /**
     * @method updateServiceURI
     * @summary If the supplied request has either a 'serviceURI' parameter or
     *     a 'uri' parameter that has an 'absolute path' value, we update our
     *     service URI to that value. This allows on-the-fly per-request
     *     retargeting of the endpoint URI that we represent.
     * @param {TP.sig.Request} aRequest The request to check for a new service
     *     URI.
     * @returns {TP.core.URIService} The receiver.
     */

    var serviceURI;

    //  If either the request specified a 'serviceURI' or the 'uri' supplied
    //  in the request pointed to an absolute path, use that value as the
    //  new serviceURI.
    if (TP.isURI(serviceURI = aRequest.at('serviceURI')) ||
        TP.uriIsAbsolute(serviceURI = aRequest.at('uri'))) {
        this.set('serviceURI', serviceURI);
    }

    return this;
});

//  ========================================================================
//  TP.core.Controller
//  ========================================================================

/**
 * @type {TP.core.Controller}
 * @summary This type is a common supertype for all 'TIBET controllers',
 *     objects which form the top layers of the TIBET responder chain.
 *     Per the original Smalltalk-style definition a Controller is an object
 *     responsible primarily for event handling. As such TP.core.Controller
 *     instances are typically used in the "controller chain" or attached to
 *     elements via the tibet:ctrl attribute for "responder chain" usage.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Controller');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

/**
 * An optional state machine for the receiver. When a controller has a state
 * machine that instance's current state can be leveraged during signal handling
 * to filter which handlers will be invoked.
 * @type {TP.core.StateMachine}
 */
TP.core.Controller.Inst.defineAttribute('stateMachine');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Controller.Inst.defineMethod('getCurrentState',
function() {

    /**
     * @method getCurrentState
     * @summary Returns the state name of the most specific state of the
     *     receiver's state machine. This is the value of the state for the most
     *     nested state machine, if nested, or the state machine itself.
     * @returns {String} The current most-specific state name.
     */

    var stateMachine;

    stateMachine = this.$get('stateMachine');
    if (TP.isValid(stateMachine)) {
        return stateMachine.getCurrentState();
    }
});

//  ------------------------------------------------------------------------

TP.core.Controller.Inst.defineMethod('getCurrentStates',
function() {

    /**
     * @method getCurrentStates
     * @summary Returns an array of state names, from most specific to least
     *     specific in terms of most-nested child to outer-most state machine.
     * @returns {String[]} The current controller state list.
     */

    var stateMachine;

    stateMachine = this.$get('stateMachine');
    if (TP.isValid(stateMachine)) {
        return stateMachine.getCurrentStates();
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.core.Controller.Inst.defineMethod('getStateMachine',
function() {

    /**
     * Returns the receiver's state machine, if it has one.
     * @returns {TP.core.StateMachine} The receiver's state machine instance.
     */

    return this.$get('stateMachine');
});

//  ------------------------------------------------------------------------

TP.core.Controller.Inst.defineMethod('setStateMachine',
function(aStateMachine) {

    /**
     * Assigns a state machine instance to the receiver. Controllers which have
     *     state machines can leverage the current state as part of their signal
     *     processing to filter handlers based on state.
     * @param {TP.core.StateMachine} aStateMachine The new state machine
     *     instance.
     */

    this.$set('stateMachine', aStateMachine);

    return this;
});

//  ========================================================================
//  TP.core.Application
//  ========================================================================

/**
 * @type {TP.core.Application}
 * @summary TIBET's primary application controller type. All TIBET applications
 *     have an instance of Application as the root of their responder chain. The
 *     main application type is also responsible for handling the various
 *     signals involved in application startup such as AppStart.
 */

//  ------------------------------------------------------------------------

TP.core.Controller.defineSubtype('core.Application');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The 'singleton' of this application's 'application object', normally
//  accessed through 'TP.sys.getApplication()'
TP.core.Application.Type.defineAttribute('singleton');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

/**
 * An array of controller instances which represent the current controller
 * stack. The list always ends with an Application instance which represents
 * the final controller in the responder chain.
 * @type {TP.core.Controller[]}
 */
TP.core.Application.Inst.defineAttribute('controllers');

/**
 * The router type whose route method is used to process client-side routes.
 * @type {TP.core.URIRouter}
 */
TP.core.Application.Inst.defineAttribute('router');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('init',
function(aResourceID, aRequest) {

    /**
     * @method init
     * @summary Initializes a new instance.
     * @param {String} aResourceID The unique identifier for this application.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional request or
     *     hash containing initialization parameters.
     * @returns {TP.core.Application} A new instance.
     */

    this.callNextMethod();

    //  Initialize an empty controller list.
    this.$set('controllers', TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('finalizeGUI',
function() {

    /**
     * @method finalizeGUI
     * @summary Performs any UI presentation work necessary for startup. This
     *     method should be called by the application when it is ready to show
     *     its start GUI.
     * @returns {TP.core.Application} The receiver.
     */

    TP.boot.showUIRoot();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('getControllers',
function(aSignal) {

    /**
     * @method getControllers
     * @summary Returns a list of controllers that are currently active.
     * @param {TP.sig.Signal} aSignal The signal currently being dispatched.
     * @returns {Array} The list of controllers.
     */

    var controllers,
        route,
        routeKey,
        config,
        configInfo,
        controller,
        controllerName,
        defaulted;

    controllers = this.$get('controllers');

    //  Ensure we copy current list and include the application itself as the
    //  final controller in the list.
    controllers = controllers.slice(0);
    controllers.push(this);

    if (!TP.sys.hasStarted()) {
        return controllers;
    }

    route = this.getRouter().getRoute();
    if (TP.isEmpty(route)) {
        return controllers;
    }

    //  See if the value is a route configuration key.
    routeKey = 'route.map.' + route;
    config = TP.sys.cfg(routeKey);

    if (TP.isEmpty(config)) {
        return controllers;
    }

    if (TP.isString(config)) {
        configInfo = TP.json2js(TP.reformatJSToJSON(config));
        if (TP.isEmpty(configInfo)) {
            this.raise('InvalidObject',
                        'Unable to build config data from entry: ' + config);
            return controllers;
        }
    } else {
        configInfo = config;
    }

    //  Try to obtain a controller type name
    controllerName = TP.ifInvalid(configInfo.at(routeKey + '.controller'),
                                    configInfo.at('controller'));
    defaulted = false;

    //  If there was no controller type name entry, default one by concatenating
    //  'APP' with the project and route name and the word 'Controller.
    if (TP.isEmpty(controllerName)) {
        controllerName = 'APP.' +
                            TP.sys.cfg('project.name') +
                            '.' +
                            route.asTitleCase() +
                            'Controller';
        defaulted = true;
    }

    //  See if the controller is a type name.
    controller = TP.sys.getTypeByName(controllerName);

    if (TP.notValid(controller)) {
        //  Note here how we only warn if the controller name was specified and
        //  not generated here.
        TP.ifWarn() && !defaulted ?
            TP.warn('InvalidRouteController', controllerName, ' for ',
                    TP.name(aSignal)) : 0;

        return controllers;
    }

    //  Copy the controllers Array and unshift the new controller onto the front
    //  of it.
    controllers = controllers.slice(0);
    controllers.unshift(controller);

    return controllers;
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('getHistory',
function() {

    /**
     * Returns the current object responsible for managing history for the
     * application, which focuses on history for the UICANVAS window.
     * @returns {TP.core.History} A History object.
     */

    return TP.core.History;
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('getRouter',
function() {

    /**
     * @method getRouter
     * @summary Returns the current router instance used by the application.
     * @return {TP.core.URIRouter} The active router.
     */

    var type,
        name;

    type = this.$get('router');
    if (TP.canInvoke(type, 'route')) {
        return type;
    }

    name = TP.sys.cfg('uri.router');
    type = TP.sys.require(name);

    if (TP.canInvoke(type, 'route')) {
        this.$set('router', type);
        return type;
    }
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('getTheme',
function() {

    /**
     * @method getTheme
     * @summary Returns the current UI theme. The value here is taken from the
     *     tibet.theme configuration flag setting. The value returned by
     *     this method is used as part of computations for loading CSS sheets.
     * @returns {String} The name of the current UI theme.
     */

    return TP.sys.cfg('tibet.theme');
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('popController',
function() {

    /**
     * Pops the current top controller off the controller stack. The application
     * instance will not be removed if it is the only controller remaining.
     * @returns {TP.core.Controller} The controller that was popped.
     */

    var controllers;

    controllers = this.$get('controllers');

    return controllers.shift();
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('pushController',
function(aController) {

    /**
     * Pushes a new controller onto the controller stack. The controller stack
     * is a built-in part of TIBET's "signal responder chain" so managing the
     * controller stack is a key part of managing application event processing.
     * @param {TP.core.Controller} aController The controller to push.
     * @returns {TP.core.Application} The receiver.
     */

    var controllers;

    if (TP.notValid(aController)) {
        return this.raise('InvalidController');
    }

    controllers = this.$get('controllers');
    if (!controllers.contains(aController)) {
        controllers.unshift(aController);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('setControllers',
function(aList) {

    /**
     * @method setControllers
     * @summary Defines the list of controllers that are currently active.
     * @param {Array} aList The new list of controllers.
     * @returns {TP.core.Application} The receiver.
     */

    var controllers;

    controllers = TP.ifInvalid(aList, TP.ac());
    if (!TP.isArray(controllers)) {
        return this.raise('InvalidParameter');
    }

    this.$set('controllers', controllers);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('setTheme',
function(themeName) {

    /**
     * @method setTheme
     * @summary Defines the current application theme. The value provided is
     *     placed on the UICANVAS's body element as the value for data-theme
     *     and an appropriate change signal is triggered for observers to update
     *     if they respond to changes in theme.
     * @param {String} themeName The name of the new theme.
     * @returns {TP.core.Application} The receiver.
     */

    var canvas;

    //  Update the configuration flag that drives the getTheme call.
    TP.sys.setcfg('tibet.theme', themeName);

    //  Update the current canvas to reflect any changes.
    canvas = TP.sys.getUICanvas();
    if (TP.isValid(canvas)) {
        canvas.setTheme(themeName);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('setRouter',
function(aRouter) {

    if (TP.canInvoke(aRouter, 'route')) {
        this.$set('router', aRouter);
    } else {
        return this.raise('InvalidRouter');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('start',
function(aSignal) {

    /**
     * @method start
     * @summary Starts the application, performing any initialization necessary
     *     for startup.
     * @param {TP.sig.AppStart} aSignal The  start signal that triggered out
     *     startup sequence.
     * @returns {TP.core.Application} The receiver.
     */

    // Do any final steps to ensure the UI is ready for operation.
    this.finalizeGUI();

    (function(signal) {

        var elem,
            rootWin,
            homeURL;

        //  Grab the UI root window and focus it if possible.
        if (TP.isElement(elem = signal.at('ApplicationTag'))) {
            if (TP.isWindow(rootWin = TP.nodeGetWindow(elem))) {
                rootWin.focus();
            }
        }

        //  Note that we check and clear sessionStorage here to avoid having any
        //  values set by a bookmark or reload operation on a hooked file from
        //  hanging around and affecting future operations.
        if (window.sessionStorage) {
            homeURL = window.sessionStorage.getItem(
                'TIBET.project.home_page');
            if (TP.notEmpty(homeURL)) {
                //  preserve the value in runtime config to support the
                //  TP.sys.getHomeURL call.
                TP.sys.setcfg('session.home_page', homeURL);

                window.sessionStorage.removeItem('TIBET.project.home_page');
            }
        }

        //  If we're asked to trigger routing on startup do that to properly set
        //  the initial path context.
        if (TP.notEmpty(homeURL)) {
            this.getHistory().pushLocation(homeURL);
        } else if (TP.sys.cfg('route.onstart')) {
            this.getRouter().route(TP.sys.getHomeURL());
        }

        try {
            TP.boot.$setStage('liftoff');
        } finally {
            //  Set our final stage/state flags so dependent
            //  pieces of logic can switch to their "started"
            //  states (ie. no more boot log usage etc.)
            TP.sys.hasStarted(true);
        }

        //  Activate any remote watch logic to enable live-sourcing if flagged.
        if (TP.sys.cfg('boot.context') !== 'phantomjs' &&
                !TP.sys.hasFeature('karma')) {
            TP.core.RemoteURLWatchHandler.activateWatchers();
        }

        //  Signal that everything is ready and that the application did start.
        this.signal('TP.sig.AppDidStart');

    }.bind(this).afterUnwind(aSignal));

    return this;
});

//  ------------------------------------------------------------------------
//  Handlers
//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineHandler('AppStart',
function(aSignal) {

    /**
     * @method handleAppStart
     * @summary A handler that is called when the system has loaded everything
     *     and is ready to activate your TIBET application.
     * @param {TP.sig.AppStart} aSignal The startup signal.
     * @returns {TP.core.Application} The receiver.
     */

    TP.core.Application.get('singleton').start(aSignal);
});

//  ========================================================================
//  TP.core.History
//  ========================================================================

/**
 * @type {TP.core.History}
 * @summary This type provides an interface to the window history for use
 *     in managing history-related events and activities. Its most important
 *     role is in handling low-level onpopstate events and triggering the
 *     application URI routing machinery as well as tracking any back/forward
 *     button operations.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.History');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  tracks the last direction of history traversal recorded.
TP.core.History.Type.defineAttribute('direction', null);

//  the last URI in place prior to any action by the history object. this value
//  is used for comparison during route() calls in the URIRouter.
TP.core.History.Type.defineAttribute('lastURI', null);

//  a list of the locations which this object has traversed.
TP.core.History.Type.defineAttribute('history');

//  the current index in the history list. Note this value may not correspond to
//  the actual browser's view of the world if low-level API has been used.
TP.core.History.Type.defineAttribute('index', 0);

//  an index offset used to help track direction of any operation in progress.
//  Should be null when computation of an offset can't be done properly.
TP.core.History.Type.defineAttribute('offset', null);

//  a flag to turn off onpopstate handing during operations which incorrectly
//  fire it on Chrome et. al.
TP.core.History.Type.defineAttribute('popstate', true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time type initialization.
     */

    //  Install a popstate handler to catch changes due to history API.
    window.addEventListener('popstate',
                            function(evt) {
                                this.onpopstate(evt);
                            }.bind(this), false);

    //  Create a history list the size of the current native list.
    this.$set('history', TP.ac());

    //  Capture initial history location as our starting point.
    this.captureHistory();

    return;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('back',
function() {

    /**
     * @method back
     * @summary Causes the receiver to go back a page in browser history.
     */

    this.set('direction', 'back', false);
    this.set('lastURI', this.getLocation(), false);

    this.getNativeWindow().history.back();

    return;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('captureDocumentLocation',
function(aDocument) {

    /**
     * @method captureDocumentLocation
     * @summary Captures history information from the document provided. This is
     *     typically called in response to document changes in the UICANVAS to
     *     ensure the top-level history reflects the content page.
     * @param {Document} aDocument The native document to capture from.
     * @returns {Array[Object, String, String]} The history entry with state
     *     object, title, and url.
     */

    var loc,
        locParts,
        url,
        urlParts;

    if (!TP.isDocument(aDocument)) {
        this.raise('InvalidDocument');
        return;
    }

    loc = TP.documentGetLocation(aDocument);
    if (TP.isEmpty(loc)) {
        return;
    }

    //  The pushLocation call can handle parameters but it won't get the route
    //  rebuilt from "last" properly so we do that here.
    url = TP.sys.getHistory().getLocation();

    locParts = TP.uriDecompose(loc);
    urlParts = TP.uriDecompose(url);

    if (locParts.at('fragmentPath') === '/') {
        locParts.atPut('fragmentPath', urlParts.at('fragmentPath'));
    }

    loc = TP.uriCompose(locParts);

    return TP.sys.getHistory().pushLocation(loc, true);
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('captureHistory',
function(anIndex) {

    /**
     * @method captureHistory
     * @summary Captures the current state, title, and url data for the browser
     *     at the moment of invocation. Used internally to capture state when
     *     a history event occurs which affects the top URL bar value.
     * @param {Number} [anIndex] The index to update. Default is current index.
     * @returns {Array[Object, String, String]} The history entry with state
     *     object, title, and url.
     */

    var win,
        index,
        state,
        entry,
        title,
        url;

    //  Capture startup history information.
    win = this.getNativeWindow();
    title = win.title || '';
    url = TP.uriNormalize(win.location.toString());

    index = TP.ifInvalid(anIndex, this.get('index'));
    state = {};
    state.index = index;

    entry = TP.ac(state, title, url);

    //  Save the entry as our current entry for current index. This should
    //  update our history list as we traverse back/forth.
    this.get('history').atPut(index, entry);

    if (TP.sys.cfg('log.history')) {
        this.reportLocation();
    }

    return entry;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('forward',
function() {

    /**
     * @method forward
     * @summary Causes the receiver to go forward a page in browser history.
     */

    this.set('direction', 'forward', false);
    this.set('lastURI', this.getLocation(), false);

    this.getNativeWindow().history.forward();

    return;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getHistory',
function() {

    /**
     * @method getHistory
     * @summary Returns the current local history list.
     * @returns {String[]} The current history list.
     */

    return this.$get('history');
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getIndex',
function() {

    /**
     * @method getIndex
     * @summary Returns the current index in the history list.
     * @returns {Number} The current history list index.
     */

    return this.$get('index');
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getLastLocation',
function() {

    /**
     * @method getLastLocation
     * @summary Returns the previous location in the history list, if any.
     * @returns {String} The location at the prior history index.
     */

    var entry;

    //  NOTE we can't use "at()" here since it supports negative indexes and we
    //  may produce one if we're at the start of the list (index 0).
    entry = this.get('history')[this.get('index') - 1];

    if (TP.isValid(entry)) {
        return entry.at(2);
    }
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getLocation',
function() {

    /**
     * @method getLocation
     * @summary Returns the current location in the history list.
     * @returns {String} The location at the current history index.
     */

    var history,
        entry,
        index;

    history = this.get('history');
    index = this.get('index');
    entry = history.at(index);

    if (TP.notValid(entry)) {
        entry = this.captureHistory();
    }

    return entry.at(2);
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getLocationIndexes',
function(aLocation) {

    /**
     * @method getLocationIndexes
     * @summary Returns any array of history indexes where the location can be
     *     found. This is used to inform the updateIndex routine.
     * @param {String} [aLocation] The location to search for. Defaults to the
     *     current native location.
     * @returns {String} The location at the current history index.
     */

    var loc,
        list;

    loc = TP.str(aLocation) || this.getNativeLocation();
    list = TP.ac();

    this.get('history').forEach(
                        function(entry, index) {
                            if (entry.at(2) === loc) {
                                list.push(index);
                            }
                        });

    return list;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getNativeLocation',
function() {

    /**
     * @method getNativeLocation
     * @summary Retrieves the native window location.
     * @returns {String} The current native window location.
     */

    return TP.uriNormalize(this.getNativeWindow().location.toString());
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getNativeState',
function() {

    /**
     * Returns any state object associated with the browser history location.
     * @returns {Object} Any state object associated via pushState or
     *     replaceState for the current browser location.
     */

    return this.getNativeWindow().history.state;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getNativeTitle',
function() {

    /**
     * Returns any title associated with the browser history location.
     * @returns {String} The title of the native window.
     */

    return this.getNativeWindow().title;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getNativeWindow',
function() {

    /**
     * @method getNativeWindow
     * @summary Retrieves the native window the history object manages.
     * @returns {Window} The native window instance.
     */

    return window;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getNextLocation',
function() {

    /**
     * @method getNextLocation
     * @summary Returns the next location in the history list, if any.
     * @returns {String} The location at the next history index.
     */

    var entry;

    entry = this.get('history').at(this.get('index') + 1);

    if (TP.isValid(entry)) {
        return entry.at(2);
    }
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getSize',
function() {

    /**
     * @method getSize
     * @summary Returns the number of entries in the history list.
     * @returns {Number} The number of entries in the local history list.
     */

    return this.get('history').getSize();
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getState',
function() {

    /**
     * Returns any state object associated with the current history location.
     * @returns {Object} Any state object associated via pushState or
     *     replaceState for the current location.
     */

    return this.get('history').at(this.get('index')).at(0);
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getTitle',
function() {

    /**
     * Returns any title associated with the current local history location.
     * @returns {String} Any title associated via pushState or replaceState
     *     for the current location.
     */

    return this.get('history').at(this.get('index')).at(1);
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('go',
function(anOffset) {

    /**
     * @method go
     * @summary Causes the receiver to go to a specific offset from the current
     *     location in window history.
     * @param {Number} anOffset A positive or negative number of pages to go in
     *     the browser history.
     */

    if (!TP.isNumber(anOffset)) {
        return this.raise('InvalidParameter', anOffset);
    }

    //  no-op
    if (anOffset === 0) {
        return;
    }

    this.set('direction', anOffset < 0 ? 'back' : 'forward', false);
    this.set('lastURI', this.getLocation(), false);

    this.getNativeWindow().history.go(anOffset);

    return;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('onpopstate',
function(anEvent) {

    /**
     * @method onpopstate
     * @summary A native browser-level event handler invoked when the user
     *     has changed the window URL through use of the back or forward buttons
     *     or the developer used back(), forward(), go(), or 'location' slot.
     * @param {Event} anEvent The native event that caused this handler to trip.
     */

    var router,
        state,
        loc;

    //  We use a flag to turn off handling on Chrome in particular since it has
    //  a habit of signaling this for a number of incorrect cases.
    if (TP.isFalse(this.get('popstate'))) {
        return;
    }

    state = anEvent.state;
    if (TP.isValid(state)) {
        //  The url is what we really set as content, the 'pushed' value is what
        //  the URL bar was set to (which will often vary for base path usage).
        loc = state.url;
    }
    loc = TP.ifInvalid(loc,
        TP.uriNormalize(anEvent.target.location.toString()));

    //  Just because we got this event doesn't mean location actually changed.
    //  At least one browser will trigger these even if you set the window
    //  location to the same value it currently holds so we have to verify a
    //  true change to avoid extra overhead/duplicate work.
    if (loc === TP.sys.getHistory().getLocation()) {
        return;
    }

    //  The popstate event can come from a number of sources so we need to
    //  ensure we get the right index adjustments in our internal history.
    this.updateIndex(anEvent);

    //  A route has to be '#/' or '#?', so only trigger the router if we see
    //  that pattern.
    if (/#(\/|\?)/.test(loc)) {
        router = TP.sys.getRouter();
        if (TP.isValid(router)) {
            router.route(TP.ifInvalid(state, loc));
        }
        anEvent.preventDefault();
    } else {
        //  This is a link anchor target - act accordingly
        return;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('pushLocation',
function(aURL, fromDoc) {

    /**
     * @method pushLocation
     * @summary Pushes a new URL onto the history stack using the native
     *     pushState operation while keeping a local version of the stack. Note
     *     that URI values which refer to the project home page are translated
     *     so the actual home page location is not pushed, but instead the
     *     project's launch URL is pushed in keeping with the idea of "/".
     * @param {TP.core.URI|String} aURL The location to push onto the history
     *     stack.
     * @param {Boolean} [fromDoc=false] An optional flag signifying the push is
     *     coming from a loaded document handler.
     */

    var url,
        urlParts,
        home,
        launch,
        launchParts;

    if (TP.notValid(aURL)) {
        TP.raise(this, 'TP.sig.InvalidURI');
        return;
    }

    //  For our expansion testing and history tracking we want a fully-expanded
    //  and normalized version of the URL here.
    url = TP.str(aURL);
    url = TP.uriExpandPath(url);
    url = decodeURIComponent(url);

    if (!TP.isURI(url)) {
        TP.raise(this, 'TP.sig.InvalidURI');
        return;
    }

    //  We need launch parameters to be mapped in all cases to avoid changes to
    //  the boot parameters which would otherwise trigger a relaunch.
    launch = TP.sys.getLaunchURL();
    launchParts = TP.uriDecompose(launch);

    //  Convert urls pointing to the home page into their "normalized" form.
    home = TP.uriExpandPath(TP.sys.getHomeURL());
    if (TP.uriHead(url) === TP.uriHead(home)) {
        urlParts = TP.uriDecompose(url);
        urlParts.atPut('basePath', launchParts.at('basePath'));
        urlParts.atPut('baseParams', launchParts.at('baseParams'));
    }

    //  Make sure we can deal with URL parts below.
    urlParts = TP.ifInvalid(urlParts, TP.uriDecompose(url));

    //  For both path and parameters migrate any from the launch URL as long as
    //  we don't overlay anything specific from the inbound URL. NOTE that the
    //  fragmentPath is never "empty", it's "/" when there's no path/route data.
    if (urlParts.at('fragmentPath') === '/') {
        urlParts.atPut('fragmentPath', launchParts.at('fragmentPath'));
    }

    if (TP.isEmpty(urlParts.at('fragmentParams'))) {
        urlParts.atPut('fragmentParams', launchParts.at('fragmentParams'));
    }

    url = TP.uriCompose(urlParts);

    //  Dampening happens in pushState so we can just pass value through.
    return this.pushState({}, '', url, fromDoc);
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('pushState',
function(stateObj, aTitle, aURL, fromDoc) {

    /**
     * @method pushState
     * @summary Replaces the current location of the browser and sets it to an
     *     encoded version of the supplied history value.
     * @param
     * @param
     * @param
     * @param {Boolean} [fromDoc=false] An optional flag signifying the push is
     *     coming from a loaded document handler.
     * @returns {TP.core.History} The receiver.
     */

    var url,
        state,
        current,
        entry,
        index,
        title,
        router,
        result,
        history,
        loc,
        parts,
        basePath,
        pushable;

    if (!TP.isURI(aURL)) {
        TP.raise(this, 'TP.sig.InvalidURI');
        return;
    }

    url = TP.str(aURL);
    current = this.getLocation();
    title = aTitle || '';

    //  Dampen changes that aren't really changes.
    if (current === url) {
        return;
    }

    this.set('direction', 'forward', false);
    this.set('lastURI', current, false);

    //  Update our internal history, and track the index in the state object so
    //  we can update when we get notifications.
    history = this.get('history');
    index = this.get('index');

    //  Truncate the list to current location. This seems consistent with
    //  browser behavior where if you use back() or go(-n) to back up in the
    //  list and then set location='url' you can't go forward, the list ends.
    history.length = index + 1;

    state = stateObj || {};
    state.index = index + 1;
    state.title = title;
    state.url = url;

    entry = TP.ac(state, title, url);
    history.push(entry);

    this.set('index', index + 1);

    //  work around bug(s) on chrome et. al. which fire popstate on pushState
    try {

        this.set('popstate', false);

        if (TP.sys.cfg('log.history')) {
            TP.debug('pushState(' + JSON.stringify(state) +
                    ', \'' + entry.at(1) + '\', \'' + url + '\')');
        }

        loc = top.location.toString();

        //  Compute the right path to push. We don't push changes to the base
        //  URL unless configured explicitly for that feature. In all other
        //  cases we update the fragment path to reflect the base path change.
        if (TP.notFalse(TP.sys.cfg('route.fragment_only')) &&
                        TP.uriHead(loc) !== TP.uriHead(url)) {

            parts = TP.hc();

            //  preserve the current root elements to avoid changing base.
            parts.atPut('root', TP.uriRoot(loc));
            parts.atPut('basePath', TP.uriBasePath(loc));
            parts.atPut('baseParams', TP.uriBaseParameters(loc));

            //  build up the new fragment using the proposed base path and
            //  parameter combination. This will cause the "page path" to
            //  be reflected in the fragment path as if it were a route.
            basePath = TP.uriBasePath(url);
            if (basePath === parts.at('basePath')) {
                parts.atPut('fragmentPath', TP.uriFragmentPath(url));
            } else {
                parts.atPut('fragmentPath', basePath);
            }
            parts.atPut('fragmentParams', TP.uriFragmentParameters(url));

            //  adjust any extension since we don't want to expose those in
            //  route paths.
            if (TP.notEmpty(TP.uriExtension(basePath))) {
                parts.atPut(
                        'fragmentPath',
                        basePath.replace('.' + TP.uriExtension(basePath), ''));
            }

            pushable = TP.uriCompose(parts);
        } else {
            //  Allow the entire URL as proposed to be pushed to native history.
            pushable = url;
        }

        //  Track the ultimately pushed URL separately from the original so we
        //  can tell when we're looking at an adjusted path.
        state.pushed = pushable;

        if (TP.sys.cfg('log.history')) {
            TP.debug('pushState pushing: ' + pushable);
        }

        //  Update the native window history and URL bar value. This will show
        //  the "routable" value but not the actual canvas URI in some cases.
        result = this.getNativeWindow().history.pushState(
                                                state, title, pushable);

        //  If we're here due to a direct change via a document being loaded
        //  don't allow further processing.
        if (TP.isTrue(fromDoc)) {
            return;
        }

        if (/#(\/|\?)/.test(pushable)) {
            router = TP.sys.getRouter();
            if (TP.canInvoke(router, 'route')) {
                router.route(url, 'forward');
            }
        }
    } finally {
        this.set('popstate', true);
    }

    if (TP.sys.cfg('log.history')) {
        this.reportLocation();
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('replaceLocation',
function(aURL) {

    /**
     * @method replaceLocation
     * @summary Replaces the current location of the browser and sets it to an
     *     encoded version of the supplied history value.
     * @param
     * @returns {TP.core.History} The receiver.
     */

    return this.replaceState({}, '', aURL);
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('replaceState',
function(stateObj, aTitle, aURL) {

    /**
     * @method replaceState
     * @summary Replaces the current location of the browser and sets it to an
     *     encoded version of the supplied history value.
     * @param
     * @param
     * @param
     * @returns {TP.core.History} The receiver.
     */

    var url,
        state,
        title,
        index,
        current,
        result,
        entry,
        router,
        history;

    url = TP.str(aURL);
    url = decodeURIComponent(url);
    title = aTitle || '';

    //  Capture this before the replace so we have something to compare.
    current = this.getLocation();

    //  Dampen changes that aren't really changes.
    if (current === url) {
        return;
    }

    this.set('direction', 'replace', false);
    this.set('lastURI', current, false);

    history = this.get('history');
    index = this.get('index');

    state = stateObj || {};
    state.index = index;
    state.title = title;
    state.url = url;

    entry = TP.ac(state, title, url);
    history.atPut(index, entry);

    //  work around bug(s) on chrome et. al. which fire popstate on pushState
    try {
        this.set('popstate', false);

        if (TP.sys.cfg('log.history')) {
            TP.debug('replaceState(' +
                        JSON.stringify(state) +
                        ', \'' + entry.at(1) + '\', \'' + url + '\')');
        }

        result = this.getNativeWindow().history.replaceState(state, title, url);

        router = TP.sys.getRouter();
        if (TP.canInvoke(router, 'route')) {
            router.route(url, 'replace');
        }
    } finally {
        this.set('popstate', true);
    }

    if (TP.sys.cfg('log.history')) {
        this.reportLocation();
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('reportLocation',
function(anIndex) {

    /**
     * @method reportLocation
     * @summary Logs the history location at an index.
     * @param {Number} [anIndex] An index to report, or the current index.
     */

    var index,
        entry,
        native,
        local,
        method;

    native = this.getNativeLocation();
    index = TP.ifInvalid(anIndex, this.get('index'));
    entry = this.get('history').at(index);
    local = entry.at(2);

    if (TP.notFalse(TP.sys.cfg('route.fragment_only'))) {
        //  when using fragment-only updates we'll often fail to match if
        //  alternative pages have been loading in the UICANVAS.
        method = 'debug';
    } else {
        method = local === native ? 'debug' : 'error';
    }

    if (TP.isValid(entry)) {
        TP[method]('history.at(' + index + ') -> ' + local + '.');
    } else {
        TP[method]('history.at(' + index + ') -> ' + 'empty.');
    }
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('setIndex',
function(anIndex) {

    /**
     * @method setIndex
     * @summary Updates the receiver's internal history index to a new offset.
     * @param
     * @raises {TP.sig.InvalidParameter} If index in not a number.
     * @raises {TP.sig.InvalidIndex} If index would be out of range.
     */

    if (!TP.isNumber(anIndex)) {
        return this.raise('InvalidParameter');
    }

    if (anIndex < 0 || anIndex > this.getSize() - 1) {
        return this.raise('InvalidIndex');
    }

    this.$set('index', anIndex);
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('updateIndex',
function(anEvent) {

    /**
     * @method updateIndex
     * @summary Updates the current history index by comparing data for the
     *     current location with known history entries. The event
     * @param {PopStateEvent} anEvent The history PopState event triggering this
     *     update request. The index value of this event, if available, will
     *     identify the new index traversed to.
     * @returns {Number} The new index.
     */

    var last,
        next,
        native,
        history,
        index,
        state,
        stateIndex,
        offset,
        indexes,
        min,
        max,
        len,
        i;

    //  Ensure it's for the window we're watching.
    if (!anEvent || anEvent.target !== this.getNativeWindow()) {
        return this;
    }

    history = this.get('history');
    index = this.get('index');

    //  The state in anEvent may include an index...which would be our
    //  answer. We just need to compute the offset.
    if (TP.isValid(anEvent)) {
        state = anEvent.state;

        if (TP.isValid(state)) {
            stateIndex = state.index;

            if (TP.isNumber(stateIndex)) {
                this.set('offset', stateIndex - index);
            }
        }
    }

    offset = this.get('offset');
    if (TP.isValid(offset)) {

        if (offset > 0) {
            this.set('direction', 'forward');
        } else if (offset === 0) {
            this.set('direction', 'replace');
        } else {
            this.set('direction', 'back');
        }

        this.set('index', index + offset);

        //  Clear the offset so we don't reuse it by accident.
        this.set('offset', null);

        return this.get('index');
    }

    //  Shouldn't be here...all operations should route back through a popstate
    //  event only after we've been able to pushState or somehow otherwise
    //  ensured there's always an offset...but hey, it's a browser :)...

    last = this.getLastLocation();
    next = this.getNextLocation();
    native = this.getNativeLocation();

    if (native === last) {

        if (native !== next) {
            //  back
            this.set('direction', 'back');
            this.set('index', index - 1);
        } else {
            //  in-between a cyclic entry...have to pick one. We go back since
            //  you can always navigate forward by retracing steps, but you
            //  can't get back if we keep forcing a true back "forward".
            TP.warn('Ambiguous history event. Defaulting to back.');

            this.set('direction', 'back');
            this.set('index', index - 1);
        }
    } else if (native === next) {
        //  forward
        this.set('direction', 'forward');
        this.set('index', index + 1);
    } else {
        //  either brand new, or more than one index away...go(n);
        indexes = this.getLocationIndexes(native);

        if (TP.isEmpty(indexes)) {
            //  Never seen it...must be forward.
            history.push(TP.ac({index: index + 1}, '', native));

            this.set('direction', 'forward');
            this.set('index', index + 1);
        } else {
            //  If all indexes are > than ours it's got to be a forward jump. If
            //  they're all < ours it has to be a backward jump.
            min = indexes.getSize() + 1;
            max = -1;

            indexes.forEach(
                    function(ind) {
                        min = Math.min(min, ind);
                        max = Math.max(max, ind);
                    });

            if (min > index) {
                this.set('direction', 'forward');
                this.set('index', index + 1);
            } else if (max < index) {
                this.set('direction', 'back');
                this.set('index', index - 1);
            } else {
                TP.warn('Ambiguous history event. Defaulting to back.');

                this.set('direction', 'back');

                //  Have to locate the index closest to us that's prior to the
                //  current index.
                len = indexes.getSize();
                for (i = 0; i < len; i++) {
                    if (indexes.at(i) < index && indexes.at(i + 1) > index) {
                        stateIndex = indexes.at(i);
                    }
                }

                this.set('index', stateIndex);
            }
        }
    }

    this.captureHistory();

    return this.get('index');
});

//  ========================================================================
//  TP.core.Worker
//  ========================================================================

/**
 * @type {TP.core.Worker}
 * @summary This type provides an interface to the browser's 'worker thread'
 *     capability.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Worker');

//  This type is used as a common supertype, but is not instantiable.
TP.core.Worker.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  a pool of worker objects, keyed by the worker type name. Note that this is a
//  LOCAL attribute
TP.core.Worker.defineAttribute('$workerPoolDict');

//  the maximum number of workers allowed in the pool for this type
TP.core.Worker.Type.defineAttribute('$maxWorkerCount');

//  the total number of workers currently allocated for this type
TP.core.Worker.Type.defineAttribute('$currentWorkerCount');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Worker.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Initializes the type.
     */

    this.set('$workerPoolDict', TP.hc());

    return;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Type.defineMethod('getWorker',
function() {

    /**
     * @method getWorker
     * @summary Returns a worker either from a pool of workers that exist for
     *     the type being messaged or a new worker, if no workers are available
     *     in the pool for the receiving type.
     * @returns TP.core.Worker A worker of the type being messaged.
     */

    var poolDict,
        pool,

        worker;

    //  The dictionary of pools is on the TP.core.Worker type itself as a type
    //  local.
    poolDict = TP.core.Worker.get('$workerPoolDict');

    //  See if there is a pool for this receiving type, keyed by its name (the
    //  type name). If not, create one and register it.
    if (TP.notValid(pool = poolDict.at(this.getName()))) {
        pool = TP.ac();
        poolDict.atPut(this.getName(), pool);
        this.set('$currentWorkerCount', 0);
    }

    //  If there are workers available for this receiving type, use one of them.
    if (TP.notEmpty(pool)) {
        worker = pool.shift();
    } else if (this.get('$currentWorkerCount') < this.get('$maxWorkerCount')) {
        //  Otherwise, if the current worker count is less than the max worker
        //  count for this type, then go ahead and construct one and bump the
        //  current count.
        worker = this.construct();
        this.set('$currentWorkerCount', this.get('$currentWorkerCount') + 1);
    } else {
        //  Otherwise, the pool was empty and if we allocated another worker
        //  we'd be over our max limit, so we warn.
        TP.ifWarn() ?
            TP.warn('Maximum number of workers reached for: ' +
                    this.getName() +
                    '.') : 0;
    }

    return worker;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Type.defineMethod('repoolWorker',
function(worker) {

    /**
     * @method repoolWorker
     * @summary Puts the supplied Worker into the pool for the receiving type.
     * @param {TP.core.Worker} worker The worker to put into the pool.
     * @returns TP.meta.core.Worker The receiver.
     */

    var poolDict,
        pool;

    //  The dictionary of pools is on the TP.core.Worker type itself as a type
    //  local.
    poolDict = TP.core.Worker.get('$workerPoolDict');

    //  See if there is a pool for this receiving type, keyed by its name (the
    //  type name). If not, create one and register it.
    if (TP.notValid(pool = poolDict.at(this.getName()))) {
        pool = TP.ac();
        poolDict.atPut(this.getName(), pool);
    }

    //  Put the worker into the pool, ready to be used again.
    pool.push(worker);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  a worker thread object used by this object to interface with the worker
//  thread.
TP.core.Worker.Inst.defineAttribute('$workerThreadObj');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initializes a new instance of the receiver.
     * @returns {TP.core.Worker} A new instance.
     */

    var workerHelperURI,
        workerThread;

    //  construct the instance from the root down
    this.callNextMethod();

    //  Initialize the worker thread with the worker helper stub.
    workerHelperURI = TP.uc('~lib_etc/workers/tibet_worker_helper.js');
    workerThread = new Worker(workerHelperURI.getLocation());

    this.set('$workerThreadObj', workerThread);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('eval',
function(jsSrc) {

    /**
     * @method eval
     * @summary Evaluates the supplied JavaScript source code inside of the
     *     worker thread that this object represents.
     * @param {String} jsSrc The source code to evaluate inside of the worker.
     * @returns Promise A promise that will resolve when the evaluation is
     *     complete.
     */

    var workerThread,
        newPromise;

    if (TP.isEmpty(jsSrc)) {
        return this.raise('InvalidParameter', 'No source code provided.');
    }

    workerThread = this.get('$workerThreadObj');

    //  Construct a Promise around sending the supplied source code to the
    //  worker for evaluation.
    newPromise = TP.extern.Promise.construct(
        function(resolver, rejector) {

            workerThread.onmessage = function(e) {

                //  Run the Promise resolver with the data returned in the
                //  message event.
                return resolver(e.data);
            };

            workerThread.onerror = function(e) {

                var err;

                //  Convert from an ErrorEvent into a real Error object
                err = new Error(e.message, e.filename, e.lineno);

                //  Run the Promise rejector with the Error object constructed
                //  from the data returned in the error event.
                return rejector(err);
            };

            //  Post a message telling the worker helper stub code loaded into
            //  the thread to evaluate the supplied source code.
            workerThread.postMessage({
                funcRef: 'evalJS',      //  func ref in worker
                thisRef: 'self',        //  this ref in worker
                params: TP.ac(jsSrc)    //  params ref - JSONified structure
            });
        });

    return newPromise;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('import',
function(aCodeURL) {

    /**
     * @method import
     * @summary Imports the JavaScript source code referred to by the supplied
     *     URL into the worker thread that this object represents.
     * @param {TP.core.URL|String} aCodeURL The URL referring to the resource
     *     containing the source code to import inside of the worker.
     * @returns Promise A promise that will resolve when the importation is
     *     complete.
     */

    var url,

        workerThread,
        newPromise;

    if (!TP.isURI(aCodeURL)) {
        return this.raise('InvalidURL',
                            'Not a valid URL to JavaScript source code.');
    }

    url = TP.uc(aCodeURL).getLocation();

    workerThread = this.get('$workerThreadObj');

    newPromise = TP.extern.Promise.construct(
        function(resolver, rejector) {

            workerThread.onmessage = function(e) {

                //  Run the Promise resolver with the data returned in the
                //  message event.
                return resolver(e.data);
            };

            workerThread.onerror = function(e) {

                var err;

                //  Convert from an ErrorEvent into a real Error object
                err = new Error(e.message, e.filename, e.lineno);

                //  Run the Promise rejector with the Error object constructed
                //  from the data returned in the error event.
                return rejector(err);
            };

            //  Post a message telling the worker helper stub code loaded into
            //  the thread to import source code from the supplied URL.
            workerThread.postMessage({
                funcRef: 'importJS',    //  func ref in worker
                thisRef: 'self',        //  'this' ref in worker
                params: TP.ac(url)      //  params ref - JSONified structure
            });
        });

    return newPromise;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('defineWorkerMethod',
function(name, body, async) {

    /**
     * @method defineWorkerMethod
     * @summary Defines a method inside of the worker represented by the
     *     receiver and a peer method on the receiver that calls it, thereby
     *     presenting a seamless interface to it. The peer method will return a
     *     Promise that will resolve when the worker has posted results back for
     *     that call.
     * @param {String} name The name of the method.
     * @param {Function} body The body of the method.
     * @param {Boolean} async Whether or not the method is itself asynchronous.
     *     If so, it is important that it be written in such a way to take a
     *     callback as it's last formal parameter. In that way, it can inform
     *     the worker it is done and the worker can post the results back to
     *     this object. The default is false.
     * @returns Promise A promise that will resolve when the definition is
     *     complete.
     */

    var methodSrc,
        isAsync,

        promise;

    if (TP.isEmpty(name)) {
        return this.raise('InvalidString', 'Invalid method name');
    }

    if (!TP.isCallable(body)) {
        return this.raise('InvalidFunction', 'Invalid method body');
    }

    //  Get the source of the method body handed in and prepend
    //  'self.<methodName>' onto the front.
    methodSrc = 'self.' + name + ' = ' + body.toString();

    isAsync = TP.ifInvalid(async, false);

    //  Use our 'eval' method to evaluate the code. This is *not* the regular JS
    //  'eval' global call - this method evaluates the code over in worker
    //  thread and returns a Promise that will resolve when that is done.
    promise = this.eval(methodSrc);

    //  Attach to the Promise that was returned from evaluating the code.
    promise.then(
        function() {

            var peerMethod;

            //  Now, define that method on *this* object to call over into the
            //  worker thread to invoke what we just eval'ed over there.
            peerMethod = function() {
                var args,
                    workerThread,
                    newPromise;

                args = Array.prototype.slice.call(arguments);

                workerThread = this.get('$workerThreadObj');

                newPromise = TP.extern.Promise.construct(
                    function(resolver, rejector) {

                        workerThread.onmessage = function(e) {

                            var data;

                            //  Run the Promise resolver with the result data
                            //  returned in the message event (if there is
                            //  result data).
                            data = JSON.parse(e.data);
                            if (TP.isValid(data)) {
                                return resolver(data.result);
                            }

                            //  No result data - so just call the resolver.
                            return resolver();
                        };

                        workerThread.onerror = function(e) {

                            var err;

                            //  Convert from an ErrorEvent into a real Error
                            //  object
                            err = new Error(e.message, e.filename, e.lineno);

                            //  Run the Promise rejector with the Error object
                            //  constructed from the data returned in the error
                            //  event.
                            return rejector(err);
                        };

                        workerThread.postMessage({
                            funcRef: name,      //  func ref in worker
                            thisRef: 'self',    //  this ref in worker
                            params: args,       //  params ref - JSONified
                                                //  structure
                            async: isAsync
                        });
                    });

                return newPromise;
            };

            //  Install that method on ourself.
            this.defineMethod(name, peerMethod);
        }.bind(this));

    return promise;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('repool',
function() {

    /**
     * @method repool
     * @summary Puts the receiver into the pool for its type.
     * @returns TP.core.Worker The receiver.
     */

    this.getType().repoolWorker(this);

    return this;
});

//  ========================================================================
//  TP.core.LESSWorker
//  ========================================================================

/**
 * @type {TP.core.LESSWorker}
 * @summary A subtype of TP.core.Worker that manages a LESSCSS engine.
 */

//  ------------------------------------------------------------------------

TP.core.Worker.defineSubtype('core.LESSWorker');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  used to 'initialize' the worker since LESSCSS makes some assumptions on
//  startup which are not valid for our environment (i.e. trying to process
//  LESS stylesheets found on the document - a web worker has no DOM environment
//  of any kind).
TP.core.LESSWorker.Type.defineConstant('SETUP_STRING',
'window = self; window.document = { getElementsByTagName: function(tagName) { if (tagName === "script") { return [{dataset: {}}]; } else if (tagName === "style") { return []; } else if (tagName === "link") { return []; } } };');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.LESSWorker.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Initializes the type.
     */

    //  We allocate a maximum of 2 workers in our pool to compile LESS.
    this.set('$maxWorkerCount', 2);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  a worker thread object used by this object to interface with the worker
//  thread.
TP.core.LESSWorker.Inst.defineAttribute('$workerIsSettingUp');

//  the Promise kept by this worker that will be used for chaining chunks of
//  asynchronous work together.
TP.core.LESSWorker.Inst.defineAttribute('$workerPromise');

//  ------------------------------------------------------------------------

TP.core.LESSWorker.Inst.defineMethod('compile',
function(srcText, options) {

    /**
     * @method compile
     * @summary Compiles the supplied LESS source text into regular CSS.
     * @param {String} srcText The LESS source text to compile.
     * @param {TP.core.Hash} options Options to the LESS engine. This is
     *     optional.
     * @returns Promise A promise that will resolve when the compilation is
     *     complete.
     */

    var opts,
        resultFunc,

        workerPromise;

    if (TP.isEmpty(srcText)) {
        return this.raise('InvalidString', 'Invalid LESSCSS source text');
    }

    if (TP.notEmpty(options)) {
        opts = options.asObject();
    } else {
        opts = {};
    }

    //  Define a Function that will process the result.
    resultFunc =
        function(results) {
            var error,
                output,
                resultOpts;

            error = results[0];
            output = results[1];
            resultOpts = results[2];

            if (TP.notEmpty(error)) {
                TP.ifError() ?
                    TP.error('Error processing LESSCSS: ' +
                        TP.str(error)) : 0;
                return;
            }

            return TP.hc('css', output.css,
                            'imports', output.imports,
                            'compilationOptions', TP.hc(resultOpts));
        };

    workerPromise = this.get('$workerPromise');

    //  If our worker isn't set up, do so and then call our 'compileLESS' method
    //  that will dispatch over into the worker.
    if (TP.notValid(workerPromise) &&
        TP.notTrue(this.get('$workerIsSettingUp'))) {

        //  Flip our flag so that we don't do this again. We only flip this to
        //  true once and don't flip it back so that the test above only
        //  succeeds once.
        this.set('$workerIsSettingUp', true);

        //  Evaluate the setup String, then import the copy of LESSCSS in the
        //  dependencies directory, then define a worker method that will
        //  'render' the LESSCSS code we hand to it (automagically sent over to
        //  the worker by this type).
        workerPromise = this.eval(this.getType().SETUP_STRING).then(
            function() {

                //  Import the LESS library
                return this.import(TP.uc('~lib_deps/less-tpi.min.js'));
            }.bind(this)).then(
            function() {

                //  Define the compilation 'worker method'. Note that worker
                //  methods actually get shipped over to the worker thread, so
                //  they can't contain TIBETisms. Also worker methods return a
                //  Promise, which we leverage below.

                /* eslint-disable no-undef,no-shadow */
                return this.defineWorkerMethod(
                        'compileLESS',
                        function(lessSrc, options, callback) {
                            var cb;

                            //  Define a callback that will return any error,
                            //  any result and the original options we hand it.
                            cb = function(err, res) {
                                callback(err, res, options);
                            };

                            window.less.render(lessSrc, options, cb);
                        },
                        true);
                /* eslint-enable no-undef,no-shadow */
            }.bind(this)).then(
            function() {
                //  Then run the compilation 'worker method'.
                return this.compileLESS(srcText, opts).
                                    then(function(results) {

                                        //  After this is executed, the worker
                                        //  is no longer setting up.
                                        this.set('$workerIsSettingUp', false);

                                        //  Return the worker to the pool when
                                        //  we're done, and make sure to pass
                                        //  along the results to the result
                                        //  function.
                                        this.repool();

                                        return results;
                                    }.bind(this)).then(resultFunc);
            }.bind(this));
    } else {

        //  Otherwise, the worker is set up - just run the compilation 'worker
        //  method'.
        workerPromise = workerPromise.then(
                function() {

                    return this.compileLESS(srcText, opts).
                                    then(function(results) {

                                        //  Return the worker to the pool when
                                        //  we're done, and make sure to pass
                                        //  along the results to the result
                                        //  function.
                                        this.repool();

                                        return results;
                                    }.bind(this)).then(resultFunc);
                }.bind(this));
    }

    //  Capture the worker Promise so that we can continue to chain onto it.
    this.set('$workerPromise', workerPromise);

    //  If the current worker count is equal to our max worker count, we repool
    //  ourselves as we're the last worker available, but we do have the
    //  capability to continue chaining onto the worker Promise.
    if (this.getType().get('$currentWorkerCount') ===
        this.getType().get('$maxWorkerCount')) {
        this.repool();
    }

    //  Return the worker Promise so that more things can be chained onto it.
    return workerPromise;
});

//  ========================================================================
//  TIBET convenience methods
//  ========================================================================

TP.sys.defineMethod('getApplication',
function() {

    /**
     * @method getApplication
     * @summary Retrieves the application singleton object.
     * @returns {TP.core.Application} The receiver.
     */

    var inst;

    //  Don't let this return null. Always build a default instance.
    inst = TP.core.Application.get('singleton');
    if (TP.notValid(inst)) {
        inst = TP.core.Application.construct();
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getHistory',
function() {

    /**
     * @method getHistory
     * @summary Retrieves the application history object.
     * @returns {TP.core.History} The TIBET history object.
     */

    return this.getApplication().getHistory();
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getRoute',
function() {

    /**
     * @method getRoute
     * @summary Retrieves the current application route name.
     * @returns {String} The current route.
     */

    return this.getRouter().getRoute();
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getRouter',
function() {

    /**
     * @method getRouter
     * @summary Retrieves the application uri router.
     * @returns {TP.core.History} The TIBET router.
     */

    return this.getApplication().getRouter();
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('setRoute',
function(aRoute) {

    /**
     * @method setRoute
     * @summary Updates the fragment path portion which defines the current
     *     route in TIBET terms. Any boot parameters on the existing URL are
     *     preserved by this call.
     * @discussion Routes in TIBET are signified by the "fragment path" portion
     *     of the URI which we define as the section of the URI fragment prior
     *     to any '?' which sets off the "fragment parameters" (aka boot
     *     parameters). Changes to this section of the URI result in a Route
     *     signal being fired so application logic can respond to route changes.
     * @param {String} aRoute The route information.
     * @returns {String} The current route.
     */

    return this.getRouter().setRoute(aRoute);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

