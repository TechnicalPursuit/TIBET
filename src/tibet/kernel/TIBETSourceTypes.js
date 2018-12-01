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
//  Signal Sources
//  ========================================================================

/*
TP.sig.SignalSource is the core signaling type from which all other signal
sources derive. Signal sources are objects that throw off signals; devices like
mice and keyboards and remote sources like server-sent event servers.
*/

TP.lang.Object.defineSubtype('sig.SignalSource');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.SignalSource.Type.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Invoked by observe() to add an observation or activate
     *     underlying signaling hooks necessary to ensure proper signaling.
     * @param {Object|Object[]} anOrigin One or more origins to observe.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    TP.override();
});

//  ------------------------------------------------------------------------

TP.sig.SignalSource.Type.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Invoked by ignore() to remove an observation or deactivate
     *     underlying signaling hooks necessary to ensure proper signaling.
     * @param {Object|Object[]} anOrigin One or more origins to ignore.
     * @param {Object|Object[]} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    TP.override();
});

//  ------------------------------------------------------------------------
//  Inst Attributes
//  ------------------------------------------------------------------------

TP.sig.SignalSource.Inst.defineAttribute('observers');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.SignalSource.Inst.defineMethod('addObserver',
function(aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    TP.override();
});

//  ------------------------------------------------------------------------

TP.sig.SignalSource.Inst.defineMethod('hasObservers',
function() {

    /**
     * @method hasObservers
     * @summary Returns whether or not the receiver has observers.
     * @returns {Boolean} Whether or not the receiver has observers.
     */

    var observers;

    observers = this.$get('observers');

    return !TP.isEmpty(observers);
});

//  ------------------------------------------------------------------------

TP.sig.SignalSource.Inst.defineMethod('removeObserver',
function(aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener.
     * @param {Object|Object[]} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    TP.override();
});

//  ========================================================================
//  TP.sig.URISignalSource
//  ========================================================================

/*
 * TP.sig.URISignalSource is a set of traits for various signal source subtypes
 * which use a URI to define their endpoint (SSE, socket, etc.).
 */

TP.sig.SignalSource.defineSubtype('URISignalSource');

//  This is intended for use as a set of traits, not a concrete type.
TP.sig.URISignalSource.isAbstract(true);

//  ------------------------------------------------------------------------
//  Inst Attributes
//  ------------------------------------------------------------------------

TP.sig.URISignalSource.Inst.defineAttribute('uri');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.URISignalSource.Inst.defineMethod('setURI',
function(aURI) {

    /**
     * @method setURI
     * @summary Defines the endpoint URI for the receiver.
     * @param {TP.uri.URI} aURI The URI representing the signal endpoint.
     * @exception TP.sig.InvalidURI
     * @returns {TP.sig.SignalSource} A new instance.
     */

    var uri;

    //  Not a valid URI? We can't initialize properly then...
    if (!TP.isURI(uri = TP.uc(aURI))) {
        return this.raise('TP.sig.InvalidURI');
    }

    this.set('uri', uri);

    return this;
});

//  ========================================================================
//  TP.sig.MessageSource
//  ========================================================================

/*
TP.sig.MessageSource provides a common supertype for objects with an onmessage
interface. Examples include web sockets and server-sent events.
*/

TP.sig.SignalSource.defineSubtype('sig.MessageSource');

//  ------------------------------------------------------------------------
//  Inst Attributes
//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineAttribute('active', false);

//  The list of standard handler names that instances of this type will
//  automatically add listeners for.
TP.sig.MessageSource.Inst.defineAttribute(
    '$standardEventHandlerNames', TP.ac('open', 'close', 'error', 'message'));

//  The private TP.core.Hash containing a map of custom event names to the
//  handlers that were installed for each one so that we can unregister them.
TP.sig.MessageSource.Inst.defineAttribute('$customEventHandlers');

TP.sig.MessageSource.Inst.defineAttribute('errorCount', 0);

TP.sig.MessageSource.Inst.defineAttribute('source');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize a new signal instance.
     * @returns {TP.sig.MessageSource} A new instance.
     */

    this.callNextMethod();

    this.set('$customEventHandlers', TP.hc());

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineMethod('activate',
function() {

    /**
     * @method activate
     * @summary Activates observation of the message source. In most cases
     *     this will be a variation on adding a listener to a native source.
     * @returns {Boolean} Whether or not the activation was successful.
     */

    TP.override();
});

//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineMethod('addObserver',
function(aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Invoked by observe() to add an observation or activate
     *     underlying signaling hooks necessary to ensure proper signaling.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    var sigTypes;

    if (TP.notValid(aSignal)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  If we're not already active try to activate now. If that fails
    //  we'll skip any attempt to register...we can't get to the endpoint.
    if (TP.notValid(this.get('source')) || !this.isActive()) {
        if (!this.activate()) {
            TP.warn('Unable to activate message source. Ignoring observation.');
            return false;
        }
    }

    //  Signal can be singular or an array of them. Normalize to an array.
    if (!TP.isArray(sigTypes = aSignal)) {
        sigTypes = TP.ac(aSignal);
    }

    //  Process the signal array into an array of all signal types that are
    //  being requested including their subtypes for inheritance firing.
    sigTypes = sigTypes.collect(
                function(aSignalType) {
                    var sigType,
                        subs;

                    //  Convert any signal names to the actual type objects.
                    sigType = TP.isType(aSignalType) ?
                        aSignalType :
                        TP.sys.getTypeByName(aSignalType);

                    //  To support "inheritance firing" we need any subtypes.
                    if (TP.notValid(subs = sigType.getSubtypes())) {
                        return sigType;
                    }

                    return TP.ac(sigType, subs);
                });

    sigTypes = sigTypes.flatten();

    //  Configure any custom event handlers necessary for the signals given.
    this.setupCustomHandlers(sigTypes);

    //  Tell the notification to register our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineMethod('deactivate',
function(closed) {

    /**
     * @method deactivate
     * @summary Deactivates observation of the message source.
     * @param {Boolean} [closed=false] True to tell deactivate any remote
     *     connection that the receiver is managing is already closed so skip
     *     any internal close call.
     * @returns {Boolean} Whether or not the connection closed successfully.
     */

    var source;

    if (!this.isActive()) {
        return true;
    }

    source = this.get('source');
    if (TP.notValid(source)) {
        //  NOTE we don't raise here since this is often called during shutdown
        //  and we don't want to report on errors we can't do anything about.
        return false;
    }

    if (TP.notTrue(closed)) {
        try {
            source.close();
        } catch (e) {
            void 0;
        }
    }

    this.signal('TP.sig.SourceClosed', TP.hc('source', source));

    this.set('source', null);

    //  Empty whatever remaining custom handlers that weren't unregistered (we
    //  don't have to worry about removing them as event listeners from the
    //  event source object since we're disposing of it).
    this.get('$customEventHandlers').empty();

    return true;
});

//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineMethod('isActive',
function(aFlag) {

    /**
     * @method isActive
     * @summary A source is active if activate() has been called and no
     *     corresponding deactivate() call has been made.
     * @param {Boolean} [aFlag] If present, sets the state rather than gets it.
     * @returns {Boolean} Whether or not the source is open.
     */

    if (TP.isValid(aFlag)) {
        this.$set('active', aFlag);
    }

    return TP.isTrue(this.$get('active'));
});

//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineMethod('removeObserver',
function(aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Object[]} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    var sigTypes;

    if (TP.notValid(aSignal)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (!this.hasObservers()) {
        return true;
    }

    //  Signal can be a single instance or array. Normalize to array.
    if (!TP.isArray(sigTypes = aSignal)) {
        sigTypes = TP.ac(aSignal);
    }

    //  Convert any string-based signals/instances into signal types including
    //  any subtypes to support inheritance-style observe/ignore semantics.
    sigTypes = sigTypes.collect(
                function(aSignalType) {
                    var sigType,
                        subs;

                    //  Grab the real type object if it wasn't supplied.
                    sigType = TP.isType(aSignalType) ?
                        aSignalType :
                        TP.sys.getTypeByName(aSignalType);

                    if (TP.notValid(subs = sigType.getSubtypes())) {
                        return sigType;
                    }

                    return TP.ac(sigType, subs);
                });
    sigTypes = sigTypes.flatten();

    //  Remove any custom handlers we installed for proper signaling.
    this.teardownCustomHandlers(sigTypes);

    if (!this.hasObservers()) {
        this.deactivate();
    }

    //  Always tell the notification system to remove our handler, etc.
    //  presuming this was invoked indirectly via ignore().
    return true;
});

