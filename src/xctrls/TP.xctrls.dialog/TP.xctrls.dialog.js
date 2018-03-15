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
 * @type {TP.xctrls.dialog}
 * @summary Manages dialog XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls:dialog');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.dialog.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  Dialogs do not allow UIActivate/UIDeactivate signals to bubble outside of
//  themselves. This means that all keydown/keyup/mousedown/mouseup/click events
//  are not allowed to bubble down 'under' the dialog.
TP.xctrls.dialog.Type.defineAttribute('opaqueBubblingSignalNames',
        TP.ac('TP.sig.UIActivate', 'TP.sig.UIDeactivate'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.dialog.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.defineDependencies('TP.extern.Promise');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineAttribute('body',
    TP.cpc('> *[tibet|pelem="body"]', TP.hc('shouldCollapse', true)));

TP.xctrls.dialog.Inst.defineAttribute('header',
    TP.cpc('> *[tibet|pelem="header"]', TP.hc('shouldCollapse', true)));

TP.xctrls.dialog.Inst.defineAttribute('bodyGroup',
    TP.cpc('> *[tibet|pelem="body"] > tibet|group',
        TP.hc('shouldCollapse', true)));

TP.xctrls.dialog.Inst.defineAttribute('curtain',
    TP.xpc('//*[@id="systemCurtain"]',
        TP.hc('shouldCollapse', true)
    ).set('fallbackWith', function(tpTarget) {
        return TP.xctrls.curtain.getSystemCurtainFor(
            tpTarget.getDocument(),
            tpTarget.getAttribute('curtainID'));
    }));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineHandler('DialogDismiss',
function(aSignal) {

    /**
     * @method handleDialogDismiss
     * @summary Handles notifications of when the receiver is to be dismissed
     * (i.e. hidden).
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.dialog} The receiver.
     */

    this.setAttribute('hidden', true);

    //  Make sure to clear the content. This will cause any mutation detach
    //  teardown machinery to be invoked.
    this.setContent('');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary The setter for the receiver's hidden state.
     * @param {Boolean} beHidden Whether or not the receiver is in a hidden
     *     state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var curtainTPElem,
        thisref;

    if (this.getAttribute('modal') === 'true') {
        if (TP.isValid(curtainTPElem = this.get('curtain'))) {
            curtainTPElem.setAttribute('hidden', beHidden);
        }
    }

    //  If we're about to show, we need to tell the system that we're switching
    //  focus contexts in an async fashion. Otherwise, it can't properly track
    //  previously focused elements.
    if (!beHidden) {
        this.asyncActivatingFocusContext();
    }

    thisref = this;
    setTimeout(function() {

        var focusedTPElem;

        if (beHidden) {
            //  Blur any focused element that is enclosed within us.
            thisref.blurFocusedDescendantElement();
        } else {
            //  Focus any autofocused element or the first focusable element
            //  under us.
            thisref.focusAutofocusedOrFirstFocusableDescendant();

            focusedTPElem = thisref.getDocument().getFocusedElement();
            if (TP.canInvoke(focusedTPElem, 'select')) {
                focusedTPElem.select();
            }
        }
    }, 75);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the value supplied.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {TP.dom.Node} The result of setting the content of the
     *     receiver.
     */

    return this.get('bodyGroup').setContent(aContentObject, aRequest);
});

//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineMethod('setTitle',
function(aTitle) {

    /**
     * @method setTitle
     * @summary Sets the title of the receiver.
     * @param {String} aTitle The text content to set the title to.
     * @returns {TP.sherpa.dialog} The receiver.
     */

    this.get('header').setTextContent(aTitle);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.ResponderSignal.defineSubtype('DialogDismiss');

//  Subtypes of TP.sig.DialogDismiss that get thrown by standardized controls
TP.sig.DialogDismiss.defineSubtype('DialogOk');
TP.sig.DialogDismiss.defineSubtype('DialogCancel');

//  ------------------------------------------------------------------------

TP.definePrimitive('dialog',
function(info) {

    /**
     * @method dialog
     * @summary Displays a dialog to the user given the information in the
     *     supplied hash.
     * @param {TP.core.Hash} info The information used when displaying the
     *     dialog. Valid keys for this hash include:
     *          {String} [dialogID=systemDialog] The id to use for the overall
     *          dialog in the system.
     *          {Boolean} [isModal=true] Whether or not this dialog is modal
     *          (i.e. will have an event-trapping curtain behind it).
     *          {String} templateContent The actual markup content to put into
     *          the dialog.
     *          {TP.uri.URI} [templateURI] If the templateContent parameter is
     *          not supplied, this parameter will be checked for a URI that can
     *          be used to supply the markup content.
     *          {Object} [templateData] If either the templateContent or the
     *          templateURI point to content that has ACP expressions in it,
     *          this parameter will provide the dynamic data for that template.
     *          {TP.core.Hash} setContentParams The parameters to pass along to
     *          the 'setContent()' call when the dialog sets its content. See
     *          that method for more information.
     *          {Function} [beforeShow] A function to execute before showing the
     *          dialog.
     * @returns {Promise} A Promise to be used as necessary. Since this is an
     *     alert(), this Promise's resolver Function will be called with no
     *     return value.
     */

    var promise;

    if (TP.notValid(info)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (TP.notValid(info.at('templateContent')) &&
        TP.notValid(info.at('templateURI'))) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    promise = TP.extern.Promise.construct(
        function(resolver, rejector) {

            var win,

                dialogID,
                isModal,
                template,

                dialogTPElem,

                title,

                dialogElem,
                docBody,

                templateData,

                contentResource,

                beforeShowCallback;

            //  If we're running in the Sherpa, then use the UIROOT window.
            //  Otherwise, use the current UI canvas.
            if (TP.sys.hasFeature('sherpa')) {
                win = TP.win('UIROOT');
            } else {
                win = TP.sys.uiwin(true);
            }

            //  Default the dialog ID and whether we're displaying in a modal
            //  fashion
            dialogID = info.atIfInvalid('dialogID', 'systemDialog');
            isModal = info.atIfInvalid('isModal', true);

            template = info.at('templateContent');
            if (TP.notValid(template)) {
                template = info.at('templateURI');

                if (TP.notValid(template)) {
                    return TP.raise(TP, 'InvalidTemplate');
                }
            }

            //  Grab the dialog and create one if one isn't present.
            dialogTPElem = TP.byId(dialogID, win);
            if (TP.notValid(dialogTPElem)) {

                //  Create a new 'xctrls:dialog' Element and set it's modal
                //  attribute if appropriate.
                dialogElem = TP.elem(
                                '<xctrls:dialog id="' + dialogID + '"' +
                                ' curtainID="systemCurtain"/>');
                if (isModal) {
                    TP.elementSetAttribute(dialogElem, 'modal', 'true', true);
                }

                //  Grab the TP.html.body of the window's document and insert
                //  the content before it's end tag.
                docBody = TP.wrap(win).getDocument().getBody();

                //  Note the assignment here to capture the TP version of the
                //  element that got inserted.
                dialogTPElem = docBody.insertContent(dialogElem, TP.BEFORE_END);
            }

            //  If a title was defined, then set the dialog's title to it.
            //  Otherwise, clear the dialog's title (in case it's shared and it
            //  had a title from it's previous user).
            title = info.at('title');
            if (TP.notEmpty(title)) {
                dialogTPElem.setTitle(title);
            } else {
                dialogTPElem.setTitle('');
            }

            //  Grab any template data and transform the supplied template with
            //  it.
            templateData = info.at('templateData');
            contentResource = template.transform(templateData);

            if (TP.isURI(template)) {
                //  Set that contentResource's result as the content of our
                //  dialog
                dialogTPElem.setContent(contentResource.get('result'),
                                        info.at('setContentParams'));
            } else {
                dialogTPElem.setContent(contentResource,
                                        info.at('setContentParams'));
            }

            //  If a callback Function that should be executed before we show
            //  the dialog was supplied, invoke it with the dialog
            //  TP.dom.ElementNode as the only parameter.
            beforeShowCallback = info.at('beforeShow');
            if (TP.isCallable(beforeShowCallback)) {
                beforeShowCallback(dialogTPElem);
            }

            //  Show the dialog
            dialogTPElem.setAttribute('hidden', false);

            //  Call the Promise's resolver with the created TP.xctrls.dialog
            //  object.
            resolver(dialogTPElem);
        });

    return promise;
});

//  ------------------------------------------------------------------------
//  STDIO - A REDEFINITION OF SYSTEM-LEVEL PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('alert',
function(aMessage, info) {

    /**
     * @method alert
     * @summary Displays a message to the user. Advanced versions of this
     *     function make use of DHTML controls and a "curtain" to display the
     *     message in a modal fashion.
     *     The initial version is a simple wrapper around the native JS alert()
     *     function.
     * @param {String} aMessage The message for the user.
     * @param {TP.core.Hash} [info] An optional hash containing additional
     *     information to control the dialog that gets displayed. Keys on this
     *     hash could include:
     *          templateURI:    A URI to use for the dialog template instead of
     *                          the standard template.
     *          dialogID:       The ID to use for the dialog. This defaults to
     *                          'systemDialog'.
     * @example Notify the user of some event:
     *     <code>
     *          TP.alert('TIBET Rocks!');
     *     </code>
     * @returns {Promise} A Promise to be used as necessary. Since this is an
     *     alert(), this Promise's resolver Function will be called with no
     *     return value.
     */

    var templateURI,
        dialogID,

        promise;

    //  Grab the template URI and dialog ID for the 'alert' panel (and
    //  defaulting if they are not supplied in the separate hash).
    if (TP.isValid(info)) {
        templateURI = info.atIfInvalid(
                        'templateURI',
                        TP.uc('~TP.xctrls.dialog/system_alert.xhtml'));
        dialogID = info.atIfInvalid('dialogID', 'systemDialog');
    } else {
        templateURI = TP.uc('~TP.xctrls.dialog/system_alert.xhtml');
        dialogID = 'systemDialog';
    }

    //  Call the TP.dialog() method with that data and specifying that the panel
    //  is to be modal and what the message it.
    promise = TP.dialog(
                    TP.hc('templateURI', templateURI,
                            'dialogID', dialogID,
                            'isModal', true,
                            'templateData', TP.hc('message', aMessage)));

    //  After displaying, focus the button and return the chained Promise.
    return promise.then(
        function(dialogTPElem) {

            var button,
                answerPromise;

            button = TP.byCSSPath('.dialogControls button[action="ok"]',
                                    dialogTPElem,
                                    true);

            button.focus();

            answerPromise = TP.extern.Promise.construct(
                function(resolver, rejector) {
                    dialogTPElem.defineHandler('DialogOk',
                    function(aSignal) {

                        //  Hide the panel and call the resolver with null,
                        //  since this is an alert and it doesn't matter whether
                        //  they activated a control that fired 'DialogOk' or
                        //  not.
                        this.setAttribute('hidden', true);
                        resolver();
                    });
                    dialogTPElem.defineHandler('DialogCancel',
                    function(aSignal) {

                        //  Hide the panel and call the resolver with null,
                        //  since this is an alert and it doesn't matter whether
                        //  they activated a control that fired 'DialogCancel'
                        //  or not.
                        this.setAttribute('hidden', true);
                        resolver();
                    });
                });

            return answerPromise;
        });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('confirm',
function(anAction, info) {

    /**
     * @method confirm
     * @summary Displays a prompt to the user asking for confirmation of an
     *     action. Advanced versions of this function make use of DHTML controls
     *     and a "curtain" to display the prompt in a modal fashion.
     *     The initial version is a simple wrapper around the native JS
     *     confirm() function.
     * @param {String} anAction The action for the user to confirm.
     * @param {TP.core.Hash} [info] An optional hash containing additional
     *     information to control the dialog that gets displayed. Keys on this
     *     hash could include:
     *          templateURI:    A URI to use for the dialog template instead of
     *                          the standard template.
     *          dialogID:       The ID to use for the dialog. This defaults to
     *                          'systemDialog'.
     * @example Obtain an answer from the user:
     *     <code>
     *          TP.confirm('Perform Action?');
     *     </code>
     * @returns {Promise} A Promise to be used as necessary. Since this is a
     *     confirm(), this Promise's resolver Function will be called with true
     *     if the user confirmed the requested action and false if they did not.
     */

    var templateURI,
        dialogID,

        promise;

    //  Grab the template URI and dialog ID for the 'confirm' panel (and
    //  defaulting if they are not supplied in the separate hash).
    if (TP.isValid(info)) {
        templateURI = info.atIfInvalid(
                        'templateURI',
                        TP.uc('~TP.xctrls.dialog/system_confirm.xhtml'));
        dialogID = info.atIfInvalid('dialogID', 'systemDialog');
    } else {
        templateURI = TP.uc('~TP.xctrls.dialog/system_confirm.xhtml');
        dialogID = 'systemDialog';
    }

    //  Call the TP.dialog() method with that data and specifying that the panel
    //  is to be modal and what the message it.
    promise = TP.dialog(
                    TP.hc('templateURI', templateURI,
                            'dialogID', dialogID,
                            'isModal', true,
                            'templateData', TP.hc('message', anAction)));

    //  After displaying, focus the button and build another promise that will
    //  install DialogOk and DialogCancel handlers as local handlers directly on
    //  the dialog object. Return that nested Promise.
    return promise.then(
        function(dialogTPElem) {

            var button,

                answerPromise;

            button = TP.byCSSPath('.dialogControls button[action="ok"]',
                                    dialogTPElem,
                                    true);

            button.focus();

            answerPromise = TP.extern.Promise.construct(
                function(resolver, rejector) {
                    dialogTPElem.defineHandler('DialogOk',
                    function(aSignal) {

                        //  Hide the panel and call the resolver with true,
                        //  since they activated a control that fired 'DialogOk'
                        this.setAttribute('hidden', true);
                        resolver(true);
                    });
                    dialogTPElem.defineHandler('DialogCancel',
                    function(aSignal) {

                        //  Hide the panel and call the resolver with false,
                        //  since they activated a control that fired
                        //  'DialogCancel'
                        this.setAttribute('hidden', true);
                        resolver(false);
                    });
                });

            return answerPromise;
        });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('prompt',
function(aQuestion, aDefaultAnswer, info) {

    /**
     * @method prompt
     * @summary Displays a prompt to the user asking for data. Advanced
     *     versions of this function make use of DHTML controls and a "curtain"
     *     to display the prompt in a modal fashion.
     *     The initial version is a simple wrapper around the native JS prompt()
     *     function.
     * @param {String} aQuestion The question for the user.
     * @param {String} aDefaultAnswer The default answer, provided in the input
     *     field.
     * @param {TP.core.Hash} [info] An optional hash containing additional
     *     information to control the dialog that gets displayed. Keys on this
     *     hash could include:
     *          templateURI:    A URI to use for the dialog template instead of
     *                          the standard template.
     *          dialogID:       The ID to use for the dialog. This defaults to
     *                          'systemDialog'.
     *          secure:         Whether or not the field should be secure (i.e.
     *                          the content should not be visible to the user).
     * @example Obtain an answer from the user:
     *     <code>
     *          TP.prompt('Favorite color', 'Black');
     *     </code>
     * @returns {Promise} A Promise to be used as necessary. Since this is a
     *     prompt(), this Promise's resolver Function will be called with the
     *     value returned by the user.
     */

    var templateURI,
        dialogID,

        isSecure,

        promise;

    //  Grab the template URI and dialog ID for the 'prompt' panel (and
    //  defaulting if they are not supplied in the separate hash).
    if (TP.isValid(info)) {
        templateURI = info.atIfInvalid(
                        'templateURI',
                        TP.uc('~TP.xctrls.dialog/system_prompt.xhtml'));
        dialogID = info.atIfInvalid('dialogID', 'systemDialog');
        isSecure = info.atIfInvalid('secure', false);
    } else {
        templateURI = TP.uc('~TP.xctrls.dialog/system_prompt.xhtml');
        dialogID = 'systemDialog';
        isSecure = false;
    }

    //  Call the TP.dialog() method with that data and specifying that the panel
    //  is to be modal and what the message it.
    promise = TP.dialog(
                    TP.hc('templateURI', templateURI,
                            'dialogID', dialogID,
                            'isModal', true,
                            'templateData', TP.hc('message', aQuestion)));

    //  After displaying, if a default answer was provided, set the value of the
    //  input field and select the text in the field. If not, just focus the
    //  input field. Then build another promise that will install DialogOk and
    //  DialogCancel handlers as local handlers directly on the dialog object.
    //  Return that nested Promise.
    return promise.then(
        function(dialogTPElem) {

            var inputField,

                answerPromise;

            inputField = TP.byCSSPath('.dialogContent input[type="text"]',
                                        dialogTPElem,
                                        true);

            if (isSecure) {
                inputField.setAttribute('type', 'password');
            }

            if (TP.notEmpty(aDefaultAnswer)) {
                inputField.set('value', aDefaultAnswer);
            }

            answerPromise = TP.extern.Promise.construct(
                function(resolver, rejector) {
                    dialogTPElem.defineHandler('DialogOk',
                    function(aSignal) {

                        //  Hide the panel and call the resolver with true,
                        //  since they activated a control that fired 'DialogOk'
                        this.setAttribute('hidden', true);
                        resolver(inputField.get('value'));
                    });
                    dialogTPElem.defineHandler('DialogCancel',
                    function(aSignal) {

                        //  Hide the panel and call the resolver with false,
                        //  since they activated a control that fired
                        //  'DialogCancel'
                        this.setAttribute('hidden', true);
                        resolver(null);
                    });
                });

            return answerPromise;
        });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

