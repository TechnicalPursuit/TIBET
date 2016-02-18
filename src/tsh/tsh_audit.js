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
 * @type {TP.tsh.audit}
 * @summary A subtype of TP.core.ActionElementNode that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:audit');

TP.tsh.audit.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.audit.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action. For tsh:uri
     *     this method is responsible for dispatching all the variations of pipe
     *     methods which are suitable for use with a URI.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. Common values are TP.CONTINUE, TP.DESCEND, and
     *     TP.BREAK.
     */

    var usage,

        shell,

        arg0,

        obj,

        results,

        astCache,
        unusedRules;

    usage = 'Usage: :audit [target]';

    shell = aRequest.at('cmdShell');

    //  No arguments means we dump usage. Need at least a flag to list
    //  something like types.
    if (!shell.hasArguments(aRequest)) {
        aRequest.stdout(usage);
        return aRequest.complete();
    }

    arg0 = shell.getArgument(aRequest, 'ARG0');
    if (TP.isString(arg0)) {
        arg0 = arg0.unquoted();
    }

    //  First attempt to resolve the target as a specific object name.
    obj = shell.resolveObjectReference(arg0, aRequest);

    if (TP.notValid(obj)) {
        aRequest.stdout('Invalid document reference: ' + arg0);

        return aRequest.complete();
    }

    obj = TP.unwrap(obj);

    if (!TP.isDocument(obj)) {
        aRequest.stdout('Invalid document reference: ' + arg0);

        return aRequest.complete();
    }

    results = '';

    astCache = TP.hc();

    unusedRules = TP.documentGetUnusedStyleRules(obj);
    unusedRules.forEach(
            function(aRule) {
                var ruleInfo,

                    position,

                    source,
                    start,
                    end;

                ruleInfo = TP.styleRuleGetSourceInfo(aRule, astCache);

                if (TP.isEmpty(ruleInfo)) {
                    results += 'No rule info for: ' + TP.dump(aRule) + '\n\n';
                    return;
                }

                if (TP.notValid(position = ruleInfo.at('position'))) {
                    return;
                }

                source = position.at('source');

                start = position.at('start');
                end = position.at('end');

                results += 'Rule: ' + ruleInfo.at('selectors').join(',') +
                            ' @ ' + source + ':' +
                            start.at('line') + ',' + start.at('column') +
                            '...' +
                            end.at('line') + ',' + end.at('column') +
                            '\n\n';
            });

    aRequest.complete(results);

    return TP.BREAK;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
