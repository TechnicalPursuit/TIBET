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
 * @type {TP.sherpa.bindingConnectionAssistant}
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('sherpa.bindingConnectionAssistant');

//  Note how this property is TYPE_LOCAL, by design.
TP.sherpa.bindingConnectionAssistant.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.bindingConnectionAssistant.Inst.defineAttribute('head',
    TP.cpc('> .head', TP.hc('shouldCollapse', true)));

TP.sherpa.bindingConnectionAssistant.Inst.defineAttribute('body',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

TP.sherpa.bindingConnectionAssistant.Inst.defineAttribute('foot',
    TP.cpc('> .foot', TP.hc('shouldCollapse', true)));

TP.sherpa.bindingConnectionAssistant.Inst.defineAttribute('generatedAttr',
    TP.cpc('> .foot > #generatedAttr', TP.hc('shouldCollapse', true)));

TP.sherpa.bindingConnectionAssistant.Inst.defineAttribute('data');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.bindingConnectionAssistant.Type.defineMethod('showAssistant',
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
     *          'pathParts': An array of path parts to the source data.
     * @returns {TP.meta.sherpa.bindingConnectionAssistant} The receiver.
     */

    var assistantContentTPElem,
        dialogPromise;

    //  Grab the TP.sherpa.bindingConnectionAssistant type's template.
    assistantContentTPElem =
        TP.sherpa.bindingConnectionAssistant.getResourceElement(
                        'template',
                        TP.ietf.mime.XHTML);

    //  Open a dialog with the connection assistant's content.
    dialogPromise = TP.dialog(
        TP.hc(
            'dialogID', 'ConnectionAssistantDialog',
            'isModal', true,
            'title', 'Make a binding connection',
            'templateContent', assistantContentTPElem));

    //  After the dialog is showing, set the assistant parameters on the content
    //  object from those defined in the original signal's payload.
    dialogPromise.then(
        function(aDialogTPElem) {
            var contentTPElem;

            contentTPElem = aDialogTPElem.get('bodyGroup').
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

TP.sherpa.bindingConnectionAssistant.Inst.defineMethod('computeAttributeValue',
function(info) {

    /**
     * @method computeAttributeValue
     * @summary Computes the attribute value text from the supplied attribute
     *     information.
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
                            return anEntry.at('attributeName');
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
                        str += anEntry.at('expressionAspect') +
                                ': ' +
                                TP.escapePseudoJSONValue(
                                    anEntry.at('expressionValue')) +
                                ', ';
                    });

                //  Slice off the last comma and trailing space
                str = str.slice(0, -2);

                str += '}" ';
            });
    }

    //  Slice off the last space, if there is one
    if (str.endsWith(' ')) {
        str = str.slice(0, -1);
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindingConnectionAssistant.Inst.defineMethod('generateAttr',
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

    str = '';

    if (TP.notEmpty(val = info.at('scopeType'))) {
        if (val === 'computed') {
            str += 'Scope: ' + info.at('computedScope');
        } else if (val === 'manual') {
            str += 'Scope: ' + info.at('manualScope');
        }
    } else {
        return '';
    }

    str += ' exprs: ';

    str += this.computeAttributeValue(info);

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindingConnectionAssistant.Inst.defineHandler('DialogCancel',
function(anObject) {

    /**
     * @method handleDialogCancel
     * @summary Handles when the user has 'canceled' the dialog (i.e. wants to
     *     proceed without taking any action).
     * @param {TP.sig.DialogCancel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.bindingConnectionAssistant} The receiver.
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
    connector = TP.byId('SherpaConnector', this.getNativeDocument());
    connector.hideAllConnectorVisuals();

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

TP.sherpa.bindingConnectionAssistant.Inst.defineHandler('DialogOk',
function(anObject) {

    /**
     * @method handleDialogOk
     * @summary Handles when the user has 'ok-ed' the dialog (i.e. wants to
     *     proceed by taking the default action).
     * @param {TP.sig.DialogOk} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.bindingConnectionAssistant} The receiver.
     */

    var modelURI,

        connector,

        destTPElement,

        result,
        data,
        info,

        attrName,
        val,
        attrVal;

    //  We observed the model URI when we were set up - we need to ignore it now
    //  on our way out.
    modelURI = TP.uc('urn:tibet:bindingConnectionAssistant_source');
    this.ignore(modelURI, 'ValueChange');

    //  Hide the connector. Because we're invoked asynchronously, our invoking
    //  code configured the connector to not hide. Therefore, we need to do it
    //  here.
    connector = TP.byId('SherpaConnector', this.getNativeDocument());
    connector.hideAllConnectorVisuals();

    //  Signal that the connection has succeeded.
    this.signal('SherpaConnectSucceeded');

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

    /*
    //  Compute the attribute name and value from what the user has entered.
    attrName = 'bind:io';

    //attrVal = this.computeAttributeValue(info);
    attrVal = info.at('fullPath');

    TP.bySystemId('Sherpa').setAttributeOnElementInCanvas(
                                    destTPElement, attrName, attrVal);
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindingConnectionAssistant.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the user changes the value of the underlying model.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     * @returns {TP.sherpa.bindingConnectionAssistant} The receiver.
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

    attrInfo = TP.hc(data).at('info');

    str = this.generateAttr(attrInfo);
    this.get('generatedAttr').setTextContent(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindingConnectionAssistant.Inst.defineMethod('findServiceTag',
function(aTPElement, aSourceURI) {

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

    //  Try to find tibet:service tags that are under the context element that
    //  have a remote URI that matches the supplied remote URI. Note that,
    //  because of URI location normalization (expansion, etc.) we need to do
    //  this by querying for all 'tibet:service' tags and then comparing their
    //  URIs individually.
    serviceTPElems = TP.byCSSPath('tibet|service', contextTPElem, false, true);

    len = serviceTPElems.getSize();
    for (i = 0; i < len; i++) {
        serviceTPElem = serviceTPElems.at(i);

        remoteURIAttrVal = serviceTPElem.getAttribute('href');
        localURIAttrVal = serviceTPElem.getAttribute('result');

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

TP.sherpa.bindingConnectionAssistant.Inst.defineMethod('computeCommonScope',
function(connectedURI, inheritedURI, isLeaf, scopingURI) {

    var connectedFrag,

        connectedPath,
        connectedPathType,
        connectedPathParts,

        needsScopingURI,

        connectedPrimaryURI,
        inheritedPrimaryURI,

        inheritedFragExpr,

        inheritedFrag,
        inheritedPath,

        commonParts,

        scopeParts,

        computedScope,

        scopePrefix,
        scopePath;

    connectedFrag = connectedURI.getFragment();
    if (TP.isEmpty(connectedFrag)) {
        //  TODO: Raise an exception
        return null;
    }

    connectedPath = TP.apc(connectedFrag);
    connectedPathType = connectedPath.getPathType();
    connectedPathParts = connectedPath.getPathParts();

    needsScopingURI = true;

    if (TP.isValid(inheritedURI)) {

        connectedPrimaryURI = connectedURI.getPrimaryURI();
        inheritedPrimaryURI = inheritedURI.getPrimaryURI();

        //  Attempt to compute a scope by first looking at the *primary URIs* of
        //  the inherited and connected URIs.
        if (inheritedPrimaryURI.equalTo(connectedPrimaryURI)) {

            needsScopingURI = false;

            //  NB: We use the fragment expression here to test for emptiness,
            //  since the fragment itself will contain the XPointer scheme.
            inheritedFragExpr = inheritedURI.getFragmentExpr();
            if (TP.notEmpty(inheritedFragExpr)) {

                //  Use the whole fragment here (including the XPointer scheme
                //  since that will produce more accurate paths).
                inheritedFrag = inheritedURI.getFragment();
                inheritedPath = TP.apc(inheritedFrag);

                //  Try to see if there are any common parts between the
                //  connected path and the inherited path.
                commonParts =
                    connectedPath.computeCommonLeadingParts(inheritedPath);

                //  Not a 100% match?
                if (commonParts.getSize() !== connectedPathParts.getSize()) {

                    scopeParts = connectedPathParts.slice(
                                                    commonParts.getSize());

                    if (isLeaf) {
                        scopeParts = scopeParts.slice(0, -1);
                    }

                    if (TP.notEmpty(scopeParts)) {
                        computedScope =
                            '#' + connectedPath.getPointerScheme() +
                            '(' +
                                TP.joinAccessPathParts(
                                    scopeParts, connectedPathType) +
                            ')';
                    } else {
                        //  Otherwise, the scopes are equivalent - there is no
                        //  real computed scope.
                        computedScope = '';
                    }
                }
            }
        }
    }

    //  The above logic did not compute a scope - we're going to just return a
    //  scope computed from the connected path and the supplied scoping URI.
    if (TP.notValid(computedScope)) {

        if (isLeaf) {
            scopeParts = connectedPathParts.slice(0, -1);
        } else {
            scopeParts = connectedPathParts;
        }

        //  Grab the property information under the entry that matches our
        //  scope (joined together by a path separator).
        //  TODO: JSONPath-only alert
        scopePrefix = scopeParts.join('.');

        scopePath = TP.apc(scopePrefix);

        if (needsScopingURI) {
            computedScope = scopingURI.getLocation() +
                            scopePath.asXPointerString();
        } else {
            computedScope = scopePath.asXPointerString();
        }
    }

    return computedScope;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindingConnectionAssistant.Inst.defineMethod('setData',
function(anObj) {

    /**
     * @method setData
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} aDataObject The object to set the receiver's internal
     *     data to.
     * @returns {TP.sherpa.bindingConnectionAssistant} The receiver.
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

        inheritedScopeVals,
        inheritedExpr,
        inheritedURI,

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

    serviceInfo = this.findServiceTag(destTPElement, connectedURI);
    if (TP.notValid(serviceInfo)) {
        //  We couldn't find a service element. Turn on the flag.
        needsServiceTag = true;

        //  If we need a service tag, then we need to generate a local (result)
        //  URN that we can use in the scope and put into the service tag's
        //  'result' attribute.
        newLocalLoc = TP.TIBET_URN_PREFIX +
                            'uri' + TP.genID().replace('$', '_') +
                            '_result';

        localURI = TP.uc(newLocalLoc);

        //  Capture the connectedPrimaryURI as the 'remote' URI for the service
        //  tag.
        remoteURI = connectedPrimaryURI;
    } else {
        //  We have a service tag available that has either its local or remote
        //  URI value set to our connected *primary* URI. Turn off the flag.
        needsServiceTag = false;

        //  The remote URI is what the service tag defines.
        remoteURI = TP.uc(serviceInfo.first().getAttribute('href'));

        if (serviceInfo.last() === 'local') {
            //  Everything is fine - we're hooking up to the local (result) URI.
        } else if (serviceInfo.last() === 'remote') {
            //  Otherwise, we're hooking up to the remote URI. We need to get
            //  the local (result) URI from the service tag and use that as our
            //  'connected URI'.
            localURI = TP.uc(serviceInfo.first().getAttribute('result'));
        }
    }

    localPrimaryURI = localURI.getPrimaryURI();

    //  ---

    newBindingInfo.atPut('needsServiceTag', needsServiceTag);
    newBindingInfo.atPut('serviceTagRemoteURI', remoteURI.getLocation());
    newBindingInfo.atPut('serviceTagLocalURI', localPrimaryURI.getLocation());

    //  ---

    //  Compute expression and scope
    expressions = TP.ac();

    //  This is the scope path as seen by the destination element by looking up
    //  its tree.

    //  Grab the scoping values from the element we're connecting to.
    inheritedScopeVals = destTPElement.getBindingScopeValues();

    //  ---

    //  If the element we're connecting to has inherited scoping values, then
    //  compute the full URI from it and compute a scoping value based on
    //  comparing the URI we connected to and the URI we're 'inherting' scope
    //  from.
    if (TP.notEmpty(inheritedScopeVals)) {
        inheritedExpr = TP.uriJoinFragments.apply(TP, inheritedScopeVals);
        inheritedURI = TP.uc(inheritedExpr);
    } else {
        inheritedURI = null;
    }

    computedScope = this.computeCommonScope(connectedURI,
                                            inheritedURI,
                                            isLeaf,
                                            localURI);

    newBindingInfo.atPut('manualScope', '');
    newBindingInfo.atPut('computedScope', '');

    //  Couldn't compute a scope - just flip 'scopeType' to 'manual'
    if (TP.isEmpty(computedScope)) {
        newBindingInfo.atPut('scopeType', 'manual');
    } else {
        newBindingInfo.atPut('scopeType', 'computed');
        newBindingInfo.atPut('computedScope', computedScope);
    }

    //  ---

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

    exprs = propInfo.at(scopePrefix);

    if (TP.notEmpty(exprs)) {
        exprs = exprs.collect(
                        function(part) {
                            //  TODO: JSONPath-only alert - slicing the 1
                            //  offset is the path separator length.
                            return part.slice(part.indexOf(scopePrefix) +
                                                scopePrefix.getSize() +
                                                1);
                        });
        newBindingInfo.atPut('possibleExprs', exprs);
    }

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
//  end
//  ========================================================================
