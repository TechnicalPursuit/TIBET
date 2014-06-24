//  ========================================================================
/*
NAME:   TIBETWorkflowTypes.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

/*
//  ---
//  introduction
//  ---

Part of the vision for TIBET is that it can help seamlessly integrate the
web browser into workflow-driven applications. This vision is most clearly
seen in TIBET's "workflow types" and support for the XMPP messaging (aka
signaling) protocol standardized by the IETF.

By leveraging XMPP servers as "event routers" we can allow business events
to move between server-side workflow systems and the web browser as if the
client and server were "chatting" about those business events. When IM/chat
data arrives at the client TIBET is able to deserialize TP.sig.Signal
content and trigger it to drive client-side logic.

More structured conversations require a slightly more structured approach.
Rather than simply awaiting unsolicited events from the server the client
often needs to make one or more requests whose responses must be coordinated
and potentially "joined" to drive the application forward.

The types in this file provide support for managing requests and responses
in a unified fashion regardless of the targeted resource and regardless of
whether the invocation is synchronous or asynchronous. Also included are
types that help manage permission-based functionality. Additional support
for workflow-related activity is found in the tibet/workflow module.

//  ---
//  workflow terms
//  ---

To make sure we're all working from the same starting point let's look at
a few definitions from the Workflow Management Coalition...

Workflow revolves around processing individual 'cases' in a meaningful way.
This is accomplished by moving each case through a 'process' made up of one
or more 'tasks'. In workflow terms, a task is a script for how to perform
a transactionally consistent unit of work. The events which drive workflow
processes through a series of tasks are known as 'triggers'.

A specific invocation of a task in response to a trigger is known as an
'activity'; however, before an activity can occur a 'work item', a request
binding a specific task to a specific case, must be constructed. This work
item can then be 'allocated' to an appropriate 'resource' capable of
performing the work.

To assist with resource allocation individual resources are often assigned
to groups.  When the group is functionally-oriented it is referred to as a
'role'. When it is organizationally-oriented it is known as a 'unit' (short
for organizational unit (i.e. "sales").

TIBET takes a very event-driven view of all this, mapping as much of the
workflow model just described into its object and signaling systems:

'case'          ->  Object (any object can represent a case to be processed)
'process'       ->  A defined/designed series of signals and their handlers
'task'          ->  A handler function (the template for doing atomic work)
'trigger'       ->  TP.sig.Signal (Change, TP.sig.Request, UISignal, etc)
'activity'      ->  A specific signal handler invocation
'work item'     ->  TP.sig.Request (i.e. "please perform a task on this
                    case")
'allocation'    ->  A lookup/binding of a specific TP.core.Resource to a
                    TP.sig.Request
'resource'      ->  Any object primarily responsible for servicing requests

In essence, when you need to make a request you can leverage a common
supertype, or create a specific subtype to manage that process. Likewise you
can create custom response types when there's advanced result manipulation
that you need to organize. The rest of the process is handled automatically
by TIBET's signaling system and the request/response matching that happens
automatically via the TP.core.Resource, TP.sig.Request, and TP.sig.Response
base types.

Signal "coalescers" allow you to wait for all signals/requests in a group
to complete, or for one of several alternative signals to complete, before
signaling themselves -- offering a signal-based way to join one or more
asynchronous requests with very little effort. These types provide one way
to manage the concept of "joins" within a workflow process with signals
providing the triggering logic based on state change, timers, etc.

//  ---
//  keys and keyrings
//  ---

A common requirement in resource allocation is that work items be assigned
to resources which have not only the ability, but permission, to perform
the work. In web interfaces this shows up in terms of how different pages,
or portions of a page, are hidden from users without permission to view
and/or modify certain data. This can happen due to "provisioning"
differences (you didn't buy that module), or data security restrictions.

From an authoring perspective it's problematic to define completely separate
pages to deal with all but the largest-grained cases. What we wanted TIBET
to support was something that would allow you to place permission
requirements on various UI elements and have the UI adjust -- preferably by
using nothing more than standard CSS.

To support easier construction of permission-sensitive UI TIBET uses the
concept of "keys" and "key rings". A "key" in this context is any string you
like, usually a two to four letter mnemonic for some permission. For
example, you might assign 'SLF' to the permission 'store local files'.
A collection of such keys, along with their full descriptions, is called a
"key ring". The intersection of the current user's keys and the various key
requirements you've authored on your UI element can be leveraged by CSS
selectors to alter the UI without the need for custom JavaScript logic.

//  ---
//  roles and units
//  ---

As mentioned earlier, workflow systems organize functional elements into
"roles" and organizational elements into "units". TIBET uses these elements
in managing permission-based behavior.

Key rings, which represent permissions in TIBET, are always associated
directly with a role or unit, and only indirectly with a user by way of the
role(s) and unit(s) to which they are assigned. This assignment is made by
assigning a vCard containing role and unit information to a TP.core.User
instance.
As a result of this assignment TIBET will dynamically load and associate
the vCard's role and unit information with that user.

Permission-based behavior, logic in the application that differs based on
the user's role or unit affiliations, is managed in a similar fashion. Since
the role and user data is managed via types you can alter not only a set of
keys but the actual methods which are invoked based on role and/or unit.

When any role/unit-driven resource (service) is asked to perform a task it
delegates some of that responsiblity to the current role and unit types.
This happens automatically, allowing you to focus on messaging the resource
in a common way, while benefiting from permission-specific functionality.

//  ---
//  real vs. effective users
//  ---

One additional issue around permissions is that a number of applications
require the user to shift between roles of various permission levels. For
example,  developers, quality assurance personnel, operations personnel, and
administrators often need to emulate other users who have fewer permissions.
If this kind of emulation isn't managed properly it's possible for the user
to "lose permissions" during certain transitions and find some of their
control surfaces (user interface elements) are no longer accessible to them.

To deal with this common situation TIBET takes a cue from UNIX permissions
and allows both a "real" and "effective" user to be defined. The currently
defined real user determines the "real role" and "real unit", while the
current effective user determines the effective role and effective unit.

While many applications won't construct more than one user instance, hence
having the same real and effective user, those applications that need more
control can get it simply by creating a second TP.core.User instance and
associating it with the appropriate vCard(s).

As you shift between user profiles TIBET automatically updates the body
element of all open windows (at least those under TIBET's control) to
contain the user's real and effective keys. This augmentation of the body
element provides a hook that you can leverage in your CSS to automatically
control the display of the UI, showing or hiding elements as appropriate to
the current user.  More advanced transitions can be managed by simply
observing changes to the current user.

//  ---
//  security
//  ---

Obviously all this talk about permissions, keys, etc. is focused primarily
on managing the user interface in a meaningful way for the current user. As
always the server should validate user credentials with each SOA call to
ensure that the user has permission to perform those server-side calls. The
value in TIBET's permission system is simply that it pushes much of the
common UI-specific permission-related work to the CSS and markup rather than
requiring custom JavaScript simply to show/hide UI.

If your security requirements need to go even further and conceal the fact
that certain UI elements exist when a user doesn't have permission to access
the data it's easy to factor those out into separately xi:include sections
which return permission-specific content. You can alternatively use
different types to drive custom behavior to build those elements for users
with permission. This approach can be taken as far as vending a different
application manifest for different user role/unit affiliations.
*/

//  ========================================================================
//  TP.core.Resource
//  ========================================================================

/**
 * @type {TP.core.Resource}
 * @synopsis Root type for TIBET resources.
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

TP.lang.Object.defineSubtype('core:Resource');

//  add sync and async mode support along with necessary constants.
TP.core.Resource.addTraitsFrom(TP.core.SyncAsync);

//  Resolve the traits right away as subtypes of this type are used during the
//  booting process.
TP.core.Resource.executeTraitResolution();

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  keep a hash of all resource instances, by ID. this helps to ensure
//  we only construct one of each resource ID.
TP.core.Resource.Type.defineAttribute('instances', TP.hc());

//  the combination of origins/signals defining the triggers we observe.
//  note that the defaults are declared at the type level but each instance
//  can alter these as it chooses
TP.core.Resource.Type.defineAttribute('triggerOrigins');
TP.core.Resource.Type.defineAttribute('triggerSignals');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Resource.Type.defineMethod('addResource',
function(aResource) {

    /**
     * @name addResource
     * @synopsis Adds a new resource instance to the global resource hash.
     * @param {TP.core.Resource} aResource The resource to add.
     */

    if (TP.notValid(aResource)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    if (this.getResourceById(aResource.get('resourceID'))) {
        return this.raise('TP.sig.NonUniqueID', arguments);
    }

    return this.get('instances').atPut(
                                aResource.get('resourceID'), aResource);
});

//  ------------------------------------------------------------------------

