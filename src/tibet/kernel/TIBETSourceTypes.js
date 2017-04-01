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
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.SignalSource.Type.defineAttribute('observers');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.SignalSource.Type.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} anOrigin One or more origins to observe.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    TP.override();
});

//  ------------------------------------------------------------------------

TP.sig.SignalSource.Type.defineMethod('hasObservers',
function() {

    /**
     */

    var observers;

    observers = this.$get('observers');

    return TP.isValid(observers) && !observers.isEmpty();
});

//  ------------------------------------------------------------------------

TP.sig.SignalSource.Type.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} anOrigin One or more origins to observe.
     * @param {Object|Array} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
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
//  Inst Methods
//  ------------------------------------------------------------------------

TP.sig.SignalSource.Inst.defineMethod('addObserver',
function(aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    TP.override();
});

//  ------------------------------------------------------------------------

TP.sig.SignalSource.Inst.defineMethod('hasObservers',
function() {

    /**
     */

    var observers;

    observers = this.$get('observers');

    return TP.isValid(observers) && !observers.isEmpty();
});

//  ------------------------------------------------------------------------

TP.sig.SignalSource.Inst.defineMethod('removeObserver',
function(aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
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
//  Inst Methods
//  ------------------------------------------------------------------------

TP.sig.URISignalSource.Inst.defineMethod('setURI',
function(aURI) {

    /**
     * @method setURI
     * @summary Defines the endpoint URI for the receiver.
     * @param {TP.core.URI} aURI The URI representing the signal endpoint.
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

//  The private TP.core.Hash containing a map of custom event names to the
//  handlers that were installed for each one so that we can unregister them.
TP.sig.MessageSource.Inst.defineAttribute('$customEventHandlers');

TP.sig.MessageSource.Inst.defineAttribute('errorCount', 0);

TP.sig.MessageSource.Inst.defineAttribute('source');


//  ------------------------------------------------------------------------
//  Inst Methods
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
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The handler is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
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
    sigTypes = sigTypes.collect(function(aSignalType) {
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
     * @summary Closes the connection to the remote server-sent events server.
     * @param {Boolean} [closed=false] True to tell deactivate the connection
     *     is already closed so skip any internal close call.
     * @returns {Boolean} Whether or not the connection closed successfully.
     */

    var source;

    if (!this.isActive()) {
        return;
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
     * @summary A source is active if activate() has been called an no
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
     * @param {Object|Array} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
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
    sigTypes = sigTypes.collect(function(aSignalType) {
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
     * @summary Configures handlers for custom events from the server.
     * @param {Array} signalTypes An Array of TP.sig.SourceSignal subtypes to
     *     check for custom handler registration.
     * @returns {TP.sig.MessageSource} The receiver.
     */

    TP.override();
});

//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineMethod('setupStandardHandlers',
function() {

    /**
     * @method setupStandardHandlers
     * @summary Sets up the 'standard' Server-Side Events handlers for our
     *     event source object.
     * @exception TP.sig.InvalidSource
     * @returns {TP.sig.RemoteMessageSource} The receiver.
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
    ['open', 'close', 'error', 'message'].forEach(function(op) {
        if (TP.canInvoke(thisref, 'on' + op)) {
            source.addEventListener(op, thisref['on' + op].bind(thisref), false);
        }
    });

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.MessageSource.Inst.defineMethod('teardownCustomHandlers',
function(signalTypes) {

    /**
     * @method teardownCustomHandlers
     * @summary Tears down handlers for custom events from the server.
     * @param {Array} signalTypes An Array of TP.sig.SourceSignal subtypes to
     *     check for custom handler registration.
     * @returns {TP.sig.MessageSource} The receiver.
     */

    TP.override();
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

    return;
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
//  Inst Methods
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

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.RemoteMessageSource.Inst.defineMethod('init',
function(aURI) {

    /**
     * @method init
     * @summary Initialize a new signal instance.
     * @param {TP.core.URI} aURI The endpoint URI representing the source of
     *     server-sent events.
     * @returns {TP.sig.RemoteMessageSource} A new instance.
     */

    this.callNextMethod();

    //  Invoke mixed-in setter to capture the URI value.
    this.setURI(aURI);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.RemoteMessageSource.Inst.defineMethod('activate',
function() {

    /**
     * @method activate
     * @summary Opens the connection to the remote server-sent events server.
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidSource
     * @returns {Boolean} Whether or not the connection opened successfully.
     */

    var uri,
        source,
        sourceType;

    //  If we're active and have a real source object nothing to do.
    if (this.isActive() && TP.isValid(this.get('source'))) {
        return;
    }

    //  Reset any error count so we can reactivate without issues.
    this.set('errorCount', 0);

    uri = this.get('uri');

    sourceType = this.getSourceType();
    if (TP.notValid(sourceType)) {
        this.raise('InvalidSourceType');
        return false;
    }

    try {
        source = new sourceType(uri.asString());
    } catch (e) {
        this.raise('TP.sig.InvalidSource', e);
        return false;
    }

    if (TP.notValid(source)) {
        this.raise('TP.sig.InvalidSource');
        return false;
    }

    this.set('source', source);
    this.setupStandardHandlers();

    this.isActive(true);

    return true;
});

//  ------------------------------------------------------------------------

TP.sig.RemoteMessageSource.Inst.defineMethod('getSourceType',
function() {

    /**
     */

    TP.override();
});

//  ------------------------------------------------------------------------

TP.sig.RemoteMessageSource.Inst.defineMethod('onopen',
function() {

    /**
     */

    var source,
        payload;

    source = this.get('source');

    payload = TP.hc(
        'source', source,
        'sourceURL', this.get('uri')
    );

    this.signal('TP.sig.SourceOpen', payload);

    return;
});

//  ========================================================================
//  TP.core.SSE
//  ========================================================================

TP.sig.RemoteMessageSource.defineSubtype('core.SSE');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.SSE.Inst.defineMethod('getSourceType',
function() {

    /**
     */

    return self.EventSource;
});

//  ------------------------------------------------------------------------

TP.core.SSE.Inst.defineMethod('onerror',
function(evt) {

    /**
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
        return;
    }

    this.set('errorCount', errorCount++);

    //  If the readyState is set to EventSource.CLOSED, then the browser
    //  is 'failing the connection'. In this case, we signal a
    //  'TP.sig.SourceClosed' and return.
    if (source.readyState === EventSource.CLOSED) {
        this.deactivate();
        return;
    }

    //  If the readyState is set to EventSource.CONNECTING, then the
    //  browser is trying to 'reestablish the connection'. In this case,
    //  we signal a 'TP.sig.SourceReconnecting' and return.
    if (source.readyState === EventSource.CONNECTING) {
        this.signal('TP.sig.SourceReconnecting', payload);
        return;
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

    return;
});

//  ------------------------------------------------------------------------

TP.core.SSE.Inst.defineMethod('onmessage',
function(evt) {

    /**
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

    signalName = evt.signalName || 'TP.sig.SourceDataReceived';

    this.signal(signalName, payload);

    return;
});

//  ------------------------------------------------------------------------

TP.core.SSE.Inst.defineMethod('setupCustomHandlers',
function(signalTypes) {

    /**
     * @method setupCustomHandlers
     * @summary Sets up handlers for 'custom' server-side events.
     * @description The Server-Sent Events specification does not
     *     specify that the 'onmessage' handler will fire when there is a
     *     custom 'event' (as specified by the 'event:' tag in the received
     *     data). We check the signal types being observed for a REMOTE_NAME
     *     which allows it to adapt to server event names which should map
     *     to that signal type and register a low-level handler accordingly.
     * @param {Array} signalTypes An Array of TP.sig.SourceSignal subtypes to
     *     check for custom handler registration.
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

    signalTypes.perform(function(aSignalType) {
        var eventName,
            signalName,
            handlerFunc;

        signalName = aSignalType.getSignalName();

        eventName = TP.ifEmpty(aSignalType.REMOTE_NAME, signalName);

        //  If there's already a handler registered for this native
        //  event type then just return here. We don't want multiple
        //  handlers for the same native event.
        if (handlerRegistry.hasKey(eventName)) {
            return;
        }

        //  Look for a method to match the eventName to use as the handler.
        if (TP.canInvoke(thisref, 'on' + eventName)) {
            handlerFunc = thisref['on' + eventName].bind(thisref);
        } else {
            //  No special handler so rely on a wrapped copy of onmessage that
            //  we pass the specific signal name to.
            handlerFunc = function(evt) {
                evt.signalName = signalName;
                this.onmessage(evt);
            }.bind(thisref);
        }

        //  Put it in the handler registry in case we went to unregister
        //  it interactively later.
        handlerRegistry.atPut(eventName, handlerFunc);

        //  Add the custom event listener to the event source.
        source.addEventListener(eventName, handlerFunc, false);
    });

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SSE.Inst.defineMethod('teardownCustomHandlers',
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
     * @param {Array} signalTypes An Array of TP.sig.SourceSignal subtypes to
     *     check for custom handler registration.
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

            //  If the signal type has a REMOTE_NAME slot, then remove the
            //  custom handler that we would've set up using that value as the
            //  event name.
            if (TP.notEmpty(customName = aSignalType.REMOTE_NAME)) {

                //  If there is a callable function registered in the handler
                //  registry under the custom event name, remove it.
                if (TP.isCallable(handlerFunc =
                                    handlerRegistry.atPut(customName))) {

                    handlerRegistry.removeKey(customName);
                    source.removeEventListener(customName,
                                                    handlerFunc,
                                                    false);
                }
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

//  TODO
//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('getSourceType',
function() {

    /**
     */

    return self.WebSocket;
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('onclose',
function(code, reason) {

    /**
     */

    //  TODO

    var source,
        payload;

    source = this.get('source');

    payload = TP.hc(
                'code', code,
                'reason', reason,
                'sourceURL', source.url
                );

    this.signal('TP.sig.SourceClosed', payload);

    //  Deactivate but force it to skip any close() operation that might trigger
    //  a recursion.
    this.deactivate(true);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('onerror',
function(evt) {

    //  TODO

    return;
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('onmessage',
function(evt) {

    //  TODO

    return;
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('setupCustomHandlers',
function(signalTypes) {

    /**
     * @method setupCustomHandlers
     * @summary Configures handlers for custom events from the server.
     * @param {Array} signalTypes An Array of TP.sig.SourceSignal subtypes to
     *     check for custom handler registration.
     * @returns {TP.core.Socket} The receiver.
     */

    //  TODO

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Socket.Inst.defineMethod('teardownCustomHandlers',
function(signalTypes) {

    /**
     * @method teardownCustomHandlers
     * @summary Tears down handlers for custom events from the server.
     * @param {Array} signalTypes An Array of TP.sig.SourceSignal subtypes to
     *     check for custom handler registration.
     * @returns {TP.core.Socket} The receiver.
     */

    //  TODO

    return this;
});

//  ========================================================================
//  TP.core.Geolocation
//  ========================================================================

TP.sig.MessageSource.defineSubtype('TP.core.Geolocation');

//  TODO    watchPosition


//  ========================================================================
//  TP.core.MediaQuery
//  ========================================================================

TP.sig.MessageSource.defineSubtype('TP.core.MediaQuery');

//  TODO    TP.windowQueryCSSMedia(win, queryStr, mqHandler);


//  ========================================================================
//  TP.core.Window (extensions)
//  ========================================================================

//  a TP.core.Hash containing either media queries or a geo query used for
//  signaling either media query or geo signals, keyed by the 'origin' used to
//  observe
TP.core.Window.Type.defineAttribute('$queries', TP.hc());

//  a TP.core.Hash containing media query handler Functions, used to signal
//  media query changes, keyed by the 'origin' used to observe
TP.core.Window.Type.defineAttribute('$mqEntries', TP.hc());

//  a Number containing the unique identifier for the currently active
//  'geolocation watcher'
TP.core.Window.Type.defineAttribute('$geoWatch');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} anOrigin One or more origins to observe.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    var map,

        originStr,

        queryCount,

        originParts,
        winID,
        queryStr,
        win,

        geoWatch,
        mediaQuery,

        mqHandler;

    map = this.get('$queries');

    if (TP.notValid(anOrigin) || TP.notValid(aSignal)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Make sure that the origin matches one of the kinds of queries we can
    //  process.
    originStr = TP.str(anOrigin);
    if (!/@media |@geo/.test(originStr)) {
        return this.raise('TP.sig.InvalidOrigin');
    }

    //  If our 'queries' map does not already have an entry
    if (TP.notValid(queryCount = map.at(originStr))) {

        //  The origin should be something like 'window_0@geo' or
        //  'window@media screen and (max-width:800px)'
        originParts = originStr.split(/@media |@geo/);
        if (originParts.getSize() !== 2) {
            return this.raise('TP.sig.InvalidQuery');
        }

        winID = originParts.first();
        queryStr = originParts.last();

        //  Can't find a Window? Bail out.
        if (!TP.isWindow(win = TP.sys.getWindowById(winID))) {
            return this.raise('TP.sig.InvalidWindow');
        }

        //  If the caller is interested in Geolocation stuff, make sure we're on
        //  a platform that supports it.
        if (/@geo/.test(originStr)) {

            if (TP.isValid(win.navigator.geolocation)) {

                //  Set up the 'watch' with a success callback that signals a
                //  GeoPositionChange and an error callback that signals a
                //  GeoPositionError
                geoWatch = win.navigator.geolocation.watchPosition(
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

                        TP.signal(originStr,
                                    'TP.sig.GeoPositionChange',
                                    data);
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

                        TP.signal(originStr,
                                    'TP.sig.GeoPositionError',
                                    errorMsg);
                    });

                this.set('$geoWatch', geoWatch);
            }
        } else if (/@media /.test(originStr)) {

            //  Otherwise, it was a media query, so define a handler that will
            //  signal CSSMediaActive or CSSMediaInactive depending on whether
            //  the query matches or not.
            mqHandler =
                function(aQuery) {
                    if (aQuery.matches) {
                        TP.signal(originStr,
                                    'TP.sig.CSSMediaActive',
                                    aQuery.media);
                    } else {
                        TP.signal(originStr,
                                    'TP.sig.CSSMediaInactive',
                                    aQuery.media);
                    }
                };

            //  Perform the query and get the MediaQueryList back. Note that
            //  this will also register the handler so that the callback fires
            //  when the environment changes such that the query succeeds or
            //  fails.
            mediaQuery = TP.windowQueryCSSMedia(win, queryStr, mqHandler);

            //  Store off a pair of the MediaQueryList and the handler with the
            //  query string as a key. This will allow us to unregister the
            //  query and handler in the removeObserver() call below
            this.get('$mqEntries').atPut(
                queryStr, TP.ac(mediaQuery, mqHandler));
        }

        //  Kick off the map count with a 1. Subsequent queries using the same
        //  query string will just kick the counter.
        map.atPut(originStr, 1);
    } else {

        //  Otherwise, just kick the query count in the map
        map.atPut(originStr, queryCount + 1);
    }

    //  Always tell the notification to register our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.core.Window.Type.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} anOrigin One or more origins to ignore.
     * @param {Object|Array} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    var map,

        originStr,

        queryCount,

        originParts,
        win,

        handlers,
        mqEntry;

    map = this.get('$queries');

    if (TP.notValid(anOrigin) || TP.notValid(aSignal)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Make sure that the origin matches one of the kinds of queries we can
    //  process.
    originStr = TP.str(anOrigin);
    if (!/@media |@geo/.test(originStr)) {
        return this.raise('TP.sig.InvalidOrigin');
    }

    //  If our 'queries' map has an entry for the query, then it's a
    //  registration that we care about.
    if (TP.isValid(queryCount = map.at(originStr))) {

        //  The origin should be something like 'window_0@geo' or
        //  'window@media screen and (max-width:800px)'
        originParts = originStr.split(/@media |@geo/);
        if (originParts.getSize() !== 2) {
            return this.raise('TP.sig.InvalidQuery');
        }

        //  If we're the last handler interested in this query, then go to
        //  the trouble of unregistering it, etc.
        if (queryCount === 1) {

            if (/@geo/.test(originStr)) {

                if (TP.isValid(win.navigator.geolocation)) {

                    //  Make sure to both clear the watch and set our internal
                    //  variable to null
                    win.navigator.geolocation.clearWatch(this.get('$geoWatch'));
                    this.set('$geoWatch', null);
                }
            } else if (/@media /.test(originStr)) {

                if (TP.notEmpty(handlers = this.get('$mqEntries')) &&
                        TP.isValid(mqEntry = handlers.at(originStr))) {

                    if (TP.isMediaQueryList(mqEntry.first())) {
                        mqEntry.first().removeListener(mqEntry.last());
                    }

                    handlers.removeKey(originStr);
                }
            }

            map.removeKey(originStr);

        } else {
            //  Otherwise, there are multiple handlers interested in this query,
            //  so just reduce the counter by one.
            map.atPut(originStr, queryCount - 1);
        }
    }

    //  Always tell the notification to remove our handler, etc.
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
    //  mutation records for flipping 'pclass:hover' attribute changes.
    TP.addMutationObserverFilter(
        function(aMutationRecord) {

            if (aMutationRecord.type === 'attributes' &&
                aMutationRecord.attributeName === 'hover' &&
                aMutationRecord.attributeNamespace === TP.w3.Xmlns.PCLASS) {
                return false;
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
                ans,
                val;

            target = aMutationRecord.target;

            //  If the target isn't an Element, we allow the mutation.
            if (!TP.isElement(target)) {
                return true;
            }

            val = TP.elementGetAttribute(
                            target, 'tibet:nomutationtracking', true);
            if (val === 'ansorself') {
                return false;
            }

            if (TP.isElement(
                ans = TP.nodeAncestorMatchingCSS(
                            target,
                            '*[tibet|nomutationtracking]'))) {

                val = TP.elementGetAttribute(
                            ans, 'tibet:nomutationtracking', true);

                if (val === 'true' || val === 'ans') {
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
     * @returns {TP.lang.RootObject.<TP.sig.MutationSignalSource>} The
     *     MutationSignalSource type.
     */

    var method,

        recordsHandler,
        observerConfig,

        mutationObserverID,

        styleChangesHandler;

    //  PhantomJS (at least at the time of this writing, doesn't support these).
    if (TP.notValid(self.MutationObserver)) {
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
            aDocument,
            recordsHandler,
            observerConfig,
            mutationObserverID);

    //  Activate it.
    TP.activateMutationObserver(mutationObserverID);

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
            TP.documentEnsureHeadElement(aDocument),
            styleChangesHandler,
            observerConfig,
            mutationObserverID);

    //  Activate it.
    TP.activateMutationObserver(mutationObserverID);

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
     * @returns {TP.lang.RootObject.<TP.sig.MutationSignalSource>} The
     *     MutationSignalSource type.
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
     * @returns {TP.lang.RootObject.<TP.sig.MutationSignalSource>} The
     *     MutationSignalSource type.
     */

    var targetNode,
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

        targetDoc,

        queryKeys,
        len,
        i,
        entry;

    //  Make sure that the target is a Node
    if (!TP.isNode(targetNode = aMutationRecord.target)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  And make sure that we can computed a TIBET type for it.
    if (!TP.isType(targetType = TP.wrap(targetNode).getType())) {
        return this;
    }

    //  Make sure that the target is in a Window.
    if (!TP.isWindow(targetNode.ownerDocument.defaultView)) {
        return;
    }

    //  Switch on the type of mutation that cause this to trigger.
    mutationType = aMutationRecord.type;

    switch (mutationType) {
        case 'attributes':

            //  We can only process attribute changes for Elements - make sure
            //  the target is one.
            if (!TP.isElement(targetNode = aMutationRecord.target)) {
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
                            //  it has a value of 'ansorself' for the
                            //  'tibet:nomutationtracking' attribute, then
                            //  return false to filter out this node from the
                            //  'removed' data set.
                            if (TP.isElement(aNode)) {

                                val = TP.elementGetAttribute(
                                    aNode, 'tibet:nomutationtracking', true);

                                if (val === 'ansorself') {
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

                                if (val === 'true' || val === 'ans') {
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
                            //  it has a value of 'ansorself' for the
                            //  'tibet:nomutationtracking' attribute, then
                            //  return false to filter out this node from the
                            //  'added' data set.
                            if (TP.isElement(aNode)) {

                                val = TP.elementGetAttribute(
                                    aNode, 'tibet:nomutationtracking', true);

                                if (val === 'ansorself') {
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

                                if (val === 'true' || val === 'ans') {
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
     * @param {TP.core.AccessPath} [queryPath] The optional access path that
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

    //  If there is a valid path, then execute it.
    if (TP.notEmpty(queryPath)) {
        results = queryPath.executeGet(queryContext);
    }

    //  If there are added nodes, invoke that machinery.
    if (TP.notEmpty(addedNodes)) {

        //  If we had results from our query, intersect them against the added
        //  nodes.
        if (TP.notEmpty(results)) {
            matchingNodes = results.intersection(addedNodes, TP.IDENTITY);
        } else if (TP.isEmpty(queryPath)) {
            //  Otherwise, if there is no query, just use all of the added nodes.
            matchingNodes = addedNodes;
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
    if (TP.notEmpty(removedNodes)) {

        //  NOTE: Since we can't run the query against nodes that have already
        //  been removed the DOM, we just pass the entire Array of removed nodes
        //  to the handler. It is up to that method to do whatever filtering is
        //  required.
        matchingNodes = removedNodes;

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
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @description This method is overridden on this type because the
     *     TP.sig.DOMResize signal is a 'dual purpose' signal in that, if you
     *     observe a Window or Document for 'resized', you will use the native
     *     browser's machinery but if you observe an Element for 'resized',
     *     there is no native browser event for such a thing and so you will use
     *     TIBET's 'resize listener' function to watch the Element(s) for sizing
     *     changes.
     * @param {Object|Array} anOrigin One or more origins to observe.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
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
     * @summary Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} anOrigin One or more origins to ignore.
     * @param {Object|Array} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
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
//  TP.core.Worker
//  ========================================================================

/**
 * @type {TP.core.Worker}
 * @summary This type provides an interface to the browser's 'worker thread'
 *     capability.
 */

//  ------------------------------------------------------------------------

TP.sig.MessageConnection.defineSubtype('core.Worker');

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

    //  Initialize the worker thread with the worker helper stub. NOTE
    //  this is the 'build' directory so ~lib_build/src
    workerHelperURI = TP.uc('~lib_build/tibet_worker.js');
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

    if (!TP.isURIString(aCodeURL) && !TP.isURI(aCodeURL)) {
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
        }.bind(this)).catch(
        function(err) {
            TP.ifError() ?
                TP.error('Error creating TP.core.Worker Promise: ' +
                            TP.str(err)) : 0;
        });

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
'window = self; window.document = { getElementsByTagName: function(tagName) { if (tagName === "script") { return [{dataset: {async:true}}]; } else if (tagName === "style") { return []; } else if (tagName === "link") { return []; } } };');

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

                    return this.compileLESS(srcText, opts).
                                    then(function(results) {

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
