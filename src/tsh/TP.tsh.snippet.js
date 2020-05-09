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
 * @type {TP.tsh.snippet}
 * @summary A subtype of TP.tag.ActionTag that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:snippet');

TP.tsh.snippet.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.snippet.Type.defineMethod('tshExecute',
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

        promptForDescription,

        arg0,
        arg1,

        isRemove,

        snippets,
        snippetNum,
        snippet,

        hidNum,

        command,
        description;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    //  This command only works in the context of a loaded and enabled Sherpa
    if (!TP.sys.hasFeature('sherpa')) {
        aRequest.stdout(
                'The :snippet command requires a loaded and enabled Sherpa');
        aRequest.complete(TP.TSH_NO_VALUE);

        return aRequest;
    }

    promptForDescription = function() {

        var defaultStr,
            descriptionReq;

        defaultStr = 'Description for history item #' + hidNum;
        descriptionReq = TP.sig.UserInputRequest.construct(
                                TP.hc('query', 'Snippet description:',
                                        'default', defaultStr,
                                        'select', true,
                                        'async', true));

        //  response comes as a TP.sig.UserInput signal, so add a local
        //  handler
        descriptionReq.defineHandler(
            'UserInput',
            function(aSignal) {

                var descriptionResult,
                    invalidDescriptionReq,
                    validDescriptionReq;

                //  do this so the triggering request clears the queue
                if (TP.isValid(aSignal.getRequest().get('responder'))) {
                    aSignal.getRequestID().signal(
                                            'TP.sig.RequestCompleted');
                }

                descriptionResult = aSignal.getResult();

                //  if the response wasn't adequate we can deal with that by
                //  simply reporting via an output request
                /* eslint-disable no-extra-parens */
                if (TP.isEmpty(descriptionResult)) {
                /* eslint-enable no-extra-parens */

                    invalidDescriptionReq =
                        TP.sig.UserOutputRequest.construct(
                            TP.hc('output', 'Invalid snippet description',
                                    'async', true));

                    invalidDescriptionReq.isError(true);
                    invalidDescriptionReq.fire(shell);
                } else {
                    snippets.add(TP.ac(command, descriptionResult));

                    validDescriptionReq =
                        TP.sig.UserOutputRequest.construct(
                            TP.hc('output', 'Snippet added: ' + command,
                                    'async', true));

                    validDescriptionReq.fire(shell);
                }

                //  Make sure to complete the original request to keep
                //  everything in sync with the shell.
                aRequest.complete(TP.TSH_NO_VALUE);

                return;
            });

        //  first-stage request (description) and response handler are
        //  defined so initiate the sequence, using the shell as the
        //  originator
        descriptionReq.fire(shell);
    };

    arg0 = shell.getArgument(aRequest, 'ARG0');
    arg1 = shell.getArgument(aRequest, 'ARG1');

    isRemove = shell.getArgument(aRequest, 'tsh:remove', false);

    snippets = TP.uc('urn:tibet:tsh_snippets').getResource().get('result');

    //  First form - remove the 3rd snippet:
    //  :snippet --remove 3

    snippetNum = TP.nc(arg0);
    if (TP.isTrue(isRemove)) {
        if (TP.isNumber(snippetNum)) {
            snippet = snippets.at(snippetNum);

            snippets.remove(snippet);

            aRequest.stdout('Snippet removed: ' + snippet.first());
            aRequest.complete(TP.TSH_NO_VALUE);
        } else {
            aRequest.stdout('Snippet removal requires numeric index');
            aRequest.complete(TP.TSH_NO_VALUE);
        }

        return aRequest;
    }

    //  Second form - add the snippet based on the 4th history entry:
    //  :snippet --hid=4
    //  OR
    //  :snippet --hid=4 'This is a cool snippet'

    hidNum = TP.nc(shell.getArgument(aRequest, 'tsh:hid', -1));
    if (TP.isNumber(hidNum) && hidNum > -1) {
        command = shell.get('history').at(hidNum).at('cmd');
        if (TP.notEmpty(command)) {

            description = arg0;

            //  If the user provided a description, use it and return.
            if (TP.notEmpty(description)) {
                snippets.add(TP.ac(command, description));

                aRequest.complete(TP.TSH_NO_VALUE);

                return;
            }

            //  Otherwise, prompt for a description
            promptForDescription();
        }

        //  Note how we do *not* complete the request before returning... we
        //  complete it in the handler above.
        return aRequest;
    }

    //  Last form - add the snippet from scratch:
    //  :snippet '4 + 5' 'This is a cool snippet'

    //  If the first argument is empty, we dump usage.
    if (TP.isEmpty(arg0)) {
        return this.printUsage(aRequest);
    }
    command = arg0;

    //  If the second argument is empty, prompt for a description
    if (TP.isEmpty(arg1)) {
        promptForDescription();

        //  Note how we do *not* complete the request before returning... we
        //  complete it in the handler above.
        return;
    }
    description = arg1;

    snippets.add(TP.ac(command, description));
    aRequest.stdout('Snippet added: ' + snippet.first());

    aRequest.complete(TP.TSH_NO_VALUE);

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('snippet',
    TP.tsh.snippet.Type.getMethod('tshExecute'),
    'Allows addition and removal of commonly used snippets of TSH.',
    ':snippet [<snippet> [<description>]] [--hid=N] [--remove=N]',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
