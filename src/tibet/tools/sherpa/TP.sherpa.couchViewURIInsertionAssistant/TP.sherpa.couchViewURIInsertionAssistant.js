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
 * @type {TP.sherpa.couchViewURIInsertionAssistant}
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('sherpa.couchViewURIInsertionAssistant');

//  Note how this property is TYPE_LOCAL, by design.
TP.sherpa.couchViewURIInsertionAssistant.defineAttribute(
    'themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.couchViewURIInsertionAssistant.Inst.defineAttribute('head',
    TP.cpc('> .head', TP.hc('shouldCollapse', true)));

TP.sherpa.couchViewURIInsertionAssistant.Inst.defineAttribute('body',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

TP.sherpa.couchViewURIInsertionAssistant.Inst.defineAttribute('foot',
    TP.cpc('> .foot', TP.hc('shouldCollapse', true)));

TP.sherpa.couchViewURIInsertionAssistant.Inst.defineAttribute('data');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.couchViewURIInsertionAssistant.Inst.defineHandler('DialogCancel',
function(anObject) {

    /**
     * @method handleDialogCancel
     * @summary Handles when the user has 'canceled' the dialog (i.e. wants to
     *     proceed without taking any action).
     * @param {TP.sig.DialogCancel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.couchViewURIInsertionAssistant} The receiver.
     */

    var modelURI;

    //  We observed the model URI when we were set up - we need to ignore it now
    //  on our way out.
    modelURI = TP.uc('urn:tibet:couchViewURIInsertionAssistant_source');
    this.ignore(modelURI, 'ValueChange');

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

TP.sherpa.couchViewURIInsertionAssistant.Inst.defineHandler('DialogOk',
function(anObject) {

    /**
     * @method handleDialogOk
     * @summary Handles when the user has 'ok-ed' the dialog (i.e. wants to
     *     proceed by taking the default action).
     * @param {TP.sig.DialogOk} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.couchViewURIInsertionAssistant} The receiver.
     */

    var modelURI,

        suppliedData,

        result,
        resultData,
        info,

        targetElem,

        newElem,

        localID,
        localLoc,

        remoteLoc,
        selectionLoc,

        generateDetailView,

        newLoadServiceElem,
        newTableElem,

        remoteURI,
        loadRequest;

    //  We observed the model URI when we were set up - we need to ignore it now
    //  on our way out.
    modelURI = TP.uc('urn:tibet:couchViewURIInsertionAssistant_source');
    this.ignore(modelURI, 'ValueChange');

    if (TP.notValid(suppliedData = this.get('data'))) {
        return this;
    }

    result = TP.uc('urn:tibet:couchViewURIInsertionAssistant_source').
                getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(resultData = result.get('data'))) {
        return this;
    }

    info = TP.hc(resultData).at('info');

    //  ---

    targetElem = suppliedData.at('insertionPoint');
    if (!TP.isElement(targetElem)) {
        //  No insertion point? Exit here.
        //  TODO: Raise an exception
        return this;
    }

    //  ---

    newElem = TP.xhtmlnode('<div/>');

    localID = suppliedData.at('insertionID');
    localLoc = info.at('localLocation');

    remoteLoc = info.at('remoteLocation');
    selectionLoc = localLoc + '_selection';

    generateDetailView = TP.bc(info.at('generateDetailView'));

    //  ---

    newLoadServiceElem =
        TP.elem('<tibet:service' +
                ' id="' + localID + '_loader"' +
                ' href="' + remoteLoc + '"' +
                ' result="' + localLoc + '"' +
                ' watched="true"' +
                ' on:TP.sig.AttachComplete="TP.sig.UIActivate"/>');
    TP.nodeAppendChild(newElem, newLoadServiceElem, false);

    if (generateDetailView) {
        newTableElem = TP.elem(
            '<xctrls:table' +
            ' bind:in="{data: ' + localLoc + '#jpath($.rows[0:].value)}"' +
            ' bind:io="{value: ' + selectionLoc + '}"/>');
    } else {
        newTableElem = TP.elem(
            '<xctrls:table' +
            ' bind:in="{data: ' + localLoc + '#jpath($.rows[0:].value)}"/>');
    }

    TP.nodeAppendChild(newElem, newTableElem, false);

    //  ---

    //  Create a function that will perform the insertion. We do this because,
    //  if we want to generate a detail view, we need to obtain the master data
    //  first.

    if (!generateDetailView) {
        TP.bySystemId('Sherpa').insertElementIntoCanvas(
            newElem,
            targetElem,
            info.at('insertionPosition'),
            true,
            false);
    } else {

        remoteURI = TP.uc(remoteLoc);

        loadRequest = remoteURI.constructRequest(TP.hc('method', TP.HTTP_GET));

        loadRequest.defineHandler(
            'RequestSucceeded',
                function(aResponse) {

                    var newDetailGroupStr,

                        columnCount,

                        newDetailGroupElem,

                        i;

                    newDetailGroupStr =
                        '<span bind:scope="' +
                        selectionLoc +
                        '" style="margin-left: 10px">';

                    columnCount =
                        aResponse.get('result').get('$.rows[0].value').getSize();

                    for (i = 0; i < columnCount; i++) {
                        newDetailGroupStr +=
                            '<input type="text" bind:io="value[' + i + ']"/>';
                    }

                    newDetailGroupStr += '</span>';

                    newDetailGroupElem = TP.xhtmlnode(newDetailGroupStr);
                    TP.nodeAppendChild(newElem, newDetailGroupElem, false);

                    TP.bySystemId('Sherpa').insertElementIntoCanvas(
                        newElem,
                        targetElem,
                        info.at('insertionPosition'),
                        true,
                        false);
                });

        loadRequest.defineHandler(
            'RequestFailed',
                function(aResponse) {
                    TP.bySystemId('Sherpa').insertElementIntoCanvas(
                        newElem,
                        targetElem,
                        info.at('insertionPosition'),
                        true,
                        false);
                });

        remoteURI.load(loadRequest);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.couchViewURIInsertionAssistant.Inst.defineMethod('generatePathData',
function(anElement) {

    /**
     * @method generatePathData
     * @summary Generates the data that will be used to display the path from
     *     the top-level of the Element's document down through the descendant
     *     chain to the supplied Element.
     * @param {Element} anElement The element to generate the path to.
     * @returns {TP.sherpa.couchViewURIInsertionAssistant} The receiver.
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

TP.sherpa.couchViewURIInsertionAssistant.Inst.defineMethod('setData',
function(anObj) {

    /**
     * @method setData
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} aDataObject The object to set the receiver's internal
     *     data to.
     * @returns {TP.sherpa.couchViewURIInsertionAssistant} The receiver.
     */

    var modelObj,
        newInsertionInfo,

        modelURI,

        insertionPosition,
        insertionPointElem,

        breadcrumbTPElem,
        breadcrumbData;

    //  ---

    this.$set('data', anObj);

    //  ---

    //  Build the model object.
    modelObj = TP.hc();

    //  Register a hash to be placed at the top-level 'info' slot in the model.
    newInsertionInfo = TP.hc();
    modelObj.atPut('info', newInsertionInfo);

    //  The data for the remote location, the result location and whether or
    //  not we should generate a detail view.
    newInsertionInfo.atPut('remoteLocation',
                            anObj.at('uri').getLocation());
    newInsertionInfo.atPut('localLocation',
                            'urn:tibet:' + anObj.at('insertionID'));
    newInsertionInfo.atPut('generateDetailView',
                            true);

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
    modelURI = TP.uc('urn:tibet:couchViewURIInsertionAssistant_source');

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
                        'couchViewURIInsertionAssistant_InsertionBreadcrumb',
                        this.getNativeNode());
    breadcrumbTPElem.setValue(breadcrumbData);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
