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
 * @type {TP.xctrls.richtext}
 */

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.defineSubtype('richtext');

//  Events:
//      xctrls-richtext-selected

//  A URI to the 'frame file' - the file that will be loaded into the
//  iframe that this type builds to hold the custom control.
TP.xctrls.FramedElement.set('frameFileURI',
        TP.uc('~lib_src/xctrls/xctrls_richtext/xctrls_richtext_stub.html'));

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.xctrls.richtext.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @method cmdGetContent
     * @summary Invoked by the TSH when the receiver is the data source for a
     *     command sequence which is piping data from the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var obj,
        output;

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        return aRequest.fail('No command instance.');
    }

    if (TP.notValid(output = obj.getValue())) {
        return aRequest.fail('No content.');
    } else {
        output = TP.join('<span xmlns="', TP.w3.Xmlns.XHTML, '">',
                            output,
                            '</span>');

        return aRequest.complete(output);
    }
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @method cmdSetContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        obj,
        content;

    if (TP.isEmpty(input = aRequest.stdin())) {
        return aRequest.fail('No content.');
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        return aRequest.fail('No command instance.');
    }

    //  stdin is always an Array, so we want the first item.
    content = input.at(0);

    obj.setContent(content, aRequest);

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineAttribute('$oldSelectionLength');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('configure',
function() {

    /**
     * @method configure
     * @returns {TP.xctrls.richtext} The receiver.
     * @abstract
     */

    var editorInst;

    editorInst = this.$getEditorInstance();

    editorInst.onNodeChange.add(
            function(ed, ctrlManager, elem, isCollapsed, otherObj) {

                this.selectionChangeHandler(ed, ctrlManager, elem,
                                            isCollapsed, otherObj);
            }.bind(this));

    //  Seems a bit funky, but it works... should we check to make sure the
    //  'save' plugin is loaded?
    editorInst.settings.save_onsavecallback =
            function(editor) {
                this.signal('TP.sig.ContentSave', this.getValue());
            }.bind(this);

    this.refresh();

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('focus',
function(moveAction) {

    /**
     * @method focus
     * @summary Focuses the receiver for keyboard input.
     * @param {Constant} moveAction The type of 'move' that the user requested.
     *     This can be one of the following:
     *          TP.FIRST
     *          TP.LAST
     *          TP.NEXT
     *          TP.PREVIOUS
     *          TP.FIRST_IN_GROUP
     *          TP.LAST_IN_GROUP
     *          TP.FIRST_IN_NEXT_GROUP
     *          TP.FIRST_IN_PREVIOUS_GROUP
     *          TP.FOLLOWING
     *          TP.PRECEDING.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return this.$getEditorInstance().getContent();
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('$getEditorInstance',
function() {

    /**
     * @method $getEditorInstance
     * @summary Returns the internal TinyMCE editor instance.
     * @returns {Object} The internal TinyMCE editor instance.
     */

    return this.get('tpIFrame').get('tinyMCE').activeEditor;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('refresh',
function(aSignal) {

    /**
     * @method refresh
     * @summary Updates the receiver to reflect the current value of any data
     *     binding it may have. If the signal argument's payload specified a
     *     'deep' refresh then descendant elements are also updated.
     * @param {TP.sig.DOMRefresh|TP.core.Hash} aSignalOrHash An optional signal
     *     which triggered this action or a hash.
     *     This signal or hash should include a key of 'deep' and a value
     *     of true to cause a deep refresh that updates all nodes.
     */

    /*
    var xml;

    xml = this.getBoundContent();

    this.setContent(TP.str(xml));
    */

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('focus',
function() {

    /**
     * @method focus
     * @summary Focuses the receiver for keyboard input.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('selectionChangeHandler',
function(editorID, ctrlManager, elem, isCollapsed, otherObj) {

    /**
     * @method selectionChangeHandler
     * @param {undefined} editorID
     * @param {undefined} ctrlManager
     * @param {undefined} elem
     * @param {undefined} isCollapsed
     * @param {undefined} otherObj
     * @returns {TP.xctrls.richtext} The receiver.
     * @abstract
     */

    var oldLength,
        newLength;

    oldLength = TP.ifInvalid(this.$get('$oldSelectionLength'), 0);
    newLength = this.getSelection().length;

    if (oldLength !== newLength) {
        this.$changed('selection', TP.CREATE);
    }

    //  Set the old selection length, but don't broadcast a 'change' signal
    //  for this.
    this.$set('$oldSelectionLength', newLength, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    this.$getEditorInstance().setContent(aValue);

    return this;
});

//  ------------------------------------------------------------------------
//  PubSub sharing
//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('handleXMPPPubsubEventInput',
function(aSignal) {

    /**
     * @method handleXMPPPubsubEventInput
     * @param {undefined} aSignal
     * @returns {TP.xctrls.richtext} The receiver.
     * @abstract
     */

    var firstItem,
        itemContent;

    //  The node payload is a TP.core.Hash that has a 'node' slot that
    //  contains an TP.xmpp.Message node. This message node contains an XMPP
    //  pubsub 'event' node which contains 1...n 'item' elements. Here we
    //  just go after the first one.
    firstItem = aSignal.getPayload().at('node').getNamedDescendant('item');
    itemContent = firstItem.firstChild;

    this.setContent(TP.str(itemContent));
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('publishContent',
function(publishName) {

    /**
     * @method publishContent
     * @param {undefined} publishName
     * @returns {undefined}
     * @abstract
     */

    var payload,

        requestParams,
        msgReq;

    if (TP.isEmpty(publishName)) {
        return;
    }

    payload = TP.elem(
                TP.join('<span xmlns="', TP.w3.Xmlns.XHTML, '">',
                        this.getValue(),
                        '</span>'));

    requestParams = TP.hc(
        'action', 'publish',
        'pubsubServiceJID', TP.xmpp.JID.construct('pubsub.localhost'),
        'nodeID', '/home/localhost/testrat/' + publishName,
        'payload', payload);

    msgReq = TP.sig.XMPPRequest.construct(requestParams);
    msgReq.defineMethod(
        'handleRequestSucceeded',
        function(aResponse) {
            TP.info(aResponse.getResponseText());
        });

    msgReq.defineMethod(
        'handleRequestFailed',
        function(aResponse) {
            TP.ifError() ?
                TP.error(aResponse.getResponseText()) : 0;
        });

    msgReq.fire();
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('shouldShare',
function(shareFlag, shareName) {

    /**
     * @method shouldShare
     * @param {undefined} shareFlag
     * @param {undefined} shareName
     * @returns {TP.xctrls.richtext} The receiver.
     * @abstract
     */

    var requestParams,
        msgReq;

    if (TP.isEmpty(shareName)) {
        return;
    }

    //  First, if the shareFlag is false, then we want to unsubscribe.
    if (TP.isFalse(shareFlag)) {
        requestParams = TP.hc(
            'id', 'unsubscribe1',
            'action', 'unsubscribe',
            'pubsubServiceJID', TP.xmpp.JID.construct('pubsub.localhost'),
            'nodeID', '/home/localhost/testrat/' + shareName);

        this.ignore(null, 'TP.sig.XMPPPubsubEventInput');
    } else {
        //  Otherwise, we want to subscribe.
        requestParams = TP.hc(
            'action', 'subscribe',
            'pubsubServiceJID', TP.xmpp.JID.construct('pubsub.localhost'),
            'nodeID', '/home/localhost/testrat/' + shareName);

        this.observe(null, 'TP.sig.XMPPPubsubEventInput');
    }

    msgReq = TP.sig.XMPPRequest.construct(requestParams);
    msgReq.defineMethod(
        'handleRequestSucceeded',
        function(aResponse) {
            TP.info(aResponse.getResponseText());
        });

    msgReq.defineMethod(
        'handleRequestFailed',
        function(aResponse) {
            TP.ifError() ?
                TP.error(aResponse.getResponseText()) : 0;
        });

    msgReq.fire();

    return this;
});

//  ------------------------------------------------------------------------
//  textUtilities methods
//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('clearValue',
function() {

    /**
     * @method clearValue
     * @summary Clears the entire value of the receiver.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    var oldVal;

    oldVal = this.$getEditorInstance().getContent();

    this.$getEditorInstance().setContent('');

    this.changed('value', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('clearSelection',
function() {

    /**
     * @method clearSelection
     * @returns {undefined}
     * @abstract
     */

    var oldVal;

    oldVal = this.getSelection();

    this.$getEditorInstance().selection.setContent('');

    this.changed('selection', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('collapseSelection',
function(toStart) {

    /**
     * @method collapseSelection
     * @summary Collapse the current selection to one end or the other.
     * @param {Boolean} toStart Whether or not to collapse the selection to the
     *     start of itself. This defaults to false (i.e. the selection will
     *     collapse to the end).
     * @returns {TP.xctrls.richtext} The receiver.
     */

    this.$getEditorInstance().selection.collapse(toStart);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('getSelection',
function() {

    /**
     * @method getSelection
     * @summary Returns the currently selected text.
     * @returns {String} The currently selected text.
     */

    return this.$getEditorInstance().selection.getContent();
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('getSelectionEnd',
function() {

    /**
     * @method getSelectionEnd
     * @summary Returns the ending index of the currently selected text.
     * @returns {Number} The ending index of the current selection.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('getSelectionStart',
function() {

    /**
     * @method getSelectionStart
     * @summary Returns the starting index of the currently selected text.
     * @returns {Number} The starting index of the current selection.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('insertAfterSelection',
function(aText) {

    /**
     * @method insertAfterSelection
     * @summary Inserts the supplied text after the current selection.
     * @param {String} aText The text to insert.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    TP.documentInsertAfterSelection(this.$getEditorInstance().getDoc(),
                                    aText);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('insertBeforeSelection',
function(aText) {

    /**
     * @method insertBeforeSelection
     * @summary Inserts the supplied text before the current selection.
     * @param {String} aText The text to insert before the current selection.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    TP.documentInsertBeforeSelection(this.$getEditorInstance().getDoc(),
                                        aText);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('replaceSelection',
function(aText) {

    /**
     * @method replaceSelection
     * @param {undefined} aText
     * @returns {undefined}
     * @abstract
     */

    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.$getEditorInstance().selection.setContent(aText);

    newVal = this.getSelection();

    this.changed('selection', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('selectFromTo',
function(aStartIndex, anEndIndex) {

    /**
     * @method selectFromTo
     * @summary Selects the contents of the receiver from the supplied starting
     *     index to the supplied ending index.
     * @param {Number} aStartIndex The starting index.
     * @param {Number} aEndIndex The ending index.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('setCursorToEnd',
function() {

    /**
     * @method setCursorToEnd
     * @summary Sets the cursor to the end position of the receiver.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('setCursorToStart',
function() {

    /**
     * @method setCursorToStart
     * @summary Sets the cursor to the start position of the receiver.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('setSelection',
function(aText) {

    /**
     * @method setSelection
     * @param {undefined} aText
     * @returns {undefined}
     * @abstract
     */

    //  This method is just an alias for replaceSelection()
    this.replaceSelection(aText);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('wrapSelection',
function(beforeText, afterText) {

    /**
     * @method wrapSelection
     * @summary Wraps the current selection with the beforeText and afterText.
     * @param {String} beforeText The text to insert before the selection.
     * @param {String} afterText The text to insert after the selection.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    this.replaceSelection(TP.join(beforeText,
                            this.getSelection(),
                            afterText));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
