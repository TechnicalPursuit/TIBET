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
 * @type {TP.lama.couchDocumentURIInsertionAssistant}
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('lama.couchDocumentURIInsertionAssistant');

//  Note how this property is TYPE_LOCAL, by design.
TP.lama.couchDocumentURIInsertionAssistant.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lama.couchDocumentURIInsertionAssistant.Type.defineMethod('showAssistant',
function(assistantData) {

    /**
     * @method showAssistant
     * @summary Shows the assistant, using the supplied data.
     * @param {TP.core.Hash} assistantData The data that the assistant will use
     *     to wire the signal source and target together. This hash should have
     *     four slots:
     *          'insertionPosition': The insertion position, relative to the
     *          insertion point element, that the new node should be inserted
     *          at. This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN,
     *          TP.BEFORE_END, TP.AFTER_END.
     *          'insertionPoint' The element that provides the insertion point
     *          to the insertion operation. This, in combination with the
     *          insertion position, will provide the place in the DOM to insert
     *          the new DOM node.
     *          'uri': The URI holding the data.
                'localStorageID': A temporary data holder for the form data.
     * @returns {TP.meta.lama.couchDocumentURIInsertionAssistant} The receiver.
     */

    var assistantContentTPElem,
        dialogPromise;

    //  Grab the TP.lama.couchViewURIInsertionAssistant type's template.
    assistantContentTPElem =
        TP.lama.couchDocumentURIInsertionAssistant.getResourceElement(
                        'template',
                        TP.ietf.mime.XHTML);

    //  Open a dialog with the connection assistant's content.
    dialogPromise = TP.dialog(
        TP.hc(
            'dialogID', 'CouchDocumentURIAssistantDialog',
            'isModal', true,
            'title', 'Insert Property Sheet',
            'templateContent', assistantContentTPElem));

    //  After the dialog is showing, set the assistant parameters on the content
    //  object from those defined in the original signal's payload.
    dialogPromise.then(
        function(aDialogTPElem) {
            var contentTPElem;

            contentTPElem = aDialogTPElem.
                            get('dialogcontent').
                            getFirstChildElement();

            //  Pass along the insertion position and the peer element
            //  as the insertion point to the dialog info.
            contentTPElem.set('data', assistantData);

            return;
        });

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.couchDocumentURIInsertionAssistant.Inst.defineAttribute('head',
    TP.cpc('> .head', TP.hc('shouldCollapse', true)));

TP.lama.couchDocumentURIInsertionAssistant.Inst.defineAttribute('body',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

TP.lama.couchDocumentURIInsertionAssistant.Inst.defineAttribute('foot',
    TP.cpc('> .foot', TP.hc('shouldCollapse', true)));

TP.lama.couchDocumentURIInsertionAssistant.Inst.defineAttribute('data');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.couchDocumentURIInsertionAssistant.Inst.defineMethod('generatePathData',
function(anElement) {

    /**
     * @method generatePathData
     * @summary Generates the data that will be used to display the path from
     *     the top-level of the Element's document down through the descendant
     *     chain to the supplied Element.
     * @param {Element} anElement The element to generate the path to.
     * @returns {TP.lama.couchDocumentURIInsertionAssistant} The receiver.
     */

    var targetTPElem,

        nodes,

        info;

    targetTPElem = TP.wrap(anElement);

    //  Get the supplied element's ancestor chain and build a list from that.
    nodes = targetTPElem.getAncestors();

    //  Unshift the supplied element onto the front.
    nodes.unshift(targetTPElem);

    //  Reverse the list so that the top-most anscestor is first and the
    //  supplied element is last.
    nodes.reverse();

    info = TP.ac();

    //  Concatenate the filtered child elements onto the list.
    nodes.perform(
        function(aNode) {
            var node;

            node = TP.canInvoke(aNode, 'getNativeNode') ?
                                    aNode.getNativeNode() :
                                    aNode;

            if (!TP.isElement(node)) {
                return;
            }

            info.push(TP.elementGetFullName(node));
        });

    return info;
});

//  ------------------------------------------------------------------------

TP.lama.couchDocumentURIInsertionAssistant.Inst.defineHandler('DialogCancel',
function(anObject) {

    /**
     * @method handleDialogCancel
     * @summary Handles when the user has 'canceled' the dialog (i.e. wants to
     *     proceed without taking any action).
     * @param {TP.sig.DialogCancel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.couchDocumentURIInsertionAssistant} The receiver.
     */

    var modelURI;

    //  We observed the model URI when we were set up - we need to ignore it now
    //  on our way out.
    modelURI = TP.uc('urn:tibet:couchDocumentURIInsertionAssistant_source');
    this.ignore(modelURI, 'ValueChange');

    //  Message the main Lama IDE object to focus the TDC input cell.
    TP.bySystemId('Lama').focusInputCell(1000);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.couchDocumentURIInsertionAssistant.Inst.defineHandler('DialogOk',
function(anObject) {

    /**
     * @method handleDialogOk
     * @summary Handles when the user has 'ok-ed' the dialog (i.e. wants to
     *     proceed by taking the default action).
     * @param {TP.sig.DialogOk} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.couchDocumentURIInsertionAssistant} The receiver.
     */

    var modelURI,

        suppliedData,

        result,
        resultData,
        info,

        schemaText,

        tSchema,
        schemaObj,

        schemaFile,

        targetElem,

        newTPElem,
        newElem,

        localID,
        localLoc,

        remoteLoc,

        doc,

        newLoadServiceElem,
        newSaveServiceElem,
        newSaveButtonElem,

        schemaURI,

        saveRequest;

    //  We observed the model URI when we were set up - we need to ignore it now
    //  on our way out.
    modelURI = TP.uc('urn:tibet:couchDocumentURIInsertionAssistant_source');
    this.ignore(modelURI, 'ValueChange');

    if (TP.notValid(suppliedData = this.get('data'))) {
        return this;
    }

    result = TP.uc('urn:tibet:couchDocumentURIInsertionAssistant_source').
                getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(resultData = result.get('data'))) {
        return this;
    }

    info = TP.hc(resultData).at('info');

    //  ---

    schemaText = info.at('schema');

    if (!TP.isJSONString(schemaText)) {
        //  Schema wasn't JSON. Exit here.
        //  TODO: Raise an exception
        return this;
    }

    //  Note the 'false' here - we want a POJO
    tSchema = TP.json2js(schemaText, false);

    schemaObj = TP.json.JSONSchemaContent.construct(tSchema);

    // schemaFile = info.at('schemaFile');
    schemaFile = null;

    //  ---

    targetElem = suppliedData.at('insertionPoint');
    if (!TP.isElement(targetElem)) {
        //  No insertion point? Exit here.
        //  TODO: Raise an exception
        return this;
    }

    //  Create a new xctrls:propertysheet element from the computed JSON schema.
    newTPElem = TP.xctrls.propertysheet.from(schemaObj);
    newElem = TP.unwrap(newTPElem);

    localID = suppliedData.at('localStorageID');
    localLoc = 'urn:tibet:' + localID;

    remoteLoc = suppliedData.at('uri').getLocation();

    //  ---

    newTPElem.setAttribute('bind:scope', localLoc + '#jpath($)');

    doc = TP.nodeGetDocument(newElem);

    newLoadServiceElem =
        TP.elem('<http:service' +
                ' id="' + localID + '_loader"' +
                ' href="' + remoteLoc + '"' +
                ' name="' + localLoc + '"' +
                ' watched="true"' +
                ' on:TP.sig.AttachComplete="TP.sig.UIActivate"/>');
    TP.nodeAppendChild(newElem, newLoadServiceElem, false);
    TP.nodeAppendChild(newElem, doc.createTextNode('\n'), false);

    newSaveServiceElem =
        TP.elem('<http:service' +
                ' id="' + localID + '_saver"' +
                ' href="' + remoteLoc + '"' +
                ' body="' + localLoc + '"' +
                ' name="' + localLoc + '_result"' +
                ' method="PUT"' +
                ' mimetype="application/json"/>');
    TP.nodeAppendChild(newElem, newSaveServiceElem, false);
    TP.nodeAppendChild(newElem, doc.createTextNode('\n'), false);

    newSaveButtonElem =
        TP.xhtmlnode(
                '<xctrls:button' +
                ' class="saveButton"' +
                ' on:click="{signal: UIActivate, ' +
                            'origin: \'' + localID + '_saver' + '\'}">' +
                '<xctrls:label>Save Property Sheet</xctrls:label>' +
                '</xctrls:button>');
    TP.nodeAppendChild(newElem, newSaveButtonElem, false);
    TP.nodeAppendChild(newElem, doc.createTextNode('\n'), false);

    //  ---

    //  Now, check to see if we have a schema file path defined. If not, execute
    //  the insertion function immediately. If so, save the schema file and then
    //  execute the insertion function
    if (TP.isEmpty(schemaFile)) {
        TP.bySystemId('Lama').insertElementIntoCanvas(
            newElem,
            targetElem,
            info.at('insertionPosition'),
            true,
            false);
    } else {

        schemaURI = TP.uc(schemaFile);
        schemaURI.set('shouldPatch', false);

        schemaURI.setContent(schemaText);

        if (!TP.isURI(schemaURI)) {
            TP.bySystemId('Lama').insertElementIntoCanvas(
                newElem,
                targetElem,
                info.at('insertionPosition'),
                true,
                false);
        } else {
            saveRequest = schemaURI.constructRequest(
                                        TP.hc('method', TP.HTTP_PUT));

            saveRequest.defineHandler(
                'RequestSucceeded',
                    function(aResponse) {

                        var newContentElem;

                        newContentElem =
                            TP.elem('<tibet:type' +
                                    ' name="' + localID + '"' +
                                    ' base="TP.core.JSONContent"' +
                                    ' schema="' + schemaFile + '"/>');

                        TP.nodeInsertBefore(
                            newElem, newContentElem, newLoadServiceElem, false);

                        TP.bySystemId('Lama').insertElementIntoCanvas(
                            newElem,
                            targetElem,
                            info.at('insertionPosition'),
                            true,
                            false);
                    });

            saveRequest.defineHandler(
                'RequestFailed',
                    function(aResponse) {
                        TP.bySystemId('Lama').insertElementIntoCanvas(
                            newElem,
                            targetElem,
                            info.at('insertionPosition'),
                            true,
                            false);
                    });

            schemaURI.save(saveRequest);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.couchDocumentURIInsertionAssistant.Inst.defineMethod('setData',
function(anObj) {

    /**
     * @method setData
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} anObj The object to set the receiver's internal data to.
     * @returns {TP.lama.couchDocumentURIInsertionAssistant} The receiver.
     */

    var data,

        definitionName,

        pojoSchema,

        schemaText,

        modelObj,
        newInsertionInfo,

        modelURI,

        insertionPosition,
        insertionPointElem,

        breadcrumbTPElem,
        breadcrumbData;

    this.$set('data', anObj);

    //  ---

    //  Grab the JSON data from the source URI.
    data = anObj.at('uri').getResource(
                TP.hc(
                    'resultType', TP.CONTENT,
                    'contentType', TP.core.Content
                )).get('result').get('data');

    definitionName = 'Couch_Doc_' + data._id;

    //  Build a JSON Schema from the POJO data and with the ID of the Couch
    //  document as the JSON Schema 'definition name'.
    pojoSchema = TP.json.JSONSchema.buildSchemaFrom(data, definitionName);

    if (TP.notValid(pojoSchema)) {
        return this;
    }

    //  Grab the text of the POJO schema object and format it out, using plain
    //  text encoding. This will become the value of the schema textarea.
    schemaText = TP.json(pojoSchema);
    schemaText = TP.lama.pp.runFormattedJSONModeOn(
                        schemaText,
                        TP.hc('outputFormat', TP.PLAIN_TEXT_ENCODED));

    //  ---

    //  Build the model object.
    modelObj = TP.hc();

    //  Register a hash to be placed at the top-level 'info' slot in the model.
    newInsertionInfo = TP.hc();
    modelObj.atPut('info', newInsertionInfo);

    //  The data for the chosen tag or entered tag names
    newInsertionInfo.atPut('schema', schemaText);
    // newInsertionInfo.atPut('schemaFile',
    //                        '~app_dat/' + definitionName + '.json');

    //  If we were handed an insertion position, then use it. Otherwise, default
    //  it to TP.BEFORE_END
    insertionPosition = anObj.at('insertionPosition');
    if (TP.isEmpty(insertionPosition)) {
        insertionPosition = TP.BEFORE_END;
    }
    newInsertionInfo.atPut('insertionPosition', insertionPosition);

    //  ---

    //  Set up a model URI and observe it for change ourself. This will allow us
    //  to regenerate the tag representation as the model changes.
    modelURI = TP.uc('urn:tibet:couchDocumentURIInsertionAssistant_source');

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

    //  ---

    insertionPointElem = anObj.at('insertionPoint');
    newInsertionInfo.atPut('insertionPoint', insertionPointElem);

    //  If we were handed an Element as an insertion point, then we generate the
    //  data that will show a path to it.
    if (TP.isElement(insertionPointElem)) {
        breadcrumbData = this.generatePathData(insertionPointElem);
    } else {
        breadcrumbData = TP.ac();
    }

    //  Set the value of the breadcrumb to that data.
    breadcrumbTPElem = TP.byId(
                        'couchDocumentURIInsertionAssistant_InsertionBreadcrumb',
                        this.getNativeNode());
    breadcrumbTPElem.setValue(breadcrumbData);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
