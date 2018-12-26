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
 * @type {TP.tsh.type_assistant}
 */

//  ------------------------------------------------------------------------

TP.tsh.CommandAssistant.defineSubtype('tsh.type_assistant');

//  Note how this property is TYPE_LOCAL, by design.
TP.tsh.type_assistant.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Type.defineConstant('BUILT_IN_DNA_TAG_TYPES',
    TP.ac(
        'TP.tag.ActionTag',
        'TP.tag.CompiledTag',
        'TP.core.Content',
        'TP.core.Controller',
        'TP.tag.InfoTag',
        'TP.tag.TemplatedTag'));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Inst.defineAttribute('dna');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Inst.defineMethod('generateCommand',
function(info) {

    /**
     * @method generateCommand
     * @summary Generates the command text that will be sent to the shell if the
     *     user dismisses the assistant by clicking 'ok'.
     * @param {TP.core.Hash} info The hash containing the command parameters.
     * @returns {String} The generated command string.
     */

    var str,

        data,
        val;

    str = ':type --name=\'' +
            info.at('topLevelNS') + '.' + info.at('typeNSAndName') + '\'';

    if (TP.notEmpty(val = info.at('supertype'))) {
        data = TP.uc('urn:tibet:typelist').getResource().get('result');
        if (TP.isValid(data)) {
            val = data.at(val);
        }

        str += ' --supertype=\'' + val + '\'';
    }

    if (TP.notEmpty(val = info.at('dna'))) {
        str += ' --dna=\'' + val + '\'';
    }

    if (TP.notEmpty(val = info.at('package'))) {
        str += ' --package=\'' + val + '\'';
    }

    if (TP.notEmpty(val = info.at('config'))) {
        str += ' --config=\'' + val + '\'';
    }

    if (TP.notEmpty(val = info.at('dir'))) {
        str += ' --dir=\'' + val + '\'';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Inst.defineMethod('getAssistantModelURI',
function() {

    /**
     * @method getAssistantModelURI
     * @summary Returns the URI containing the model that the assistant is using
     *     to manage all of the selections in its panel.
     * @returns {TP.uri.URI} The URI containing the assistant model.
     */

    return TP.uc('urn:tibet:type_cmd_source');
});

//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Inst.defineHandler('DialogCancel',
function(anObject) {

    /**
     * @method handleDialogCancel
     * @summary Handles when the user has 'canceled' the dialog (i.e. wants to
     *     proceed without taking any action).
     * @param {TP.sig.DialogCancel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.tsh.type_assistant} The receiver.
     */

    this.callNextMethod();

    this.signal('TypeAdditionCancelled');

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Inst.defineHandler('ResetSupertype',
function(anObject) {

    /**
     * @method handleResetSupertype
     * @summary Handles when the user wants to reset the supertype.
     * @param {TP.sig.ResetSupertype} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.tsh.type_assistant} The receiver.
     */

    var result;

    result = this.get('assistantModelURI').getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    result.set('$.info.supertype', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the user changes the value of the underlying model.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     * @returns {TP.tsh.type_assistant} The receiver.
     */

    var result,

        currentDNA,
        supertypeForDNA;

    result = this.get('assistantModelURI').getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    currentDNA = result.get('$.info.dna');

    if (currentDNA === this.$get('dna')) {
        return this.callNextMethod();
    } else {
        this.$set('dna', currentDNA);
    }

    switch (currentDNA) {

        case 'default':

            //  If the supertype is currently set to one of the tag types, then
            //  we set it to the empty String, since we're setting it back to a
            //  non preset supertype and we'll let the user choose.
            if (this.getType().BUILT_IN_DNA_TAG_TYPES.contains(
                    result.get('$.info.supertype'))) {
                supertypeForDNA = '';
            } else {
                //  Otherwise, set it to null which will cause the logic below
                //  to skip setting it - that way we won't override what the
                //  user wants.
                supertypeForDNA = null;
            }

            break;

        case 'actiontag':
            supertypeForDNA = 'TP.tag.ActionTag';
            break;

        case 'compiledtag':
            supertypeForDNA = 'TP.tag.CompiledTag';
            break;

        case 'content':
            supertypeForDNA = 'TP.core.Content';
            break;

        case 'controller':
            supertypeForDNA = 'TP.core.Controller';
            break;

        case 'infotag':
            supertypeForDNA = 'TP.tag.InfoTag';
            break;

        case 'templatedtag':
            supertypeForDNA = 'TP.tag.TemplatedTag';
            break;

        default:
            supertypeForDNA = 'TP.lang.Object';
            break;
    }

    if (TP.isValid(supertypeForDNA)) {
        result.set('$.info.supertype', supertypeForDNA);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Inst.defineMethod('setOriginalRequest',
function(anObj) {

    /**
     * @method setOriginalRequest
     * @summary Sets the original request received by the command that triggered
     *     the assistant.
     * @param {TP.sig.Request} anObj The original request that was supplied to
     *     the assistant via the command.
     * @returns {TP.tsh.type_assistant} The receiver.
     */

    var shell,
        args,

        topLevelInfo,
        typeInfo,

        name,
        nameParts,

        modelURI,
        modelObj,

        typesURI,

        rootType,

        typesObj;

    this.callNextMethod();

    //  Configure the GUI using the argument values that we can derive from the
    //  original request

    shell = anObj.at('cmdShell');
    args = shell.getArguments(anObj);

    topLevelInfo = TP.hc();

    typeInfo = TP.hc();
    topLevelInfo.atPut('info', typeInfo);

    name = args.at('tsh:name');
    if (TP.notEmpty(name)) {
        nameParts = name.split(/[:.]/g);

        if (nameParts.getSize() === 3) {
            typeInfo.atPut('topLevelNS', nameParts.at(0));
            typeInfo.atPut('typeNSAndName',
                            nameParts.at(1) + '.' + nameParts.at(2));
        } else if (nameParts.getSize() === 2) {
            typeInfo.atPut('topLevelNS', 'APP');
            typeInfo.atPut('typeNSAndName',
                            nameParts.at(0) + '.' + nameParts.at(1));
        } else if (nameParts.getSize() === 1) {
            typeInfo.atPut('topLevelNS', 'APP');
            typeInfo.atPut('typeNSAndName',
                            TP.sys.cfg('project.name') + '.' + nameParts.at(0));
        }
    } else {
        typeInfo.atPut('topLevelNS', 'APP');
        typeInfo.atPut('typeNSAndName', '');
    }

    typeInfo.atPut('supertype',
                    TP.ifInvalid(args.at('tsh:supertype'), ''));
    typeInfo.atPut('dna',
                    TP.ifInvalid(args.at('tsh:dna'), ''));
    typeInfo.atPut('package',
                    TP.ifInvalid(args.at('tsh:package'), ''));
    typeInfo.atPut('config',
                    TP.ifInvalid(args.at('tsh:config'), ''));
    typeInfo.atPut('dir',
                    TP.ifInvalid(args.at('tsh:dir'), ''));

    //  Set up the type list value holder

    typesURI = TP.uc('urn:tibet:typelist');

    //  NB: 'tsh:roottype' is a TSH-only parameter used just for communicating
    //  where to 'root' the supertype list.
    if (TP.notEmpty(args.at('tsh:roottype'))) {
        rootType = TP.sys.getTypeByName(args.at('tsh:roottype'));
        if (TP.isType(rootType)) {
            typesObj = TP.hc();
            rootType.getSubtypeNames(true).sort().perform(
                function(aTypeName) {
                    typesObj.atPut(aTypeName, aTypeName);
                });
        }
    }

    //  Couldn't obtain a types hash above.
    if (TP.notValid(typesObj)) {
        //  Grab all of the type names here as key/value pairs containing the
        //  type name in both slots.
        typesObj = TP.sys.getCustomTypeNameKVPairs();
    }

    //  Set the types value holder to the Array we computed here. We also tell
    //  it to go ahead and signal change to kick things off.
    typesURI.setResource(typesObj, TP.hc('signalChange', true));

    //  Set up a model URI and observe it for change ourself. This will allow us
    //  to regenerate the tag representation as the model changes.
    modelURI = TP.uc('urn:tibet:type_cmd_source');
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

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.defineSubtype('TypeAdditionCancelled');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
