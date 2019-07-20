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
 * @type {TP.tsh.deploy_assistant}
 */

//  ------------------------------------------------------------------------

TP.tsh.CommandAssistant.defineSubtype('tsh.deploy_assistant');

//  Note how this property is TYPE_LOCAL, by design.
TP.tsh.deploy_assistant.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tsh.deploy_assistant.Inst.defineMethod('$flushToProfile',
function() {

    var modelURI,

        result,
        data,

        deployInfos;

    //  Grab the current binding backing store.

    modelURI = this.get('assistantModelURI');

    result = modelURI.getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(data = result.get('data'))) {
        return this;
    }

    //  Grab the 'deployment information entries' that the user's profile is
    //  storing for us.
    deployInfos =
        TP.uc('urn:tibet:sherpa_deployinfos').getResource().get('result');

    //  Put a copy of the 'info' aspect (a POJO) found in the binding store into
    //  the deployment information entries.
    deployInfos.atPut(
        data.info.helperName,
        TP.copy(data.info));

    //  Tell the shell to save it's profile. This will force it to flush all of
    //  its data, including the deployment information entries, to its
    //  persistent store.
    TP.bySystemId('TSH').saveProfile();
});

//  ------------------------------------------------------------------------

TP.tsh.deploy_assistant.Inst.defineMethod('generateCommand',
function(info) {

    /**
     * @method generateCommand
     * @summary Generates the command text that will be sent to the shell if the
     *     user dismisses the assistant by clicking 'ok'.
     * @param {TP.core.Hash} info The hash containing the command parameters.
     * @returns {String} The generated command string.
     */

    var str,
        helperProps;

    str = ':deploy ' + info.at('helperName');

    //  Build a 'JSON argument' that represents all of the helper properties.
    //  This will allow those to be passed on the command line.
    helperProps = info.at('helperProps');
    if (TP.notEmpty(helperProps)) {
        str += ' \'{';

        helperProps.forEach(
                        function(anEntry) {
                            str += '"' +
                                anEntry.propName +
                                '":"' +
                                anEntry.propValue + '",';
                        });

        str = str.slice(0, -1);

        str += '}\'';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.tsh.deploy_assistant.Inst.defineMethod('getAssistantModelURI',
function() {

    /**
     * @method getAssistantModelURI
     * @summary Returns the URI containing the model that the assistant is using
     *     to manage all of the selections in its panel.
     * @returns {TP.uri.URI} The URI containing the assistant model.
     */

    return TP.uc('urn:tibet:deploy_cmd_source');
});

//  ------------------------------------------------------------------------

TP.tsh.deploy_assistant.Inst.defineHandler('DialogCancel',
function(anObject) {

    /**
     * @method handleDialogCancel
     * @summary Handles when the user has 'canceled' the dialog (i.e. wants to
     *     proceed without taking any action).
     * @param {TP.sig.DialogCancel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.tsh.deploy_assistant} The receiver.
     */

    this.callNextMethod();

    //  Keep the 'deploy infos' over in the shell up-to-date
    this.$flushToProfile();

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.deploy_assistant.Inst.defineHandler('DialogOk',
function(anObject) {

    /**
     * @method handleDialogOk
     * @summary Handles when the user has 'ok-ed' the dialog (i.e. wants to
     *     proceed by taking the default action).
     * @param {TP.sig.DialogOk} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.tsh.deploy_assistant} The receiver.
     */

    this.callNextMethod();

    //  Keep the 'deploy infos' over in the shell up-to-date
    this.$flushToProfile();

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.deploy_assistant.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the user changes the value of the underlying model.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     * @returns {TP.tsh.deploy_assistant} The receiver.
     */

    var aspect;

    aspect = aSignal.at('aspect');

    //  If the aspect that got changed is the helperName, then (re)populate the
    //  helper properties from the profile data store and/or the values that the
    //  user would have entered in this run of the dialog.
    if (aspect.endsWith('helperName')) {
        this.populateHelperProperties(true);

        //  Keep the 'deploy infos' over in the shell up-to-date
        this.$flushToProfile();
    } else if (aspect.contains('helperProps')) {
        this.populateHelperProperties(false);

        //  Keep the 'deploy infos' over in the shell up-to-date
        this.$flushToProfile();
    } else {
        this.callNextMethod();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.deploy_assistant.Inst.defineMethod('populateHelperProperties',
function(takePropsFromStore) {

    /**
     * @method populateHelperProperties
     * @summary Populates the 'helper properties' in the supplied command
     *     parameters based on the 'helperName' that is also in the command
     *     parameters.
     * @param {Boolean} takePropsFromStore Whether or not to populate the
     *     current set of deployment properties from the 'backing store' of the
     *     user's profile or to use the current binding model.
     * @returns {TP.tsh.deploy_assistant} The receiver.
     */

    var deployInfos,

        modelURI,
        result,
        data,

        assistantInfo,

        helperName,
        helperProps,
        helperPropsNames,

        profileName;

    //  Grab the 'deployment information entries' that the user's profile is
    //  storing for us. If we have an entry here for helper properties, then we
    //  will use that.
    deployInfos =
        TP.uc('urn:tibet:sherpa_deployinfos').getResource().get('result');

    //  Grab the current binding backing store.

    modelURI = this.get('assistantModelURI');

    result = modelURI.getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(data = result.get('data'))) {
        return this;
    }

    assistantInfo = data.info;

    //  And the helper name from it.
    helperName = assistantInfo.helperName;

    if (takePropsFromStore) {
        //  If the deployment entries have an entry for the helper named with
        //  the helper name, use that. This will be kept up-to-date as we change
        //  from helper to helper (within the same dialog session) and will also
        //  be updated when the user exits the panel (no matter how they did -
        //  either 'ok' or 'cancel').
        if (deployInfos.at(helperName)) {
            helperProps = deployInfos.at(helperName).helperProps;
        } else {
            helperProps = TP.ac();
        }

        //  Set whatever we found *back* into the binding info store's version of
        //  the helper props. Otherwise, they won't show in the UI.
        assistantInfo.helperProps = helperProps;
    } else {
        helperProps = assistantInfo.helperProps;
    }

    helperPropsNames = helperProps.collect(
                            function(anEntry) {
                                return anEntry.propName;
                            });

    switch (helperName) {
        case 'shipit':
            //  Grab the profile name and slice off everything after the '@'.
            //  That will be what we default the 'profile name'.
            profileName = TP.sys.getcfg('boot.profile');
            profileName = profileName.slice(0, profileName.indexOf('@'));

            if (takePropsFromStore &&
                !helperPropsNames.contains('environment')) {
                helperProps.push(
                    {
                        propName: 'environment',
                        propValue: profileName
                    });
            }

            break;
        case 'aws_ebs':
            break;
        case 'aws_fargate':
            break;
        case 'azure_webapps':
            break;
        case 'dockerhub':
            if (takePropsFromStore &&
                !helperPropsNames.contains('password')) {
                helperProps.push(
                    {
                        propName: 'password',
                        propValue: 'fluffy'
                    });
            }
            break;
        case 'heroku':
            break;
        default:
            break;
    }

    if (takePropsFromStore) {
        modelURI.$changed();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.deploy_assistant.Inst.defineMethod('setOriginalRequest',
function(anObj) {

    /**
     * @method setOriginalRequest
     * @summary Sets the original request received by the command that triggered
     *     the assistant.
     * @param {TP.sig.Request} anObj The original request that was supplied to
     *     the assistant via the command.
     * @returns {TP.tsh.deploy_assistant} The receiver.
     */

    var deployInfo,
        topLevelInfo,

        modelURI,
        modelObj;

    this.callNextMethod();

    //  Configure the GUI using the argument values that we can derive from the
    //  original request

    topLevelInfo = TP.hc();

    deployInfo = TP.hc();
    topLevelInfo.atPut('info', deployInfo);

    deployInfo.atPut('helperName', 'shipit');

    deployInfo.atPut('helperProps', TP.ac());

    //  Set up a model URI and observe it for change ourself. This will allow us
    //  to regenerate the tag representation as the model changes.
    modelURI = this.getAssistantModelURI();
    this.observe(modelURI, 'ValueChange');

    //  Construct a JSONContent object around the model object so that we can
    //  bind to it using the more powerful JSONPath constructs
    modelObj = TP.core.JSONContent.construct(TP.js2json(topLevelInfo));

    //  Set the resource of the model URI to the model object, telling the URI
    //  that it should observe changes to the model (which will allow us to get
    //  notifications from the URI which we're observing above) and to go ahead
    //  and signal change to kick things off.
    modelURI.setResource(
        modelObj, TP.hc('observeResource', true, 'signalChange', true));

    this.populateHelperProperties(true);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
