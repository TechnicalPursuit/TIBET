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

        val;

    str = ':type --name=\'' +
            info.at('topLevelNS') + '.' + info.at('typeNSAndName') + '\'';

    if (TP.notEmpty(val = info.at('supertype'))) {
        val = TP.uc('urn:tibet:typelist').getResource().get('result').at(val);
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

    typeInfo.atPut('package',
                    TP.ifInvalid(args.at('tsh:package'), ''));
    typeInfo.atPut('config',
                    TP.ifInvalid(args.at('tsh:config'), ''));
    typeInfo.atPut('dir',
                    TP.ifInvalid(args.at('tsh:dir'), ''));
    typeInfo.atPut('dna',
                    TP.ifInvalid(args.at('tsh:dna'), ''));
    typeInfo.atPut('supertype',
                    TP.ifInvalid(args.at('tsh:supertype'), ''));

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

    //  Set up the type list value holder

    typesURI = TP.uc('urn:tibet:typelist');

    //  Grab all of the type names here. Note that because this list contains
    //  type names that are signal names themselves, we need to make sure to
    //  configure this Array to not consider itself an 'origin set'. Otherwise,
    //  there will be spurious triggering of signals.
    typesObj = TP.copy(TP.sys.getCustomTypeNames().sort());
    typesObj.isOriginSet(false);

    //  Set the types value holder to the Array we computed here. We also tell
    //  it to go ahead and signal change to kick things off.
    typesURI.setResource(typesObj, TP.hc('signalChange', true));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
