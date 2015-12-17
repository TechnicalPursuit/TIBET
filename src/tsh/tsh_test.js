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
        params,
        karma,
        total,
        suiteName,
        cases,
        context,
        msg,
        obj;

    runner = TP.bySystemId('TP.test');
    if (TP.notValid(runner)) {
        aRequest.fail('Unable to find TP.test.');
        return;
    }

    //  Let the stdout/stderr routines have a hook to help them determine how to
    //  format output.
    aRequest.atPut('cmdTAP', true);

    aRequest.stdout(TP.TSH_NO_VALUE);

    shell = aRequest.at('cmdShell');

    ignore_only = shell.getArgument(aRequest, 'tsh:ignore_only', false);
    ignore_skip = shell.getArgument(aRequest, 'tsh:ignore_skip', false);

    target = shell.getArgument(
                        aRequest,
                        'tsh:target',
                        shell.getArgument(aRequest, 'ARG0'));

    if (TP.notEmpty(target)) {
        target = target.unquoted();
    }

    suiteName = shell.getArgument(
                        aRequest,
                        'tsh:suite',
                        shell.getArgument(aRequest, 'ARG1'));

    if (suiteName === true) {
        //  Only a single dash...syntax glitch...
        suiteName = '';
    } else if (TP.notEmpty(suiteName)) {
        suiteName = suiteName.unquoted();
    }

    cases = shell.getArgument(aRequest, 'tsh:cases', null);
    if (TP.notEmpty(cases)) {
        cases = cases.unquoted();
    }

    context = shell.getArgument(aRequest, 'tsh:context', 'app');
    if (TP.notEmpty(context)) {
        context = context.unquoted();
    }

    options = TP.hc('ignore_only', ignore_only,
                    'ignore_skip', ignore_skip,
                    'context', context,
                    'target', target,
                    'suite', suiteName,
                    'cases', cases);

    karma = TP.ifInvalid(
            TP.extern.karma, {
                info: TP.NOOP,
                error: TP.NOOP,
                results: TP.NOOP,
                complete: TP.NOOP
            });

    if (TP.isEmpty(target) && TP.isEmpty(suiteName)) {

        //  If the CLI drove this, or the Sherpa/TDC, there should be an
        //  explicit -all. The karma-tibet bridge doesn't do that however.
        if (TP.sys.cfg('boot.context') === 'phantomjs' ||
                TP.sys.hasFeature('karma')) {

            total = runner.getCases(options).getSize();
            karma.info({total: total});

            runner.runSuites(options).then(
                function(result) {
                    aRequest.complete();
                    karma.complete();
                },
                function(error) {
                    aRequest.fail(error);
                    karma.complete();
                }
            );

        } else {
            msg = 'Usage - :test <target> [-suite <filter>] [-cases <filter>] [-local_only] [-ignore_only] [-ignore_skip]';
            aRequest.stdout(msg);
            aRequest.complete();
            karma.error(msg);
            return;
        }

    } else if (TP.isEmpty(target) && TP.notEmpty(suiteName)) {

        aRequest.stdout(TP.TSH_NO_VALUE);

        total = runner.getCases(options).getSize();
        karma.info({total: total});

        runner.runSuites(options).then(
            function(result) {
                //  TODO: should we pass non-null results?
                aRequest.complete();
                karma.complete();
            },
            function(error) {
                aRequest.fail(error);
                karma.complete();
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

        //  One sugar here is that if the receiver is a type object we can ask
        //  for it to run both Type and Inst tests by essentially running each
        //  of the likely targets.
        if (TP.isType(obj)) {
            if (!shell.getArgument(aRequest, 'tsh:local_only', false)) {

                params = options.asObject();
                params.target = obj.Type;
                total = runner.getCases(params).getSize();
                params.target = obj.Inst;
                total += runner.getCases(params).getSize();
                params.target = obj;
                total += runner.getCases(params).getSize();
                karma.info({total: total});

                //  Type first, then Inst, then Local
                TP.sys.logTest('# Running Type tests for ' + target);
                obj.Type.runTestSuites(options).then(
                        function() {
                            TP.sys.logTest('# Running Inst tests for ' + target);
                            return obj.Inst.runTestSuites(options);
                        }).then(function() {
                            TP.sys.logTest('# Running Local tests for ' + target);
                            return obj.runTestSuites(options);
                        }).then(function(result) {
                            // TODO: should we pass non-null results?
                            aRequest.complete();
                            karma.complete();
                        },
                        function(error) {
                            aRequest.fail(error);
                            karma.complete();
                        }
                );
                return;
            }
        }

        aRequest.stdout(TP.TSH_NO_VALUE);

        params = options.asObject();
        params.target = obj;
        total = runner.getCases(params).getSize();
        karma.info({total: total});

        TP.sys.logTest('# Running Local tests for ' + target);
        obj.runTestSuites(options).then(
            function(result) {
                //  TODO: should we pass non-null results?
                aRequest.complete();
                karma.complete();
            },
            function(error) {
                aRequest.fail(error);
                karma.complete();
            }
        );
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
