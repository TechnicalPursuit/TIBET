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
 * @type {TP.lama.bindingConnectionAssistant}
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('lama.bindingConnectionAssistant');

//  Note how this property is TYPE_LOCAL, by design.
TP.lama.bindingConnectionAssistant.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.bindingConnectionAssistant.Inst.defineAttribute('head',
    TP.cpc('> .head', TP.hc('shouldCollapse', true)));

TP.lama.bindingConnectionAssistant.Inst.defineAttribute('body',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

TP.lama.bindingConnectionAssistant.Inst.defineAttribute('foot',
    TP.cpc('> .foot', TP.hc('shouldCollapse', true)));

TP.lama.bindingConnectionAssistant.Inst.defineAttribute('generatedAttr',
    TP.cpc('> .foot > #generatedAttr', TP.hc('shouldCollapse', true)));

TP.lama.bindingConnectionAssistant.Inst.defineAttribute('data');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lama.bindingConnectionAssistant.Type.defineMethod('showAssistant',
function(assistantData) {

    /**
     * @method showAssistant
     * @summary Shows the assistant, using the supplied data.
     * @param {TP.core.Hash} assistantData The data that the assistant will use
     *     to wire the signal source and target together. This hash should have
     *     three slots:
     *          'destTPElement': The TP.core.ElementNode that the binding
     *          is being made to.
     *          'sourceURI': The source URI that the element is binding to.
     *          'propInfo': A hash of property information (such as the type of
     *          property, etc.)
     *          'isLeaf': Whether or not the property was a 'leaf' property.
     *          'forceManualScope': Whether or not the manual scope should be
     *          forced (in which case a computed scope won't even be computed).
     *          'useServiceTag': Whether or not the panel should use (or
     *          generate) a service tag.
     * @returns {TP.meta.lama.bindingConnectionAssistant} The receiver.
     */

    var assistantContentTPElem,
        dialogPromise;

    //  Grab the TP.lama.bindingConnectionAssistant type's template.
    assistantContentTPElem =
        TP.lama.bindingConnectionAssistant.getResourceElement(
                        'template',
                        TP.ietf.mime.XHTML);

    //  Open a dialog with the connection assistant's content.
    dialogPromise = TP.dialog(
        TP.hc(
            'dialogID', 'ConnectionAssistantDialog',
            'dialogWindow', TP.sys.getUIRoot(),
            'isModal', true,
            'title', 'Make a binding connection',
            'templateContent', assistantContentTPElem));

    //  After the dialog is showing, set the assistant parameters on the content
    //  object from those defined in the original signal's payload.
    dialogPromise.then(
        function(aDialogTPElem) {
            var contentTPElem;

            contentTPElem = aDialogTPElem.
                            get('contentElement').
                            getFirstChildElement();

            //  Pass along the insertion position and the peer element
            //  as the insertion point to the dialog info.
            contentTPElem.set('data', assistantData);

            return;
        });

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.bindingConnectionAssistant.Inst.defineMethod(
'computeExpressionsAttributeValue',
function(info) {

    /**
     * @method computeExpressionsAttributeValue
     * @summary Computes the attribute value text for binding expressions
     *     from the supplied attribute information.
     * @param {TP.core.Hash} info The hash containing the attribute information.
     * @returns {String} The attribute markup text.
     */

    var str,

        val,

        entries;

    str = '';

    //  Iterate over all of the defined expressions
    if (TP.notEmpty(val = info.at('expressions'))) {
        //  First, group by attributeName. This will produce a hash with the
        //  attributeName as its key and an Array of the entries that had that
        //  attributeName.
        entries = val.groupBy(
                        function(anEntry) {
                            return anEntry.attributeName;
                        });

        entries.perform(
            function(kvPair) {
                var attrName,
                    attrEntries;

                attrName = kvPair.first();
                attrEntries = kvPair.last();

                str += attrName + '="{';

                attrEntries.forEach(
                    function(anEntry) {
                        str += anEntry.expressionAspect +
                                ': ' +
                                TP.escapePseudoJSONValue(
                                    anEntry.expressionValue) +
                                ', ';
                    });

                //  Slice off the last comma and trailing space
                str = str.slice(0, -2);

                str += '}" ';
            });

        //  Slice off the last space, if there is one
        if (str.endsWith(' ')) {
            str = str.slice(0, -1);
        }
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.lama.bindingConnectionAssistant.Inst.defineMethod(
'computeScopeAttributeValue',
function(info) {

    /**
     * @method computeScopeAttributeValue
     * @summary Computes the attribute value text for the binding scope from the
     *     supplied attribute information.
     * @param {TP.core.Hash} info The hash containing the attribute information.
     * @returns {String} The attribute markup text.
     */

    var str,

        val;

    str = '';

    if (TP.notEmpty(val = info.at('scopeType'))) {
        if (val === 'computed') {
            str += info.at('computedScope');
        } else if (val === 'manual') {
            str += info.at('manualScope');
        }
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.lama.bindingConnectionAssistant.Inst.defineMethod('findServiceTag',
function(aTPElement, aSourceURI) {

    /**
     * @method findServiceTag
     * @summary Finds a 'http:service' tag in the same document as the supplied
     *     element that has either an 'href' or 'result' URI value that matches
     *     the *primary* URI portion of the supplied source URI.
     * @param {TP.dom.ElementNode} aTPElement The element to begin looking for
     *     the 'http:service' tag. The nearest 'halo generator' will be found
     *     for this element (i.e. if this element represents a custom tag, the
     *     search will *not* take place outside of its template). If that cannot
     *     be determined, the element's document's documentElement will be used
     *     to search.
     * @param {TP.core.URI} aSourceURI The URI that will be used to match either
     *     the 'href' or 'result' attribute values. Note that the value used to
     *     match will be the *primary URI* value of this URI.
     * @returns {Array|null} An array containing the found service tag in the
     *     first position and the word 'global' or 'local' in the second
     *     position to indicate whether the match to the supplied source URI was
     *     the 'href' URI value of the service tag or the 'result' URI value of
     *     the service tag.
     */

    var contextTPElem,

        sourcePrimaryURI,

        serviceTPElems,

        len,
        i,

        serviceTPElem,

        remoteURIAttrVal,
        localURIAttrVal;

    //  First, get the nearest 'generator' element for the supplied element.
    //  This will give us the nearest 'custom tag' up the parent chain.
    contextTPElem = aTPElement.getNearestHaloGenerator();
    if (TP.notValid(contextTPElem)) {
        contextTPElem = aTPElement.getDocument().getDocumentElement();
    }

    sourcePrimaryURI = aSourceURI.getPrimaryURI();

    //  Try to find http:service tags that are under the context element that
    //  have a remote URI that matches the supplied remote URI. Note that,
    //  because of URI location normalization (expansion, etc.) we need to do
    //  this by querying for all 'http:service' tags and then comparing their
    //  URIs individually.
    serviceTPElems = TP.byCSSPath('http|service', contextTPElem, false, true);

    len = serviceTPElems.getSize();
    for (i = 0; i < len; i++) {
        serviceTPElem = serviceTPElems.at(i);

        remoteURIAttrVal = serviceTPElem.getAttribute('href');
        localURIAttrVal = serviceTPElem.getAttribute('name');

        if (sourcePrimaryURI.equalTo(remoteURIAttrVal)) {
            return TP.ac(serviceTPElem, 'remote');
        }

        if (sourcePrimaryURI.equalTo(localURIAttrVal)) {
            return TP.ac(serviceTPElem, 'local');
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.lama.bindingConnectionAssistant.Inst.defineMethod('generateAttr',
function(info) {

    /**
     * @method generateAttr
     * @summary Generates the attribute text that will be used to create a new
     *     Attribute and add it to the connector source if user dismisses the
     *     assistant by clicking 'ok'.
     * @param {TP.core.Hash} info The hash containing the attribute information.
     * @returns {String} The attribute markup text.
     */

    var scopeStr,
        str;

    str = '';

    scopeStr = this.computeScopeAttributeValue(info);
    if (TP.notEmpty(scopeStr)) {
        str += 'bind:scope="' + this.computeScopeAttributeValue(info) + '" ';
    }

    str += this.computeExpressionsAttributeValue(info);

    return str;
});

//  ------------------------------------------------------------------------

TP.lama.bindingConnectionAssistant.Inst.defineHandler('DialogCancel',
function(anObject) {

    /**
     * @method handleDialogCancel
     * @summary Handles when the user has 'canceled' the dialog (i.e. wants to
     *     proceed without taking any action).
     * @param {TP.sig.DialogCancel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.bindingConnectionAssistant} The receiver.
     */

    var modelURI,

        connector;

    //  We observed the model URI when we were set up - we need to ignore it now
    //  on our way out.
    modelURI = TP.uc('urn:tibet:bindingConnectionAssistant_source');
    this.ignore(modelURI, 'ValueChange');

    //  Hide the connector. Because we're invoked asynchronously, our invoking
    //  code configured the connector to not hide. Therefore, we need to do it
    //  here.
    connector = TP.byId('LamaConnector', this.getNativeDocument());
    connector.hideAllConnectorVisuals();

    //  Signal that the connection has failed.
    this.signal('LamaConnectFailed');

    //  Message the main Lama IDE object to focus the TDC input cell.
    TP.bySystemId('Lama').focusInputCell(1000);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.bindingConnectionAssistant.Inst.defineHandler('DialogOk',
function(anObject) {

    /**
     * @method handleDialogOk
     * @summary Handles when the user has 'ok-ed' the dialog (i.e. wants to
     *     proceed by taking the default action).
     * @param {TP.sig.DialogOk} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.bindingConnectionAssistant} The receiver.
     */

    var modelURI,

        connector,

        destTPElement,

        result,
        data,
        info,

        val,

        scopeVal,

        entries;

    //  We observed the model URI when we were set up - we need to ignore it now
    //  on our way out.
    modelURI = TP.uc('urn:tibet:bindingConnectionAssistant_source');
    this.ignore(modelURI, 'ValueChange');

    //  Hide the connector. Because we're invoked asynchronously, our invoking
    //  code configured the connector to not hide. Therefore, we need to do it
    //  here.
    connector = TP.byId('LamaConnector', this.getNativeDocument());
    connector.hideAllConnectorVisuals();

    //  Signal that the connection has succeeded.
    this.signal('LamaConnectSucceeded');

    //  Grab the source element that we're going to be putting the attribute on.
    destTPElement = this.get('data').at('destTPElement');
    if (TP.notValid(destTPElement)) {
        return this;
    }

    result = TP.uc('urn:tibet:bindingConnectionAssistant_source').
                                                getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(data = result.get('data'))) {
        return this;
    }

    info = TP.hc(data).at('info');

    //  Iterate over all of the defined expressions
    if (TP.notEmpty(val = info.at('expressions'))) {

        //  Tell the main Lama object that it should go ahead and process DOM
        //  mutations to the source DOM.
        TP.bySystemId('Lama').set('shouldProcessDOMMutations', true);

        scopeVal = this.computeScopeAttributeValue(info);
        if (TP.notEmpty(scopeVal)) {
            destTPElement.setAttribute('bind:scope', scopeVal);
        }

        //  First, group by attributeName. This will produce a hash with the
        //  attributeName as its key and an Array of the entries that had that
        //  attributeName.
        entries = val.groupBy(
                        function(anEntry) {
                            return anEntry.attributeName;
                        });

        entries.perform(
            function(kvPair) {
                var attrName,
                    attrEntries,
                    attrVal;

                attrName = kvPair.first();
                attrEntries = kvPair.last();

                //  Start the attribute value with an opening '{'.
                attrVal = '{';

                //  Iterate over each entry, appending a String representing the
                //  key/value for each expression.
                attrEntries.forEach(
                    function(anEntry) {
                        attrVal += anEntry.expressionAspect +
                                    ': ' +
                                    TP.escapePseudoJSONValue(
                                        anEntry.expressionValue) +
                                    ', ';
                    });

                //  Slice off the last comma and trailing space
                attrVal = attrVal.slice(0, -2);

                //  Close the '}'
                attrVal += '}';

                destTPElement.setAttribute(attrName, attrVal);
            });

        //  Tell the binding machinery to update its referenced locations, using
        //  the supplied native Element to derive the document that the
        //  locations will be refreshed from (the machinery will refresh all of
        //  the binding locations in the whole document).
        TP.bind.XMLNS.refreshReferencedLocations(destTPElement.getNativeNode());

        //  Refresh the element, now that we've altered the bindings.
        destTPElement.refresh();

        //  Message the main Lama IDE object to focus the TDC input cell.
        TP.bySystemId('Lama').focusInputCell(1000);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.bindingConnectionAssistant.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the user changes the value of the underlying model.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     * @returns {TP.lama.bindingConnectionAssistant} The receiver.
     */

    var result,
        data,
        attrInfo,
        str;

    result = TP.uc('urn:tibet:bindingConnectionAssistant_source').
                getResource().
                get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(data = result.get('data'))) {
        return this;
    }

    //  If the author has toggled the 'Insert Service Tag'
    if (aSignal.at('aspect').endsWith('wantsServiceTag')) {
        this.wantsServiceTagChange(data);
    }

    attrInfo = TP.hc(data).at('info');

    str = this.generateAttr(attrInfo);
    this.get('generatedAttr').setTextContent(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.bindingConnectionAssistant.Inst.defineMethod('setData',
function(anObj) {

    /**
     * @method setData
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} anObj The object to set the receiver's internal data to.
     * @returns {TP.lama.bindingConnectionAssistant} The receiver.
     */

    var modelObj,

        newBindingInfo,

        destTPElement,

        connectedURI,
        connectedPrimaryURI,

        propInfo,

        isLeaf,

        serviceInfo,

        needsServiceTag,

        newLocalLoc,
        localURI,

        remoteURI,

        localPrimaryURI,

        expressions,

        computedScope,

        scopeParts,
        scopePrefix,
        exprs,

        modelURI;

    this.$set('data', anObj);

    //  ---

    //  Build the model object.
    modelObj = TP.hc();

    //  Register a hash to be placed at the top-level 'info' slot in the model.
    newBindingInfo = TP.hc();
    modelObj.atPut('info', newBindingInfo);

    //  ---

    destTPElement = anObj.at('destTPElement');

    connectedURI = anObj.at('sourceURI');
    connectedPrimaryURI = connectedURI.getPrimaryURI();

    propInfo = anObj.at('propInfo');

    isLeaf = anObj.at('isLeaf');

    //  ---

    //  If the caller wants us to use a service tag, then we need to do some
    //  additional computation. Otherwise, things are easy - we're binding
    //  directly to the URL.
    if (TP.notFalse(anObj.at('useServiceTag'))) {

        //  Look for service element that has either its remote or its local
        //  (result) URI set to connectedURI.
        serviceInfo = this.findServiceTag(destTPElement, connectedURI);
        if (TP.notValid(serviceInfo)) {
            //  We couldn't find a service element. Turn on the flag.
            needsServiceTag = true;

            //  If we need a service tag, then we need to generate a local
            //  (result) URN that we can use in the scope and put into the
            //  service tag's 'result' attribute.
            newLocalLoc = TP.TIBET_URN_PREFIX +
                            'uri' + TP.genID().replace('$', '_') +
                            '_result';

            localURI = TP.uc(newLocalLoc);

            //  Capture the connectedPrimaryURI as the 'remote' URI for the
            //  service tag.
            remoteURI = connectedPrimaryURI;
        } else {
            //  We have a service tag available that has either its local or
            //  remote URI value set to our connected *primary* URI. Turn off
            //  the flag.
            needsServiceTag = false;

            //  The remote URI is what the service tag defines.
            remoteURI = TP.uc(serviceInfo.first().getAttribute('href'));

            if (serviceInfo.last() === 'local') {
                //  Everything is fine - we're hooking up to the local (result)
                //  URI.
            } else if (serviceInfo.last() === 'remote') {
                //  Otherwise, we're hooking up to the remote URI. We need to
                //  get the local (result) URI from the service tag and use that
                //  as our 'connected URI'.
                localURI = TP.uc(serviceInfo.first().getAttribute('name'));
            }
        }

        localPrimaryURI = localURI.getPrimaryURI();

        //  ---

        newBindingInfo.atPut('needsServiceTag', needsServiceTag);

        //  We initially set the 'wantsServiceTag' property to what the system
        //  determined around needing a service tag.
        newBindingInfo.atPut('wantsServiceTag', TP.ac(needsServiceTag));

        newBindingInfo.atPut('serviceTagRemoteURI', remoteURI.getLocation());
        newBindingInfo.atPut('serviceTagLocalURI', localPrimaryURI.getLocation());

    } else {
        localURI = connectedPrimaryURI;
        needsServiceTag = false;
        newBindingInfo.atPut('needsServiceTag', false);

        //  We initially set the 'wantsServiceTag' property to what the system
        //  determined around needing a service tag.
        newBindingInfo.atPut('wantsServiceTag', TP.ac(false));

    }

    //  ---

    //  Compute binding scope value

    expressions = TP.ac();

    if (TP.notFalse(anObj.at('forceManualScope'))) {
        newBindingInfo.atPut('manualScope', connectedPrimaryURI.getLocation());
        computedScope = null;
    } else {
        newBindingInfo.atPut('manualScope', '');
        computedScope = destTPElement.computeCommonScope(
                                        connectedURI, isLeaf, localURI);
    }

    //  Couldn't compute a scope - just flip 'scopeType' to 'manual'
    if (TP.isEmpty(computedScope)) {
        newBindingInfo.atPut('scopeType', 'manual');
        newBindingInfo.atPut('computedScope', '');
    } else {
        newBindingInfo.atPut('scopeType', 'computed');
        newBindingInfo.atPut('computedScope', computedScope);

        //  We capture the value of the "computed scope if we want a service
        //  tag" to the computed scope so that we don't have to compute it
        //  again.
        newBindingInfo.atPut('serviceTagComputedScope', computedScope);
    }

    //  ---

    //  Compute possible expression values

    if (TP.notEmpty(connectedURI.getFragment())) {

        scopeParts = TP.apc(connectedURI.getFragment()).getPathParts();

        //  JSONPath-only alert
        if (scopeParts.first() === '$') {
            scopeParts.shift();
        }

        if (isLeaf) {
            //  JSONPath-only alert
            scopePrefix = scopeParts.slice(0, -1).join('.');
        } else {
            //  JSONPath-only alert
            scopePrefix = scopeParts.join('.');
        }

        exprs = propInfo.at(scopePrefix).at('exprs');

        if (TP.notEmpty(exprs)) {
            exprs = exprs.collect(
                            function(part) {
                                //  TODO: JSONPath-only alert - slicing the 1
                                //  offset is the path separator length.
                                return part.slice(part.indexOf(scopePrefix) +
                                                    scopePrefix.getSize() +
                                                    1);
                            });
        }
    } else {
        //  If there is no fragment, then we assume a property of 'value'.
        exprs = propInfo.at('value').at('exprs');
    }

    newBindingInfo.atPut('possibleExprs', exprs);

    //  Expressions
    newBindingInfo.atPut('expressions', expressions);

    //  ---

    //  Set up a model URI and observe it for change ourself. This will allow us
    //  to regenerate the attribute representation as the model changes.
    modelURI = TP.uc('urn:tibet:bindingConnectionAssistant_source');
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

TP.lama.bindingConnectionAssistant.Inst.defineMethod(
'wantsServiceTagChange',
function(anObj) {

    /**
     * @method wantsServiceTagChange
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} anObj The object to set the receiver's internal data to.
     * @returns {TP.lama.bindingConnectionAssistant} The receiver.
     */

    var data,
        info,

        wantsServiceTag,

        connectedURI,

        computedScope,

        modelURI;

    data = this.get('data');
    info = anObj.info;

    //  Grab the value for whether the author wants a service tag or not. Note
    //  that radio button values will come as an Array - collapse the value to a
    //  single Boolean.
    wantsServiceTag = TP.collapse(info.wantsServiceTag);
    if (!wantsServiceTag) {

        //  The author doesn't want a service tag. Compute a common scope from
        //  the URI that we're directly connecting to and use that as the
        //  computed scope.

        connectedURI = data.at('sourceURI');
        if (TP.isEmpty(connectedURI.getFragment())) {
            //  TODO: Raise an exception
            return null;
        }

        computedScope = data.at('destTPElement').computeCommonScope(
                                                    connectedURI,
                                                    data.at('isLeaf'));
        info.computedScope = computedScope;

    } else {
        info.computedScope = info.serviceTagComputedScope;
    }

    //  Grab the URI that we're updating and signal that it's changing.
    modelURI = TP.uc('urn:tibet:bindingConnectionAssistant_source');
    modelURI.$changed();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
