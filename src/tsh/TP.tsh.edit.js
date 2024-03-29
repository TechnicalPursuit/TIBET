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
 * @type {TP.tsh.edit}
 * @summary A subtype of TP.tag.ActionTag that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:edit');

TP.tsh.edit.addTraitTypes(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.edit.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {TP.sig.Request|Number} The request or a TSH shell loop control
     *     constant which controls how the outer TSH processing loop should
     *     continue. Common values are TP.CONTINUE, TP.DESCEND, and TP.BREAK.
     */

    var shell,

        arg0,
        url,
        obj;

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

    arg0 = shell.getArgument(aRequest, 'ARG0');

    if (TP.regex.URI_LIKELY.test(arg0) &&
        !TP.regex.REGEX_LITERAL_STRING.test(arg0)) {
        url = shell.expandPath(arg0);
        if (TP.isURI(url = TP.uc(url))) {
            obj = url;
        } else {
            obj = shell.resolveObjectReference(arg0, aRequest);
        }
    } else {
        obj = shell.resolveObjectReference(arg0, aRequest);
    }

    if (TP.notValid(obj)) {
        aRequest.stdout('Invalid object reference: ' + arg0);

        return aRequest.complete(TP.TSH_NO_VALUE);
    }

    //  Fire a 'EditObject' signal, supplying the target object to focus on.
    TP.signal(null,
                'EditObject',
                TP.hc('targetObject', obj,
                        'targetAspect', TP.id(obj),
                        'addTargetAsRoot', true));

    aRequest.complete(TP.TSH_NO_VALUE);

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('edit',
    TP.tsh.edit.Type.getMethod('tshExecute'),
    'Opens an editor for the value at stdin.',
    ':edit <target>',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