TP.core.Resource.Type.defineMethod('construct',
function(resourceID) {

    /**
     * @name construct
     * @synopsis Constructs a new instance of the receiver. If the resourceID
     *     provided is a duplicate an exception is thrown.
     * @param {TP.core.Resource} aResource The resource to add.
     * @raises TP.sig.NonUniqueID
     */

    var inst;

    //  no id means no resource instance
    if (TP.notValid(resourceID)) {
        return this.raise('TP.sig.InvalidResourceID', arguments);
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
     * @name getResourceById
     * @synopsis Returns the resource instance with the given ID.
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

//  the resource's current request list
TP.core.Resource.Inst.defineAttribute('requests');

//  these default to the values installed on the type, but can be altered
//  at the instance level
TP.core.Resource.Inst.defineAttribute('triggerOrigins');
TP.core.Resource.Inst.defineAttribute('triggerSignals');

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
     * @name init
     * @synopsis Initializes a new instance of the receiver.
     * @param {String} resourceID A unique TIBET identifier. By unique we mean
     *     an ID which will not conflict with any other ID registered using
     *     TIBET's object registration methods.
     * @raises TP.sig.InvalidResourceID
     * @returns {TP.core.Resource} A new instance.
     */

    //  construct the instance from the root down
    this.callNextMethod();

    //  our public name is our resource ID
    this.setID(resourceID);

    //  get our request hash set up
    this.$set('requests', TP.hc());

    //  try to locate a matching vcard

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('acceptRequest',
function(aRequest) {

    /**
     * @name acceptRequest
     * @synopsis Does the work necessary to ensure that the receiver and the
     *     request are properly associated via responder links etc.
     * @param {TP.sig.Request} aRequest The request to accept.
     * @returns {TP.core.Resource} The receiver.
     */

    //  keep track of the fact that we're working on this request
    this.addRequest(aRequest);

    //  make sure the request can get back to us as the resource which
    //  responded to the request
    aRequest.set('responder', this);

    //  set the request's status code so we keep observers informed
    aRequest.isActive(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('addRequest',
function(aRequest) {

    /**
     * @name addRequest
     * @synopsis Adds the request to the resource's request list for the
     *     duration of processing. If the receiver isn't 'idle' this method will
     *     fail.
     * @param {TP.sig.Request} aRequest The request to process.
     * @raises TP.sig.InvalidRequest
     * @returns {TP.core.Resource} The receiver.
     */

    this.get('requests').atPut(aRequest.getRequestID(), aRequest);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('getAccessKeys',
function() {

    /**
     * @name getAccessKeys
     * @synopsis Returns the receiver's permission keys, based on any vCard that
     *     may have been assigned.
     * @returns {TP.lang.Hash} The receiver's permission keys.
     */

    var keys,
        vcard;

    if (TP.isValid(vcard = this.getVCard())) {
        keys = vcard.getAccessKeys();
    } else {
        keys = TP.ac();
    }

    return keys;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('getPrimaryRole',
function() {

    /**
     * @name getPrimaryRole
     * @synopsis Returns the primary role, the first role in the receiver's
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
     * @name getPrimaryUnit
     * @synopsis Returns the primary unit, the _last_ unit in the receiver's
     *     vCard, if any.
     * @description Note the subtle distinction here. Units are normally defined
     *     in hierarchy order, so the first unit is actually the least specific
     *     one. For that reason we return the last unit in line as the primary
     *     (most-specific) unit.
     * @returns {TP.core.Role} A subtype of TP.core.Role.
     */

    var vcard;

    if (TP.isValid(vcard = this.getVCard())) {
        return vcard.getRoles().last();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('getResourceID',
function() {

    /**
     * @name getResourceID
     * @synopsis Returns the unique resource identifier for the receiver.
     * @returns {String}
     */

    return this.getID();
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('getTriggerOrigins',
function() {

    /**
     * @name getTriggerOrigins
     * @synopsis Returns one or more origins for the TIBET signaling system
     *     which should cause the receiver to respond to requests.
     * @description The trigger origins are typically null meaning any origin is
     *     valid and responsiveness depends on the signal type. You can override
     *     this for specific instances so that a particular resource is focused
     *     on responding to a particular requestor.
     * @returns {Object}
     */

    var origins;

    if (TP.notValid(origins = this.$get('triggerOrigins'))) {
        return this.getType().get('triggerOrigins');
    }

    return origins;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('getTriggerSignals',
function() {

    /**
     * @name getTriggerSignals
     * @synopsis Returns one or more trigger signals for the TIBET signaling
     *     system which should cause the receiver to respond to requests. The
     *     trigger signals default based on the receiver's type.
     * @returns {Object}
     * @todo
     */

    var signals;

    if (TP.notValid(signals = this.$get('triggerSignals'))) {
        return this.getType().get('triggerSignals');
    }

    return signals;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('getVCard',
function() {

    /**
     * @name getVCard
     * @synopsis Returns the receiver's vCard, if one has been set.
     * @returns {TP.vcard_temp.vCard} A TIBET vCard wrapper element.
     */

    return this.$get('vCard');
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('handle',
function(aSignal) {

    /**
     * @name handle
     * @synopsis Handles notification of an incoming signal.
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
    handler = this.getHandler(request, true);
    if (TP.isCallable(handler)) {
        try {
            this.acceptRequest(request);

            return handler.apply(this, arguments);
        } catch (e) {
            TP.ifError() ?
                TP.error(TP.ec(e, 'Error in handler: ' + TP.str(handler)),
                            TP.LOG, arguments) : 0;

            return;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('handleRequest',
function(aRequest) {

    /**
     * @name handleRequest
     * @synopsis Default request-type handling method. Intended to be overridden
     *     in specific resource subtypes, or to have a more specific handler
     *     catching requests before they reach this default handler.
     * @description When a handle call is received the search for a handler
     *     proceeds through the type hierarchy of the request and terminates at
     *     handleRequest. This implementation raises a MissingOverride
     *     Exception.
     * @param {TP.sig.Request} aRequest The request to be serviced.
     * @returns {TP.sig.Response}
     * @todo
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('hasAccessKey',
function(aKey) {

    /**
     * @name hasAccessKey
     * @synopsis Returns true if the receiver has the access key provided by
     *     virtue of their current vCard assignment.
     * @returns {Boolean} True if the receiver's vCard data includes the key
     *     provided.
     */

    return this.getAccessKeys().contains(aKey);
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('isAvailable',
function(aRequest) {

    /**
     * @name isAvailable
     * @synopsis Returns true if the receiver is available to service the
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
     * @name isEnabled
     * @synopsis Returns a boolean defining whether the receiver is runnable. If
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
     * @name isRegistered
     * @synopsis Returns a boolean defining whether the receiver has registered
     *     to observe its triggers. Resources only need to register if they are
     *     going to be triggered by signals rather than by direct invocation.
     * @param {Boolean} aFlag A new value for this property. Optional.
     * @returns {Boolean}
     * @todo
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
     * @name isTargeted
     * @synopsis Returns a boolean defining whether the receiver matches the
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
     * @name populateMissingVCardData
     * @synopsis Populates any missing parameters in the request from the
     *     receiver's vCard.
     * @description This method uses the information in the supplied 'parameter
     *     info' to perform this process. This hash has the following format:
     *
     *     TP.hc('<name_of_param>', TP.ac('<vCard_name>', <prompt_message>'));
     *
     *
     * @param {TP.lang.Hash} aParamInfo A parameter info hash that contains
     *     information on how to populate the request from the vCard.
     * @param {TP.sig.Request} aRequest The request to populate.
     * @returns {TP.core.URIService} The receiver.
     * @todo
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
     * @name register
     * @synopsis Registers the receiver observe its trigger signals so that
     *     requests will cause activation of the service.
     * @returns {TP.core.Resource} The receiver.
     */

    var origins,
        signals,

        i,
        j;

    //  let TIBET know who we are
    TP.sys.registerObject(this);

    origins = this.get('triggerOrigins') || TP.ANY;
    signals = this.get('triggerSignals') || 'TP.sig.Request';

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

    //  update our internal registration flag
    this.isRegistered(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('removeRequest',
function(aRequest) {

    /**
     * @name removeRequest
     * @synopsis Removes the request from the resource's list of currently
     *     active requests.
     * @param {TP.sig.Request} aRequest
     * @raises TP.sig.InvalidRequest
     * @returns {TP.core.Resource} The receiver.
     */

    //  make sure it can respond properly
    if (!TP.canInvoke(aRequest, 'getRequestID')) {
        return this.raise('TP.sig.InvalidRequest', arguments);
    }

    //  remove the request using its ID
    this.get('requests').removeKey(aRequest.getRequestID());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('setVCard',
function(aVCard) {

    /**
     * @name setVCard
     * @synopsis Sets the VCard description for the resource.
     * @param {TP.vcard_temp.vCard} aVCard The vCard description for the
     *     resource.
     * @returns {TP.core.Resource} The receiver.
     */

    this.$set('vCard', aVCard);

    //  altering the vCard may alter role and unit which affect uri filters
    TP.sys.setcfg('tibet.uriprofile', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Resource.Inst.defineMethod('unregister',
function() {

    /**
     * @name unregister
     * @synopsis Turns off registration (ignores) the receivers triggers.
     * @returns {TP.core.Resource} The receiver.
     */

    var origins,
        signals,

        i,
        j;

    //  let TIBET forget who we are
    TP.sys.unregisterObject(this);

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

    //  update our internal registration flag
    this.isRegistered(false);

    return this;
});

//  ========================================================================
//  TP.sig.WorkflowSignal
//  ========================================================================

/**
 * @type {TP.sig.WorkflowSignal}
 * @synopsis Top level workflow signal type.
 * @description The TP.sig.WorkflowSignal type is a root signal type for
 *     workflow request/response signal types such as TP.sig.Request and
 *     TP.sig.Response.
 */

//  ------------------------------------------------------------------------

TP.sig.Signal.defineSubtype('WorkflowSignal');

//  add job status behavior to the receiver so we can track progress. this
//  adds methods such as fail, complete, etc.
TP.sig.WorkflowSignal.addTraitsFrom(TP.core.JobStatus);
TP.sig.WorkflowSignal.Type.resolveTrait('getSignalName', TP.sig.WorkflowSignal);
TP.sig.WorkflowSignal.Inst.resolveTraits(
        TP.ac('resume', 'asSource', 'asDumpString', 'asHTMLString',
                'asJSONSource', 'asPrettyString', 'asXMLString', 'asString',
                'at', 'atPut', 'getSignalName', 'getProperty', 'copy',
                'shouldLog', 'init', 'isRecyclable', 'recycle'),
        TP.sig.WorkflowSignal);

//  Resolve the traits right away as subtypes of this type are used during the
//  booting process.
TP.sig.WorkflowSignal.executeTraitResolution();

TP.sig.WorkflowSignal.Type.defineAttribute('defaultPolicy', TP.INHERITANCE_FIRING);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.WorkflowSignal.Inst.defineMethod('fire',
function(anOrigin, aPayload, aPolicy) {

    /**
     * @name fire
     * @synopsis Fires the signal so that registered observers are notified.
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
     * @todo
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
    TP.signal(origin, this, arguments, aPayload, policy);

    return this;
});

//  ========================================================================
//  TP.sig.Request
//  ========================================================================

/**
 * @type {TP.sig.Request}
 * @synopsis TIBET's main workflow request signal type. This type most closely
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
//  a constructResponse message. this is typically redefined in subtypes so
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
     * @name request
     * @synopsis Constructs a standard TP.sig.Request populated differently
     *     depending on the nature of the argument list.
     * @description When no arguments are given this is a synonym for
     *     TP.sig.Request.construct(), when a single argument is given if it's a
     *     TP.sig.Signal of any kind then the signal's payload becomes the
     *     request's payload, otherwise the object itself becomes the request
     *     payload. When multiple arguments are given they are passed to TP.hc()
     *     and the resulting hash becomes the request's payload.
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
     * @name isSynchronous
     * @synopsis Returns true if the instances of the receiver can support
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
     * @name shouldLog
     * @synopsis Returns whether or not this request should be logged. The
     *     default at this level is to return whether TIBET is logging request
     *     signals in general.
     * @returns {Boolean} Whether or not this signal will be logged.
     * @todo
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

//  if the current signal is part of a thread of messages the threadID
//  should be set to the requestID of the initial (root) signal.
TP.sig.Request.Inst.defineAttribute('threadID');

//  optional hash of child requests used for simple workflow configurations
TP.sig.Request.Inst.defineAttribute('childJoins');

//  optional hash of parent requests used for simple workflow configurations
TP.sig.Request.Inst.defineAttribute('parentJoins');

//  optional hash of peer requests used for simple workflow configurations
TP.sig.Request.Inst.defineAttribute('peerJoins');

//  ------------------------------------------------------------------------
//  Delegated Methods
//  ------------------------------------------------------------------------

/**
 * @NOTE NOTE NOTE delegations should always come before the concrete method
 *     definitions if possible to help avoid issues and to allow later concrete
 *     method implementations to overwrite as expected.
 * @todo
 */

//  ------------------------------------------------------------------------

//  result acquisition defers to the response object
TP.delegate(TP.ac('getResult',
                    'getResultNode',
                    'getResultObject',
                    'getResultText'),
            TP.sig.Request.getInstPrototype(),
            true);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('init',
function(aRequest, aResourceID, aThreadID) {

    /**
     * @name init
     * @synopsis Initialize a new request. Each request is composed of a request
     *     payload (usually a hash), and optional resourceID and threadID
     *     elements. The resourceID allows a request to target a particular
     *     resource while the threadID allows the request to be associated with
     *     an ongoing request/response 'conversation' between parties. When
     *     creating the instance TP.sig.Request will use any type-specific
     *     requestTemplate and merge it with any incoming request information.
     * @param {TP.lang.Hash} aRequest An object containing specific request
     *     parameters which will by used by the request's responder to process
     *     the request. NOTE that this takes the same parameter slot as the root
     *     payload for TP.sig.Signal. This should be specific to the signal
     *     type.
     * @param {String} aResourceID A unique resource identifier.
     * @param {String} aThreadID A unique thread identifier.
     * @returns {TP.sig.Request} A new instance.
     * @todo
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
     * @name $initTemplate
     * @synopsis Generates and returns a viable request payload from the
     *     incoming payload object and any local template for the receiver. When
     *     both a template and a request are provided the keys in the template
     *     missing in the request are merged to fill in those default values.
     * @param {TP.lang.Hash} aRequest An object containing parameters for the
     *     request.
     * @param {A} TP.lang.Hash viable payload object. NOTE that when no request
     *     or template exist the return value is NULL so no payload is implied
     *     for the call.
     * @todo
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
    } else if (TP.isKindOf(aRequest, TP.lang.Hash)) {
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
                this.defineMethod(key, request.at(key));
            }
        }
    }

    return request;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('asQueryString',
function() {

    /**
     * @name asQueryString
     * @synopsis Returns the receiver's "query string" content, the parameters
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
     * @name configureSTDIO
     * @synopsis Maps STDIO functions and content from one request to another so
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

TP.sig.Request.Inst.defineMethod('constructResponse',
function(aResult) {

    /**
     * @name constructResponse
     * @synopsis The default method for getting a response instance for the
     *     request. This method is invoked automatically by services when
     *     building up responses to incoming requests. The returned instance is
     *     then updated with the result data and fired when ready.
     * @param {Object} aResult A result object.
     * @returns {TP.sig.Response}
     * @todo
     */

    var response,
        responseName;

    //  don't allow a request to get more than one instance of response
    if (TP.isValid(response = this.getResponse())) {
        if (TP.isDefined(aResult)) {
            response.set('result', aResult);
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

TP.sig.Request.Inst.defineMethod('fire',
function(anOrigin, aPayload, aPolicy) {

    /**
     * @name fire
     * @synopsis Fires the signal so that registered observers are notified.
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
     * @todo
     */

    //  clear any response we may have from a prior execution
    this.$set('response', null);

    //  clear status code back to original
    this.set('statusCode', TP.READY);

    //  clear failure/fault code back to original
    this.set('faultCode', null);
    this.set('faultText', null);

    this.callNextMethod();

    return this.constructResponse();
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getDelegate',
function() {

    /**
     * @name getDelegate
     * @synopsis Returns the receiver's delegate, the object used by the
     *     TP.delegate() utility function when constructing delegation methods.
     *     For TP.sig.Request this is the request's response.
     * @returns {Object} The receiver's delegation object.
     */

    return this.getResponse();
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getPromise',
function () {

    /**
     * @name getPromise
     * @synopsis Returns a 'promise' (a 'Promises/A+'-compliant Promise) for the
     *     receiving object. Note that, in TIBET, all a promise really is is a
     *     TP.sig.Response. See the 'then()' method on that type for more
     *     information.
     * @returns {TP.sig.Response} The 'promise' which can be used in
     *     promises-based programming.
     * @todo
     */

    return this.constructResponse();
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getRequestID',
function() {

    /**
     * @name getRequestID
     * @synopsis Returns the request ID for this request. The request ID may be
     *     a standard OID, a URL, or whatever is appropriate for the type of
     *     request. The default is an OID. The important thing about a request
     *     ID is that they serve as origins for any response signals which are
     *     generated so they should be reasonably unique.
     * @returns {String} A request ID which can take any form.
     * @todo
     */

    return this.getID();
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getRequestor',
function() {

    /**
     * @name getRequestor
     * @synopsis Returns the receiver's requestor, the object that is configured
     *     to receive notifications of results/callbacks. The request itself is
     *     the default requestor, meaning without some explicit setter the
     *     request is called back with results when any low-level processing is
     *     complete.
     * @returns {Object} The requestor, often the TP.sig.Request itself.
     * @todo
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
     * @name getResponder
     * @synopsis Returns the object which responded to this request. Only viable
     *     after the request has been activated.
     * @returns {Object}
     */

    return this.$get('responder');
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getResponse',
function() {

    /**
     * @name getResponse
     * @synopsis Returns the response object for this request, if any.
     * @returns {Object}
     */

    return this.$get('response');
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getResponseName',
function() {

    /**
     * @name getResponseName
     * @synopsis Returns the response name for this request. The response name
     *     is the signal name that should be used when signaling a response.
     *     Normally this defaults to the type name of the response type, but you
     *     can alter it when you want to fine tune handler lookup without having
     *     to create new subtypes of TP.sig.Response.
     * @returns {String} The response signal name.
     * @todo
     */

    var name;

    name = this.$get('responseName');

    return TP.ifEmpty(name, this.getResponseType().getName());
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getResponseType',
function() {

    /**
     * @name getResponseType
     * @synopsis Returns the type of response this request expects. By default
     *     this is TP.sig.Response but custom subtypes can be used to provide
     *     specific response processing.
     * @returns {TP.lang.RootObject.<TP.core.Response>} A TP.core.Response
     *     subtype type object.
     * @todo
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
                    '. Defaulting to TP.sig.Response.',
                    TP.LOG, arguments) : 0;

        return TP.sig.Response;
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('handle',
function(aSignal) {

    /**
     * @name handle
     * @synopsis The top-level signal hander for this type. To ensure proper
     *     response processing while allowing the default handleResponse method
     *     to be the override point we handle some response-specific
     *     housekeeping here. NOTE that it is still up to the individual
     *     response handling methods to fail, cancel, or complete the request.
     * @param {TP.sig.Signal} aSignal The signal to handle.
     * @returns {Object} The handler function's results.
     * @todo
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
    if (TP.notValid(request) || (request !== this)) {
        return;
    }

    //  look up a handler, forcing lookup to find only handlers that
    //  properly match custom signal name overrides
    handler = this.getHandler(aSignal, true);
    if (TP.isCallable(handler)) {
        try {
            return handler.apply(this, arguments);
        } catch (e) {
            TP.ifError() ?
                TP.error(TP.ec(e, 'Error in handler: ' + TP.str(handler)),
                            TP.LOG, arguments) : 0;

            return;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('handleResponse',
function(aSignal) {

    /**
     * @name handleResponse
     * @synopsis Generic response handling method. When using simple
     *     request/response processing it's possible to leverage the request
     *     instances themselves as responders so this method is often invoked to
     *     perform response processing.
     * @description Default response processing ensures that observation of the
     *     request/response ID are turned off, that the request is removed from
     *     any pending request queues, and that a RequestCompleted is signaled
     *     with the request's ID.
     * @param {TP.sig.Response} aSignal The TP.sig.Response instance.
     * @returns {TP.sig.Request} The receiver.
     * @todo
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('isSynchronous',
function(aResource) {

    /**
     * @name isSynchronous
     * @synopsis Returns true if the request specifies a synchronous response.
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
     * @name recycle
     * @synopsis Prepares the receiver for a new usage cycle.
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
     * @name setRequest
     * @synopsis Sets the receiver's internal request hash. This is the same as
     *     setting the receiver's signal "payload" via setPayload.
     * @param {TP.lang.Hash} aRequest A set of key/value pairs defining the
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
     * @name setRequestID
     * @synopsis Sets the receiver's request ID. This effectively changes the
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
     * @name setRequestor
     * @synopsis Sets the receiver's requestor, the object that will be
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
     * @name setResponder
     * @synopsis Sets the receiver's responder, the object which is handling the
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
     * @name setResponse
     * @synopsis Sets the associated response instance for the receiver.
     * @param {TP.sig.Response} aResponse The associated response instance.
     * @returns {TP.sig.Request} The receiver.
     */

    if (!TP.isKindOf(aResponse, 'TP.sig.Response')) {
        return this.raise('TP.sig.InvalidParameter',
                            arguments,
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
     * @name setResponseName
     * @synopsis Sets the receiver's response name, the name of the specific
     *     signal that should be used when signaling a response. Under normal
     *     circumstances this defaults to the receiving object type's response
     *     type name, but it can be changed to create more focused response
     *     handling scenarios that don't require construction of custom response
     *     types.
     * @param {String} aName The response name. Default is the receiving type's
     *     response type name.
     * @returns {TP.sig.Request} The receiver.
     * @todo
     */

    this.$set('responseName', aName, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('setResponseType',
function(aType) {

    /**
     * @name setResponseType
     * @synopsis Sets the receiver's response type, the type used to construct
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
     * @name setResult
     * @synopsis Defines the request's result, the object returned as a result
     *     of processing the request.
     * @param {Object} aResult The result of request processing.
     * @returns {Object}
     */

    var response;

    //  calling constructResponse will construct/get the response as needed
    response = this.constructResponse(aResult);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('updateRequestMode',
function(aRequest) {

    /**
     * @name updateRequestMode
     * @synopsis Updates the receiver's request mode to match that of the
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
     * @name andJoin
     * @synopsis Adds a peer request and state to the list of requests which
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
     * @todo
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
     * @name andJoinChild
     * @synopsis Adds a child request to the list of requests which must
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
function(aChildRequest, aFaultCode, aFaultString) {

    /**
     * @name $cancelJoin
     * @synopsis Tells the receiver to cancel its join processing. This method
     *     is called internally to finalize processing for a parent request
     *     which had one or more child join requests.
     * @param {TP.sig.Request} aChildRequest A child request which cancelled.
     * @param {Object} aFaultCode An optional object to set as the fault code.
     *     Usually a String or Number instance.
     * @param {String} aFaultString A string description of the fault.
     * @returns {TP.sig.Request} The receiver.
     * @todo
     */

    //  already done? don't go further
    if (this.didCancel() || this.didFail()) {
        return;
    }

    //  propagate child results upward
    this.$set('faultCode', aChildRequest.getFaultCode(), false);
    this.$set('faultText', aChildRequest.getFaultText(), false);

    //  don't push empty values into the argument list or we risk creating
    //  'undefined' as one of the values inappropriately.
    switch (arguments.length) {
        case 2:
            return this.cancel(aFaultCode);
        case 3:
            return this.cancel(aFaultCode, aFaultString);
        default:
            return this.cancel();
    }
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('canComplete',
function() {

    /**
     * @name canComplete
     * @synopsis Returns true if the receiver has no pending child joins haven't
     *     joined, meaning the receiver probably has pending asynchronous child
     *     requests and should not complete.
     * @returns {Array} The current and-joined or or-joined requests.
     * @todo
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
     * @name $completeJoin
     * @synopsis Tells the receiver to "complete" its join processing. This
     *     method is called internally to finalize processing for a parent
     *     request which had one or more child join requests.
     * @param {TP.sig.Request} aChildRequest A child request which completed.
     * @param {Object} aResult An optional result to output.
     * @returns {TP.sig.Request} The receiver.
     * @todo
     */

    //  already done? don't go further
    if (this.didCancel() || this.didFail()) {
        return;
    }

    //  propagate child results upward
    this.set('result', aChildRequest.getResult());

    //  don't push an undefined into the complete call unless it's "real"
    if (arguments.length > 1) {
        return this.complete(aResult);
    }

    return this.complete();
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('$failJoin',
function(aChildRequest, aFaultCode, aFaultString) {

    /**
     * @name $failJoin
     * @synopsis Tells the receiver to fail its join processing. This method is
     *     called internally to finalize processing for a parent request which
     *     had one or more child join requests.
     * @param {TP.sig.Request} aChildRequest A child request which cancelled.
     * @param {Object} aFaultCode An optional object to set as the fault code.
     *     Usually a String or Number instance.
     * @param {String} aFaultString A string description of the fault.
     * @returns {TP.sig.Request} The receiver.
     * @todo
     */

    //  already done? don't go further
    if (this.didCancel() || this.didFail()) {
        return;
    }

    //  propagate child results upward
    this.$set('faultCode', aChildRequest.getFaultCode(), false);
    this.$set('faultText', aChildRequest.getFaultText(), false);

    //  don't push empty values into the argument list or we risk creating
    //  'undefined' as one of the values inappropriately.
    switch (arguments.length) {
        case 2:
            return this.fail(aFaultCode);
        case 3:
            return this.fail(aFaultCode, aFaultString);
        default:
            return this.fail();
    }
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getChildJoins',
function(aJoinKey) {

    /**
     * @name getChildJoins
     * @synopsis Returns the joined requests which will be checked during join
     *     processing to see if the receiver 'hasJoined'.
     * @param {String} aJoinKey The key to look up, which should be either the
     *     TP.AND or TP.OR constant.
     * @returns {Array} The current and-joined or or-joined requests.
     * @todo
     */

    var joins,
        list;

    joins = this.$get('childJoins');
    if (TP.notValid(joins)) {
        joins = TP.hc();
        this.$set('childJoins', joins);
    }

    if (TP.notEmpty(aJoinKey)) {
        list = joins.at(aJoinKey);
        if (TP.notValid(list)) {
            list = TP.ac();
            joins.atPut(aJoinKey, list);
        }

        return list;
    }

    return joins;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getJoins',
function(aJoinKey, aRequest) {

    /**
     * @name getJoins
     * @synopsis Returns the joined requests which will be checked during join
     *     processing to see if the receiver 'hasJoined'.
     * @param {String} aJoinKey The key to look up, which should be either the
     *     TP.AND or TP.OR constant, or a specific wrapup state code.
     * @param {TP.sig.Request} aRequest An optional request used when looking
     *     for joins specific to that request's completion.
     * @returns {Array} The current and-joined or or-joined requests.
     * @todo
     */

    var joins,
        list;

    joins = this.$get('peerJoins');
    if (TP.notValid(joins)) {
        joins = TP.hc();
        this.$set('peerJoins', joins);
    }

    if (TP.isValid(aJoinKey)) {
        list = joins.at(aJoinKey);
        if (TP.notValid(list)) {
            list = TP.ac();
            joins.atPut(aJoinKey, list);
        }

        return list;
    }

    return joins;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('getParentJoins',
function(aJoinKey) {

    /**
     * @name getParentJoins
     * @synopsis Returns the joined requests which will be checked during join
     *     processing to see if the receiver 'hasJoined'.
     * @param {String} aJoinKey The key to look up, which should be either the
     *     TP.AND or TP.OR constant.
     * @returns {Array} The current and-joined or or-joined requests.
     * @todo
     */

    var joins,
        list;

    joins = this.$get('parentJoins');
    if (TP.notValid(joins)) {
        joins = TP.hc();
        this.$set('parentJoins', joins);
    }

    if (TP.notEmpty(aJoinKey)) {
        list = joins.at(aJoinKey);
        if (TP.notValid(list)) {
            list = TP.ac();
            joins.atPut(aJoinKey, list);
        }

        return list;
    }

    return joins;
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('hasJoined',
function(aRequest, childJoin) {

    /**
     * @name hasJoined
     * @synopsis Invoked by requests which have been joined to the receiver in
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
     * @todo
     */

    var list,
        len,
        i,
        item;

    list = TP.isTrue(childJoin) ? this.getChildJoins(TP.OR) :
                                this.getJoins(TP.OR);
    len = list.length;
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
    len = list.length;
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
     * @name joinTo
     * @synopsis Joins the receiver to a downstream peer request. When the
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
     * @todo
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
     * @name orJoin
     * @synopsis Adds a request and state to the list of requests which may
     *     reach a prescribed state before the receiver can trigger. For orJoin
     *     requests only one pair must match for the receiver to trigger in
     *     response.
     * @param {TP.sig.Request} aRequest A request instance to observe as a
     *     trigger.
     * @param {Number|String} aState A job control state or suffix such as
     *     TP.SUCCEEDED or "Succeeded" (the default).
     * @returns {TP.sig.Request} The receiver.
     * @todo
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
     * @name orJoinChild
     * @synopsis Adds a child request to the list of requests which must
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
     * @name $wrapupJoin
     * @synopsis Invoked internally to register a request and state for join
     *     testing during job wrapup processing.
     * @param {TP.sig.Request} aRequest A request instance to observe as a
     *     trigger.
     * @param {Number|String} aState A job control state or suffix such as
     *     TP.SUCCEEDED or "Succeeded" (the default).
     * @param {Boolean} childJoin True to signify that this join is a child
     *     join.
     * @returns {TP.sig.Request} The receiver.
     * @todo
     */

    var state,
        list;

    state = TP.ifInvalid(aState, TP.SUCCEEDED);

    //  NOTE that when we're defining joins to check upon wrapup we are
    //  looking at our peers and parents in terms of other requests which
    //  should be notified.
    list = TP.isTrue(childJoin) ? this.getParentJoins(state) :
                                this.getJoins(state);
    list.push(aRequest);

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.JobStatus Methods
//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('cancelJob',
function(aFaultCode, aFaultString) {

    /**
     * @name cancelJob
     * @synopsis Tells the receiver to "cancel", meaning whatever work is needed
     *     to get to a TP.CANCELLED state.
     * @param {Object} aFaultCode An optional object to set as the fault code.
     *     Usually a String or Number instance.
     * @param {String} aFaultString A string description of the fault.
     * @returns {TP.sig.Request} The receiver.
     * @todo
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
        joins.at(i).cancel(aFaultCode, aFaultString);
    }

    //  don't push empty values into the argument list or we risk creating
    //  'undefined' as one of the values inappropriately.
    switch (arguments.length) {
        case 1:
            return this.$wrapupJob('Cancelled', TP.CANCELLED, aFaultCode);
        case 2:
            return this.$wrapupJob('Cancelled', TP.CANCELLED, aFaultCode,
                                    aFaultString);
        default:
            return this.$wrapupJob('Cancelled', TP.CANCELLED);
    }
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('completeJob',
function(aResult) {

    /**
     * @name completeJob
     * @synopsis Tells the receiver to "complete", meaning whatever work is
     *     needed to get to a proper TP.SUCCEEDED state.
     * @param {Object} aResult An optional object to set as the result of the
     *     request.
     * @returns {TP.sig.Request} The receiver.
     * @todo
     */

    //  completing a job should ensure the result gets properly set in any
    //  response object we have.
    this.constructResponse(aResult);

    //  don't push empty values into the argument list or we risk creating
    //  'undefined' as one of the values inappropriately.
    if (arguments.length > 0) {
        return this.$wrapupJob('Succeeded', TP.SUCCEEDED, aResult);
    }

    return this.$wrapupJob('Succeeded', TP.SUCCEEDED);
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('failJob',
function(aFaultCode, aFaultString) {

    /**
     * @name failJob
     * @synopsis Tells the receiver to "fail", meaning whatever work is needed
     *     to get to a TP.FAILED state.
     * @param {Object} aFaultCode An optional object to set as the fault code.
     *     Usually a String or Number instance.
     * @param {String} aFaultString A string description of the fault.
     * @returns {TP.sig.Request} The receiver.
     * @todo
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
        joins.at(i).cancel(aFaultCode, aFaultString);
    }

    //  don't push empty values into the argument list or we risk creating
    //  'undefined' as one of the values inappropriately.
    switch (arguments.length) {
        case 1:
            return this.$wrapupJob('Failed', TP.FAILED, aFaultCode);
        case 2:
            return this.$wrapupJob('Failed', TP.FAILED, aFaultCode,
                                    aFaultString);
        default:
            return this.$wrapupJob('Failed', TP.FAILED);
    }
});

//  ------------------------------------------------------------------------

TP.sig.Request.Inst.defineMethod('$wrapupJob',
function(aSuffix, aState, aResultOrFailureCode, aFaultString) {

    /**
     * @name $wrapupJob
     * @synopsis Handles notifying the common parties to a request, the request,
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
     * @param {Object} aResultOrFailureCode A valid result object when in a
     *     non-failure state and a failure code when using a failure state.
     * @param {String} aFaultString Optional fault string used when in a failure
     *     state.
     * @returns {TP.sig.Request} The receiver.
     * @todo
     */

    var start,
        end,

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

        sigType,

        shortHandler,
        fullHandler,

        joins,
        ancestor,
        join,
        arglen;

    TP.debug('break.request_wrapup');

    //  consider this to be "end of processing" time since what follows is
    //  largely about notifying rather than "real work" for the request
    if (TP.isValid(start = this.at('cmdStart'))) {
        end = Date.now();
        this.atPut('cmdEnd', end);
    }

    //  get a handle to the response object for the request.
    response = this.constructResponse();

    //  three objects get special consideration with respect to notification
    //  to keep observe/ignore overhead to a minimum.
    request = this;
    responder = this.get('responder');
    requestor = this.get('requestor');

    //  now we ensure we don't have duplicate objects to notify, request and
    //  requestor will often default to the same request instance.
    responder = (responder === request) ? null : responder;
    requestor = (requestor === request) ? null : requestor;
    requestor = (requestor === responder) ? null : requestor;

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
            if (!TP.isType(sigType = TP.sys.getTypeByName(signame))) {
                continue;
            }

            shortHandler = sigType.getHandlerName(null, false) + suffix;
            fullHandler = sigType.getHandlerName(null, true) + suffix;

            response.setSignalName(signame + suffix);

            //  notify the request itself, it will often be locally
            //  programmed with custom callback hooks
            TP.handle(request, response, shortHandler, true);
            TP.handle(request, response, fullHandler, true);
            if (response.shouldPrevent() || response.shouldStop()) {
                break;
            }

            //  notify responder...typically the service which did the
            //  actual processing. we give it one last chance to finish up
            //  any housekeeping for the request/response before requestor
            TP.handle(responder, response, shortHandler, true);
            TP.handle(responder, response, fullHandler, true);
            if (response.shouldPrevent() || response.shouldStop()) {
                break;
            }

            TP.handle(requestor, response, shortHandler, true);
            TP.handle(requestor, response, fullHandler, true);
            if (response.shouldPrevent() || response.shouldStop()) {
                break;
            }

            //  signal the request for any remaining observers which might
            //  exist. NOTE that since we've been manipulating the signal
            //  name we don't use inheritance firing here... implying that
            //  observers of response signals have to be observing
            //  specifically.
            TP.signal(id, response, arguments, null, TP.FIRE_ONE);
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
                    join.atPut(TP.STDIN, TP.ac(aResultOrFailureCode));
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
                        ancestor.$failJoin(this, aResultOrFailureCode);
                        break;
                    case 4:
                        ancestor.$failJoin(this,
                                            aResultOrFailureCode,
                                            aFaultString);
                        break;
                    default:
                        ancestor.$failJoin(this);
                        break;
                }
            } else if (this.isCancelling() || this.didCancel()) {
                switch (arglen) {
                    case 3:
                        ancestor.$cancelJoin(this, aResultOrFailureCode);
                        break;
                    case 4:
                        ancestor.$cancelJoin(this,
                                                aResultOrFailureCode,
                                                aFaultString);
                        break;
                    default:
                        ancestor.$cancelJoin(this);
                        break;
                }
            } else if (ancestor.hasJoined(this, true)) {
                if (arglen > 2) {
                    ancestor.$completeJoin(this, aResultOrFailureCode);
                } else {
                    ancestor.$completeJoin(this);
                }
            }
        }
    }

    return this;
});

//  ========================================================================
//  TP.sig.Response
//  ========================================================================

/**
 * @type {TP.sig.Response}
 * @synopsis Top-level response signal for TP.sig.Request signals. All response
 *     signals are subtypes of this signal. When a TP.sig.Request is handled by
 *     a resource the resource's handle calls will construct and eventually
 *     signal a TP.sig.Response of the proper name/type to notify any observers.
 *     The response instance is also returned by the handler so that direct
 *     invocations of synchronous calls allow you direct access to the response
 *     without delay.
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
//  Delegated Methods
//  ------------------------------------------------------------------------

/**
 * @NOTE NOTE NOTE delegations should always come before the concrete method
 *     definitions if possible to help avoid issues and to allow later concrete
 *     method implementations to overwrite as expected.
 * @todo
 */

//  ------------------------------------------------------------------------

//  basic job control defers to the request, as does the request ID
TP.delegate(TP.ac('failJob', 'cancelJob', 'completeJob',
                'getFaultCode', 'getFaultText',
                'getStatusCode', 'getStatusText',
                'getRequestID'),
            TP.sig.Response.getInstPrototype(),
            true);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('init',
function(aRequest, aResult) {

    /**
     * @name init
     * @synopsis Initialize a new instance. The request should be the original
     *     TP.sig.Request instance while the optional result is whatever data
     *     should be assigned to the request as the result.
     * @param {TP.sig.Request} aRequest A request object. In the case of
     *     TP.sig.Response instances the request object provided here must be a
     *     TP.sig.Request instance, not one of the more loosely typed "request
     *     hash" types used by other request-oriented methods.
     * @param {Object} aResult A result object.
     * @returns {TP.sig.Response} A new instance.
     * @todo
     */

    //  initialize the signal -- note we don't pass along the TP.sig.Request
    //  instance as payload or a 'request hash'
    this.callNextMethod(null);

    //  NOTE we force a request from either TP.sig.Request or TP.lang.Hash
    //  here to ensure we've got something we can process effectively with
    this.$set('request', TP.request(aRequest), false);

    //  if we received a value (including null) as a result then set it.
    if (TP.isDefined(aResult)) {
        this.$set('result', aResult, false);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('fire',
function(anOrigin, aPayload, aPolicy) {

    /**
     * @name fire
     * @synopsis Fires the response using either the request ID or null ID. NOTE
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
     * @todo
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
    TP.signal(origin, this, arguments, aPayload, policy);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getDelegate',
function() {

    /**
     * @name getDelegate
     * @synopsis Returns the receiver's delegate, the object used by the
     *     TP.delegate() utility function when constructing delegation methods.
     *     For TP.sig.Response this is the request object.
     * @returns {Object} The receiver's delegation object.
     */

    return this.getRequest();
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getPayload',
function() {

    /**
     * @name getPayload
     * @synopsis Returns the optional arguments to the signal. If the response
     *     contains a payload it is returned by this call, otherwise any payload
     *     used by the original request is returned.
     * @returns {Object} The receiver's payload.
     * @todo
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
     * @name getRequest
     * @synopsis Returns the receiver's original request object.
     * @returns {TP.sig.Request} The request this is the response for.
     */

    return this.$get('request');
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getResult',
function() {

    /**
     * @name getResult
     * @synopsis Returns the request result, the object returned as a result of
     *     processing the receiver's request.
     * @returns {Object}
     */

    return this.$get('result');
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getResultNode',
function() {

    /**
     * @name getResultNode
     * @synopsis Returns the receiver's result in TP.core.Node form if possible.
     *     When the result isn't valid XML this method returns null.
     * @returns {Node} A valid Node instance.
     */

    return TP.tpnode(this.getResult());
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getResultObject',
function() {

    /**
     * @name getResultObject
     * @synopsis Returns the receiver's result in object form.
     * @returns {Object}
     */

    return this.getResult();
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('getResultText',
function() {

    /**
     * @name getResultText
     * @synopsis Returns the receiver's content in text (String) form.
     * @returns {String}
     */

    return TP.str(this.getResult());
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('setRequest',
function(aRequest) {

    /**
     * @name setRequest
     * @synopsis Sets the receiver's request object.
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
     * @name setResult
     * @synopsis Defines the request's result, the object returned as a result
     *     of processing the request. This method is often overridden in
     *     subtypes so they can manage how the result data is stored.
     * @param {Object} aResult The result of request processing.
     * @returns {Object}
     */

    this.$set('result', aResult, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Response.Inst.defineMethod('then',
function (onFulfilled, onRejected) {

    /**
     * @name then
     * @synopsis A method which implements, as closely as possible, a
     *     'Promises/A+' implementation in TIBET.
     * @description This method, which is standardized by the 'Promises/A+'
     *     standard, implements the core functionality of TIBET-based JavaScript
     *      Promises. Note that, in TIBET, Promises are really just instances of
     *      TP.sig.Response. This method allows for Promise composition as
     *      intended by Promises/A+, while also leveraging all of TIBET's
     *      Request/Response infrastructure.
     * @param {Function} onFulfilled A Function that will be executed if the
     *     promise reaches it's fulfilled state.
     * @param {Function} onRejected A Function that will be executed if the
     *     promise reaches it's rejected state.
     * @returns {TP.sig.Response} A 'promise' that can be used to be the 'next
     *     step' in a chain of promises.
     * @todo
     */

    var myReq,
        newReq;

    //  In TIBET, a Promise's 'resolver' is it's Request
    myReq = this.getRequest();

    //  Create a new request that will be the 'next step in the promises chain'.
    //  This can be a 'plain' TP.core.Request.
    newReq = TP.request();

    //  Set up a 'request succeeded' handler on the receiving request that will
    //  run the onFulfilled handler (if supplied) or just complete the new
    //  request with the value (if the onFulfilled handler is not supplied).
    myReq.defineMethod('handleRequestSucceeded',
        function (aResponse) {
            var handlerValue,
                promiseRequest;

            if (TP.isCallable(onFulfilled)) {

                //  We must run this when the stack has completely unwound,
                //  according to the Promises/A+ specification.
                (function () {
                    try {
                        //  Go ahead and run the onFulfilled
                        handlerValue = onFulfilled(aResponse.getResult());

                        //  If we get a 'promise' back as the handler value
                        //  (promises are just Responses), then get it's request
                        //  and *join that to the new request that we created
                        //  above*. This is the core of what makes the chaining
                        //  work.
                        if (TP.isKindOf(handlerValue, TP.sig.Response)) {

                            promiseRequest = handlerValue.getRequest();
                            newReq.andJoinChild(promiseRequest);
                        } else {
                            //  We didn't get back a promise - just complete the
                            //  new request with the returned value.
                            newReq.complete(handlerValue);
                        }
                    } catch (e) {
                        //  The onFulfilled handler threw an exception - fail
                        //  the new request.
                        newReq.fail(TP.FAILURE,
                                    TP.sc('Promise failure: ') + TP.str(e));
                    }
                }).afterUnwind();
            } else {
                //  No onFulfilled handler - complete the new request, passing
                //  along the result of this response.
                newReq.complete(aResponse.getResult());
            }
        });

    //  Set up a 'request failed' handler on the receiving request that will
    //  run the onRejected handler (if supplied) or just complete the new
    //  request with the value (if the onRejected handler is not supplied).
    myReq.defineMethod('handleRequestFailed',
        function (aResponse) {
            var handlerValue,
                promiseRequest;

            if (TP.isCallable(onRejected)) {

                //  We must run this when the stack has completely unwound,
                //  according to the Promises/A+ specification.
                (function () {
                    try {
                        //  Go ahead and run the onRejected
                        handlerValue = onRejected(
                            TP.hc('faultCode', aResponse.getFaultCode(),
                                    'faultText', aResponse.getFaultText()));

                        //  If we get a 'promise' back as the handler value
                        //  (promises are just Responses), then get it's request
                        //  and *join that to the new request that we created
                        //  above*. This is the core of what makes the chaining
                        //  work.
                        if (TP.isKindOf(handlerValue, TP.sig.Response)) {

                            promiseRequest = handlerValue.getRequest();
                            newReq.andJoinChild(promiseRequest);
                        } else if (TP.isDefined(handlerValue)) {
                            //  Otherwise, a non-promise value was returned -
                            //  try to complete the new request with that as the
                            //  value.
                            newReq.complete(handlerValue);
                        } else {
                            //  No value was returned - just fail the new
                            //  request.
                            newReq.fail(aResponse.getFaultCode(),
                                        aResponse.getFaultText());
                        }
                    } catch (e) {
                        //  The onRejected handler threw an exception - fail the
                        //  new request.
                        newReq.fail(TP.FAILURE,
                                    TP.sc('Promise failure: ') + TP.str(e));
                    }
                }).afterUnwind();
            } else {
                //  No onRejected handler - fail the new request, passing along
                //  the fault code and fault text of this response.
                newReq.fail(aResponse.getFaultCode(), aResponse.getFaultText());
            }
        });

    //  Return the 'promise' of the new request - allowing chaining.
    return newReq.getPromise();
});

//  ========================================================================
//  TP.core.PermissionGroup
//  ========================================================================

/**
 * @type {TP.core.PermissionGroup}
 * @synopsis An object whose primary purpose is to hold permission-specific
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

TP.lang.Object.defineSubtype('core:PermissionGroup');

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
     * @name addKeyRing
     * @synopsis Adds a key ring to the receiver, granting it the permissions
     *     defined by the keys contained in the key ring. Note that this
     *     operation is typically done via an initialize method which defines
     *     the permissions related to each group type.
     * @description When defining different permission group types one of the
     *     operations needed is to define the keyrings which that group has
     *     access to. This is typically done by string name so that the keyrings
     *     don't have to exist at the time of the assignment -- allowing
     *     definitions to be made with less overhead. The individual keyrings
     *     will be loaded the first time a request is made for the actual keys.
     * @param {String} keyRingName The name of the key ring.
     * @returns {TP.core.Resource} The receiver.
     */

    var ring,
        rings;

    ring = TP.tibet.keyring.getInstanceById(keyRingName);
    if (TP.notValid(ring)) {
        return this.raise('TP.sig.InvalidParameter',
                            arguments,
                            'Key ring: \'' + keyRingName + '\' not found.');
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
     * @name getAccessKeys
     * @synopsis Returns an array of the permission keys associated with the
     *     receiver by virtue of its associated keyrings.
     * @returns {Array} An array containing the string keys of the receiver.
     * @todo
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

//  ========================================================================
//  TP.core.Role
//  ========================================================================

/**
 * @type {TP.core.Role}
 * @synopsis A functionally-oriented permission group capable of providing both
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
     * @name initialize
     * @synopsis Initializes the type, defining the baseline keyrings.
     */

    //  We initialize a key ring for the 'Guest' role. This matches the role
    //  for the user 'demo' that the TP.core.User type will default to if no
    //  user is supplied at startup. That username ('demo') *must* have a
    //  role of 'Guest' in the vCards that are loaded into the system for
    //  this role/keyring to make a difference.

    this.addKeyRing('Guest');

    return;
});

//  ========================================================================
//  Public:Guest
//  ========================================================================

//  Build a default role for "Public" organization and "Guest" role.
TP.core.Role.defineSubtype('Public:Guest');

//  ========================================================================
//  TP.core.Unit
//  ========================================================================

/**
 * @type {TP.core.Unit}
 * @synopsis A organizationally-oriented permission group capable of providing
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
     * @name initialize
     * @synopsis Initializes the type, defining the baseline keyrings.
     */

    this.addKeyRing('Public');
    return;
});

//  ========================================================================
//  Public:Public
//  ========================================================================

//  Build a default unit for "Public" organization and "Public" unit.
TP.core.Unit.defineSubtype('Public:Public');

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
 * @synopsis A resource specific to the application user.
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
     * @name construct
     * @synopsis Constructs and returns a new TP.core.User instance. Also
     *     ensures that the first TP.core.User instance constructed is
     *     automatically set to be the real user.
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
     * @name $distributeEffectiveAccessKeys
     * @synopsis Updates all open window body elements to contain the current
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
     * @name $distributeRealAccessKeys
     * @synopsis Updates all open window body elements to contain the current
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
     * @name getEffectiveAccessKeys
     * @synopsis Returns the effective access keys, the access keys owned by the
     *     effective user instance if there is one.
     * @returns {Array} An array of the effective user's access keys.
     * @todo
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
     * @name getEffectiveUser
     * @synopsis Returns the current "effective" user instance. Defaults to the
     *     current real user when no effective user instance has been set.
     * @returns {TP.core.User} The current effective user instance.
     * @todo
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
     * @name getInstanceById
     * @synopsis Returns the instance with the ID provided, if available.
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
     * @name getRealAccessKeys
     * @synopsis Returns the real user access keys, the access keys owned by the
     *     real user instance if there is one.
     * @returns {Array} An array of the real user's access keys.
     * @todo
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
     * @name getRealUser
     * @synopsis Returns the "real" user instance, the one most typically
     *     associated with the server session, when there is a server.
     * @returns {TP.core.User} The current real user instance.
     */

    var realUser;

    if (TP.notValid(realUser = this.$get('realUser'))) {
        //  We construct the default user of 'demo' if no TP.core.User has
        //  been constructed yet (i.e. via some sort of login process). Note
        //  that, if the standard supplied vCards.xml file that is supplied
        //  with TIBET is used here, this user will have a role of 'Guest'
        //  and a keyring that matches. See TP.core.Role's initialize()
        //  method for more information.
        TP.core.User.construct('demo');

        realUser = this.$get('realUser');
    }

    return realUser;
});

//  ------------------------------------------------------------------------

TP.core.User.Type.defineMethod('setEffectiveUser',
function(aUser) {

    /**
     * @name setEffectiveUser
     * @synopsis Sets the application's effective user to the instance provided.
     *     This will cause certain UI updates to potentially occur as TIBET
     *     updates the effective role/unit permissions.
     * @param {TP.core.User} aUser The instance to make effective.
     * @returns {TP.lang.RootObject.<TP.core.User>} The TP.core.User type
     *     object.
     */

    if (!TP.isKindOf(aUser, this)) {
        this.raise('TP.sig.InvalidUser', arguments);

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
     * @name setRealUser
     * @synopsis Sets the application's real user to the instance provided. This
     *     will cause certain UI updates to potentially occur as TIBET updates
     *     the effective role/unit permissions.
     * @param {TP.core.User} aUser The instance to make "real".
     * @returns {TP.lang.RootObject.<TP.core.User>} The TP.core.User type
     *     object.
     */

    if (!TP.isKindOf(aUser, this)) {
        this.raise('TP.sig.InvalidUser', arguments);

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

//  A TP.lang.Hash of remote pubsub topics that the user might be
//  subscribed.
TP.core.User.Inst.defineAttribute('remoteSubscriptions');

//  A TP.lang.Hash of credential sets that the user has available to them.
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
     * @name init
     * @synopsis Initializes a new user instance. This method extends the
     *     default resource initializer to automatically search for a matching
     *     vCard entry for the user ID.
     * @param {String} resourceID A unique user identifier. This ID will be used
     *     to look for an initial vCard entry for the named user.
     * @returns {TP.core.User}
     * @todo
     */

    var vCard;

    //  construct the instance from the root down
    this.callNextMethod();

    vCard = TP.vcard_temp.vCard.getInstanceById(resourceID);

    if (TP.isValid(vCard)) {
        this.setVCard(vCard);
    }

    this.set('remoteSubscriptions', TP.hc());
    this.set('credentials', TP.hc());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.User.Inst.defineMethod('clearCredentialsFor',
function(resourceID) {

    /**
     * @name clearCredentialsFor
     * @synopsis Clears the credentials information for the specified resource.
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
     * @name getCredentialsFor
     * @synopsis Returns the credentials information for the specified resource.
     * @param {String} resourceID A unique TIBET identifier. By unique we mean
     *     an ID which will not conflict with any other ID registered using
     *     TIBET's object registration methods.
     * @returns {TP.lang.Hash} A hash containing the user's credentials for the
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
            //  (i.e. a TP.lang.Hash) if we can and grab the credentials at
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
     * @name getCredentialsPassword
     * @synopsis Returns the password used for saving the user's credentials.
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
     * @name saveCredentials
     * @synopsis Saves the user's credentials information.
     * @returns {TP.core.User} The receiver.
     */

    var credentialsPW,
        credentialsStorage;

    //  If the user was already prompted to enter a password for the credentials
    //  DB, but didn't, the password is set to TP.NULL. If this is the case,
    //  there is no sense in continuing.
    if ((credentialsPW = this.get('credentialsPassword')) === TP.NULL) {
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
 * @synopsis A processing resource.
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
     * @name getDefaultInstance
     * @synopsis Returns the instance with the service ID provided, if
     *     available.
     * @param {String} resourceID A unique TIBET identifier. By unique we mean
     *     an ID which will not conflict with any other ID registered using
     *     TIBET's object registration methods.
     * @param {TP.sig.Signal} aSignal The signal which triggered this activity.
     * @returns {TP.core.Service} A valid service instance if one can be
     *     constructed.
     * @todo
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
                TP.warn(TP.ec(e, 'Couldn\'t construct default instance: '),
                        TP.LOG,
                        arguments) : 0;

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
     * @name getInstanceById
     * @synopsis Returns the instance with the service ID provided, if
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

TP.core.Service.Type.defineMethod('handleRequest',
function(aSignal) {

    /**
     * @name handleRequest
     * @synopsis Handles requests by creating a default instance on demand and
     *     forwarding the work to that instance. Once the instance has been
     *     constructed the receiver ignores future request signals so that it is
     *     no longer part of the request cycle.
     * @param {TP.sig.Request} aSignal The signal that triggered this handler.
     * @returns {Object} The result of processing the signal.
     * @todo
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
     * @name isRegistered
     * @synopsis Returns a boolean defining whether the receiver has registered
     *     to observe its triggers. Services register so they can avoid instance
     *     creation until the first request.
     * @param {Boolean} aFlag A new value for this property. Optional.
     * @returns {Boolean}
     * @todo
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
     * @name register
     * @synopsis Registers the receiver observe its trigger signals so that
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
     * @name unregister
     * @synopsis Unregisters the receiver observe its trigger signals so that
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
     * @name init
     * @synopsis Initializes a new instance of the receiver, providing it with a
     *     unique resourceID and any parameters that might be needed via an
     *     optional request/parameter hash.
     * @param {String} resourceID A unique TIBET identifier. By unique we mean
     *     an ID which will not conflict with any other ID registered using
     *     TIBET's object registration methods.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A hash or request object
     *     that should provide any additional parameters necessary to construct
     *     an instance.
     * @raises TP.sig.InvalidResourceID
     * @returns {TP.core.Resource} A new instance.
     * @todo
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
     * @name clearAuthData
     * @synopsis Clears any stored authentication data from the receiver and any
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
     * @name configureAuthData
     * @synopsis Configures authentication data for the receiver. This method
     *     should be overridden by subtypes to do something real.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional request or
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
     * @name isEnabled
     * @synopsis Returns true if the service can process requests.
     * @returns {Boolean} Whether or not the service is enabled.
     */

    return this.get('serviceEnabled');
});

//  ------------------------------------------------------------------------

TP.core.Service.Inst.defineMethod('register',
function() {

    /**
     * @name register
     * @synopsis Registers the receiver observe its trigger signals.
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
                        'supportedModes', TP.core.SyncAsync.SYNCHRONOUS);
TP.core.FunctionService.Type.defineAttribute(
                        'mode', TP.core.SyncAsync.SYNCHRONOUS);

TP.core.FunctionService.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.FunctionService.Inst.defineMethod('handleFunctionRequest',
function(aRequest) {

    /**
     * @name handleFunctionRequest
     * @synopsis Handles when an TP.sig.FunctionRequest is fired. Since
     *     this service will register itself as the default handler for these
     *     kinds of requests, the default instance of it will usually handle all
     *     of these kinds of requests.
     * @param {TP.sig.FunctionRequest} aRequest The request object to take
     *     the request parameters from.
     * @returns {TP.core.FunctionService} The receiver.
     * @todo
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
        request.fail(TP.FAILURE, 'Handler not callable');
    } else {
        result = handler.apply(request, TP.ac(request));
        request.set('result', result);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Function Additions
//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asFunctionRequest',
function () {

    /**
     * @name asFunctionRequest
     * @synopsis A convenience wrapper method to turn a Function into a
     *     FunctionRequest.
     * @returns {TP.core.FunctionRequest} A new FunctionRequest containing the
     *     receiving Function.
     */

    return TP.sig.FunctionRequest.construct(TP.hc('handler', this));
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('fire',
function () {

    /**
     * @name fire
     * @synopsis A convenience wrapper method to 'fire' a Function. This first
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
 * @synopsis Common supertype for IO-related requests.
 */

//  ------------------------------------------------------------------------

TP.sig.Request.defineSubtype('IORequest');

//  ========================================================================
//  TP.sig.IOResponse
//  ========================================================================

/**
 * @type {TP.sig.IOResponse}
 * @synopsis Common supertype for IO-related responses.
 */

//  ------------------------------------------------------------------------

TP.sig.Response.defineSubtype('IOResponse');

//  ========================================================================
//  TP.core.IOService
//  ========================================================================

/**
 * @type {TP.core.IOService}
 * @synopsis Common supertype for IO-related responses.
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
     * @name isPolling
     * @synopsis Returns true if the receiver is currently 'actively polling'.
     *     This means that the receiver is a polling mode and is not paused.
     * @returns {Boolean} Whether or not the service is in a polling mode.
     */

    var pollingJob;

    pollingJob = this.get('$pollingJob');

    return (TP.isValid(pollingJob) &&
            pollingJob.isActive() &&
            !pollingJob.isPaused());
});

//  ------------------------------------------------------------------------

TP.core.IOService.Inst.defineMethod('inPollMode',
function() {

    /**
     * @name inPollMode
     * @synopsis Returns true if the receiver is currently in a polling mode.
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
     * @name $computeInterval
     * @synopsis Returns a value which grows slowly over time by adding 1 second
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

TP.core.IOService.Inst.defineMethod('handleRequestFailed',
function(aSignal) {

    /**
     * @name handleRequestFailed
     * @synopsis Handles any signal being managed by this service that has
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

TP.core.IOService.Inst.defineMethod('handleRequestSucceeded',
function(aSignal) {

    /**
     * @name handleRequestSucceeded
     * @synopsis Handles any signal being managed by this service that has
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
     * @name pausePolling
     * @synopsis Pauses any current polling behavior.
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
     * @name $poll
     * @synopsis Polls the server for new data.
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
     * @name resumePolling
     * @synopsis Resumes any previously paused polling behavior.
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
     * @name startPolling
     * @synopsis Start the service's polling behavior.
     * @description The polling parameters supplied to this method can contain a
     *     'polling interval computation' Function in the 'poll' key. This
     *     Function will be bound to this object (so the 'this' reference point
     *     to this service) and will take the polling job as the only parameter.
     *     An example can be seen in the default Function that is used when this
     *     Function is not supplied in the polling parameters - this type's
     *     '$computeInterval' Function.
     * @param {TP.lang.Hash|TP.sig.Request} pollParams Polling configuration
     *     parameters. These may include: 'poll' [true|false|Function]
     *     'pollFirstInterval' Number 'pollMaxInterval' Number.
     * @returns {TP.core.IOService} The receiver.
     * @todo
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
     * @name stopPolling
     * @synopsis Stop the service's polling behavior.
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
 * @synopsis Common supertype for URI-related requests.
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
     * @name getFinalURI
     * @synopsis Returns the final URI associated with this request.
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
     * @name getRequestURI
     * @synopsis Returns the target URI associated with this request.
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
 * @synopsis Common supertype for URI-related responses.
 */

//  ------------------------------------------------------------------------

TP.sig.IOResponse.defineSubtype('URIResponse');

//  ------------------------------------------------------------------------
//  Delegated Methods
//  ------------------------------------------------------------------------

TP.delegate(TP.ac('getFinalURI', 'getRequestURI'),
            TP.sig.URIResponse.getInstPrototype(),
            true);

//  ========================================================================
//  TP.core.URIService
//  ========================================================================

/**
 * @type {TP.core.URIService}
 * @synopsis Provides common functionality for services focused on processing
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
     * @name init
     * @synopsis Returns an initialized instance of the receiver. If aRequest is
     *     provided it can help define the service's operation by providing a
     *     default serviceURI for the receiver. This uri is used when incoming
     *     requests don't provide a specific value.
     * @param {String} resourceID A unique service identifier.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional request or
     *     hash containing a serviceURI if the service is going to be tied to a
     *     particular target location.
     * @returns {TP.core.URIService} A new instance.
     * @todo
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
                    TP.FAILURE,
                    TP.sc('Missing required URI parameter in request: ') +
                            'serviceURI');

                    return;
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
     * @name getRequestURI
     * @synopsis Returns the URI to use for the request. This method ensures
     *     that each request has a viable target URI by defaulting to the
     *     receiver's serviceURI value if the request doesn't specify a URI of
     *     its own.
     * @param {TP.sig.Request} aRequest The request to check for a URI.
     * @returns {TPURI} The request URI.
     * @todo
     */

    var url;

    if (TP.notValid(url = aRequest.at('uri'))) {
        if (TP.notValid(url = this.get('serviceURI'))) {
            this.raise('TP.sig.InvalidURI', arguments,
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
     * @name getServiceURI
     * @synopsis Returns the default service URI for the receiver. This is the
     *     URI used when an individual request does not override it with an
     *     alternative URI.
     * @returns {TP.core.URI} The receiver's default URI.
     * @todo
     */

    //  start with instance and work outward to the type
    return this.$get('serviceURI') || this.getType().get('serviceURI');
});

//  ------------------------------------------------------------------------

TP.core.URIService.Inst.defineMethod('rewriteRequestURI',
function(aRequest) {

    /**
     * @name rewriteRequestURI
     * @synopsis Rewrites the request's URI, ensuring it defaults to the service
     *     URI and is rewritten to the current concrete location based on
     *     TIBET's rewriting rules.
     * @param {TP.sig.Request} aRequest The request to rewrite.
     * @returns {TP.core.URI} The new/updated URI instance.
     * @todo
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
                    arguments,
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
     * @name updateServiceURI
     * @synopsis If the supplied request has either a 'serviceURI' parameter or
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
//  TP.core.Application
//  ========================================================================

/**
 * @type {TP.core.Application}
 * @synopsis This type acts as the 'main type' for the application. It handles
 *     such things as starting the 'main GUI' for the application and handles
 *     application-level signals, such as 'location changes' as the user
 *     interacts with the browser controls.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:Application');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  what signals will trigger this resource/service?
//TP.core.Application.Type.defineAttribute('triggerSignals',
//                                      'TP.sig.UserIORequest');

//  The 'singleton' of this application's 'application object', normally
//  accessed through 'TP.sys.getApplication()'
TP.core.Application.Type.defineAttribute('singleton');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Application.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Performs one-time type initialization.
     */

    this.observe(TP.sys, 'TP.sig.AppStart');
    return;
});

//  ------------------------------------------------------------------------

TP.core.Application.Type.defineMethod('handleAppStart',
function(aSignal) {

    /**
     * @name handleAppStart
     * @synopsis A handler that is called when the system has set up everything
     *     required to run a TIBET application and is ready to start the GUI.
     * @description At this level, this type does nothing.
     * @param {TP.sig.AppStart} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.core.Application} The receiver.
     */

    var appType,
        newAppInst;

    //  Turn off future notifications of this signal/origin pair.
    this.ignore(aSignal.getSignalOrigin(), aSignal.getSignalName());

    //  Allocate and initialize a (singleton) instance of the specified
    //  application controller type. If that type isn't provided, or it can't
    //  be loaded, then we default to TP.core.Application and WARN.
    appType = aSignal.at('ApplicationType');
    if (TP.notValid(appType)) {
        TP.ifWarn() ?
            TP.warn('Unable to locate application controller type.' +
                    'Defaulting to TP.core.Application.',
                    TP.LOG, arguments) : 0;
        appType = TP.sys.require('TP.core.Application');
    }

    //  Create the new instance and define it as our singleton for any future
    //  application instance requests.
    newAppInst = appType.construct('AppSingleton', null);
    TP.core.Application.set('singleton', newAppInst);

    //  Tell our new singleton instance to start :).
    newAppInst.start(aSignal);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('init',
function(aResourceID, aRequest) {

    /**
     * @name init
     * @synopsis Initializes a new instance.
     * @param {String} aResourceID The unique identifier for this application.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional request or
     *     hash containing initialization parameters.
     * @returns {TP.core.Application} A new instance.
     * @todo
     */

    this.callNextMethod();

    this.observe(TP.core.History, 'TP.sig.LocationBack');
    this.observe(TP.core.History, 'TP.sig.LocationChanged');
    this.observe(TP.core.History, 'TP.sig.LocationNext');

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('finalizeGUI',
function() {

    /**
     * @name finalizeGUI
     * @synopsis Performs any UI presentation work necessary for startup. This
     *     method should be called by the application when it is ready to show
     *     its start GUI.
     * @returns {TP.core.Application} The receiver.
     */

    if (!TP.sys.cfg('boot.tdc')) {
        TP.boot.showUIRoot();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('handleLocationBack',
function(aSignal) {

    /**
     * @name handleLocationBack
     * @synopsis A handler that is called when the user has advanced backward in
     *     history via the 'backward' button of the browser.
     * @param {TP.sig.LocationBack} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.core.Application} The receiver.
     */

    TP.ifInfo() ?
        TP.info('Got to TP.core.Application::handleLocationBack',
                    TP.LOG,
                    arguments) : 0;

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('handleLocationChanged',
function(aSignal) {

    /**
     * @name handleLocationChanged
     * @synopsis A handler that is called when the user has changed the location
     *     and changed history in some way, either by using the forward or
     *     backward controls in the browser or by attempting to load a bookmark.
     *     The default implementation that this type supplies attempts to load
     *     the URI that the user is navigating to into the current 'UI canvas'.
     * @description If a 'direction' (forward or backward) can be determined a
     *     'TP.sig.LocationBack' or 'TP.sig.LocationNext' signal is *also*
     *     signaled, in addition to this signal.
     * @param {TP.sig.LocationChanged} aSignal The signal that caused this
     *     handler to trip.
     * @returns {TP.core.Application} The receiver.
     * @todo
     */

    var tpUICanvasWin,
        uriStr;

    TP.ifInfo() ?
        TP.info('Got to TP.core.Application::handleLocationChanged',
                    TP.LOG,
                    arguments) : 0;

    if (TP.notValid(tpUICanvasWin = TP.sys.getUICanvas())) {
        //  TODO: Raise an exception?
        return this;
    }

    if (TP.notEmpty(uriStr = aSignal.getPayload())) {
        tpUICanvasWin.setContent(TP.uc(uriStr));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('handleLocationNext',
function(aSignal) {

    /**
     * @name handleLocationNext
     * @synopsis A handler that is called when the user has advanced forward in
     *     history either via the 'forward' button of the browser or by
     *     specifying a new location to navigate to.
     * @param {TP.sig.LocationNext} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.core.Application} The receiver.
     */

    TP.ifInfo() ?
        TP.info('Got to TP.core.Application::handleLocationNext',
                    TP.LOG,
                    arguments) : 0;

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Application.Inst.defineMethod('start',
function(aSignal) {

    /**
     * @name start
     * @synopsis Starts the application, performing any initialization necessary
     *     for startup.
     * @param {TP.sig.AppStart} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.core.Application} The receiver.
     */

    var elem,
        rootWin;

    // Do any final steps to ensure the UI is ready for operation.
    this.finalizeGUI();

    if (TP.isElement(elem = aSignal.at('ApplicationElement'))) {
        //  Grab the UI root window and focus it.
        if (TP.isWindow(rootWin = TP.nodeGetWindow(elem))) {
            rootWin.focus();
        }
    }

    //  Signal that everything is ready and that the application did start.
    this.signal('TP.sig.AppDidStart');

    return this;
});

//  ------------------------------------------------------------------------
//  TIBET convenience method
//  ------------------------------------------------------------------------

TP.sys.defineMethod('getApplication',
function() {

    /**
     * @name getApplication
     * @synopsis Retrieves the application singleton object.
     * @returns {TP.core.Application} The receiver.
     */

    return TP.core.Application.get('singleton');
});

//  ========================================================================
//  TP.core.History
//  ========================================================================

/**
 * @type {TP.core.History}
 * @synopsis This type manages the browser history by trapping back & forward
 *     behavior and bookmark navigations and allowing TIBET to manage them. It
 *     also ensures that the user cannot back up into 'main TIBET top-level
 *     window'.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:History');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the title of the 'root' document
TP.core.History.Type.defineAttribute('rootDocTitle');

//  the current index in the history list.
TP.core.History.Type.defineAttribute('historyIndex', 0);

//  a list of the locations which this object has traversed.
TP.core.History.Type.defineAttribute('historyList', TP.ac());

//  whether or not this object is setting the hash itself
TP.core.History.Type.defineAttribute('addingHistory', false);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Performs one-time type initialization.
     */

    //  Install an 'onhashchange' event handler onto the top-level window
    //  (the 'tibet' window) that informs us when the user changes the hash,
    //  either via using the back/forward buttons or by using a bookmark.
    top.onhashchange = function(evt) {

                            this.handleHashChanged(evt);
                        }.bind(this);

    //  Prime the pump with the top location, but don't use setLocation()
    //  since we don't want the hash to actually change
    this.get('historyList').add(TP.btoa(top.location.href));
    this.set('rootDocTitle', TP.documentGetTitleContent(top.document));

    return;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('clearHistory',
function() {

    /**
     * @name clearHistory
     * @synopsis Empties the receiver's history list.
     * @returns {TP.core.History} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('getIndexForHash',
function(hashValue) {

    /**
     * @name getIndexForHash
     * @synopsis Returns the numeric 'index' within the history list of the
     *     hashValue or null if one can't be determined.
     * @description If the hashValue occurs more than once in the history list
     *     (i.e. the location has been navigated to more than once), this
     *     routine will examine entries 'around' (front and back) of each of
     *     those entries in the real history list to try to determine the 'best
     *     fit' for the hash being queried for.
     * @param {TP.core.URI|String} hashValue The TP.core.URI or String to use.
     * @returns {Number}
     */

    var hashIndices;

    hashIndices = this.get('historyList').getPositions(hashValue);

    //  Return null if the hash isn't found - this must mean that we haven't
    //  added this hash before.
    if (TP.isEmpty(hashIndices)) {
        return null;
    }

    //  Return the index if the hash is found only once.
    if (hashIndices.getSize() === 1) {
        return hashIndices.first();
    }

    //  TODO:
    //  If the hash is found more than once, then we need to:
    //      a. 'Unhook' the onhashchange handler
    //      b. Do a back(), capture the hash value into 'backhash'
    //      c. Do a forward() twice, capture the hash value into
    //          'forwardhash'
    //      d. Do a back() to get back to our hash
    //      e. 'Rehook' the onhashchange handler
    //      f. Search by 3's 'around' the indicies where the hash was found

    return null;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('handleHashChanged',
function(anEvent) {

    /**
     * @name handleHashChanged
     * @synopsis A native browser-level event handler that is called when the
     *     user has changed the top-level window hash in some fashion. For
     *     TIBET, this usually means they've navigated with the forward or back
     *     buttons, used a bookmark or double-clicked on a file from the file
     *     system.
     * @param {HashChanged} aSignal The event that caused this handler to trip.
     * @returns {TP.core.History} The receiver.
     */

    var hashVal,

        encodedVal,

        entryIndex,

        oldOnHashChange,
        forcedBackPageTitle,

        decodedVal;

    //  If we're already 'adding history', that means that the location is
    //  being set because one of our handlers below is setting it. We set a
    //  flag in the setLocation() routine to avoid endless looping, so we
    //  detect that here, clear the flag and return.
    if (TP.isTrue(this.get('addingHistory'))) {
        this.set('addingHistory', false);

        return this;
    }

    //  If the hash is empty, that must mean that we're at the first 'main
    //  page', which is the location of our top-level window. We have the
    //  encoded value, etc. here, so we just set it.
    if (TP.isEmpty(hashVal = top.location.hash)) {
        //  Must be the top-level page
        encodedVal = this.get('historyList').at(0);

        decodedVal = TP.atob(encodedVal);

        entryIndex = 0;
    } else {
        //  Otherwise, we grab the hash value, make sure it doesn't have a
        //  leading '#', and get its index in our history list.
        if (hashVal.startsWith('#')) {
            encodedVal = hashVal.slice(1);
        } else {
            encodedVal = hashVal;
        }

        entryIndex = this.getIndexForHash(encodedVal);
    }

    //  If the encoded value matches the first value in our history, then
    //  the user has navigated to our 'root' location - a no no. We initiate
    //  a procedure to get the browser history, location and document title
    //  back to the location that they navigated from.
    if (encodedVal === this.get('historyList').at(0)) {
        //  Grab the old 'onhashchange' handler. We'll need it when we're
        //  done.
        oldOnHashChange = top.onhashchange;

        //  The document title is current that of the page we came from, but
        //  we're gonna set the document title to that of the 'root doc' and
        //  we need to capture this before it goes away.
        forcedBackPageTitle = TP.documentGetTitleContent(top.document);

        //  Set the new onhashchange handler to one that will set the title
        //  of the document to the 'forced back to' page and restores the
        //  regular 'onhashchange' handler. This not only sets the document
        //  title properly, it avoids endless loops by calling this routine
        //  when we do a 'go()' below.
        top.onhashchange =
            function() {

                TP.documentSetTitleContent(top.document,
                                            forcedBackPageTitle);
                top.onhashchange = oldOnHashChange;
            };

        //  Set the document's title to the root document title we captured
        //  on initialization before we leave this location.
        TP.documentSetTitleContent(top.document,
                                    this.get('rootDocTitle'));

        //  Go back to the page that the user was trying to navigate away
        //  from by using the historyIndex (our own index that hasn't
        //  changed).
        top.history.go(this.get('historyIndex'));

        return this;
    }

    //  If the encoded value is the same as the value at our current index,
    //  we just return here - we're probably being called because one of our
    //  handlers for TP.sig.LocationChanged is setting the content of the
    //  URI and sending us back the same URI.

    if (encodedVal === this.get('historyList').at(this.get('historyIndex'))) {
        return this;
    }

    //  If a valid entry index was computed, then compare it against the
    //  current history index and send the proper back/next signals if a
    //  direction can be determined.
    if (TP.isNumber(entryIndex)) {
        if (entryIndex < this.get('historyIndex')) {
            this.signal('TP.sig.LocationBack', arguments, decodedVal);
        } else if (entryIndex > this.get('historyIndex')) {
            this.signal('TP.sig.LocationNext', arguments, decodedVal);
        }

        this.set('historyIndex', entryIndex);
    }

    //  In any case, the location changed, so let all observers know.
    this.signal('TP.sig.LocationChanged', arguments, decodedVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('replaceLocation',
function(histValue) {

    /**
     * @name replaceLocation
     * @synopsis Replaces the current location of the browser and sets it to an
     *     encoded version of the supplied history value.
     * @param {TP.core.URI|String} histValue The TP.core.URI or String to use.
     * @returns {TP.core.History} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.History.Type.defineMethod('setLocation',
function(histValue) {

    /**
     * @name setLocation
     * @synopsis Sets the current location of the browser to an encoded version
     *     of the supplied history value.
     * @param {TP.core.URI|String} histValue The TP.core.URI or String to use.
     * @returns {TP.core.History} The receiver.
     */

    var encodedVal,

        histIndex,

        currentHashVal;

    if (TP.isEmpty(histValue)) {
        return this.raise('TP.sig.InvalidURI', arguments);
    }

    encodedVal = TP.btoa(histValue.asString());

    //  If the encoded value is the same as the value at our current index,
    //  we just return here - we're probably being called because one of our
    //  handlers for TP.sig.LocationChanged is setting the content of the
    //  URI and sending us back the same URI.
    if (encodedVal === this.get('historyList').at(this.get('historyIndex'))) {
        return this;
    }

    histIndex = this.get('historyIndex');

    this.set('historyList',
                this.get('historyList').slice(0, histIndex + 1));

    this.get('historyList').add(encodedVal);

    //  note that we point to the current entry, which should be visible
    this.set('historyIndex', histIndex + 1);

    //  We only set this flag if the hash isn't already the encoded
    //  value (sometimes we're called as part of the hash changing, in
    //  which case it already has - we don't want to set this flag
    //  because onhashchange() will not be called to reset it and we'll
    //  be out of sync for the next time the hash changes).

    currentHashVal = top.location.hash;
    if (currentHashVal.startsWith('#')) {
        currentHashVal = currentHashVal.slice(1);
    }

    if (currentHashVal !== encodedVal) {
        this.set('addingHistory', true);
    }

    // TODO: revisit this in the context of routing and url-to-hash mapping.
    //top.location.hash = encodedVal;

    return this;
});

//  ========================================================================
//  TP.core.Controller
//  ========================================================================

/**
 * @type {TP.core.Controller}
 * @synopsis This type is a common supertype for all 'TIBET controllers'.
 *     Controllers are objects that typically control some GUI or application
 *     workflow.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:Controller');

//  ========================================================================
//  TP.core.URIController
//  ========================================================================

/**
 * @type {TP.core.URIController}
 * @synopsis This type is a common supertype for 'URI controllers'. That is,
 *     controller objects that are associated with a URI, typically a 'page' or
 *     'screen' in TP.sys.
 */

//  ------------------------------------------------------------------------

TP.core.Controller.defineSubtype('URIController');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the URI associated with the controller
TP.core.URIController.Inst.defineAttribute('uri');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.URIController.Inst.defineMethod('isResponderFor',
function(aSignal, isCapturing) {

    /**
     * @name isResponderFor
     * @synopsis Whether or not the receiver is a responder for the supplied
     *     signal and capturing mode.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if the
     *     receiver is an appropriate responder.
     * @param {Boolean} isCapturing Whether or not the responder computation
     *     machinery is computing the chain for the 'capturing' phase of the
     *     event dispatch.
     * @returns {Boolean} Whether or not the receiver is a valid responder for
     *     the supplied signal and capturing mode.
     * @todo
     */

    var sigType;

    //  The default is that we don't participate in capturing responder
    //  chains.
    if (TP.isTrue(isCapturing)) {
        return false;
    }

    sigType = aSignal.getType();

    //  Check that we're a responder for any signals that we have a handler
    //  for.
    return TP.canInvoke(
                this, sigType.getHandlerName(null, false, aSignal)) ||
            TP.canInvoke(
                this, sigType.getHandlerName(null, true, aSignal));
});

//  ------------------------------------------------------------------------

TP.core.URIController.Inst.defineMethod('getNextResponder',
function(aSignal, isCapturing) {

    /**
     * @name getNextResponder
     * @synopsis Returns the next responder as computed by the receiver.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if the
     *     receiver is an appropriate responder.
     * @param {Boolean} isCapturing Whether or not the responder computation
     *     machinery is computing the chain for the 'capturing' phase of the
     *     event dispatch.
     * @returns {Object} The next responder as computed by the receiver.
     * @todo
     */

    var uri,
        uriDoc,

        elementWin,
        frameElem;

    //  Go to our URI's content node (which should be a Document), get its
    //  window and, if its an iframe window, grab the iframe holding it and
    //  'walk' up the DOM.
    if (TP.isValid(uri = this.get('uri')) &&
        TP.isDocument(uriDoc = uri.getContentNode()) &&
        TP.isIFrameWindow(elementWin = TP.nodeGetWindow(uriDoc))) {
        frameElem = elementWin.frameElement;
        if (TP.isElement(frameElem)) {
            //  Recurse, calling the iframe's 'getNextResponder' method to
            //  work our way 'up' the tree.
            return TP.wrap(frameElem).getNextResponder(aSignal,
                                                        isCapturing);
        }
    }

    //  The default next responder for URI controllers is the Application
    //  singleton object.
    return TP.sys.getApplication();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
