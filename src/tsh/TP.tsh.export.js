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
 * @type {TP.tsh.export}
 */

//  ------------------------------------------------------------------------

TP.core.ActionTag.defineSubtype('tsh:export');

TP.tsh.export.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.export.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @description This command writes out the previous command buffer to the
     *     script file named as the target url.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. Common values are TP.CONTINUE, TP.DESCEND, and
     *     TP.BREAK.
     */

    var shell,

        path,
        ext,
        url,
        hid,

        request,
        content;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    //  No arguments means we dump usage.
    if (!shell.hasArguments(aRequest)) {
        return this.printUsage(aRequest);
    }

    //  TODO:   make this read from stdin for potential buffer content etc

    //  NB: We supply 'null' as the default value if 'tsh:ref' wasn't
    //  specified.
    path = shell.getArgument(aRequest, 'tsh:href', null, true);
    if (TP.isEmpty(path)) {
        return aRequest.fail('Unable to determine target url.');
    }

    ext = TP.uriExtension(path);
    if (TP.isEmpty(ext)) {
        path = path + '.tsh';
    }

    url = TP.uc(path);
    if (TP.notValid(url)) {
        return aRequest.fail('Invalid target url.');
    }

    hid = shell.getArgument(aRequest, 'tsh:hid', null, false);

    hid = TP.ifEmpty(hid, -2);
    hid = parseInt(hid, 10);
    if (TP.notValid(hid) || TP.isNaN(hid)) {
        return aRequest.fail('Invalid target history.');
    }

    //  we want the expanded form of the last command, ready for action.
    request = shell.$get('history').at(hid);

    content = request.at('cmdExpansion');
    content = TP.XML_10_UTF8_HEADER + content;
    content = content.replace(/>/g, '>\n');

    aRequest.stdout(content);
    url.setContent(content, TP.request('resultType', TP.TEXT));

    url.save(TP.request('method', TP.HTTP_PUT));

    return;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('export',
    TP.tsh.export.Type.getMethod('tshExecute'),
    'Writes a previous command to a target URL.',
    ':export --href <exporturl> [--hid <hidnum>]',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
