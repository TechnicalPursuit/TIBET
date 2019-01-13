//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.sherpa.changes}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('changes');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.changes.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);
    tpElem.setup();

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Executes once the tag has been fully processed and its
     *     attachment phases are fully complete.
     * @description Because tibet:data tag content drives binds and we need to
     *     notify even without a full page load, we notify from here once the
     *     attachment is complete (instead of during tagAttachData).
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var dataURI,

        shouldWatchURI,
        shouldWatchValue,

        shouldProcessURI,
        shouldProcessValue;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  set the server-side URIs list to an empty Array so that it draw an
    //  'empty full row' list.
    dataURI = TP.uc('urn:tibet:changedServerURIs');
    dataURI.setResource(TP.ac());

    //  set the client-side URIs list to an empty Array so that it draw an
    //  'empty full row' list.
    dataURI = TP.uc('urn:tibet:changedClientURIs');
    dataURI.setResource(TP.ac());

    shouldWatchURI = TP.uc('urn:tibet:watch_remote_changes');
    shouldWatchValue = TP.sys.cfg('uri.watch_remote_changes');
    shouldWatchURI.setContent('{"selected":' + shouldWatchValue + '}');

    shouldProcessURI = TP.uc('urn:tibet:process_remote_changes');
    shouldProcessValue = TP.sys.cfg('uri.process_remote_changes');
    shouldProcessURI.setContent('{"selected":' + shouldProcessValue + '}');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineAttribute('countWithName',
    TP.cpc('> .header > sherpa|count[name="{{0}}"]',
                            TP.hc('shouldCollapse', true)));

TP.sherpa.changes.Inst.defineAttribute('serverCount',
    TP.cpc('> .header > sherpa|count[name="server"]',
                            TP.hc('shouldCollapse', true)));

TP.sherpa.changes.Inst.defineAttribute('clientCount',
    TP.cpc('> .header > sherpa|count[name="client"]',
                            TP.hc('shouldCollapse', true)));

TP.sherpa.changes.Inst.defineAttribute('watchRemoteChangesCheckbox',
    TP.cpc('> .content #watchRemoteChanges > input',
                            TP.hc('shouldCollapse', true)));

TP.sherpa.changes.Inst.defineAttribute('processRemoteChangesCheckbox',
    TP.cpc('> .content #processRemoteChanges > input',
                            TP.hc('shouldCollapse', true)));

