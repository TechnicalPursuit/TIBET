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

TP.tag.ActionTag.defineSubtype('tsh:test');

TP.tsh.test.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.test.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @method cmdRunContent
     * @summary
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object}
     */

    var shell,
        runner,

        ignore_only,
        ignore_skip,
        inherit,
        subtypes,
        target,
        suiteName,
        cases,

        contextDefaulted,
        context,

        karma,

        total,

        obj,
        nsRoot,
        options,

        params;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    runner = TP.bySystemId('TP.test');
    if (TP.notValid(runner)) {
        aRequest.fail('Unable to find TP.test.');
        return;
    }

    //  Let the stdout/stderr routines have a hook to help them determine how to
    //  format output.
    aRequest.atPut('cmdTAP', true);

    aRequest.stdout(TP.TSH_NO_VALUE);

    ignore_only = shell.getArgument(aRequest, 'tsh:ignore_only', false);
    ignore_skip = shell.getArgument(aRequest, 'tsh:ignore_skip', false);
    inherit = shell.getArgument(aRequest, 'tsh:inherit', false);
    subtypes = shell.getArgument(aRequest, 'tsh:subtypes', false);

    //  Grab the argument for 'target', either from a named flag parameter or
    //  from the 'first argument' (ARG0) of the command. Note that in both cases
    //  we want the 'original' value (not the 'expanded'/'resolve' one) - this
    //  will give us what the user originally typed and what we can resolve into
    //  a symbol below.
    target = shell.getArgument(
                        aRequest,
                        'tsh:target',
                        shell.getArgument(aRequest, 'ARG0', null, false, true),
                        false,
                        true);

    if (TP.isString(target)) {
        target = target.unquoted();
    }

    suiteName = shell.getArgument(
                        aRequest,
                        'tsh:suite',
                        shell.getArgument(aRequest, 'ARG1'));

    if (suiteName === true) {
        //  Only a single dash...syntax glitch...
        suiteName = '';
    } else if (TP.isString(suiteName)) {
        suiteName = suiteName.unquoted();
    }

    cases = shell.getArgument(aRequest, 'tsh:cases', null);
    if (TP.isString(cases)) {
        cases = cases.unquoted();
    }

    //  Note how we keep track of whether the context has been defaulted for use
    //  below when the target is a type object.
    contextDefaulted = false;
    context = shell.getArgument(aRequest, 'tsh:context');
    if (TP.isEmpty(context)) {
        context = 'app';
        contextDefaulted = true;
    }

    if (TP.isString(context)) {
        context = context.unquoted();
    }

    options = TP.hc('ignore_only', ignore_only,
                    'ignore_skip', ignore_skip,
                    'inherit', inherit,
                    'subtypes', subtypes,
                    'context', context,
                    'target', target,
                    'suite', suiteName,
                    'cases', cases);

    //  Stubs for when Karma isn't around.
    karma = TP.extern.karma;
    if (TP.notValid(karma)) {
        karma = {
            info: TP.NOOP,
            error: TP.NOOP,
            results: TP.NOOP,
            complete: TP.NOOP
        };
    }

    TP.test.Suite.set('$rootRequest', aRequest);

    //  Define a local version of 'complete' that nulls out the suite's root
    //  request.
    aRequest.defineMethod('complete',
        function() {
            TP.test.Suite.set('$rootRequest', null);
            return this.callNextMethod();
        });

    if (TP.notValid(target) && TP.isEmpty(suiteName)) {

        total = runner.getCases(options).getSize();

        karma.info(
            {
                total: total
            });

        runner.runSuites(options).then(
            function(result) {
                aRequest.complete(TP.TSH_NO_VALUE);
                karma.complete();
            },
            function(error) {
                aRequest.fail(error);
                karma.complete();
            }
        );

    } else if (TP.notValid(target) && TP.notEmpty(suiteName)) {

        aRequest.stdout(TP.TSH_NO_VALUE);

        total = runner.getCases(options).getSize();

        karma.info(
            {
                total: total
            });

        runner.runSuites(options).then(
            function(result) {
                //  TODO: should we pass non-null results?
                aRequest.complete(TP.TSH_NO_VALUE);
                karma.complete();
            },
            function(error) {
                aRequest.fail(error);
                karma.complete();
            }
        );

    } else {

        if (TP.isString(target)) {
            obj = shell.resolveObjectReference(target, aRequest);
        } else {
            obj = target;
        }

        //  If we defaulted the context and we've got an object to ask then ask
        //  it to help correct any mistake in the defaulting.
        if (contextDefaulted && TP.canInvoke(obj, 'get')) {

            //  Try to grab a 'namespace root'. If obj is a TIBET type, it can
            //  tell you what its root namespace is.
            if (TP.isType(obj)) {
                nsRoot = obj.get('nsRoot');
            } else {
                //  If not, it may be a 'primitive' Function, in which case (if
                //  it was defined using a TIBET method) it has an owner with a
                //  name.
                nsRoot = obj[TP.OWNER][TP.NAME];
            }

            if (TP.isValid(nsRoot) && nsRoot !== 'APP') {
                context = 'lib';
                options.atPut('context', context);
            }
        }

        if (TP.notValid(obj)) {
            aRequest.fail('Unable to resolve object: ' + TP.id(target));
            return;
        }

        if (!TP.canInvoke(obj, 'runTestSuites')) {
            aRequest.fail('Object has no runTestSuites method: ' + TP.id(obj));
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

                karma.info(
                    {
                        total: total
                    });

                //  Type first, then Inst, then Local
                TP.sys.logTest('# Running Type tests for ' + TP.name(target));
                obj.Type.runTestSuites(options).then(
                    function() {
                        TP.sys.logTest('# Running Inst tests for ' +
                            TP.name(target));

                        //  This method returns a Promise, so we must return
                        //  that here so that everything gets chained
                        //  properly.
                        return obj.Inst.runTestSuites(options);
                    }).then(
                    function() {
                        TP.sys.logTest('# Running Local tests for ' +
                            TP.name(target));

                        //  This method returns a Promise, so we must return
                        //  that here so that everything gets chained
                        //  properly.
                        return obj.runTestSuites(options);
                    }).then(
                    function(result) {
                        //  TODO: should we pass non-null results?
                        aRequest.complete(TP.TSH_NO_VALUE);
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

        karma.info(
            {
                total: total
            });

        TP.sys.logTest('# Running Local tests for ' + TP.id(obj));
        obj.runTestSuites(options).then(
            function(result) {
                //  TODO: should we pass non-null results?
                aRequest.complete(TP.TSH_NO_VALUE);
                karma.complete();
            },
            function(error) {
                aRequest.fail(error);
                karma.complete();
            }
        );
    }

    return;
}, {
    patchCallee: false
});

//  ------------------------------------------------------------------------

TP.tsh.test.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {TP.sig.Request|Number} The request or a TSH shell loop control
     *     constant which controls how the outer TSH processing loop should
     *     continue. Common values are TP.CONTINUE, TP.DESCEND, and TP.BREAK.
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('test',
    TP.tsh.test.Type.getMethod('cmdRunContent'),
    'Executes an object\'s tests or test suite.',
    ':test [<target>] [--suite <suite>] [--cases <filter>] [--karma]' +
    ' [--context <app|lib|all>]' +
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
