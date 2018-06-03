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
 * @type {TP.tsh.bookmark}
 * @summary A subtype of TP.tag.ActionTag that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:bookmark');

TP.tsh.bookmark.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.bookmark.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @param {TP.sig.Request} aRequest The request containing path input for
     *     the shell.
     * @returns {TP.sig.Request} The request.
     */

    var shell,

        arg0,
        arg1,

        isRemove,

        bookmarks,
        bookmarkNum,
        bookmark,

        path,
        description,

        defaultStr,
        descriptionReq;

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
                'The :bookmark command requires a loaded and enabled Sherpa');
        aRequest.complete(TP.TSH_NO_VALUE);

        return aRequest;
    }

    arg0 = shell.getArgument(aRequest, 'ARG0');
    arg1 = shell.getArgument(aRequest, 'ARG1');

    isRemove = shell.getArgument(aRequest, 'tsh:remove', false);

    bookmarks = TP.uc('urn:tibet:sherpa_bookmarks').getResource().get('result');

    //  First form - remove the 3rd bookmark:
    //  :bookmark --remove 3

    bookmarkNum = TP.nc(arg0);
    if (TP.isTrue(isRemove)) {
        if (TP.isNumber(bookmarkNum)) {
            bookmark = bookmarks.at(bookmarkNum);

            bookmarks.remove(bookmark);

            aRequest.stdout('bookmark removed: ' + bookmark.first());
            aRequest.complete(TP.TSH_NO_VALUE);
        } else {
            aRequest.stdout('bookmark removal requires numeric index');
            aRequest.complete(TP.TSH_NO_VALUE);
        }

        return aRequest;
    }

    path = arg0;
    description = arg1;

    //  Second form - add the bookmark and prompt for the description
    //  :bookmark 'pathPart1/pathPart2'

    if (TP.isEmpty(description) && TP.notEmpty(path)) {

        if (TP.notEmpty(path)) {

            defaultStr = 'Description for bookmark';
            descriptionReq = TP.sig.UserInputRequest.construct(
                                    TP.hc('query', 'Bookmark description:',
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
                                TP.hc('output', 'Invalid bookmark description',
                                        'async', true));

                        invalidDescriptionReq.isError(true);
                        invalidDescriptionReq.fire(shell);
                    } else {

                        bookmarks.add(TP.ac(path, descriptionResult));

                        validDescriptionReq =
                            TP.sig.UserOutputRequest.construct(
                                TP.hc(
                                'output', 'Bookmark to: "' + path + '" added',
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
        }

        //  Note how we do *not* complete the request before returning... we
        //  complete it in the handler above.
        return aRequest;
    }

    //  Last form - add the bookmark from scratch:
    //  :bookmark 'pathPart1/pathPart2' 'This is a cool bookmark'

    //  If either argument is empty, we dump usage.
    if (TP.isEmpty(path) || TP.isEmpty(description)) {
        return this.printUsage(aRequest);
    }

    bookmarks.add(TP.ac(path, description));
    aRequest.stdout('Bookmark to: "' + path + '" added');

    aRequest.complete(TP.TSH_NO_VALUE);

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('bookmark',
    TP.tsh.bookmark.Type.getMethod('tshExecute'),
    'Allows addition and removal of commonly used bookmarks of the Sherpa' +
        ' Inspector.',
    ':bookmark [<path> [<description>]] [--delete=N]',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
