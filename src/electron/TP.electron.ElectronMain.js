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
 * @type {TP.electron.ElectronMain}
 */

//  ========================================================================
//  TP.electron.ElectronMain
//  ========================================================================

TP.core.SignalSource.defineSubtype('electron.ElectronMain');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.electron.ElectronMain.Type.defineAttribute('$listeners', TP.hc());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.electron.ElectronMain.Type.defineMethod('addObserver',
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

    var origins,
        signals,

        thisref,

        len,
        i,
        len2,
        j,

        originID,
        sigName,

        entryKey;

    //  If we're running in headless mode, just return false to tell the
    //  signaling system to *not* add the observation to the main
    //  notification engine.
    if (TP.sys.isHeadless()) {
        return false;
    }

    if (TP.sys.cfg('boot.context') !== 'electron') {
        return this.raise('UnsupportedOperation');
    }

    if (TP.notValid(anOrigin) || TP.notValid(aSignal)) {
        return this.raise('TP.sig.InvalidParameter');
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

    thisref = this;

    len = signals.getSize();

    /* eslint-disable no-loop-func */
    for (i = 0; i < len; i++) {

        sigName = TP.expandSignalName(signals.at(i).getSignalName());

        len2 = origins.getSize();
        for (j = 0; j < len2; j++) {

            originID = TP.gid(origins.at(j));

            //  Before we add the listener Function, we should check to see if
            //  we already registered one for this origin/signal pair. If so,
            //  then we don't need more than one.
            entryKey = originID + TP.JOIN + sigName;
            if (TP.notValid(this.get('$listeners').at(entryKey))) {

                (function(origin, signal) {
                    var listener;

                    //  Create a listener Function that will signal with the
                    //  supplied signal origin and name with the native Event as
                    //  the payload.
                    listener = function(evt, payload) {
                                TP.signal(origin,
                                            signal,
                                            payload);
                            };

                    //  Add the listener to our listeners hash with the
                    //  origin/signal key as the key. This ensures that no more
                    //  than one entry for each origin/signal is added as a
                    //  listener.
                    thisref.get('$listeners').atPut(entryKey, listener);

                    //  Message our external Electron library to register the
                    //  listener for this signal.
                    TP.extern.electron_lib_utils.addListenerForMainEvent(
                                                            signal, listener);
                }(originID, sigName));
            }
        }
    }
    /* eslint-enable no-loop-func */

    //  Always tell the notification system to register our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.electron.ElectronMain.Type.defineMethod('removeObserver',
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

    var origins,
        signals,

        len,
        i,
        len2,
        j,

        originID,
        sigName,

        entryKey,

        listener;

    //  If we're running in headless mode, just return false to tell the
    //  signaling system to *not* add the observation to the main
    //  notification engine.
    if (TP.sys.isHeadless()) {
        return false;
    }

    if (TP.sys.cfg('boot.context') !== 'electron') {
        return this.raise('UnsupportedOperation');
    }

    if (TP.notValid(anOrigin) || TP.notValid(aSignal)) {
        return this.raise('TP.sig.InvalidParameter');
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

        sigName = TP.expandSignalName(signals.at(i).getSignalName());

        len2 = origins.getSize();
        for (j = 0; j < len2; j++) {

            originID = TP.gid(origins.at(j));

            //  Compute a origin/signal key and see if a listener is available
            //  for removal.
            entryKey = originID + TP.JOIN + sigName;
            listener = this.get('$listeners').at(entryKey);

            //  We found a valid listener - remove it from our listeners hash
            //  and message our external Electron library to remove the listener
            //  for this signal.
            if (TP.isValid(listener)) {
                this.get('$listeners').removeKey(entryKey);

                TP.extern.electron_lib_utils.removeListenerForMainEvent(
                    sigName, listener);
            }
        }
    }

    //  Always tell the notification system to remove our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.electron.ElectronMain.Type.defineMethod('signalMain',
function(aSignal, varargs) {

    /**
     * @method signalMain
     * @summary Sends the specified signal to Electron's 'main' process.
     * @param {String} aSignal The signal name to send to the main process.
     * @param {arguments} varargs Optional additional arguments for the
     *     constructor.
     * @returns {Promise} A Promise returned from sending the event to
     *     the main process. When this Promise is resolved its value will be
     *     whatever value that method returned (limited by the rules of the
     *     Structured Clone Algorithm).
     */

    var args,

        sigArgs,

        len,
        i;

    //  If we're running in headless mode, just return a resolved Promise.
    if (TP.sys.isHeadless()) {
        return Promise.resolve();
    }

    if (TP.sys.cfg('boot.context') !== 'electron') {
        return this.raise('UnsupportedOperation');
    }

    //  Grab all of the arguments into an Array and build a new Array of the
    //  '(plain) object representation' of those arguments. This is needed to
    //  serialize properly over the wire.

    args = TP.ac(arguments);

    sigArgs = TP.ac();

    len = args.getSize();
    for (i = 0; i < len; i++) {
        sigArgs.push(TP.obj(args.at(i)));
    }

    //  NB: We just pass along all arguments here - this call will 'do the right
    //  thing'.
    return TP.extern.electron_lib_utils.sendEventToMain(sigArgs);
});

//  ========================================================================
//  TP.electron.ElectronMessageSource
//  ========================================================================

TP.core.MessageSource.defineSubtype('electron.ElectronMessageSource');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The list of standard handler names that instances of this type will
//  automatically add listeners for. For Electron message sources, there are
//  none.
TP.electron.ElectronMessageSource.Type.defineAttribute(
    '$standardEventHandlerNames', TP.ac());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.electron.ElectronMessageSource.Type.defineMethod('isSupported',
function() {

    /**
     * @method isSupported
     * @summary Whether or not events from this source can be sent.
     * @returns {Boolean} Whether or not events can be sent.
     */

    return TP.sys.cfg('boot.context') === 'electron';
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.electron.ElectronMessageSource.Inst.defineMethod('activate',
function() {

    /**
     * @method activate
     * @summary Opens the connection to a remote messaging source.
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidSource
     * @exception TP.sig.InvalidSourceType
     * @returns {Boolean} Whether or not the connection opened successfully.
     */

    //  If we're not running in Electron, then we can't activate.
    if (TP.sys.cfg('boot.context') !== 'electron') {
        return false;
    }

    //  If we're active and have a real source object nothing to do.
    if (this.isActive() && TP.isValid(this.get('source'))) {
        return true;
    }

    //  Our source is the TP.electron.ElectronMain type - it is what we'll be
    //  receiving signals from.
    this.set('source', TP.electron.ElectronMain);

    //  The receiver is now active.
    this.isActive(true);

    //  Observe the TP.electron.ElectronMain type (our source) for the generic
    //  'message received' signal. This is generic but will have an encoded
    //  signal name that will be dispatched for more-specific purposes.
    this.observe(TP.electron.ElectronMain, 'TP.sig.MessageReceived');

    //  Signal the Electron-side machinery to activate its watcher.
    TP.electron.ElectronMain.signalMain('TP.sig.ActivateWatcher');

    return true;
});

//  ------------------------------------------------------------------------

TP.electron.ElectronMessageSource.Inst.defineHandler('MessageReceived',
function(aSignal) {

    /**
     * @method handleElectionMessageReceived
     * @summary Handles when we receive a message from the Electron main
     *     process.
     * @param {TP.sig.MessageReceived} aSignal The signal indicating that the
     *     main process wants to communicate with us.
     * @returns {TP.electron.ElectronMessageSource} The receiver.
     */

    var evt,
        signalName;

    evt = aSignal.getPayload();

    //  Map over the event. In the SSE code, this is done by using a REMOTE_NAME
    //  along with special handlers. For Electron, our approach can be simpler.
    switch (evt.event) {
        case 'fileChange':
            signalName = 'TP.sig.ElectronFileChange';
            break;
        default:
            //  Not an event name we recognize, so we can't map it to a signal
            //  name. Return here.
            return;
    }

    this.signal(signalName, evt);

    return this;
});

//  ------------------------------------------------------------------------

TP.electron.ElectronMessageSource.Inst.defineMethod('deactivate',
function(closed) {

    /**
     * @method deactivate
     * @summary Deactivates observation of the message source.
     * @param {Boolean} [closed=false] True to tell deactivate any remote
     *     connection that the receiver is managing is already closed so skip
     *     any internal close call.
     * @returns {Boolean} Whether or not the connection closed successfully.
     */

    if (!this.isActive()) {
        return true;
    }

    //  Ignore the TP.electron.ElectronMain type (our source) for the generic
    //  'message received' signal.
    this.ignore(TP.electron.ElectronMain, 'TP.sig.MessageReceived');

    //  Signal the Electron-side machinery to deactivate its watcher.
    TP.electron.ElectronMain.signalMain('TP.sig.DeactivateWatcher');

    //  The receiver is now inactive.
    this.isActive(false);

    return true;
});

//  ------------------------------------------------------------------------

TP.electron.ElectronMessageSource.Inst.defineMethod('setupCustomHandlers',
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
     * @returns {TP.electron.ElectronMessageSource} The receiver.
     */

    //  TP.electron.ElectronMessageSource has no custom handlers.
    return this;
});

//  ------------------------------------------------------------------------

TP.electron.ElectronMessageSource.Inst.defineMethod('teardownCustomHandlers',
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
     * @returns {TP.electron.ElectronMessageSource} The receiver.
     */

    //  TP.electron.ElectronMessageSource has no custom handlers.
    return this;
});

//  ========================================================================
//  TP.uri.ElectronURLHandler
//  ========================================================================

TP.uri.FileURLHandler.defineSubtype('ElectronFileURLHandler');

TP.uri.ElectronFileURLHandler.addTraits(TP.uri.RemoteURLWatchHandler);

//  ------------------------------------------------------------------------

TP.uri.ElectronFileURLHandler.Type.defineMethod('getWatcherSourceType',
function() {

    /**
     * @method getWatcherSourceType
     * @summary Returns the TIBET type of the watcher signal source. For the
     *     Electron source, this is TP.electron.ElectronMessageSource
     * @returns {TP.electron.ElectronMessageSource} The type that will be
     *     instantiated to make a watcher for the supplied URI.
     */

    return TP.electron.ElectronMessageSource;
});

//  ------------------------------------------------------------------------

TP.uri.ElectronFileURLHandler.Type.defineMethod('getWatcherSignalType',
function() {

    /**
     * @method getWatcherSignalType
     * @summary Returns the TIBET type of the watcher signal. This will be the
     *     signal that the signal source sends when it wants to notify URIs of
     *     changes.
     * @returns {TP.sig.ElectronFileChange} The type that will be instantiated
     *     to construct new signals that notify observers that the *remote*
     *     version of the supplied URI's resource has changed.
     */

    return TP.sig.ElectronFileChange;
});

//  ------------------------------------------------------------------------

TP.uri.ElectronFileURLHandler.Type.defineMethod('activateRemoteWatch',
function() {

    /**
     * @method activateRemoteWatch
     * @summary Performs any processing necessary to activate observation of
     *     remote URL changes.
     * @returns {TP.meta.uri.ElectronFileURLHandler} The receiver.
     */

    var sourceType,
        signalSource,
        signalType;

    sourceType = this.getWatcherSourceType();

    signalSource = sourceType.construct();
    if (TP.notValid(signalSource)) {
        return this.raise('InvalidURLWatchSource');
    }

    signalType = this.getWatcherSignalType();
    this.observe(signalSource, signalType);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.ElectronFileURLHandler.Type.defineMethod('deactivateRemoteWatch',
function() {

    /**
     * @method deactivateRemoteWatch
     * @summary Performs any processing necessary to shut down observation of
     *     remote URL changes.
     * @returns {TP.meta.uri.ElectronFileURLHandler} The receiver.
     */

    var sourceType,
        signalSource,
        signalType;

    sourceType = this.getWatcherSourceType();

    signalSource = sourceType.construct();
    if (TP.notValid(signalSource)) {
        return this.raise('InvalidURLWatchSource');
    }

    signalType = this.getWatcherSignalType();
    this.ignore(signalSource, signalType);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.ElectronFileURLHandler.Type.defineHandler('ElectronFileChange',
function(aSignal) {

    /**
     * @method handleElectionFileChange
     * @summary Handles when a TDS-managed resource has changed.
     * @param {TP.sig.ElectronFileChange} aSignal The signal indicating that a
     *     TDS-managed resource has changed.
     * @returns {TP.meta.uri.ElectronFileURLHandler} The receiver.
     */

    var payload,
        path,
        fileName,
        url;

    //  Make sure that we have a payload
    if (TP.notValid(payload = aSignal.getPayload())) {
        return this;
    }

    //  If we can't determine the file path we can't take action in any case.
    path = TP.hc(payload).at('path');
    if (TP.isEmpty(path)) {
        return this;
    }

    //  Strip any enclosing quotes from the path.
    path = path.asString().stripEnclosingQuotes();

    fileName = TP.uriExpandPath(path);

    //  If we can successfully create a URL from the payload, then process the
    //  change.
    if (TP.isURI(url = TP.uc(fileName))) {
        TP.uri.URI.processRemoteResourceChange(url);
    }

    return this;
});

//  ========================================================================
//  TP.sig.ElectronSignal
//  ========================================================================

TP.sig.Signal.defineSubtype('ElectronSignal');

TP.sig.ElectronSignal.defineSubtype('MessageReceived');

TP.sig.ElectronSignal.defineSubtype('CheckForUpdate');
TP.sig.ElectronSignal.defineSubtype('CheckingForUpdate');
TP.sig.ElectronSignal.defineSubtype('UpdateError');
TP.sig.ElectronSignal.defineSubtype('UpdateAvailable');
TP.sig.ElectronSignal.defineSubtype('UpdateNotAvailable');
TP.sig.ElectronSignal.defineSubtype('UpdateDownloaded');

TP.sig.ElectronSignal.defineSubtype('WindowMoved');
TP.sig.ElectronSignal.defineSubtype('WindowResized');

TP.sig.ElectronSignal.defineSubtype('ApplicationWillExit');
TP.sig.ElectronSignal.defineSubtype('ApplicationDidExit');

//  =======================================================================
//  Registration
//  ========================================================================

//  Make sure the remote url watcher knows about this handler type, but wait to
//  do this after the type has been fully configured to avoid api check error.
if (TP.sys.cfg('boot.context') === 'electron' && !TP.sys.inExtension()) {
    TP.uri.RemoteURLWatchHandler.registerWatcher(
                                        TP.uri.ElectronFileURLHandler);
}

//  =======================================================================
//  TP.sig.ElectronFileChange
//  ========================================================================

TP.sig.RemoteURLChange.defineSubtype('ElectronFileChange');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
