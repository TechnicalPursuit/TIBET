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
 * @type {TP.tsh.test}
 * @synopsis A command tag capable of running a test operation on one or more
 *     objects/functions.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:test');

TP.tsh.test.addTraitsFrom(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.test.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @name cmdRunContent
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object}
     * @abstract
     * @todo
     */

    var shell,
        target,
        suite,
        ignore_only,
        ignore_skip,
        options,
        suiteName,
        obj;

    TP.stop('break.tsh_test');

    suite = TP.sys.getTypeByName('TP.test.Suite');
    if (TP.notValid(suite)) {
        aRequest.fail(TP.FAILURE, 'Unable to find TP.test.Suite.');
        return;
    }

    shell = aRequest.at('cmdShell');

    ignore_only = shell.getArgument(aRequest, 'tsh:ignore_only', false);
    ignore_skip = shell.getArgument(aRequest, 'tsh:ignore_skip', false);

    suiteName = shell.getArgument(aRequest, 'tsh:suite',
        shell.getArgument(aRequest, 'ARG1'));
    suiteName = suiteName.unquoted();

    options = TP.hc('ignore_only', ignore_only,
        'ignore_skip', ignore_skip,
        'suite', suiteName);

    target = shell.getArgument(aRequest, 'ARG0');

    if (TP.isEmpty(target)) {

        suite.runTargetSuites(null, options).then(
            function(result) {
                aRequest.complete();
            },
            function(error) {
                aRequest.fail(error);
            }
        );

    } else {

        obj = shell.resolveObjectReference(target, aRequest);
        if (TP.notValid(obj)) {
            aRequest.fail(TP.FAILURE, 'Unable to resolve object: ' + target);
            return;
        }

        if (!TP.canInvoke(obj, 'runTestSuites')) {
            aRequest.fail(TP.FAILURE, 'Object cannot run tests: ' + TP.id(obj));
            return;
        }

        obj.runTestSuites(options).then(
            function(result) {
                // TODO: should we pass non-null results?
                aRequest.complete();
            },
            function(error) {
                aRequest.fail(error);
            }
        );
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