//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineMethod('setupCustomHandlers',
function(signalTypes) {

    /**
     * @method setupCustomHandlers
     * @summary Configures handlers for custom messages coming from a remote
     *     connection.
     * @param {TP.sig.SourceSignal[]} signalTypes An Array of
     *     TP.sig.SourceSignal subtypes to check for custom handler
     *     registration.
     * @returns {TP.sig.MessageSource} The receiver.
     */

    TP.override();

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineMethod('setupStandardHandlers',
function() {

    /**
     * @method setupStandardHandlers
     * @summary Sets up the 'standard' handlers for messages coming from a
     *     remote connection.
     * @exception TP.sig.InvalidSource
     * @returns {TP.sig.MessageSource} The receiver.
     */

    var source,
        thisref;

    source = this.get('source');

    if (TP.notValid(source)) {
        this.raise('TP.sig.InvalidSource');
        return this;
    }

    thisref = this;

    //  Connect our local 'on*' methods to their related native listeners.
    this.get('$standardEventHandlerNames').forEach(
        function(op) {
            if (TP.canInvoke(thisref, 'on' + op)) {
                //  Replace method with bound version to support removal.
                thisref['on' + op] = thisref['on' + op].bind(thisref);
                source.addEventListener(op, thisref['on' + op], false);
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineMethod('teardownCustomHandlers',
function(signalTypes) {

    /**
     * @method teardownCustomHandlers
     * @summary Tears down the 'standard' handlers for messages coming from a
     *     remote connection.
     * @param {TP.sig.SourceSignal[]} signalTypes An Array of
     *     TP.sig.SourceSignal subtypes to check for custom handler
     *     registration.
     * @returns {TP.sig.MessageSource} The receiver.
     */

    TP.override();
});

//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineMethod('teardownStandardHandlers',
function(signalTypes) {

    /**
     * @method teardownStandardHandlers
     * @summary Tears down the 'standard' handlers for messages coming from a
     *     remote connection.
     * @returns {TP.sig.MessageSource} The receiver.
     */

    var source,
        thisref;

    source = this.get('source');
    if (TP.notValid(source)) {
        this.raise('TP.sig.InvalidSource');
        return this;
    }

    thisref = this;

    //  Disconnect our local 'on*' methods from their related native listeners.
    this.get('$standardEventHandlerNames').forEach(
        function(op) {
            if (TP.canInvoke(thisref, 'on' + op)) {
                source.removeEventListener(op, thisref['on' + op]);
            }
        });

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Handlers
//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineHandler('AppShutdown',
function(aSignal) {

    /**
     * @method handleAppShutdown
     * @summary Handles when the app is about to be shut down. Used to
     *     deactivate the signal source to avoid leaving open connections.
     * @param {TP.sig.AppShutdown} aSignal The signal indicating that the
     *     application is to be shut down.
     * @returns {TP.sig.MessageSource} The receiver.
     */

    this.deactivate();

    return this;
});

//  ========================================================================
//  TP.sig.MessageConnection
//  ========================================================================

/*
TP.sig.MessageSource provides a common supertype for objects with an onmessage
interface. Examples include worker threads, server sent events, etc.
*/

TP.sig.MessageSource.defineSubtype('sig.MessageConnection');

TP.sig.MessageConnection.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.MessageConnection.Inst.defineMethod('send',
function(message) {

    /**
     * @method send
     * @summary Sends text to the remote end of the connection for connections
     *     which support it. Connections which are server-to-client only throw
     *     an UnsupportedOperation exception.
     * @param {String|Object} message The message to send. If the message is
     *     not a String it it serialized via the receivers implementation of
     *     serializeMessage.
     */

    return this.sendMessage(this.serializeMessage(message));
});

//  ------------------------------------------------------------------------

TP.sig.MessageConnection.Inst.defineMethod('sendMessage',
function(message) {

    /**
     * @method sendMessage
     * @summary Sends a string to the remote end of the connection. This method
     *     does not serialize content. Use send() if you want serialization.
     * @param {String} message The string to send to the end of the connection.
     */

    TP.override();
});

//  ------------------------------------------------------------------------

TP.sig.MessageConnection.Inst.defineMethod('serializeMessage',
function(message) {

    /**
     * @method serializeMessage
     * @summary Serializes a message object to produce a string message. If the
     *     message object implements an 'asMessage' method that method is
     *     invoked, otherwise the default is JSON.stringify.
     * @param {Object} message The object to serialize.
     */

    if (TP.isString(message)) {
        return message;
    }

    if (TP.canInvoke('asMessage')) {
        return message.asMessage();
    }

    return JSON.stringify(message);
});

//  ========================================================================
//  TP.sig.RemoteMessageSource
//  ========================================================================

TP.sig.MessageSource.defineSubtype('sig.RemoteMessageSource');

TP.sig.RemoteMessageSource.addTraits(TP.sig.URISignalSource);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sig.RemoteMessageSource.Inst.defineAttribute('sourceParams');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.RemoteMessageSource.Inst.defineMethod('init',
function(aURI, sourceParams) {

    /**
     * @method init
     * @summary Initialize a new signal instance.
     * @param {TP.uri.URI} aURI The endpoint URI representing the remote
     *     messaging source.
     * @param {TP.core.Hash} [sourceParams] Optional parameters used by the
     *     receiver to configure the message source.
     * @returns {TP.sig.RemoteMessageSource} A new instance.
     */

    this.callNextMethod();

    //  Invoke mixed-in setter to capture the URI value.
    this.setURI(aURI);

    //  Grab any parameters that the caller wants us to use to configure the
    //  remote source.
    this.set('sourceParams', sourceParams);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.RemoteMessageSource.Inst.defineMethod('activate',
function() {

    /**
     * @method activate
     * @summary Opens the connection to a remote messaging source.
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidSource
     * @exception TP.sig.InvalidSourceType
     * @returns {Boolean} Whether or not the connection opened successfully.
     */

    var source,
        sourceType;

    //  If we're active and have a real source object nothing to do.
    if (this.isActive() && TP.isValid(this.get('source'))) {
        return true;
    }

    //  Reset any error count so we can reactivate without issues.
    this.set('errorCount', 0);

    sourceType = this.getSourceType();

    //  NB: We use a TP.notValid check here because the type we get back from
    //  getSourceType is (or should be) a native platform constructor.
    if (TP.notValid(sourceType)) {

        this.raise('InvalidSourceType');
        return false;
    }

    try {
        source = this.constructSource();
    } catch (e) {
        this.raise('TP.sig.InvalidSource', e);
        return false;
    }

    //  Couldn't construct an instance of our source type? Raise an exception
    //  and exit here.
    if (TP.notValid(source)) {

        this.raise('TP.sig.InvalidSource');
        return false;
    }

    //  Install an unload observer on the main window to close the source before
    //  leaving.
    //  TODO: Shouldn't this be moved to an AppShutdown handler like the
    //  TP.sig.MessageSource defines above... and then it needs to subscribe to
    //  those.
    window.addEventListener('unload',
        function() {
            source.close();
        }, false);

    this.set('source', source);
    this.setupStandardHandlers();

    //  The receiver is now active.
    this.isActive(true);

    return true;
});

//  ------------------------------------------------------------------------

TP.sig.RemoteMessageSource.Inst.defineMethod('constructSource',
function() {

    /**
     * @method constructSource
     * @summary Constructs an instance of the underlying system-level object
     *     that is going to be sending and receiving remote messages.
     * @returns {Object} The system object that will send and receive messages.
     */

    var srcType,
        uriStr,
        options;

    srcType = this.getSourceType();

    uriStr = this.get('uri').asString();

    //  Make sure that, one or another, we end up with POJO.
    options = this.get('sourceParams');
    if (TP.isValid(options)) {
        options = options.asObject();
    } else {
        options = {};
    }

    //  NB: We use old-style JS syntax here because the type we get back from
    //  getSourceType is (or should be) a native platform constructor.
    return new srcType(uriStr, options);
});

//  ------------------------------------------------------------------------

TP.sig.RemoteMessageSource.Inst.defineMethod('getSourceType',
function() {

    /**
     * @method getSourceType
     * @summary The JavaScript constructor of the underlying system-level object
     *     that is going to be sending and receiving remote messages.
     * @returns {Function} The constructor of the system object that will send
     *     and receive messages.
     */

    TP.override();
});

//  ------------------------------------------------------------------------

TP.sig.RemoteMessageSource.Inst.defineMethod('onopen',
function(evt) {

    /**
     * @method onopen
     * @summary The method that is invoked when the remote messaging source that
     *     the receiver is managing has opened a connection to its remote
     *     server.
     * @param {MessageEvent} evt The event sent by the underlying system.
     * @returns {TP.sig.RemoteMessageSource} The receiver.
     */

    var source,
        payload;

    source = this.get('source');

    payload = TP.hc(
        'source', source,
        'sourceURL', this.get('uri')
    );

    this.signal('TP.sig.SourceOpen', payload);

    return this;
});

//  ========================================================================
//  TP.core.SSEMessageSource
//  ========================================================================

TP.sig.RemoteMessageSource.defineSubtype('core.SSEMessageSource');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.SSEMessageSource.Type.defineMethod('isSupported',
function() {

    /**
     * @method isSupported
     * @summary Whether or not the Server-Sent Events system is supported in the
     *     current environment.
     * @returns {Boolean} Whether or not Server-Sent Events are supported.
     */

    return TP.isValid(TP.global.EventSource);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The list of standard handler names that instances of this type will
//  automatically add listeners for. We override this from our supertype to
//  remove 'message' from the list. We handle 'onmessage' events differently at
//  this type level.
TP.core.SSEMessageSource.Inst.defineAttribute(
    '$standardEventHandlerNames', TP.ac('open', 'close', 'error'));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.SSEMessageSource.Inst.defineMethod('getSourceType',
function() {

    /**
     * @method getSourceType
     * @summary The JavaScript constructor of the Server-Sent Events system
     *     object.
     * @returns {EventSource} The constructor of the Server-Sent Events system
     *     object.
     */

    return TP.global.EventSource;
});

//  ------------------------------------------------------------------------

TP.core.SSEMessageSource.Inst.defineMethod('onerror',
function(evt) {

    /**
     * @method onerror
     * @summary The default method that is invoked when the server-sent events
     *     system that the receiver is managing has generated an error.
     * @param {ErrorEvent} evt The event sent by the underlying system.
     * @returns {TP.sig.SSEMessageSource} The receiver.
     */

    var payload,
        errorCount,
        source;

    errorCount = this.get('errorCount');
    source = this.get('source');

    //  Too many errors.
    if (errorCount > TP.sys.cfg('sse.max_errors')) {
        this.raise('TP.sig.UnstableConnection');
        this.deactivate();
        return this;
    }

    this.set('errorCount', errorCount++);

    //  If the readyState is set to EventSource.CLOSED, then the browser is
    //  'failing the connection'. In this case, we signal a
    //  'TP.sig.SourceClosed' and return.
    if (source.readyState === EventSource.CLOSED) {
        this.deactivate();
        return this;
    }

    //  If the readyState is set to EventSource.CONNECTING, then the browser is
    //  trying to 'reestablish the connection'. In this case, we signal a
    //  'TP.sig.SourceReconnecting' and return.
    if (source.readyState === EventSource.CONNECTING) {
        this.signal('TP.sig.SourceReconnecting', payload);
        return this;
    }

    //  Otherwise, there was truly some sort of error, so we signal
    //  'TP.sig.SourceError' with some information
    payload = TP.hc(
        'sourceURL', source.url,
        'withCredentials', source.withCredentials,
        'readyState', source.readyState
    );

    this.signal('TP.sig.SourceError', payload);

    this.deactivate();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SSEMessageSource.Inst.defineMethod('onmessage',
function(evt) {

    /**
     * @method onmessage
     * @summary The default method that is invoked when the server-sent events
     *     system that the receiver is managing has received data and has posted
     *     a message back into this content containing that data.
     * @param {MessageEvent} evt The event sent by the underlying system.
     * @returns {TP.sig.SSEMessageSource} The receiver.
     */

    var source,
        data,
        payload,
        signalName;

    source = this.get('source');

    try {
        data = TP.json2js(evt.data);
    } catch (e) {
        data = evt.data;
    }

    payload = TP.hc(
                'origin', evt.origin,
                'data', data,
                'lastEventId', evt.lastEventId,
                'sourceURL', source.url
                );

    //  If a signalName was placed onto the event by the caller, then use it.
    signalName = evt.signalName || 'TP.sig.SourceDataReceived';

    this.signal(signalName, payload);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SSEMessageSource.Inst.defineMethod('setupCustomHandlers',
function(signalTypes) {

    /**
     * @method setupCustomHandlers
     * @summary Sets up handlers for 'custom' server-side events.
     * @description The Server-Sent Events specification does not specify that
     *     the 'onmessage' handler will fire when there is a custom 'event' (as
     *     specified by the 'event:' tag in the received data). We check the
     *     signal types being observed for a REMOTE_NAME which allows it to
     *     adapt to server event names which should map to that signal type and
     *     register a low-level handler accordingly.
     * @param {TP.sig.SourceSignal[]} signalTypes An Array of
     *     TP.sig.SourceSignal subtypes to check for custom handler
     *     registration.
     * @exception TP.sig.InvalidSource
     * @returns {TP.sig.RemoteMessageSource} The receiver.
     */

    var source,
        thisref,
        handlerRegistry;

    if (TP.notValid(source = this.get('source'))) {
        this.raise('TP.sig.InvalidSource');
        return this;
    }

    //  A map that we need to keep up-to-date for handler unregistration
    handlerRegistry = this.get('$customEventHandlers');

    thisref = this;

    signalTypes.perform(
            function(aSignalType) {
                var eventName,
                    signalName,
                    handlerFunc;

                signalName = aSignalType.getSignalName();

                //  Get the eventName from the signal type. This might be null
                //  or undefined, which means that we'll take a different path
                //  below.
                eventName = aSignalType.REMOTE_NAME;

                //  If there's already a handler registered for this native
                //  event type then just return here. We don't want multiple
                //  handlers for the same native event.
                if (handlerRegistry.hasKey(eventName)) {
                    return;
                }

                //  Look for a method to match the eventName to use as the
                //  handler.
                if (TP.canInvoke(thisref, 'on' + eventName)) {
                    handlerFunc = thisref['on' + eventName].bind(thisref);
                } else {
                    //  No special handler so rely on a wrapped copy of
                    //  onmessage that we pass the specific signal name to.
                    handlerFunc = function(evt) {
                        evt.signalName = signalName;
                        this.onmessage(evt);
                    }.bind(thisref);

                    //  We need to default the eventName to 'message' here, so
                    //  that if one wasn't supplied, the addEventListener below
                    //  will work.
                    eventName = TP.ifInvalid(eventName, 'message');
                }

                //  Put it in the handler registry in case we went to
                //  unregister it interactively later.
                handlerRegistry.atPut(eventName, handlerFunc);

                //  Add the custom event listener to the event source.
                source.addEventListener(eventName, handlerFunc, false);
            });

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SSEMessageSource.Inst.defineMethod('teardownCustomHandlers',
function(signalTypes) {

    /**
     * @method teardownCustomHandlers
     * @summary Tears down handlers for 'custom' server-side events.
     * @description Because the Server-Sent Events specification does not
     *     specify that the general 'message' handler will fire when there is a
     *     custom 'event' (as specified by the 'event:' tag in the received
     *     data), we look at the signals being registered and if they have a
     *     'REMOTE_NAME' slot, we use that to unregister a handler with our
     *     private source object.
     * @param {TP.sig.SourceSignal[]} signalTypes An Array of
     *     TP.sig.SourceSignal subtypes to check for custom handler
     *     registration.
     * @returns {TP.sig.RemoteMessageSource} The receiver.
     */

    var source,
        handlerRegistry;

    if (TP.notValid(source = this.get('source'))) {
        //  NOTE we don't raise here since this is often called during shutdown
        //  and we don't want to report on errors we can't do anything about.
        return this;
    }

    //  A map that we have kept up-to-date for handler unregistration
    handlerRegistry = this.get('$customEventHandlers');

    //  Loop over the signal types (or their names) and see if they need a
    //  custom handler registered for them.
    signalTypes.perform(
        function(aSignalType) {
            var customName,

                handlerFunc;

            customName = TP.ifInvalid(aSignalType.REMOTE_NAME, 'message');

            //  If there is a callable function registered in the handler
            //  registry under the custom event name, remove it.
            if (TP.isCallable(handlerFunc =
                                handlerRegistry.atPut(customName))) {

                handlerRegistry.removeKey(customName);
                source.removeEventListener(customName, handlerFunc, false);
            }
        });

    return this;
});

//  ========================================================================
//  TP.core.Socket
//  ========================================================================

TP.sig.RemoteMessageSource.defineSubtype('TP.core.Socket');

//  Mix in send capability.
TP.core.Socket.addTraits(TP.sig.MessageConnection);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.Socket.defineConstant('DEFAULT_PROTOCOLS', TP.ac());

TP.core.Socket.defineConstant('STATES', {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Socket.Type.defineMethod('isSupported',
function() {

    /**
     * @method isSupported
     * @summary Whether or not WebSockets are supported in the current
     *     environment.
     * @returns {Boolean} Whether or not WebSockets are supported.
     */

    return TP.isValid(TP.global.WebSocket);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineAttribute('protocols');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('init',
function(aURI, protocols) {

    /**
     * @method init
     * @summary Initialize a new signal instance.
     * @param {TP.uri.URI} aURI The endpoint URI representing the WebSocket
     *     messaging source.
     * @param {String[]} protocols An Array of custom WebSocket protocols that
     *     the connection should be configured for.
     * @returns {TP.core.Socket} A new instance.
     */

    this.callNextMethod();

    if (TP.isValid(protocols)) {
        this.$set('protocols', protocols);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('constructSource',
function() {

    /**
     * @method constructSource
     * @summary Constructs an instance of the underlying system-level object
     *     that is going to be sending and receiving remote messages.
     * @returns {Object} The system object that will send and receive messages.
     */

    var type,
        uri,
        protocols;

    type = this.getSourceType();

    uri = this.get('uri').asString();

    protocols = this.getProtocols();

    if (TP.notEmpty(protocols)) {
        return new type(uri, protocols);
    } else {
        return new type(uri);
    }
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('getProtocols',
function() {

    /**
     * @method getProtocols
     * @summary The custom protocols that the receiver's WebSocket connection
     *     should be configured for.
     * @returns {String[]} An Array of custom WebSocket protocols that the
     *     connection is configured for.
     */

    var list;

    list = this.$get('protocols');

    return TP.isValid(list) ? list : this.getType().get('DEFAULT_PROTOCOLS');
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('getSourceType',
function() {

    /**
     * @method getSourceType
     * @summary The JavaScript constructor of the WebSockets system object.
     * @returns {WebSocket} The constructor of the WebSockets system object.
     */

    return TP.global.WebSocket;
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('isClosed',
function() {

    /**
     * @method isClosed
     * @summary Whether or not the underlying WebSocket connection is closed.
     * @returns {Boolean} Whether or not the underlying WebSocket connection
     *     is closed.
     */

    var source;

    source = this.$get('source');
    if (TP.notValid(source)) {
        return true;
    }

    return source.readyState === TP.core.Socket.STATES.CLOSED ||
            source.readyState === TP.core.Socket.STATES.CLOSING;
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('onclose',
function(evt) {

    /**
     * @method onclose
     * @summary The method that is invoked when the web socket that the receiver
     *     is managing has closed.
     * @param {CloseEvent} evt The event sent by the underlying system.
     * @returns {TP.core.Socket} The receiver.
     */

    var source,
        payload;

    source = this.get('source');

    //  Repackage WebSocket data into a hash to use as the payload for the
    //  SourceClosed signal.
    payload = TP.hc(
                'code', evt.code,
                'reason', evt.reason,
                'sourceURL', source.url
                );

    this.signal('TP.sig.SourceClosed', payload);

    //  Deactivate but force it to skip any close() operation that might trigger
    //  a recursion.
    this.deactivate(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('onerror',
function(evt) {

    /**
     * @method onerror
     * @summary The method that is invoked when the web socket that the receiver
     *     is managing has encountered an error.
     * @param {ErrorEvent} evt The event sent by the underlying system.
     * @returns {TP.core.Socket} The receiver.
     */

    TP.error(evt);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('onmessage',
function(evt) {

    /**
     * @method onmessage
     * @summary The method that is invoked when the web socket that the receiver
     *     is managing has data ready to be processed.
     * @param {MessageEvent} evt The event sent by the underlying system.
     * @returns {TP.core.Socket} The receiver.
     */

    TP.info(evt.data);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('sendMessage',
function(message) {

    /**
     * @method sendMessage
     * @summary Sends a string to the remote end of the connection. This method
     *     does not serialize content. Use send() if you want serialization.
     * @param {String} message The string to send to the end of the connection.
     * @returns TP.core.Socket The receiver.
     */

    var source;

    source = this.get('source');

    source.send(message);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('setupCustomHandlers',
function(signalTypes) {

    /**
     * @method setupCustomHandlers
     * @summary Configures handlers for custom events from the server. This
     *     method normally does nothing for a Socket. You can use it to support
     *     custom protocols as you require.
     * @param {TP.sig.SourceSignal[]} signalTypes An Array of
     *     TP.sig.SourceSignal subtypes to check for custom handler
     *     registration.
     * @returns {TP.core.Socket} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('teardownCustomHandlers',
function(signalTypes) {

    /**
     * @method teardownCustomHandlers
     * @summary Tears down handlers for custom events from the server. This
     *     method normally does nothing for a Socket. You can use it to support
     *     custom protocols as you require.
     * @param {TP.sig.SourceSignal[]} signalTypes An Array of
     *     TP.sig.SourceSignal subtypes to check for custom handler
     *     registration.
     * @returns {TP.core.Socket} The receiver.
     */

    return this;
});

//  ========================================================================
//  TP.sig.GeolocationSignal
//  ========================================================================

TP.sig.Signal.defineSubtype('GeolocationSignal');
TP.sig.GeolocationSignal.defineSubtype('GeolocationChange');
TP.sig.GeolocationSignal.defineSubtype('GeolocationError');

//  ========================================================================
//  TP.core.Geolocation
//  ========================================================================

TP.sig.MessageSource.defineSubtype('TP.core.Geolocation');

/**
 * Dictionary of window GID to geo watch objects. Used to capture registrations
 * so we can removeObserver correctly by clearing the watch on the window.
 */
TP.core.Geolocation.Type.defineAttribute('$watches', TP.hc());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Geolocation.Type.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Invoked by observe() to add an observation or activate
     *     underlying signaling hooks necessary to ensure proper signaling.
     * @param {Object|Object[]} anOrigin One or more origins to observe.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    var map,
        origin,
        originID,
        geoWatch;

    if (TP.notValid(window.geolocation)) {
        return this.raise('UnsupportedOperation');
    }

    map = this.get('$watches');

    if (TP.notValid(anOrigin) || TP.notValid(aSignal)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (TP.isWindow(anOrigin)) {
        origin = anOrigin;
    } else if (TP.isString(anOrigin)) {
        origin = TP.getWindowById(anOrigin);
        if (TP.notValid(origin)) {
            return this.raise('TP.sig.InvalidOrigin');
        }
    } else {
        return this.raise('TP.sig.InvalidOrigin');
    }

    originID = TP.gid(origin);

    if (TP.isValid(origin.navigator.geolocation)) {

        //  Set up the 'watch' with a success callback that signals a
        //  GeolocationChange and an error callback that signals a
        //  GeolocationError
        geoWatch = origin.navigator.geolocation.watchPosition(
            function(position) {
                var coords,
                    data;

                coords = position.coords;

                //  Break up the returned data into a well structured
                //  hash data structure.
                data = TP.hc(
                        'latitude', coords.latitude,
                        'longitude', coords.longitude,
                        'altitude', coords.altitude,
                        'accuracy', coords.accuracy,
                        'altitudeAccuracy', coords.altitudeAccuracy,
                        'heading', coords.heading,
                        'speed', coords.speed,
                        'timestamp', position.timestamp
                        );

                TP.signal(origin, 'TP.sig.GeolocationChange', data);
            },
            function(error) {
                var errorMsg;

                errorMsg = '';

                //  Check for known errors
                switch (error.code) {

                    case error.PERMISSION_DENIED:
                        errorMsg = TP.sc('This website does not have ',
                                            'permission to use ',
                                            'the Geolocation API');
                        break;

                    case error.POSITION_UNAVAILABLE:
                        errorMsg = TP.sc('The current position could ',
                                            'not be determined.');
                        break;

                    case error.PERMISSION_DENIED_TIMEOUT:
                        errorMsg = TP.sc('The current position could ',
                                            'not be determined ',
                                            'within the specified ',
                                            'timeout period.');
                        break;

                    default:
                        break;
                }

                //  If it's an unknown error, build a errorMsg that
                //  includes information that helps identify the
                //  situation so that the error handler can be updated.
                if (errorMsg === '') {
                    errorMsg = TP.sc('The position could not be ',
                                        'determined due to an unknown ',
                                        'error (Code: ') +
                                        error.code.toString() +
                                        ').';
                }

                TP.signal(origin, 'TP.sig.GeolocationError', errorMsg);
            });

        map.atPut(originID, geoWatch);
    }

    //  Always tell the notification system to register our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.core.Geolocation.Type.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Invoked by ignore() to remove an observation or deactivate
     *     underlying signaling hooks necessary to ensure proper signaling.
     * @param {Object|Object[]} anOrigin One or more origins to ignore.
     * @param {Object|Object[]} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    var map,
        origin,
        originID,
        geoWatch;

    map = this.get('$watches');

    if (TP.isWindow(anOrigin)) {
        origin = anOrigin;
    } else if (TP.isString(anOrigin)) {
        origin = TP.getWindowById(anOrigin);
        if (TP.notValid(origin)) {
            return this.raise('TP.sig.InvalidOrigin');
        }
    } else {
        return this.raise('TP.sig.InvalidOrigin');
    }

    originID = TP.gid(origin);

    //  If our 'queries' map has an entry for the query, then it's a
    //  registration that we care about.
    if (TP.isValid(geoWatch = map.at(originID))) {
        if (TP.isValid(origin.navigator.geolocation)) {
            origin.navigator.geolocation.clearWatch(geoWatch);
        }

        map.removeKey(originID);
    }

    //  Always tell the notification system to remove our handler, etc.
    return true;
});

//  ========================================================================
//  TP.core.MediaQuery
//  ========================================================================

TP.sig.MessageSource.defineSubtype('TP.core.MediaQuery');

/**
 * The count of observers. Incremented via addObserver, decremented via
 * removeObserver. When decrementing if the count reaches 0 the observer hook is
 * removed.
 * @type {Number}
 */
TP.core.MediaQuery.Inst.defineAttribute('$count', 0);

/**
 * The hook function used to activate the observation.
 * @type {Function}
 */
TP.core.MediaQuery.Inst.defineAttribute('$hook');

/**
 * The query object returned from the native interface used to de-register.
 * @type {Object}
 */
TP.core.MediaQuery.Inst.defineAttribute('$mediaQuery');

/**
 * The media query string. Should start with '@media'.
 * @type {String}
 */
TP.core.MediaQuery.Inst.defineAttribute('$query');

/**
 * The target window. Defaults to UICANVAS.
 * @type {Window}
 */
TP.core.MediaQuery.Inst.defineAttribute('$window');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.MediaQuery.Inst.defineMethod('init',
function(query, win) {

    /**
     * @method init
     * @summary Initializes a new instance of the receiver.
     * @param {String} query The query to use when observing changes to the
     *     document associated with the supplied Window.
     * @param {Window} win The window that the supplied media query should
     *     execute in.
     * @returns {TP.core.MediaQuery} A new instance.
     */

    var source;

    if (TP.notValid(query)) {
        return this.raise('InvalidParameter');
    }

    if (!/@media /.test(query)) {
        return this.raise('InvalidParameter');
    }

    source = win;
    if (TP.notValid(source)) {
        source = TP.getUICanvas().getNativeWindow();
    }

    if (!TP.isWindow(source)) {
        return this.raise('InvalidWindow');
    }

    this.$set('$query', query);
    this.$set('$window', source);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.MediaQuery.Inst.defineMethod('addObserver',
function(aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    var origin,
        query,
        count,
        handler,
        mediaQuery;

    //  Already activated? Just return true to tell notification system to keep
    //  processing the registration.
    if (TP.isValid(this.$get('$mediaQuery'))) {
        return true;
    }

    count = this.$get('$count');
    this.$set('count', count + 1);

    origin = this.$get('$window');
    query = this.$get('$query');

    //  Define a handler that will signal CSSMediaActive or CSSMediaInactive
    //  depending on whether the query matches or not.
    handler = function(aQuery) {
        if (aQuery.matches) {
            TP.signal(origin, 'TP.sig.CSSMediaActive', aQuery.media);
        } else {
            TP.signal(origin, 'TP.sig.CSSMediaInactive', aQuery.media);
        }
    };
    this.$set('$hook', handler);

    //  Perform the query and get the MediaQueryList back. Note that this will
    //  also register the handler so that the callback fires when the
    //  environment changes.
    mediaQuery = TP.windowQueryCSSMedia(origin, query, handler);
    this.$set('$mediaQuery', mediaQuery);

    //  Always tell the notification system to register our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.core.MediaQuery.Inst.defineMethod('removeObserver',
function(aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Removes a local signal observation which is roughly like a DOM
     *     element removing an event listener.
     * @param {Object|Object[]} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    var count,
        hook,
        mediaQuery;

    count = this.$get('$count');
    if (count === 0) {
        return true;
    }

    this.$set('count', count - 1);
    if (count > 0) {
        return true;
    }

    mediaQuery = this.$get('$mediaQuery');
    if (TP.notValid(mediaQuery)) {
        return true;
    }

    hook = this.$get('$hook');
    if (TP.isMediaQueryList(mediaQuery)) {
        mediaQuery.removeListener(hook);
    }

    //  Always tell the notification system to remove our handler, etc.
    return true;
});

//  ========================================================================
//  TP.sig.MutationSignalSource
//  ========================================================================

/*
*/

TP.sig.SignalSource.defineSubtype('sig.MutationSignalSource');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.MutationSignalSource.Type.defineAttribute('queries');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.MutationSignalSource.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.set('queries', TP.hc());

    //  Add a managed Mutation Observer filter Function that will suspend all
    //  Mutation Observer notification until the flag is flipped back.
    TP.addMutationObserverFilter(
        function(aMutationRecord) {
            return !TP.sys.$$suspendAllTIBETMutationObservers;
        },
        TP.ALL);

    //  Add a managed Mutation Observer filter Function that will filter
    //  mutation records for:
    //
    //      - style attribute changes.
    //      - flipping 'pclass:hover' attribute changes.

    TP.addMutationObserverFilter(
        function(aMutationRecord) {

            if (aMutationRecord.type === 'attributes') {

                switch (aMutationRecord.attributeName) {

                    case 'style':
                        return false;

                    case 'hover':
                        if (aMutationRecord.attributeNamespace ===
                            TP.w3.Xmlns.PCLASS) {
                            return false;
                        }

                        break;

                    default:
                        break;
                }
            }

            return true;
        },
        TP.ALL);

    //  Add a managed Mutation Observer filter Function that will filter
    //  mutation records for:
    //
    //      - generated nodes

    TP.addMutationObserverFilter(
        function(aMutationRecord) {

            var len,
                i,

                node;

            if (TP.notEmpty(aMutationRecord.addedNodes)) {

                len = aMutationRecord.addedNodes.length;
                for (i = 0; i < len; i++) {

                    node = aMutationRecord.addedNodes[i];

                    //  Nodes that are generated by TIBET, such as dragging
                    //  elements and resize trackers.
                    if (TP.isTrue(node[TP.GENERATED])) {
                        return false;
                    }
                }
            }

            if (TP.notEmpty(aMutationRecord.removedNodes)) {

                len = aMutationRecord.removedNodes.length;
                for (i = 0; i < len; i++) {

                    node = aMutationRecord.removedNodes[i];

                    //  Nodes that are generated by TIBET, such as dragging
                    //  elements and resize trackers.
                    if (TP.isTrue(node[TP.GENERATED])) {
                        return false;
                    }
                }
            }

            return true;
        },
        TP.ALL);

    //  Add a managed Mutation Observer filter Function that will filter
    //  mutation records for cases where the target itself or one of its
    //  ancestors has configured itself to not participate in mutation tracking.
    TP.addMutationObserverFilter(
        function(aMutationRecord) {

            var target,

                sherpaObj,

                ans,
                val;

            target = aMutationRecord.target;

            //  If the target isn't an Element, we allow the mutation.
            if (!TP.isElement(target)) {
                return true;
            }

            //  See if the Sherpa is currently processing DOM mutations. If so,
            //  then that means that we should just return true here.
            sherpaObj = TP.bySystemId('Sherpa');
            if (TP.isValid(sherpaObj) &&
                sherpaObj.get('shouldProcessDOMMutations')) {
                return true;
            }

            val = TP.elementGetAttribute(
                            target, 'tibet:nomutationtracking', true);
            if (val === TP.ANCESTOR_OR_SELF) {
                return false;
            }

            if (TP.isElement(
                ans = TP.nodeAncestorMatchingCSS(
                            target,
                            '*[tibet|nomutationtracking]'))) {

                val = TP.elementGetAttribute(
                            ans, 'tibet:nomutationtracking', true);

                if (val === 'true' || val === TP.ANCESTOR) {
                    return false;
                }
            }

            return true;
        },
        TP.ALL);

    return;
});

//  ------------------------------------------------------------------------

TP.sig.MutationSignalSource.Type.defineMethod('watchDocument',
function(aDocument) {

    /**
     * @method watchDocument
     * @summary Sets up observations for mutation on the document provided.
     * @param {Document} aDocument The document to register a Mutation Observer
     *     on.
     * @exception TP.sig.InvalidNode
     * @returns {TP.meta.sig.MutationSignalSource} The MutationSignalSource
     *     type.
     */

    var method,

        recordsHandler,
        observerConfig,

        mutationObserverID,

        styleChangesHandler;

    //  PhantomJS (at least at the time of this writing, doesn't support these).
    if (TP.notValid(TP.global.MutationObserver)) {
        return this;
    }

    method = TP.composeHandlerName('MutationEvent');

    //  Install a managed MutationObserver that will monitor the document for
    //  changes, filter them down to a consistent set of records, and use the
    //  TIBET signaling system to send change.

    recordsHandler = function(mutationRecords) {

        var recordGroups;

        //  Group the mutation records by target, so that we're only calling the
        //  recordsHandler once per target. We can do this because we're only
        //  processing childList and subtree mutations and therefore only care
        //  about added/removed nodes (which we coalesce below), not attribute
        //  changes. If we cared about attribute changes, then we would have to
        //  call the method we computed above individually for each mutation
        //  record.
        recordGroups = mutationRecords.groupBy(
                            function(aRecord) {
                                return aRecord.target;
                            });

        //  Iterate over the groups that were produced (i.e. groups of
        //  MutationRecords, grouped by the target).
        recordGroups.perform(
            function(kvPair) {

                var likeRecords,

                    len,
                    i,

                    likeRecord,

                    addedNodes,
                    removedNodes,

                    newRecord;

                //  NB: We don't care about the key here - it was just a way of
                //  uniquing based on the target node.
                likeRecords = kvPair.last();

                addedNodes = TP.ac();
                removedNodes = TP.ac();

                len = likeRecords.getSize();
                for (i = 0; i < len; i++) {

                    likeRecord = likeRecords.at(i);

                    addedNodes = addedNodes.concat(
                                    TP.ac(likeRecord.addedNodes));
                    removedNodes = removedNodes.concat(
                                    TP.ac(likeRecord.removedNodes));
                }

                newRecord = {};

                newRecord.target = likeRecords.at(0).target;
                newRecord.type = likeRecords.at(0).type;
                newRecord.addedNodes = addedNodes;
                newRecord.removedNodes = removedNodes;

                this[method](newRecord);

            }.bind(this));

    }.bind(this);

    //  Configure the underlying native Mutation Observer to be interested in
    //  DOM tree changes, but not DOM attribute changes.
    observerConfig = {
        childList: true,
        subtree: true,
        attributes: false,
        attributeOldValue: false
    };

    //  We will be installing this per-Document, so we need to unique it by the
    //  target Document's global ID.
    mutationObserverID = 'DOCUMENT_OBSERVER_' + TP.gid(aDocument);

    //  Add it as a managed Mutation Observer.
    TP.addMutationObserver(
            recordsHandler,
            observerConfig,
            mutationObserverID);

    //  Activate it.
    TP.activateMutationObserver(aDocument, mutationObserverID);

    //  Install a managed MutationObserver that will observe changes to style
    //  sheet elements (link, style, etc.) and will refresh the rules caches
    //  that elements keep to report which style rules apply to them.

    styleChangesHandler = function(mutationRecords) {

        var targets,

            len,
            i,
            record,

            target,

            targetTagName,

            styleType,
            fname;

        targets = TP.ac();

        len = mutationRecords.getSize();
        for (i = 0; i < len; i++) {

            record = mutationRecords.at(i);

            target = record.target;

            //  Switch depending on the type of mutation that occurred.
            switch (record.type) {

                //  If it was 'characterData', then we're only interested in
                //  XHTML 'style' elements because they're the only ones where
                //  character data can change.
                case 'characterData':

                    target = record.target.parentNode;
                    targetTagName = target.tagName.toLowerCase();

                    if (targetTagName === 'style') {
                        targets.push(target);
                    }

                    break;

                //  If it was 'attributes', then we're only interested in XHTML
                //  'link' elements and their 'href' attributes.
                case 'attributes':

                    targetTagName = target.tagName.toLowerCase();

                    if (targetTagName === 'link' &&
                        record.attributeName === 'href') {
                        targets.push(target);
                    }

                    break;

                default:
                    break;
            }
        }

        //  'targets' will be a list of 'style', 'link', etc. elements that have
        //  changed in some way. Refresh element caches from the stylesheets
        //  contained by these changed elements.
        if (TP.notEmpty(targets)) {

            targets.unique();

            len = targets.getSize();
            for (i = 0; i < len; i++) {

                target = targets.at(i);

                //  Refresh the rules cache for any elements that are affected
                //  by the stylesheet of the newly loaded style element.
                TP.$styleSheetRefreshAppliedRulesCaches(
                                        TP.cssElementGetStyleSheet(target));

                styleType = TP.wrap(target).getType();

                //  Allow the stylesheet to process the fact that it has been
                //  reloaded.
                fname = 'mutationUpdatedStyle';
                if (TP.canInvoke(styleType, fname)) {
                    styleType[fname](target, targets);
                }
            }
        }
    };

    observerConfig = {
        subtree: true,
        attributes: true,
        characterData: true
    };

    //  We will be installing this per-Document, so we need to unique it by the
    //  target Document's global ID.
    mutationObserverID = 'STYLE_CHANGES_OBSERVER_' + TP.gid(aDocument);

    TP.addMutationObserver(
            styleChangesHandler,
            observerConfig,
            mutationObserverID);

    //  Activate it.
    TP.activateMutationObserver(
        TP.documentEnsureHeadElement(aDocument),
        mutationObserverID);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.MutationSignalSource.Type.defineMethod('unwatchDocument',
function(aDocument) {

    /**
     * @method unwatchDocument
     * @summary Removes mutation observation for the document provided.
     * @param {Document} aDocument The document to remove a Mutation Observer
     *     from.
     * @exception TP.sig.InvalidNode
     * @returns {TP.meta.sig.MutationSignalSource} The MutationSignalSource
     *     type.
     */

    TP.removeMutationObserver('DOCUMENT_OBSERVER_' + TP.gid(aDocument));
    TP.removeMutationObserver('STYLE_CHANGES_OBSERVER_' + TP.gid(aDocument));

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.MutationSignalSource.Type.defineHandler('MutationEvent',
function(aMutationRecord) {

    /**
     * @method handleMutationEvent
     * @summary Responds to notifications that a mutation has occurred.
     * @param {MutationRecord} aMutationRecord The incoming mutation record.
     * @exception TP.sig.InvalidNode
     * @returns {TP.meta.sig.MutationSignalSource} The MutationSignalSource
     *     type.
     */

    var targetNode,

        processForSherpa,
        sherpaObj,

        targetShouldTrack,

        targetType,

        mutationType,

        fname,

        attrName,

        prevValue,
        newValue,
        operation,

        args,

        addedNodes,
        removedNodes,

        queryEntries,

        queryContext,
        targetDoc,
        doc,
        queryKeys,
        len,
        i,
        entry;

    //  Make sure that the target is a Node
    if (!TP.isNode(targetNode = aMutationRecord.target)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  See if the Sherpa is currently processing DOM mutations. If so, then
    //  that will factor into whether or not we will ignore this event or not.
    processForSherpa = false;
    sherpaObj = TP.bySystemId('Sherpa');
    if (TP.isValid(sherpaObj) &&
        sherpaObj.get('shouldProcessDOMMutations')) {
        processForSherpa = true;
    }

    //  If the target is an Element and it has a 'tibet:nomutationtracking'
    //  attribute on it that's either set to look at itself or at one of its
    //  ancestors or itself to determine whether or not it should process
    //  mutation signals.
    if (TP.isElement(targetNode)) {
        targetShouldTrack = TP.elementGetAttribute(
                targetNode, 'tibet:nomutationtracking', true);

        //  NB: Note how we also take processForSherpa into account here.
        if ((targetShouldTrack === 'true' ||
            targetShouldTrack === TP.ANCESTOR_OR_SELF) &&
            !processForSherpa) {
                return this;
            }
    }

    //  And make sure that we can computed a TIBET type for it.
    if (!TP.isType(targetType = TP.wrap(targetNode).getType())) {
        return this;
    }

    //  Make sure that the target is in a Window.
    doc = targetNode.ownerDocument;
    if (doc === undefined) {
        return this;
    }

    if (!TP.isWindow(doc.defaultView)) {
        return this;
    }

    //  Switch on the type of mutation that cause this to trigger.
    mutationType = aMutationRecord.type;

    switch (mutationType) {
        case 'attributes':

            //  We can only process attribute changes for Elements - make sure
            //  the target is one.
            if (!TP.isElement(targetNode)) {
                return this.raise('TP.sig.InvalidElement');
            }

            //  If we can invoke 'mutationChangedAttribute' on the TIBET type
            //  that we computed above, then go ahead and do so.
            fname = 'mutationChangedAttribute';
            if (TP.canInvoke(targetType, fname)) {
                attrName = aMutationRecord.attributeName;

                //  We configured this MutationObserver to capture old attribute
                //  values above, so grab it along with the new value here.
                prevValue = aMutationRecord.oldValue;
                newValue = TP.elementGetAttribute(targetNode, attrName, true);

                //  If there was no previous value, but there is a new value,
                //  then the attribute was created.
                if (TP.notValid(prevValue) &&
                    TP.elementHasAttribute(targetNode, attrName, true)) {
                    operation = TP.CREATE;
                } else if (!TP.elementHasAttribute(targetNode, attrName, true)) {
                    //  Otherwise, if the target Element no longer has the
                    //  attribute, then the attribute was deleted.
                    operation = TP.DELETE;
                } else {
                    //  Otherwise, they're both present, so this is an update.
                    operation = TP.UPDATE;
                }

                //  Go ahead and invoke 'mutationChangedAttribute' on the TIBET
                //  type with the various pieces of information.
                args = TP.hc('attrName', aMutationRecord.attributeName,
                                'newValue', newValue,
                                'prevValue', prevValue,
                                'operation', operation);

                targetType[fname](targetNode, args);
            }

            break;

        case 'childList':

            //  NB: We run the mutation removals first

            //  If the mutation record has removed nodes
            removedNodes = aMutationRecord.removedNodes;

            if (TP.isValid(removedNodes)) {

                if (!TP.isArray(removedNodes)) {
                    removedNodes = TP.ac(removedNodes);
                }

                //  Need to check the nodes individually for mutation tracking
                //  stoppage.
                removedNodes = removedNodes.filter(
                        function(aNode) {

                            var ans,
                                val;

                            //  If the node that got removed is an Element and
                            //  it has a value of TP.ANCESTOR_OR_SELF for the
                            //  'tibet:nomutationtracking' attribute, then
                            //  return false to filter out this node from the
                            //  'removed' data set. Note that we do *NOT* check
                            //  for a value of 'true' here. The element is
                            //  supposed to be looking to its *ancestor*, not to
                            //  itself, as to whether it should be tracked from
                            //  a mutation perspective. In other words, a
                            //  'tibet:nomutationtracking' attribute with a
                            //  simple value of 'true' will have *no* effect on
                            //  this element - only its descendants. There is a
                            //  workaround to this by using TP.ANCESTOR_OR_SELF.
                            if (TP.isElement(aNode)) {

                                val = TP.elementGetAttribute(
                                    aNode, 'tibet:nomutationtracking', true);

                                //  NB: Note how we also take processForSherpa
                                //  into account here.
                                if (val === TP.ANCESTOR_OR_SELF &&
                                    !processForSherpa) {
                                    return false;
                                }
                            }

                            //  If the node that got removed is an Element and
                            //  an Element can be found in the node's ancestor
                            //  chain that has an attribute with a name of
                            //  'tibet:nomutationtracking' and that attribute
                            //  has a value of 'true' or 'ans', then return
                            //  false to filter out this node from the 'removed'
                            //  data set.
                            if (TP.isElement(aNode) &&
                                TP.isElement(
                                    ans = TP.nodeAncestorMatchingCSS(
                                            aNode,
                                            '*[tibet|nomutationtracking]'))) {

                                val = TP.elementGetAttribute(
                                        ans, 'tibet:nomutationtracking', true);

                                //  NB: Note how we also take processForSherpa
                                //  into account here.
                                if ((val === 'true' || val === TP.ANCESTOR) &&
                                    !processForSherpa) {
                                    return false;
                                }
                            }

                            return true;
                        });
            }

            //  If, after filtering, there are still nodes in the 'removed' data
            //  data, then invoke 'mutationRemovedNodes' on the TIBET type.
            if (TP.notEmpty(removedNodes)) {
                fname = 'mutationRemovedNodes';
                if (TP.canInvoke(targetType, fname)) {
                    targetType[fname](targetNode, removedNodes);
                }
            }

            //  ---

            addedNodes = aMutationRecord.addedNodes;

            if (TP.isValid(addedNodes)) {

                if (!TP.isArray(addedNodes)) {
                    addedNodes = TP.ac(addedNodes);
                }

                //  Need to check the nodes individually for mutation tracking
                //  stoppage.
                addedNodes = addedNodes.filter(
                        function(aNode) {

                            var ans,
                                val;

                            //  If the node that got added is an Element and
                            //  it has a value of TP.ANCESTOR_OR_SELF for the
                            //  'tibet:nomutationtracking' attribute, then
                            //  return false to filter out this node from the
                            //  'added' data set. Note that we do *NOT* check
                            //  for a value of 'true' here. The element is
                            //  supposed to be looking to its *ancestor*, not to
                            //  itself, as to whether it should be tracked from
                            //  a mutation perspective. In other words, a
                            //  'tibet:nomutationtracking' attribute with a
                            //  simple value of 'true' will have *no* effect on
                            //  this element - only its descendants. There is a
                            //  workaround to this by using TP.ANCESTOR_OR_SELF.
                            if (TP.isElement(aNode)) {

                                val = TP.elementGetAttribute(
                                    aNode, 'tibet:nomutationtracking', true);

                                //  NB: Note how we also take processForSherpa
                                //  into account here.
                                if (val === TP.ANCESTOR_OR_SELF &&
                                    !processForSherpa) {
                                    return false;
                                }
                            }

                            //  If the node that got added is an Element and
                            //  an Element can be found in the node's ancestor
                            //  ancestor chain that has an attribute with a name
                            //  of 'tibet:nomutationtracking' and that attribute
                            //  has a value of 'true' or 'ans', then return
                            //  false to filter out this node from the 'added'
                            //  data set.
                            if (TP.isElement(aNode) &&
                                TP.isElement(
                                    ans = TP.nodeAncestorMatchingCSS(
                                            aNode,
                                            '*[tibet|nomutationtracking]'))) {

                                val = TP.elementGetAttribute(
                                        ans, 'tibet:nomutationtracking', true);

                                //  NB: Note how we also take processForSherpa
                                //  into account here.
                                if ((val === 'true' || val === TP.ANCESTOR) &&
                                    !processForSherpa) {
                                    return false;
                                }
                            }

                            return true;
                        });
            }

            //  If, after filtering, there are still nodes in the 'removed' data
            //  data, then invoke 'mutationRemovedNodes' on the TIBET type.
            if (TP.notEmpty(addedNodes)) {
                fname = 'mutationAddedNodes';
                if (TP.canInvoke(targetType, fname)) {
                    targetType[fname](targetNode, addedNodes);
                }
            }

            //  ---

            //  If subtree queries have been registered, then grab the document
            //  of the node that changed and, if that document and the query's
            //  document match, execute the query against it.
            if (TP.notEmpty(queryEntries = this.get('queries'))) {

                targetDoc = TP.nodeGetDocument(targetNode);

                queryKeys = queryEntries.getKeys();
                len = queryKeys.getSize();

                //  Iterate over all of the queries
                for (i = 0; i < len; i++) {
                    entry = queryEntries.at(queryKeys.at(i));

                    //  NB: 'queryContext' won't be used if there is no query
                    //  path object, but default it to the documentElement if
                    //  it wasn't supplied.
                    if (!TP.isElement(queryContext = entry.at('context'))) {
                        queryContext = targetDoc.documentElement;
                    }

                    if (!queryContext.contains(targetNode)) {
                        continue;
                    }

                    //  If the two documents match, execute the query and
                    //  dispatch signals if necessary.
                    if (entry.at('document') === targetDoc) {
                        this.executeSubtreeQueryAndDispatch(
                                queryKeys.at(i),
                                entry,
                                addedNodes,
                                removedNodes,
                                targetDoc);
                    }
                }
            }

            break;

        default:
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.MutationSignalSource.Type.defineMethod('addSubtreeQuery',
function(observer, queryPath, queryContext) {

    /**
     * @method addSubtreeQuery
     * @summary Adds a 'subtree' query.
     * @description Subtree queries are used as a convenient way to listen for
     *     mutations and then query the document that the mutation occurred in
     *     using an optional path. If the path is not supplied, any mutations
     *     that occur in the document of the observer will be sent to the
     *     observer.
     * @param {Node} observer The object that is interested in subtree
     *     mutations in its document.
     * @param {TP.path.AccessPath} [queryPath] The optional access path that
     *     will be used to filter mutations in the observer's document.
     * @param {Node} [queryContext=observer.ownerDocument] The optional context
     *     to execute the query in. Defaults to the observer's Document. NOTE:
     *     If the supplied observer isn't a Node, this parameter *must* be
     *     supplied.
     * @exception TP.sig.InvalidNode
     * @returns {TP.meta.sig.MutationSignalSource} The receiver.
     */

    var observerGID,
        observerDoc;

    if (!TP.isNode(observer) && !TP.isNode(queryContext)) {
        return this.raise('TP.sig.InvalidParameter',
                'Observer is not a Node - must supply a Node queryContext.');
    }

    observerGID = TP.gid(observer, true);

    if (TP.isNode(observer)) {
        observerDoc = TP.nodeGetDocument(observer);
    } else {
        observerDoc = TP.nodeGetDocument(queryContext);
    }

    this.get('queries').atPut(observerGID,
                                TP.hc('document', observerDoc,
                                        'path', queryPath,
                                        'context', queryContext));

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.MutationSignalSource.Type.defineMethod('removeSubtreeQuery',
function(observer) {

    /**
     * @method removeSubtreeQuery
     * @summary Removes a 'subtree' query.
     * @description Subtree queries are used as a convenient way to listen for
     *     mutations and then query the document that the mutation occurred in
     *     using an optional path. If the path is not supplied, any mutations
     *     that occur in the document of the observer will be sent to the
     *     observer.
     * @param {Node} observer The object that was interested in subtree
     *     mutations in its document.
     * @exception TP.sig.InvalidNode
     * @returns {TP.meta.sig.MutationSignalSource} The receiver.
     */

    this.get('queries').removeKey(TP.gid(observer));

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.MutationSignalSource.Type.defineMethod('executeSubtreeQueryAndDispatch',
function(queryObserverGID, queryEntry, addedNodes, removedNodes, aDocument) {

    /**
     * @method executeSubtreeQueryAndDispatch
     * @summary Executes a 'subtree' query and invokes the proper added or
     *     removed methods depending on the mutation.
     * @description Note that this won't be invoked unless the observer's
     *     document and the document that the mutation occurred in are
     *     identical.
     * @param {String} queryObserverGID The global ID of the observer that is
     *     interested in subtree mutations in its document.
     * @param {TP.core.Hash} queryEntry A hash of query data containing the
     *     query path, query context and query document.
     * @param {Node[]} addedNodes The nodes that were added in the mutation.
     * @param {Node[]} removedNodes The nodes that were removed in the mutation.
     * @param {Document} aDocument The document that the mutation occurred in.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.meta.sig.MutationSignalSource} The receiver.
     */

    var queryObserver,
        queryPath,
        queryContext,

        addedNodesInContext,
        removedNodesInContext,

        results,

        matchingNodes;

    //  Make sure that we can get the Element that is registered under observer
    //  GID.
    if (!TP.isValid(queryObserver = TP.bySystemId(queryObserverGID))) {
        //  TODO: Raise an InvalidParameter here
        return this;
    }

    //  This might be null if the receiver is interested in all added/removed
    //  nodes.
    queryPath = queryEntry.at('path');

    //  NB: 'queryContext' won't be used if there is no query path object, but
    //  default it to the documentElement if it wasn't supplied.
    if (!TP.isElement(queryContext = queryEntry.at('context'))) {
        queryContext = aDocument.documentElement;
    }

    //  If there is a real addedNodes Array, make sure all of the nodes in it
    //  exist under the queryContext node.
    if (TP.isArray(addedNodes)) {
        addedNodesInContext = addedNodes.filter(
                                function(aNode) {
                                    return queryContext.contains(aNode);
                                });
    }

    //  If there is a real removedNodes Array, make sure all of the nodes in it
    //  exist under the queryContext node.
    if (TP.isArray(removedNodes)) {
        removedNodesInContext = removedNodes.filter(
                                function(aNode) {
                                    return queryContext.contains(aNode);
                                });
    }

    //  If both of these Arrays are empty, exit here. No need to run a
    //  (relatively expensive) query path.
    if (TP.isEmpty(addedNodesInContext) && TP.isEmpty(removedNodesInContext)) {
        return this;
    }

    //  If there is a valid path, then execute it.
    if (TP.notEmpty(queryPath)) {
        results = queryPath.executeGet(queryContext);
    }

    //  If there are added nodes, invoke that machinery.
    if (TP.notEmpty(addedNodesInContext)) {

        //  If we had results from our query, intersect them against the added
        //  nodes.
        if (TP.notEmpty(results)) {
            matchingNodes = results.intersection(
                                        addedNodesInContext, TP.IDENTITY);
        } else if (TP.isEmpty(queryPath)) {
            //  Otherwise, if there is no query, just use all of the added nodes.
            matchingNodes = addedNodesInContext;
        }

        //  If there are matching nodes and we can invoke
        //  'mutationAddedFilteredNodes' against the observer, then do so.
        if (TP.notEmpty(matchingNodes) &&
            TP.canInvoke(queryObserver, 'mutationAddedFilteredNodes')) {
            queryObserver.mutationAddedFilteredNodes(
                                        matchingNodes, queryEntry);
        }
    }

    //  If there are removed nodes, invoke that machinery.
    if (TP.notEmpty(removedNodesInContext)) {

        //  NOTE: Since we can't run the query against nodes that have already
        //  been removed the DOM, we just pass the entire Array of removed nodes
        //  to the handler. It is up to that method to do whatever filtering is
        //  required.
        matchingNodes = removedNodesInContext;

        //  If there are matching nodes and we can invoke
        //  'mutationRemovedFilteredNodes' against the observer, then do so.
        if (TP.notEmpty(matchingNodes) &&
            TP.canInvoke(
                    queryObserver, 'mutationRemovedFilteredNodes')) {
            queryObserver.mutationRemovedFilteredNodes(
                                        matchingNodes, queryEntry);
        }
    }

    return this;
});

//  ========================================================================
//  TP.sig.ResizeSignalSource
//  ========================================================================

TP.sig.SignalSource.defineSubtype('sig.ResizeSignalSource');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.ResizeSignalSource.Type.defineAttribute('defaultSignal',
    'TP.sig.DOMResize');

//  The low-level handler function
TP.sig.ResizeSignalSource.Type.defineAttribute('$handlerFunc');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.ResizeSignalSource.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time type initialization.
     */

    this.set('$handlerFunc', function() {
        //  NB: 'this' is the element that the resize handler was
        //  installed for - don't bind this unless you want to lose the
        //  reference.
        TP.wrap(this).signal(TP.sig.ResizeSignalSource.get('defaultSignal'));
    });

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.ResizeSignalSource.Type.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Invoked by observe() to add an observation or activate
     *     underlying signaling hooks necessary to ensure proper signaling.
     * @description This method is overridden on this type because the
     *     TP.sig.DOMResize signal is a 'dual purpose' signal in that, if you
     *     observe a Window or Document for 'resized', you will use the native
     *     browser's machinery but if you observe an Element for 'resized',
     *     there is no native browser event for such a thing and so you will use
     *     TIBET's 'resize listener' function to watch the Element(s) for sizing
     *     changes.
     * @param {Object|Object[]} anOrigin One or more origins to observe.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    var origins,
        signals,

        ourDefaultSignalName,
        handlerFunc,

        len,
        i,
        signal,

        len2,
        j,

        obj;

    if (TP.notValid(anOrigin)) {
        return false;
    }

    //  If it's a Window or Document, just return true to tell the signaling
    //  system to add the observation to the main notification engine.
    if (TP.isWindow(anOrigin) || TP.isDocument(anOrigin)) {
        return true;
    }

    if (!TP.isArray(anOrigin)) {
        origins = TP.ac(anOrigin);
    } else {
        origins = anOrigin;
    }

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    'Improper signal definition.');

        return false;
    }

    ourDefaultSignalName = this.get('defaultSignal');

    handlerFunc = this.get('$handlerFunc');

    len = signals.getSize();

    for (i = 0; i < len; i++) {

        signal = signals.at(i).getSignalName();

        //  The only signals we're interested in are our own kind of signals
        if (signal !== ourDefaultSignalName) {
            continue;
        }

        len2 = origins.getSize();
        for (j = 0; j < len2; j++) {

            obj = origins.at(j);

            if (TP.isString(obj)) {
                obj = TP.sys.getObjectById(obj);
            }

            obj = TP.elem(TP.unwrap(obj));

            //  We didn't get an Element, even after resolving and unwrapping -
            //  that's a problem.
            if (!TP.isElement(obj)) {
                return this.raise('TP.sig.InvalidElement');
            }

            //  Add our shared handler Function as a resize listener on the
            //  Element.
            TP.elementAddResizeListener(
                obj,
                handlerFunc);
        }
    }

    //  Tell the notification to register our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.sig.ResizeSignalSource.Type.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Invoked by ignore() to remove an observation or deactivate
     *     underlying signaling hooks necessary to ensure proper signaling.
     * @param {Object|Object[]} anOrigin One or more origins to ignore.
     * @param {Object|Object[]} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    var handlerFunc,
        i,
        j,
        len,
        len2,
        obj,
        origins,
        ourDefaultSignalName,
        signal,
        signals;

    if (TP.notValid(anOrigin)) {
        return false;
    }

    //  If it's a Window or Document, just return true to tell the signaling
    //  system to remove the observation from the main notification engine.
    if (TP.isWindow(anOrigin) || TP.isDocument(anOrigin)) {
        return true;
    }

    if (!TP.isArray(anOrigin)) {
        origins = TP.ac(anOrigin);
    } else {
        origins = anOrigin;
    }

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    'Improper signal definition.');

        return false;
    }

    ourDefaultSignalName = this.get('defaultSignal');

    handlerFunc = this.get('$handlerFunc');

    len = signals.getSize();

    for (i = 0; i < len; i++) {

        signal = signals.at(i).getSignalName();

        //  The only signals we're interested in are our own kind of signals
        if (signal !== ourDefaultSignalName) {
            continue;
        }

        len2 = origins.getSize();
        for (j = 0; j < len2; j++) {

            obj = origins.at(j);

            if (TP.isString(obj)) {
                obj = TP.sys.getObjectById(obj);
            }

            obj = TP.elem(TP.unwrap(obj));

            //  We didn't get an Element, even after resolving and unwrapping -
            //  that's a problem.
            if (!TP.isElement(obj)) {
                return this.raise('TP.sig.InvalidElement');
            }

            //  Remove our shared handler Function from a resize listener on the
            //  Element.
            TP.elementRemoveResizeListener(obj, handlerFunc);
        }
    }

    //  Always tell the notification system to add our handler, etc.
    //  presuming this was invoked indirectly via observe().
    return true;
});

//  ========================================================================
//  TP.sig.VisibilitySignalSource
//  ========================================================================

TP.sig.SignalSource.defineSubtype('sig.VisibilitySignalSource');

//  ------------------------------------------------------------------------

TP.sig.VisibilitySignalSource.Type.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Invoked by observe() to add an observation or activate
     *     underlying signaling hooks necessary to ensure proper signaling.
     * @description This method is overridden on this type because the
     *     TP.sig.DOMVisibility signal uses the 'IntersectionObserver' object to
     *     monitor an element's visibility. There is no native browser event for
     *     such a thing.
     * @param {Object|Object[]} anOrigin One or more origins to observe.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    var origins,
        signals,

        len,
        i,
        signal,

        len2,
        j,

        obj;

    if (TP.notValid(anOrigin)) {
        return false;
    }

    //  If it's a Window or Document, just return true to tell the signaling
    //  system to add the observation to the main notification engine.
    if (TP.isWindow(anOrigin) || TP.isDocument(anOrigin)) {
        return true;
    }

    if (!TP.isArray(anOrigin)) {
        origins = TP.ac(anOrigin);
    } else {
        origins = anOrigin;
    }

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();

    for (i = 0; i < len; i++) {

        signal = signals.at(i).getSignalName();

        //  The only signals we're interested in are our own kind of signals.
        if (signal !== 'TP.sig.DOMVisible' && signal !== 'TP.sig.DOMHidden') {
            continue;
        }

        len2 = origins.getSize();
        for (j = 0; j < len2; j++) {

            obj = origins.at(j);

            if (TP.isString(obj)) {
                obj = TP.sys.getObjectById(obj);
            }

            obj = TP.elem(TP.unwrap(obj));

            //  We didn't get an Element, even after resolving and unwrapping -
            //  that's a problem.
            if (!TP.isElement(obj)) {
                return this.raise('TP.sig.InvalidElement');
            }

            //  If the global IntersectionObserver that manages our visibility
            //  events hasn't been allocated and initialized with the callback
            //  function, do so now.
            if (TP.notValid(TP.VISIBILITY_INTERSECTION_OBSERVER)) {
                TP.VISIBILITY_INTERSECTION_OBSERVER =
                    new IntersectionObserver(
                        function(entries) {
                            entries.forEach(
                                function(anEntry) {
                                    var target;

                                    //  The target will be the target Element
                                    //  whose intersection with the root element
                                    //  has changed. Make sure it's an Element
                                    //  and then signal the proper signal type
                                    //  depending on whether it is now
                                    //  intersecting or not.
                                    target = anEntry.target;

                                    if (!TP.isElement(target)) {
                                        return;
                                    }

                                    if (anEntry.isIntersecting) {
                                        TP.wrap(target).signal(
                                                        'TP.sig.DOMVisible');
                                    } else {
                                        TP.wrap(target).signal(
                                                        'TP.sig.DOMHidden');
                                    }
                                });
                        },
                        {
                            root: null,
                            rootMargin: '0px'
                        });
            }

            TP.VISIBILITY_INTERSECTION_OBSERVER.observe(obj);
        }
    }

    //  Tell the notification to register our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.sig.VisibilitySignalSource.Type.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Invoked by ignore() to remove an observation or deactivate
     *     underlying signaling hooks necessary to ensure proper signaling.
     * @param {Object|Object[]} anOrigin One or more origins to ignore.
     * @param {Object|Object[]} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    var i,
        j,
        len,
        len2,
        obj,
        origins,
        signal,
        signals;

    if (TP.notValid(anOrigin)) {
        return false;
    }

    //  If it's a Window or Document, just return true to tell the signaling
    //  system to remove the observation from the main notification engine.
    if (TP.isWindow(anOrigin) || TP.isDocument(anOrigin)) {
        return true;
    }

    if (!TP.isArray(anOrigin)) {
        origins = TP.ac(anOrigin);
    } else {
        origins = anOrigin;
    }

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();

    for (i = 0; i < len; i++) {

        signal = signals.at(i).getSignalName();

        //  The only signals we're interested in are our own kind of signals
        if (signal !== 'TP.sig.DOMVisible' && signal !== 'TP.sig.DOMHidden') {
            continue;
        }

        len2 = origins.getSize();
        for (j = 0; j < len2; j++) {

            obj = origins.at(j);

            if (TP.isString(obj)) {
                obj = TP.sys.getObjectById(obj);
            }

            obj = TP.elem(TP.unwrap(obj));

            //  We didn't get an Element, even after resolving and unwrapping -
            //  that's a problem.
            if (!TP.isElement(obj)) {
                return this.raise('TP.sig.InvalidElement');
            }

            //  Remove the element from the global IntersectionObserver
            //  machinery.
            if (TP.isValid(TP.VISIBILITY_INTERSECTION_OBSERVER)) {
                TP.VISIBILITY_INTERSECTION_OBSERVER.unobserve(obj);
            }
        }
    }

    //  Always tell the notification system to add our handler, etc.
    //  presuming this was invoked indirectly via observe().
    return true;
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

TP.sig.URISignalSource.defineSubtype('core.Worker');

//  Mix in send capability.
TP.core.Worker.addTraits(TP.sig.MessageConnection);

TP.core.Worker.Inst.resolveTraits(TP.ac('sendMessage'), TP.core.Worker);

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
     * @summary Performs one-time setup for the type on startup/import.
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
TP.core.Worker.Inst.defineAttribute('$thread');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('init',
function(aURI, onmessage, onerror) {

    /**
     * @method init
     * @summary Initializes a new instance of the receiver.
     * @param {String|URI} [aURI=tibet_worker.js] The URI used to initialize the
     *     worker. Defaults to the tibet_worker.js helper script.
     * @param {Function} [onmessage] Optional onmessage handler. Defaults to the
     *     receiving type's onmessage method, allowing you to create custom
     *     worker subtypes with specific methods for message protocol handling.
     * @param {Function} [onerror] Optional onerror handler. Defaults to the
     *     receiving type's onerror method, allowing you to create custom
     *     worker subtypes with specific methods for message error handling.
     * @returns {TP.core.Worker} A new instance.
     */

    var uri,
        thread,
        handler;

    //  Default the URI before invoking supertype constructor.
    uri = TP.ifInvalid(aURI, '~lib_build/tibet_worker.js');
    uri = TP.uc(uri);

    this.callNextMethod(uri);

    try {

        //  Spin off a new Worker thread.
        thread = new Worker(uri.getLocation());

        //  Set up the onmessage handler by either using the supplied one or
        //  binding to our method.
        handler = onmessage;
        if (TP.notValid(handler)) {
            handler = this.onmessage.bind(this);
        }
        thread.onmessage = handler;

        //  Set up the onerror handler by either using the supplied one or
        //  binding to our method.
        handler = onerror;
        if (TP.notValid(handler)) {
            handler = this.onerror.bind(this);
        }
        thread.onerror = handler;

    } catch (e) {
        return this.raise('WorkerError', e);
    }

    this.set('$thread', thread);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('onerror',
function(evt) {

    /**
     * @method onerror
     * @summary The default method that is invoked when the worker thread that
     *     the receiver is managing has posted a error back into this context.
     * @param {ErrorEvent} evt The event sent by the underlying system.
     * @returns {TP.core.Worker} The receiver.
     */

    var err;

    //  Convert from an ErrorEvent into a real Error object
    err = new Error(evt.message, evt.filename, evt.lineno);

    TP.error(err);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('onmessage',
function(evt) {

    /**
     * @method onmessage
     * @summary The default method that is invoked when the worker thread that
     *     the receiver is managing has posted a message back into this context.
     * @param {MessageEvent} evt The event sent by the underlying system.
     * @returns {TP.core.Worker} The receiver.
     */

    TP.info(evt.data);

    return this;
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

//  ------------------------------------------------------------------------

TP.core.Worker.Inst.defineMethod('sendMessage',
function(message) {

    /**
     * @method sendMessage
     * @summary Sends a string to the remote end of the connection. This method
     *     does not serialize content. Use send() if you want serialization.
     * @param {String} message The string to send to the end of the connection.
     * @returns TP.core.Worker The receiver.
     */

    var thread;

    thread = this.$get('$thread');

    thread.postMessage(message);

    return this;
});

//  ========================================================================
//  TP.core.PromiseWorker
//  ========================================================================

TP.core.Worker.defineSubtype('TP.core.PromiseWorker');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.PromiseWorker.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.defineDependencies('TP.extern.Promise');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.PromiseWorker.Inst.defineMethod('init',
function(aURI) {

    /**
     * @method init
     * @summary Initializes a new instance of the receiver. Note that
     *     PromiseWorker ignores any URI provided, forcing the underlying
     *     worker thread to use the tibet_helper.js script as the base.
     *     Use the 'import' function of the returned instance to add a target
     *     script with a returned Promise you can chain to.
     * @returns {TP.core.PromiseWorker|undefined} A new instance.
     */

    var uri;

    if (TP.isValid(aURI)) {
        this.raise('InvalidParameter');
        return;
    }

    uri = TP.uc('~lib_build/tibet_worker.js');

    return this.callNextMethod(uri);
});

//  ------------------------------------------------------------------------

TP.core.PromiseWorker.Inst.defineMethod('eval',
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

    workerThread = this.get('$thread');

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

TP.core.PromiseWorker.Inst.defineMethod('import',
function(aCodeURL) {

    /**
     * @method import
     * @summary Imports the JavaScript source code referred to by the supplied
     *     URL into the worker thread that this object represents.
     * @param {TP.uri.URL|String} aCodeURL The URL referring to the resource
     *     containing the source code to import inside of the worker.
     * @returns Promise A promise that will resolve when the importation is
     *     complete.
     */

    var url,

        workerThread,
        newPromise;

    if (!TP.isURIString(aCodeURL) && !TP.isURI(aCodeURL)) {
        return this.raise('InvalidURL',
                            'Not a valid URL to JavaScript source code.');
    }

    url = TP.uc(aCodeURL).getLocation();

    workerThread = this.get('$thread');

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

TP.core.PromiseWorker.Inst.defineMethod('defineWorkerMethod',
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
    //  NOTE: We do *not* use TP.global here since this code will be running
    //  in the worker thread and that's not defined there!!
    methodSrc = 'self.' + name + ' = ' + body.toString();

    isAsync = TP.ifInvalid(async, false);

    //  Use our 'eval' method to evaluate the code. This is *not* the regular JS
    //  'eval' global call - this method evaluates the code over in worker
    //  thread and returns a Promise that will resolve when that is done.
    /* eslint-disable no-eval */
    promise = this.eval(methodSrc);
    /* eslint-enable no-eval */

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

                workerThread = this.get('$thread');

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
        }.bind(this)).catch(
        function(err) {
            TP.ifError() ?
                TP.error('Error creating TP.core.PromiseWorker Promise: ' +
                            TP.str(err)) : 0;
        });

    return promise;
});


//  ========================================================================
//  TP.core.LESSWorker
//  ========================================================================

/**
 * @type {TP.core.LESSWorker}
 * @summary A subtype of TP.core.Worker that manages a LESSCSS engine.
 */

//  ------------------------------------------------------------------------

TP.core.PromiseWorker.defineSubtype('core.LESSWorker');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  used to 'initialize' the worker since LESSCSS makes some assumptions on
//  startup which are not valid for our environment (i.e. trying to process
//  LESS stylesheets found on the document - a web worker has no DOM environment
//  of any kind).
TP.core.LESSWorker.Type.defineConstant('SETUP_STRING',
'window = self; window.document = { getElementsByTagName: function(tagName) { if (tagName === "script") { return [{dataset: {async:true}}]; } else if (tagName === "style") { return []; } else if (tagName === "link") { return []; } } };');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.LESSWorker.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
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
        /* eslint-disable no-eval */
        workerPromise = this.eval(this.getType().SETUP_STRING).then(
        /* eslint-enable no-eval */
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
                return this.compileLESS(srcText, opts).then(
                                    function(results) {

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
            }.bind(this)).catch(
            function(err) {
                TP.ifError() ?
                    TP.error('Error creating TP.core.Worker Promise: ' +
                                TP.str(err)) : 0;
            });

    } else {

        //  Otherwise, the worker is set up - just run the compilation 'worker
        //  method'.
        workerPromise = workerPromise.then(
                function() {

                    return this.compileLESS(srcText, opts).then(
                                    function(results) {

                                        //  Return the worker to the pool when
                                        //  we're done, and make sure to pass
                                        //  along the results to the result
                                        //  function.
                                        this.repool();

                                        return results;
                                    }.bind(this)).then(resultFunc);
                }.bind(this)).catch(
                function(err) {
                    TP.ifError() ?
                        TP.error('Error creating TP.core.Worker Promise: ' +
                                    TP.str(err)) : 0;
                });
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
//  REMOTE SIGNAL SOURCE SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('RemoteSourceSignal');

TP.sig.RemoteSourceSignal.Type.defineAttribute('defaultPolicy',
    TP.INHERITANCE_FIRING);

TP.sig.RemoteSourceSignal.defineSubtype('SourceOpen');
TP.sig.RemoteSourceSignal.defineSubtype('SourceDataReceived');
TP.sig.RemoteSourceSignal.defineSubtype('SourceClosed');
TP.sig.RemoteSourceSignal.defineSubtype('SourceReconnecting');
TP.sig.RemoteSourceSignal.defineSubtype('SourceError');

TP.sig.RemoteSourceSignal.defineSubtype('RemoteURLChange');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
