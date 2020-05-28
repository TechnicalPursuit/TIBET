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
//  are not allowed to bubble down 'under' the dialog. Additionally, we don't
//  allow UIEnabled/UIDisabled to bubble past us either.
TP.xctrls.dialog.Type.defineAttribute('opaqueBubblingSignalNames',
        TP.ac(
            'TP.sig.UIActivate',
            'TP.sig.UIDeactivate',

            'TP.sig.UIDisabled',
            'TP.sig.UIEnabled'
            ));

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

    //  Set up an observation for TP.sig.OpenDialog
    this.observe(TP.ANY, TP.sig.OpenDialog);

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.dialog.Type.defineHandler('OpenDialog',
function(aSignal) {

    /**
     * @method handleOpenDialog
     * @param {TP.sig.OpenDialog} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.meta.xctrls.dialog} The receiver.
     */

    TP.dialog(aSignal.getPayload());

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineAttribute('body',
    TP.cpc('> *[tibet|pelem="body"]', TP.hc('shouldCollapse', true)));

TP.xctrls.dialog.Inst.defineAttribute('header',
    TP.cpc('> *[tibet|pelem="header"]', TP.hc('shouldCollapse', true)));

TP.xctrls.dialog.Inst.defineAttribute('dialogcontent',
    TP.cpc('> *[tibet|pelem="body"] > tibet|group > xctrls|content',
        TP.hc('shouldCollapse', true)));

TP.xctrls.dialog.Inst.defineAttribute('curtainWasShowing');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineMethod('getCurtain',
function() {

    /**
     * @method getCurtain
     * @summary Returns the curtain associated with this dialog.
     * @description If the receiver has a 'curtainID' attribute, then TIBET will
     *     try to find a curtain element with that ID. If none can be found,
     *     then this method will return the shared system curtain.
     * @returns {TP.xctrls.curtain} The curtain associated with the receiver.
     */

    var tpDoc,

        curtainID,
        curtainTPElem;

    tpDoc = this.getDocument();

    curtainID = this.getAttribute('curtainID');
    if (TP.notEmpty(curtainID)) {
        curtainTPElem = tpDoc.get('//*[@id="' + curtainID + '"]');
        if (TP.isKindOf(curtainTPElem, TP.dom.ElementNode)) {
            return curtainTPElem;
        }
    }

    return TP.xctrls.curtain.getSystemCurtainFor(tpDoc);
});

//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineHandler('DialogDismiss',
function(aSignal) {

    /**
     * @method handleDialogDismiss
     * @summary Handles notifications of when the receiver is to be dismissed
     * (i.e. hidden).
     * @param {TP.sig.DialogDismiss} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.dialog} The receiver.
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

    var focusedTPElem;

    //  If we're about to show, we need to tell the system that we're switching
    //  focus contexts in an async fashion. Otherwise, it can't properly track
    //  previously focused elements.
    if (!beHidden) {
        this.asyncActivatingFocusContext();
    }

    //  If we're hiding, toggle the curtain to be hidden as well. Note that
    //  toggling the curtain to show is done in the 'dialog' primitive defined
    //  below.
    if (beHidden) {
        this.toggleCurtain(beHidden);
    }

    if (beHidden) {
        //  Blur any focused element that is enclosed within us.
        this.blurFocusedDescendantElement();

        this.ignoreKeybindingsDirectly();

    } else {

        this.observeKeybindingsDirectly();

        //  Set up a function that will run after the next repaint, allowing
        //  the curtain to show (if this dialog box is modal), then fetching
        //  and displaying the dialog. Then we're ready to refresh any bindings
        //  and focus the first (or autofocused) control.
        (function() {

            //  Refresh just after showing.
            this.refresh();

            //  Focus any autofocused element or the first focusable element
            //  under us.
            this.focusAutofocusedOrFirstFocusableDescendant();

            focusedTPElem = this.getDocument().getFocusedElement();
            if (TP.canInvoke(focusedTPElem, 'select')) {
                focusedTPElem.select();
            }
        }.bind(this)).queueAfterNextRepaint(this.getNativeWindow());
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineMethod('refresh',
function(shouldRender, shouldRefreshBindings) {

    /**
     * @method refresh
     * @summary Updates the receiver's content by refreshing all bound aspects
     *     in the receiver and all of the descendants of the receiver that are
     *     bound.
     * @param {Boolean} [shouldRender] Whether or not to force (or not force)
     *     re-rendering if the data source changes. If not supplied, this
     *     parameter will default to true if the bound data changed and false if
     *     it didn't.
     * @param {Boolean} [shouldRefreshBindings] Whether or not to refresh data
     *     bindings from the receiver down (in a 'sparse' fashion). If not
     *     supplied, this parameter will default to true.
     * @returns {Boolean} Whether or not the bound value was different than the
     *     receiver already had and, therefore, truly changed.
     */

    var contentTPElem;

    //  Grab the content element under the existing panel that we
    //  found with that content key.
    contentTPElem = this.get('dialogcontent');

    return contentTPElem.refresh(shouldRender, shouldRefreshBindings);
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

    var contentTPElem;

    contentTPElem = this.get('dialogcontent');

    return contentTPElem.setContent(aContentObject);
});

//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineMethod('setTitle',
function(aTitle) {

    /**
     * @method setTitle
     * @summary Sets the title of the receiver.
     * @param {String} aTitle The text content to set the title to.
     * @returns {TP.xctrls.dialog} The receiver.
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

            var dialogID,
                isModal,
                template,

                win,

                dialogTPElem,

                title,

                dialogElem,
                docBody,

                templateData,

                contentResource,

                beforeShowCallback,

                isShowing;

            //  Default the dialog ID and whether we're displaying in a modal
            //  fashion
            dialogID = info.atIfInvalid('dialogID', 'systemDialog');
            dialogID = dialogID.unquoted();

            isModal = info.atIfInvalid('isModal', true);

            template = info.at('templateContent');
            if (TP.isString(template)) {
                template = template.unquoted();
                if (TP.isURIString(template)) {
                    template = TP.uc(template);
                }
            } else if (TP.notValid(template)) {
                template = info.at('templateURI');

                if (!TP.isURI(template)) {
                    return TP.raise(TP, 'InvalidTemplate');
                }
            }

            win = TP.sys.uiwin(true);

            //  Grab the dialog and create one if one isn't present.
            dialogTPElem = TP.byId(dialogID, win);

            //  If we couldn't find the dialog element and we're running the
            //  Sherpa, then we can try to find it in the UIROOT window.
            if (TP.notValid(dialogTPElem) && TP.sys.hasFeature('sherpa')) {
                win = TP.sys.getUIRoot();
                dialogTPElem = TP.byId(dialogID, win);
            }

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

            if (!TP.isString(template) && TP.isURI(template)) {
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

            //  If the panel is modal, then we need to manage the curtain
            //  appropriately.
            if (dialogTPElem.getAttribute('modal') === 'true') {
                isShowing = dialogTPElem.getAttribute('hidden') === false;
                dialogTPElem.toggleCurtain(isShowing);
            }

            //  Show the dialog
            dialogTPElem.setAttribute('hidden', false);

            //  Call the Promise's resolver with the created
            //  TP.xctrls.dialog object.
            resolver(dialogTPElem);
        });

    return promise;
});

//  ------------------------------------------------------------------------

TP.xctrls.dialog.Inst.defineMethod('toggleCurtain',
function(beHidden) {

    /**
     * @method toggleCurtain
     * @summary Toggles the curtain that the dialog will be using to block
     *     events from the rest of the app.
     * @param {Boolean} beHidden Whether or not the curtain should be in  a
     *     hidden state.
     * @returns {TP.xctrls.dialog} The receiver.
     */

    var curtainTPElem;

    //  If we have a valid curtain element
    if (TP.isValid(curtainTPElem = this.get('curtain'))) {

        //  If we're showing the curtain, then we capture whether or not the
        //  curtain was already showing. This may be if we're displaying a
        //  'nested' set of dialogs.
        if (!beHidden) {
            if (curtainTPElem.getAttribute('hidden') === false) {
                this.set('curtainWasShowing', true, false);
            }

            //  Go ahead and show the curtain.
            curtainTPElem.setAttribute('hidden', false);
        } else {

            //  If the curtain *wasn't* already showing when we first
            //  appeared, then we go ahead and hide it.
            if (!this.get('curtainWasShowing')) {
                curtainTPElem.setAttribute('hidden', true);
            }
        }
    }

    return this;
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

            button = TP.byCSSPath(' .dialogControls button[action="ok"]',
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

            button = TP.byCSSPath(' .dialogControls button[action="ok"]',
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

            inputField = TP.byCSSPath(' .dialogContent input[type="text"]',
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

TP.definePrimitive('promptWithChoices',
function(aQuestion, choices, aDefaultAnswer, info) {

    /**
     * @method promptWithChoices
     * @summary Displays a prompt to the user asking for data from a constrained
     *     set of choices.
     * @param {String} aQuestion The question for the user.
     * @param {String[]} choices The constrained set of choices to present to
     *     the user.
     * @param {String} [aDefaultAnswer] The default answer, provided in the
     *     input field.
     * @param {TP.core.Hash} [info] An optional hash containing additional
     *     information to control the dialog that gets displayed. Keys on this
     *     hash could include:
     *          templateURI:        A URI to use for the dialog template instead
     *                              of the standard template.
     *          dialogID:           The ID to use for the dialog. This defaults
     *                              to 'systemDialog'.
     *          multiple:           Whether or not the set of choices should be
     *                              presented such that the user can choose
     *                              multiple values.
     *          open:               Whether or not the set of choices should be
     *                              augmented with a text field such that the
     *                              user can alternatively supply an open-ended
     *                              value as an answer. Note that this value
     *                              will be given preference over what the user
     *                              selects from the set of choices.
     *          selectThreshold:    A Number that will determine whether or not
     *                              the set of choices should be presented as a
     *                              an HTML select element or set of a checkbox
     *                              or radio elements. If the number of choices
     *                              is greater than or equal to this number,
     *                              then an HTML select will be used (and set to
     *                              'multiple' if caller specified multiple
     *                              values).
     *          ctrlType:           The type of control, either 'radio',
     *                              'checkbox' or 'select'. This method will
     *                              normally compute this based on the other
     *                              settings above, but the type can be forced
     *                              by supplying a value for this key.
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

        isMultiple,
        isOpen,
        selectThreshold,
        ctrlType,

        str,
        choicesNode,

        promise;

    //  Grab the template URI and dialog ID for the 'prompt' panel (and
    //  defaulting if they are not supplied in the separate hash).
    if (TP.isValid(info)) {
        templateURI = info.atIfInvalid(
                'templateURI',
                TP.uc('~TP.xctrls.dialog/system_prompt_with_choices.xhtml'));
        dialogID = info.atIfInvalid('dialogID', 'systemDialog');

        isMultiple = info.atIfInvalid('multiple', false);
        isOpen = info.atIfInvalid('open', false);
        selectThreshold = info.atIfInvalid('selectThreshold', 5);
        ctrlType = info.at('ctrlType');
        if (TP.notValid(ctrlType)) {
            if (isMultiple) {
                ctrlType = choices.getSize() < selectThreshold ? 'checkbox' :
                                                                    'select';
            } else {
                ctrlType = choices.getSize() < selectThreshold ? 'radio' :
                                                                    'select';
            }
        }
    } else {
        templateURI =
            TP.uc('~TP.xctrls.dialog/system_prompt_with_choices.xhtml');
        dialogID = 'systemDialog';
        isMultiple = false;
        isOpen = false;
        selectThreshold = 5;
        ctrlType = choices.getSize() < selectThreshold ? 'radio' : 'select';
    }

    str = '';

    switch (ctrlType) {
        case 'checkbox':
        case 'radio':

            //  Build up a set of HTML checkboxes or radio buttons.
            choices.forEach(
                function(aChoice, index) {
                    str += '<input id="field_' + index + '"' +
                            ' name="inputChooser"' +
                            ' type="' + ctrlType + '"' +
                            ' value="' + aChoice + '"/>' +
                            '<label for="field_' + index + '">' +
                                aChoice +
                            '</label>' +
                            '<br/>';
                });

            //  If the user specified that this is an 'open' set of choices,
            //  then we have to provide an 'open' field.
            if (isOpen) {
                str += '<input id="field_' + choices.getSize() + '"' +
                        ' name="inputChooser"' +
                        ' type="' + ctrlType + '"' +
                        ' value="open"/>';
                str += '<input type="text" id="openField"/>';
                str += '<br/>';
            }

            break;

        case 'select':

            //  Build up an HTML select
            str += '<select id="field_0"';
            if (isMultiple) {
                str += ' multiple="multiple"';
            }
            str += '>';

            if (!isMultiple) {
                str += '<option value="open">Choose...</option>';
            }

            choices.forEach(
                function(aChoice, index) {
                    str += '<option value="' + aChoice + '">' +
                            aChoice +
                            '</option>';
                });
            str += '</select>';

            //  If the user specified that this is an 'open' set of choices,
            //  then we have to provide an 'open' field.
            if (isOpen) {
                str += '<br/>';
                str += '<input type="text" id="openField"/>';
            }

            break;
        default:
            break;
    }

    //  Make a node out of the built HTML - we'll inject this into the
    //  'choiceContent' div below.
    choicesNode = TP.xhtmlnode(str);

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

            var choiceContent,

                inputField,
                openField,

                val,

                answerPromise;

            //  Grab the choiceContent and inject the node that we built above.
            choiceContent = TP.byCSSPath(' .choiceContent', dialogTPElem, true);
            choiceContent.setContent(choicesNode);

            //  Grab the input field (which won't be a text field here - this is
            //  either the select or the group of checkboxes or radio buttons).
            inputField = TP.byCSSPath(' .dialogContent #field_0',
                                        dialogTPElem,
                                        true);

            if (isOpen) {
                //  Grab the override text field.
                openField = TP.byCSSPath(' .dialogContent #openField',
                                            dialogTPElem,
                                            true);

                openField.getNativeNode().onclick = function() {
                    var inputVal;

                    if (isMultiple) {
                        inputVal = inputField.getValue();
                        inputVal.push('open');
                        inputField.set('value', inputVal);
                    } else {
                        inputField.set('value', 'open');
                    }
                };
            }

            //  If the default answer is specified, then set the input field to
            //  it.
            if (TP.notEmpty(aDefaultAnswer)) {
                inputField.set('value', aDefaultAnswer);

                switch (ctrlType) {
                    case 'checkbox':
                        if (TP.isArray(aDefaultAnswer)) {
                            val = inputField.getValue();
                            if (!val.containsAll(aDefaultAnswer)) {
                                openField.set('value',
                                    aDefaultAnswer.difference(val).first());
                                val.push('open');
                                inputField.set('value', val);
                            }
                        } else {
                            if (TP.isEmpty(inputField.get('value')) && isOpen) {
                                inputField.set('value', 'open');
                                openField.set('value', aDefaultAnswer);
                            }
                        }
                        break;

                    case 'radio':
                        //  If the input field doesn't have value after we've
                        //  set it, that means that the default answer wasn't
                        //  represented by one of the choices in the input
                        //  field. In that case, if we are open, we set the
                        //  openField to that value.
                        if (TP.isEmpty(inputField.get('value')) && isOpen) {
                            inputField.set('value', 'open');
                            openField.set('value', aDefaultAnswer);
                        }
                        break;

                    case 'select':
                        if (TP.isArray(aDefaultAnswer)) {
                            val = inputField.getValue();
                            if (!val.containsAll(aDefaultAnswer)) {
                                openField.set('value',
                                    aDefaultAnswer.difference(val).first());
                            }
                        } else {
                            if (TP.isEmpty(inputField.get('value')) && isOpen) {
                                openField.set('value', aDefaultAnswer);
                            }
                        }
                        break;
                    default:
                        break;
                }
            }

            answerPromise = TP.extern.Promise.construct(
                function(resolver, rejector) {
                    dialogTPElem.defineHandler('DialogOk',
                    function(aSignal) {

                        var value,

                            openValue;

                        //  Hide the panel and call the resolver with true,
                        //  since they activated a control that fired 'DialogOk'
                        this.setAttribute('hidden', true);

                        value = inputField.get('value');

                        switch (ctrlType) {
                            case 'checkbox':
                                if (value.contains('open')) {
                                    if (TP.isValid(openField)) {
                                        value.push(openField.get('value'));
                                    }
                                }
                                break;
                            case 'radio':
                                if (value === 'open') {
                                    if (TP.isValid(openField)) {
                                        value = openField.get('value');
                                    }
                                }
                                break;
                            case 'select':
                                if (TP.isValid(openField)) {
                                    openValue = openField.get('value');
                                    if (TP.notEmpty(openValue)) {
                                        if (isMultiple) {
                                            value.push(openValue);
                                        } else {
                                            value = openValue;
                                        }
                                    }
                                }
                                break;
                            default:
                                break;
                        }

                        if (TP.isArray(value)) {
                            value.remove('open');
                        }

                        resolver(value);
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

//  ============================================================================
//  dialog-specific TP.sig.Signal subtypes
//  ============================================================================

//  dialog signals
TP.sig.Signal.defineSubtype('OpenDialog');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
