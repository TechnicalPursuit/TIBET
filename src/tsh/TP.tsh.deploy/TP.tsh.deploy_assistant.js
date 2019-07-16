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

    if (aspect.endsWith('helperName')) {
        this.populateHelperProperties();
    } else {
        this.callNextMethod();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.deploy_assistant.Inst.defineMethod('populateHelperProperties',
function() {

    /**
     * @method populateHelperProperties
     * @summary Populates the 'helper properties' in the supplied command
     *     parameters based on the 'helperName' that is also in the command
     *     parameters.
     * @returns {TP.tsh.deploy_assistant} The receiver.
     */

    var modelURI,

        result,
        data,
        assistantInfo,

        helperName,
        helperProps,
        helperPropsNames,

        profileName;

    modelURI = this.get('assistantModelURI');

    result = modelURI.getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(data = result.get('data'))) {
        return this;
    }

    assistantInfo = data.info;

    helperName = assistantInfo.helperName;
    helperProps = assistantInfo.helperProps;
    helperPropsNames = helperProps.collect(
                            function(anEntry) {
                                return anEntry.propName;
                            });

    switch (helperName) {
        case 'shipit':
            helperProps = TP.ac();

            //  Grab the profile name and slice off everything after the '@'.
            //  That will be what we default the 'profile name'.
            profileName = TP.sys.getcfg('boot.profile');
            profileName = profileName.slice(0, profileName.indexOf('@'));

            if (!helperPropsNames.contains('environment')) {
                helperProps.push(
                    {
                        propName: 'environment',
                        propValue: profileName
                    });
            }

            assistantInfo.helperProps = helperProps;
            break;
        case 'aws_ebs':
            break;
        case 'aws_fargate':
            break;
        case 'azure_webapps':
            break;
        case 'dockerhub':
            helperProps = TP.ac();

            if (!helperPropsNames.contains('password')) {
                helperProps.push(
                    {
                        propName: 'password',
                        propValue: 'fluffy'
                    });
            }

            assistantInfo.helperProps = helperProps;
            break;
        case 'heroku':
            break;
        default:
            break;
    }

    modelURI.$changed();

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
    modelURI = TP.uc('urn:tibet:deploy_cmd_source');
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

    this.populateHelperProperties();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