TP.sherpa.changes.Inst.defineAttribute('lists',
    TP.cpc('> .content xctrls|list',
                            TP.hc('shouldCollapse', false)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineHandler('BrowseToURI',
function(aSignal) {

    /**
     * @method handleBrowseToURI
     * @summary Handles when the user wants to browse to the selected URI.
     * @param {TP.sig.BrowseToURI} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.changes} The receiver.
     */

    var list,
        selectedLoc,

        cmdText;

    //  Grab the value of item that was clicked on the list. This will be the
    //  URI value.
    list = TP.wrap(aSignal.getTarget());
    selectedLoc = list.get('data').at(list.get('value'));

    //  Make sure to escape any slashes - this is important as the Sherpa
    //  inspector can use '/' as a 'path separator' and we want the URI to be
    //  treated as a 'whole'.
    selectedLoc = TP.stringEscapeSlashes(selectedLoc);

    cmdText = ':inspect --path=\'_URIS_/' + selectedLoc + '\'';
    TP.signal(null,
                'ConsoleCommand',
                TP.hc('cmdText', cmdText,
                        'showBusy', true));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineHandler('ClosedChange',
function(aSignal) {

    /**
     * @method handleClosedChange
     * @summary Handles when the HUD's 'closed' state changes.
     * @param {TP.sig.ClosedChange} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.changes} The receiver.
     */

    var hudIsClosed;

    //  Grab the HUD and see if it's currently open or closed.
    hudIsClosed = TP.bc(aSignal.getOrigin().getAttribute('closed'));

    if (hudIsClosed) {
        this.toggleObservations(false);
    } else {
        this.updateURIInfo();

        this.toggleObservations(true);
    }

    return this;
}, {
    origin: 'SherpaHUD'
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineHandler('DirtyChange',
function(aSignal) {

    /**
     * @method handleDirtyChange
     * @summary Handles when any URI's client-side 'dirty' state changes.
     * @param {TP.sig.DirtyChange} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.changes} The receiver.
     */

    //  If we're testing, then just exit here.
    if (TP.sys.isTesting()) {
        return this;
    }

    if (TP.isKindOf(aSignal.getOrigin(), TP.uri.URL)) {
        this.updateURIInfo();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineHandler('ProcessRemoteResource',
function(aSignal) {

    /**
     * @method handleProcessRemoteResource
     * @summary Handles when the user wants the system to process a particular
     *     remote resource.
     * @param {TP.sig.ProcessRemoteResource} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.changes} The receiver.
     */

    var labelText;

    //  Grab the label text by getting the button's previous sibling, which will
    //  be the bound expression 'span'. It will contain the URL location to
    //  process.
    labelText = TP.wrap(
        aSignal.getResolvedDOMTarget().previousSibling).getTextContent();

    //  Fire a ConsoleCommand that will pull that remote resource in and process
    //  it.
    TP.signal(null,
                'ConsoleCommand',
                TP.hc(
                    'cmdText', ':pull ' + labelText
                ));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineHandler('PushAllLocalResources',
function(aSignal) {

    /**
     * @method handleAllPushLocalResources
     * @summary Handles when the user wants the system to push all of the
     *     changed local resources to its remote server.
     * @param {TP.sig.PushLocalResource} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.changes} The receiver.
     */

    //  Fire a ConsoleCommand that will push the local resource to the server.
    TP.signal(null,
                'ConsoleCommand',
                TP.hc(
                    'cmdText', ':push --all'
                ));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineHandler('PushLocalResource',
function(aSignal) {

    /**
     * @method handlePushLocalResource
     * @summary Handles when the user wants the system to push a particular
     *     local resource to its remote server.
     * @param {TP.sig.PushLocalResource} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.changes} The receiver.
     */

    var labelText;

    //  Grab the label text by getting the button's previous sibling, which will
    //  be the bound expression 'span'. It will contain the URL location to
    //  push.
    labelText = TP.wrap(
        aSignal.getResolvedDOMTarget().previousSibling).getTextContent();

    //  Fire a ConsoleCommand that will push the local resource to the server.
    TP.signal(null,
                'ConsoleCommand',
                TP.hc(
                    'cmdText', ':push ' + labelText
                ));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineHandler('RemoteResourceChanged',
function(aSignal) {

    /**
     * @method handleRemoteResourceChanged
     * @summary Handles when any URI's server-side 'dirty' state changes.
     * @param {TP.sig.RemoteResourceChanged} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.changes} The receiver.
     */

    if (TP.isKindOf(aSignal.getOrigin(), TP.uri.URL)) {
        this.updateURIInfo();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineHandler('ShowClientChanges',
function(aSignal) {

    /**
     * @method handleShowClientChanges
     * @summary Handles notifications of when the user wants to show the client
     *     URIs that have changed.
     * @param {TP.sig.ShowClientChanges} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.changes} The receiver.
     */

    var drawerTPElem;

    drawerTPElem = TP.wrap(this.getNativeNode().parentNode.parentNode);
    drawerTPElem.setAttribute('closed', false);

    this.setSelectedPanel('client');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineHandler('ShowServerChanges',
function(aSignal) {

    /**
     * @method handleShowServerChanges
     * @summary Handles notifications of when the user wants to show the server
     *     URIs that have changed.
     * @param {TP.sig.ShowServerChanges} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.changes} The receiver.
     */

    var drawerTPElem;

    drawerTPElem = TP.wrap(this.getNativeNode().parentNode.parentNode);
    drawerTPElem.setAttribute('closed', false);

    this.setSelectedPanel('server');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineHandler('UISelect',
function(aSignal) {

    /**
     * @method handleUISelect
     * @summary Handles notifications of when the user has selected to switch to
     *     the currently non-selected panel of URIs that have changed.
     * @param {TP.sig.UISelect} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.changes} The receiver.
     */

    this.get('lists').forEach(
        function(aList) {
            aList.render();
        });

    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the user changes the value of the underlying model.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     * @returns {TP.sherpa.changes} The receiver.
     */

    var shouldWatchSelectedURI,
        watchIsSelected,

        shouldProcessSelectedURI,
        processIsSelected;

    shouldWatchSelectedURI = TP.uc(
        'urn:tibet:watch_remote_changes#tibet(selected)');
    watchIsSelected =
        TP.ifEmpty(shouldWatchSelectedURI.getResource().get('result'),
                    TP.sys.cfg('uri.watch_remote_changes'));
    TP.sys.setcfg('uri.watch_remote_changes', watchIsSelected);

    shouldProcessSelectedURI = TP.uc(
        'urn:tibet:process_remote_changes#tibet(selected)');
    processIsSelected =
        TP.ifEmpty(shouldProcessSelectedURI.getResource().get('result'),
                    TP.sys.cfg('uri.process_remote_changes'));
    TP.sys.setcfg('uri.process_remote_changes', processIsSelected);

    if (!watchIsSelected) {
        this.get('processRemoteChangesCheckbox').setAttrDisabled(true);
        this.get('lists').last().setAttrDisabled(true);
    } else {
        this.get('processRemoteChangesCheckbox').setAttrDisabled(false);
        this.get('lists').last().setAttrDisabled(processIsSelected);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineMethod('setSelectedPanel',
function(panelName) {

    /**
     * @method setSelectedPanel
     * @summary Sets the currently selected panel to the panel with a 'name'
     *     attribute matching the supplied panel name.
     * @param {String} panelName The name of the panel to switch to.
     * @returns {TP.sherpa.changes} The receiver.
     */

    var selectionURI,

        currentName,

        countTPElem;

    //  Grab the model value for the currently selected tab.
    selectionURI = TP.uc('urn:tibet:current_changes_tab#tibet(selection)');
    currentName = selectionURI.getResource().get('result');

    //  If that value is different than the supplied name, then switch.
    if (currentName !== panelName) {

        //  Grab the current panel and make it not selected.
        countTPElem = this.get('countWithName', currentName);
        countTPElem.setAttribute('selected', false);

        //  Grab the desired panel and make it selected.
        countTPElem = this.get('countWithName', panelName);
        countTPElem.setAttribute('selected', true);

        //  Update the currently selected tab model value.
        selectionURI.setResource(panelName);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.sherpa.changes} The receiver.
     */

    this.observe(TP.byId('SherpaHUD', this.getNativeWindow()), 'ClosedChange');

    this.toggleObservations(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.sherpa.changes} The receiver.
     */

    var shouldWatchURI,
        shouldProcessURI;

    shouldWatchURI = TP.uc('urn:tibet:watch_remote_changes');
    shouldProcessURI = TP.uc('urn:tibet:process_remote_changes');

    if (shouldObserve) {
        this.observe(shouldWatchURI, 'ValueChange');
        this.observe(shouldProcessURI, 'ValueChange');
        this.observe(TP.ANY, TP.ac('DirtyChange', 'RemoteResourceChanged'));
    } else {
        this.ignore(shouldWatchURI, 'ValueChange');
        this.ignore(shouldProcessURI, 'ValueChange');
        this.ignore(TP.ANY, TP.ac('DirtyChange', 'RemoteResourceChanged'));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineMethod('updateURIInfo',
function() {

    /**
     * @method updateURIInfo
     * @summary Updates the URI information in the client and server panels.
     * @returns {TP.sherpa.changes} The receiver.
     */

    var serverData,
        serverCountTPElem,

        oldServerCount,
        newServerCount,
        serverURI,

        clientData,
        clientCountTPElem,

        oldClientCount,
        newClientCount,
        clientURI,

        countPulseFinishedFunc;

    //  Grab the server data by getting the keys of TP.uri.URI's 'remote change
    //  list'. These will be the URI locations.
    serverData = TP.uri.URI.get('remoteChangeList').getKeys();

    //  Virtualize these URIs to match the format in the client panel.
    serverData = serverData.collect(
                    function(aLocation) {
                        return TP.uriInTIBETFormat(aLocation);
                    });

    //  Set the data of the server URIs model to the data we computed. This will
    //  cause dependents (like the list) to update.
    serverURI = TP.uc('urn:tibet:changedServerURIs');
    serverURI.setResource(serverData, TP.hc('signalChange', true));

    //  Update the count for the server side, if required.
    serverCountTPElem = this.get('serverCount');

    oldServerCount = serverCountTPElem.getContent().asNumber();
    newServerCount = TP.notEmpty(serverData) ? serverData.getSize() : 0;

    //  If the old and new server counts don't match, then update the server
    //  count.
    if (oldServerCount !== newServerCount) {

        //  Set the text of the server count to the new count and add a class
        //  that will cause the count to animate.
        serverCountTPElem.setContent(newServerCount);
        serverCountTPElem.addClass('contentrefreshed');

        //  Set up a signal handler that waits for the animation to finish. When
        //  it does, then remove the class that caused the animation.
        (countPulseFinishedFunc = function(aSignal) {

            countPulseFinishedFunc.ignore(
                serverCountTPElem, 'TP.sig.DOMAnimationEnd');

            serverCountTPElem.removeClass('contentrefreshed');
        }).observe(serverCountTPElem, 'TP.sig.DOMAnimationEnd');
    }

    //  ---

    //  Grab the client data by getting TP.uri.URI's 'local change list'. These
    //  will be hash of the URI locations as keys and the URIs as values.
    clientData = TP.uri.URI.getLocalChangeList();

    //  Select out only URIs that are really URLs.
    clientData = clientData.select(
                    function(kvPair) {
                        return TP.isKindOf(kvPair.last(), TP.uri.URL);
                    });

    //  Collect out the URL locations.
    clientData = clientData.collect(
                    function(kvPair) {
                        return kvPair.first();
                    });

    //  Set the data of the client URIs model to the data we computed. This will
    //  cause dependents (like the list) to update.
    clientURI = TP.uc('urn:tibet:changedClientURIs');
    clientURI.setResource(clientData, TP.hc('signalChange', true));

    //  Update the count for the client side, if required.
    clientCountTPElem = this.get('clientCount');

    oldClientCount = clientCountTPElem.getContent().asNumber();
    newClientCount = TP.notEmpty(clientData) ? clientData.getSize() : 0;

    //  If the old and new client counts don't match, then update the client
    //  count.
    if (oldClientCount !== newClientCount) {

        //  Set the text of the client count to the new count and add a class
        //  that will cause the count to animate.
        clientCountTPElem.setContent(newClientCount);
        clientCountTPElem.addClass('contentrefreshed');

        //  Set up a signal handler that waits for the animation to finish. When
        //  it does, then remove the class that caused the animation.
        (countPulseFinishedFunc = function(aSignal) {

            countPulseFinishedFunc.ignore(
                clientCountTPElem, 'TP.sig.DOMAnimationEnd');

            clientCountTPElem.removeClass('contentrefreshed');
        }).observe(clientCountTPElem, 'TP.sig.DOMAnimationEnd');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
