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
 * @type {TP.sherpa.signalConnectionAssistant}
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('sherpa.signalConnectionAssistant');

//  Note how this property is TYPE_LOCAL, by design.
TP.sherpa.signalConnectionAssistant.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.signalConnectionAssistant.Inst.defineAttribute('head',
    TP.cpc('> .head', TP.hc('shouldCollapse', true)));

TP.sherpa.signalConnectionAssistant.Inst.defineAttribute('body',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

TP.sherpa.signalConnectionAssistant.Inst.defineAttribute('foot',
    TP.cpc('> .foot', TP.hc('shouldCollapse', true)));

TP.sherpa.signalConnectionAssistant.Inst.defineAttribute('generatedAttr',
    TP.cpc('> .foot > #generatedAttr', TP.hc('shouldCollapse', true)));

TP.sherpa.signalConnectionAssistant.Inst.defineAttribute('data');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.signalConnectionAssistant.Inst.defineHandler('DialogCancel',
function(anObject) {

    /**
     * @method handleDialogCancel
     * @summary Handles when the user has 'canceled' the dialog (i.e. wants to
     *     proceed without taking any action).
     * @param {TP.sig.DialogCancel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.tsh.signalConnectionAssistant} The receiver.
     */

    var modelURI,
        connector;

    //  We observed the model URI when we were set up - we need to ignore it now
    //  on our way out.
    modelURI = TP.uc('urn:tibet:signalConnectionAssistant_source');
    this.ignore(modelURI, 'ValueChange');

    //  Grab the Sherpa connector and tell it to stop connecting.
    connector = TP.byId('SherpaConnector', TP.win('UIROOT'));
    if (TP.notValid(connector)) {
        return this;
    }
    connector.stopConnecting();

    //  Signal that the connection has failed.
    this.signal('SherpaConnectFailed');

    //  Focus and set the cursor to the end of the Sherpa's input cell after
    //  1000ms
    setTimeout(
        function() {
            var consoleGUI;

            consoleGUI =
                TP.bySystemId('SherpaConsoleService').get('$consoleGUI');

            consoleGUI.focusInput();
            consoleGUI.setInputCursorToEnd();
        }, 1000);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.signalConnectionAssistant.Inst.defineHandler('DialogOk',
function(anObject) {

    /**
     * @method handleDialogOk
     * @summary Handles when the user has 'ok-ed' the dialog (i.e. wants to
     *     proceed by taking the default action).
     * @param {TP.sig.DialogOk} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.tsh.signalConnectionAssistant} The receiver.
     */

    var modelURI,

        connector,

        srcTPElement,

        result,
        data,
        info,

        attrName,
        val,
        attrVal;

    //  We observed the model URI when we were set up - we need to ignore it now
    //  on our way out.
    modelURI = TP.uc('urn:tibet:signalConnectionAssistant_source');
    this.ignore(modelURI, 'ValueChange');

    //  Grab the Sherpa connector and tell it to stop connecting.
    connector = TP.byId('SherpaConnector', TP.win('UIROOT'));
    if (TP.notValid(connector)) {
        return this;
    }
    connector.stopConnecting();

    //  Signal that the connection has succeeded.
    this.signal('SherpaConnectSucceeded');

    //  Grab the source element that we're going to be putting the attribute on.
    srcTPElement = this.get('data').at('sourceTPElement');
    if (TP.notValid(srcTPElement)) {
        return this;
    }

    result = TP.uc('urn:tibet:signalConnectionAssistant_source').
                                                getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(data = result.get('data'))) {
        return this;
    }

    info = TP.hc(data).at('info');

    //  Compute the attribute name and value from what the user has entered.
    attrName = 'on:';

    if (TP.notEmpty(val = info.at('enteredSourceSignalName'))) {
        attrName += val;
    } else if (TP.notEmpty(val = info.at('chosenSourceSignalName'))) {
        attrName += val;
    }

    attrVal = '';
    if (TP.notEmpty(val = info.at('enteredDestinationHandlerName'))) {
        attrVal += val;
    } else if (TP.notEmpty(val = info.at('chosenDestinationHandlerName'))) {
        if (/ \(/.test(val)) {
            val = val.slice(0, val.indexOf(' ('));
        }
        attrVal += val;
    }

    //  Tell the main Sherpa object that it should go ahead and process DOM
    //  mutations to the source DOM.
    TP.bySystemId('Sherpa').set('shouldProcessDOMMutations', true);

    //  Go ahead and set the attribute.
    srcTPElement.setAttribute(attrName, attrVal);

    //  Focus and set the cursor to the end of the Sherpa's input cell after
    //  500ms
    setTimeout(
        function() {
            var consoleGUI;

            consoleGUI =
                TP.bySystemId('SherpaConsoleService').get('$consoleGUI');

            consoleGUI.focusInput();
            consoleGUI.setInputCursorToEnd();
        }, 1000);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.signalConnectionAssistant.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the user changes the value of the underlying model.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     * @returns {TP.tsh.signalConnectionAssistant} The receiver.
     */

    var result,
        data,
        attrInfo,
        str;

    result = TP.uc('urn:tibet:signalConnectionAssistant_source').
                getResource().
                get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(data = result.get('data'))) {
        return this;
    }

    attrInfo = TP.hc(data).at('info');

    str = this.generateAttr(attrInfo);
    this.get('generatedAttr').setTextContent(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.signalConnectionAssistant.Inst.defineMethod('generateAttr',
function(info) {

    /**
     * @method generateAttr
     * @summary Generates the attribute text that will be used to create a new
     *     Attribute and add it to the connector source if user dismisses the
     *     assistant by clicking 'ok'.
     * @param {TP.core.Hash} info The hash containing the attribute information.
     * @returns {String} The attribute markup text.
     */

    var str,

        val;

    str = 'on:';

    if (TP.notEmpty(val = info.at('enteredSourceSignalName'))) {
        str += val;
    } else if (TP.notEmpty(val = info.at('chosenSourceSignalName'))) {
        str += val;
    } else {
        return '';
    }

    str += '=';

    if (TP.notEmpty(val = info.at('enteredDestinationHandlerName'))) {
        str += val.quoted('"');
    } else if (TP.notEmpty(val = info.at('chosenDestinationHandlerName'))) {
        if (/ \(/.test(val)) {
            val = val.slice(0, val.indexOf(' ('));
        }
        str += val.quoted('"');
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.signalConnectionAssistant.Inst.defineMethod('getHandlerMethodsFor',
function(aType) {

    /**
     * @method getHandlerMethodsFor
     * @summary Retrieves the (instance-level) handler methods for the supplied
     *     type.
     * @param {TP.lang.RootObject} aType The type to produce the handler methods
     *     for.
     * @returns {String[][]} An Array of Arrays containing the names of the
     *     instance-level 'handler only' methods for the supplied type.
     */

    var sourceType,

        result,

        instProto,
        superInstProto,

        signalNameExtractRe,

        rawData;

    sourceType = aType;

    result = TP.ac();

    instProto = sourceType.getInstPrototype();
    superInstProto = sourceType.getSupertype().getInstPrototype();

    signalNameExtractRe = /handle(.+)From/;

    //  ---

    //  Methods introduced on the type itself.

    result.push(TP.GROUPING_PREFIX + ' - Introduced');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_introduced_methods).sort();

    rawData = rawData.filter(
                    function(item) {
                        return TP.regex.HANDLER_NAME.test(item);
                    });

    rawData = rawData.collect(
                    function(item) {
                        return signalNameExtractRe.match(item).at(1);
                    });

    result.push(rawData);

    //  ---

    //  Methods overridden from a supertype on the type.

    result.push(TP.GROUPING_PREFIX + ' - Overridden');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_overridden_methods).sort();

    rawData = rawData.filter(
                    function(item) {
                        return TP.regex.HANDLER_NAME.test(item);
                    });

    rawData.forEach(
            function(item) {
                var name,
                    owner;

                name = signalNameExtractRe.match(item).at(1);

                //  Note here how we get the owner from our supertype's version
                //  of the method - we know we've overridden it, so we want the
                //  owner we've overridden it from.
                if (TP.isValid(instProto[item]) &&
                    TP.isValid(owner = superInstProto[item][TP.OWNER])) {
                    result.push(name + ' (' + TP.name(owner) + ')');
                } else {
                    result.push(item + ' (none)');
                }
            });

    //  ---

    //  Methods inherited from a supertype on the type.

    result.push(TP.GROUPING_PREFIX + ' - Inherited');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_inherited_methods).sort();

    rawData = rawData.filter(
                    function(item) {
                        return TP.regex.HANDLER_NAME.test(item);
                    });

    rawData.forEach(
            function(item) {
                var name,
                    owner;

                name = signalNameExtractRe.match(item).at(1);

                if (TP.isValid(instProto[item]) &&
                    TP.isValid(owner = instProto[item][TP.OWNER])) {
                    result.push(name + ' (' + TP.name(owner) + ')');
                } else {
                    result.push(name + ' (none)');
                }
            });

    result = result.flatten();

    result = result.collect(
                function(entry) {
                    return TP.ac(
                            entry,
                            entry);
                });

    return result;
});

//  ------------------------------------------------------------------------

TP.sherpa.signalConnectionAssistant.Inst.defineMethod('setData',
function(anObj) {

    /**
     * @method setData
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} aDataObject The object to set the receiver's internal
     *     data to.
     * @returns {TP.sherpa.signalConnectionAssistant} The receiver.
     */

    var signalsURI,
        signalsObj,

        nativeEventsData,

        handlersURI,
        handlersObj,

        modelObj,
        newSignalInfo,

        modelURI;

    this.$set('data', anObj);

    //  ---

    signalsURI = TP.uc('urn:tibet:signalnamelist');

    signalsObj = TP.ac();

    //  Build a list of the native events that most 'interactive' elements respond
    //  to.
    nativeEventsData = TP.ac(
            'blur',
            'cancel',       //  dialog element
            'change',
            'click',
            'close',        //  dialog element
            'contextmenu',
            'copy',
            'cut',
            'focus',
            'input',
            'invalid',
            'load',
            'loadend',      //  img element
            'loadstart',    //  img element
            'paste',
            'progress',     //  img element
            'reset',
            'select',
            'submit',
            'toggle'        //  toggle element
    );

    nativeEventsData.sort();

    signalsObj.push(TP.GROUPING_PREFIX + ' - native events');
    signalsObj.push(nativeEventsData);

    //  Flatten the signals information and make sure it's not an origin set.
    signalsObj = signalsObj.flatten();
    signalsObj.isOriginSet(false);

    //  Massage the signals information into an Array of Arrays with the entry
    //  as both the key and value.
    signalsObj = signalsObj.collect(
                    function(entry) {
                        return TP.ac(entry, entry);
                    });

    //  Set the resource of the types URI to the computed object containing our
    //  types.
    signalsURI.setResource(signalsObj);

    //  ---

    handlersURI = TP.uc('urn:tibet:handlernamelist');

    //  Build a list of the handlers that the destination target can respond to.

    //  NB: This assume that the target is a type.
    handlersObj = this.getHandlerMethodsFor(anObj.at('destinationTarget'));
    handlersObj.isOriginSet(false);

    //  Set the resource of the types URI to the computed object containing our
    //  types.
    handlersURI.setResource(handlersObj);

    //  ---

    //  Build the model object.
    modelObj = TP.hc();

    //  Register a hash to be placed at the top-level 'info' slot in the model.
    newSignalInfo = TP.hc();
    modelObj.atPut('info', newSignalInfo);

    //  The data for the chosen signal name or entered signal name.
    newSignalInfo.atPut('chosenSourceSignalName', '');
    newSignalInfo.atPut('enteredSourceSignalName', '');

    //  The data for the chosen handler name or entered handler name.
    newSignalInfo.atPut('chosenDestinationHandlerName', '');
    newSignalInfo.atPut('enteredDestinationHandlerName', '');

    //  ---

    //  Set up a model URI and observe it for change ourself. This will allow us
    //  to regenerate the attribute representation as the model changes.
    modelURI = TP.uc('urn:tibet:signalConnectionAssistant_source');
    this.observe(modelURI, 'ValueChange');

    //  Construct a JSONContent object around the model object so that we can
    //  bind to it using the more powerful JSONPath constructs
    modelObj = TP.core.JSONContent.construct(TP.js2json(modelObj));

    //  Set the resource of the model URI to the model object, telling the URI
    //  that it should observe changes to the model (which will allow us to get
    //  notifications from the URI which we're observing above) and to go ahead
    //  and signal change to kick things off.
    modelURI.setResource(
        modelObj,
        TP.hc('observeResource', true, 'signalChange', true));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
