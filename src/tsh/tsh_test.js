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
 * @summary A command tag capable of running a test operation on one or more
 *     objects/functions.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:test');

TP.tsh.test.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.test.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @method cmdRunContent
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object}
     * @abstract
     */

    var shell,
        target,
        runner,
        ignore_only,
        ignore_skip,
        options,
        suiteName,
        obj;

    TP.stop('break.tsh_test');

    runner = TP.sys.getTypeByName('TP.test.Suite');
    if (TP.notValid(runner)) {
        aRequest.fail('Unable to find TP.test.Suite.');
        return;
    }

    // Let the stdout/stderr routines have a hook to help them determine how to
    // format output.
    aRequest.atPut('cmdTAP', true);

    aRequest.stdout('');

    shell = aRequest.at('cmdShell');

    ignore_only = shell.getArgument(aRequest, 'tsh:ignore_only', false);
    ignore_skip = shell.getArgument(aRequest, 'tsh:ignore_skip', false);

    target = shell.getArgument(aRequest, 'ARG0');

    suiteName = shell.getArgument(aRequest, 'tsh:suite',
        shell.getArgument(aRequest, 'ARG1'));

    if (suiteName === true) {
        // Only a single dash...syntax glitch...
        suiteName = '';
    } else if (TP.notEmpty(suiteName)) {
        suiteName = suiteName.unquoted();
    }

    options = TP.hc('ignore_only', ignore_only,
        'ignore_skip', ignore_skip,
        'suite', suiteName);

    if (TP.isEmpty(target) && TP.isEmpty(suiteName)) {

        if (shell.getArgument(aRequest, 'tsh:all', false)) {

            runner.runTargetSuites(null, options).then(
                function(result) {
                    aRequest.complete();
                },
                function(error) {
                    aRequest.fail(error);
                }
            );

        } else {

            aRequest.stdout('Usage - :test <target> [-local_only] [-ignore_only] [-ignore_skip]');
            aRequest.complete();
            return;
        }

    } else if (TP.notEmpty(suiteName)) {

        aRequest.stdout('');

        runner.runTargetSuites(null, options).then(
            function(result) {
                // TODO: should we pass non-null results?
                aRequest.complete();
            },
            function(error) {
                aRequest.fail(error);
            }
        );

    } else {

        obj = shell.resolveObjectReference(target, aRequest);
        if (TP.notValid(obj)) {
            aRequest.fail('Unable to resolve object: ' + target);
            return;
        }

        if (!TP.canInvoke(obj, 'runTestSuites')) {
            aRequest.fail('Object cannot run tests: ' + TP.id(obj));
            return;
        }

        // One sugar here is that if the receiver is a type object we can ask
        // for it to run both Type and Inst tests by essentially running each of
        // the likely targets.
        if (TP.isType(obj)) {
            if (!shell.getArgument(aRequest, 'tsh:local_only', false)) {

                obj.Type.runTestSuites(options).then(function() {
                        obj.Inst.runTestSuites(options);
                    }).then(function() {
                        obj.runTestSuites(options);
                    }).then(
                    function(result) {
                        // TODO: should we pass non-null results?
                        aRequest.complete();
                    },
                    function(error) {
                        aRequest.fail(error);
                    }
                );
                return;
            }
        }

        aRequest.stdout('');

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
