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
 * @summary Provides support for snippet expansion during command processing.
 *     Snippets are "pinned history" events which are saved independently and
 *     not cleared when/if history is cleared.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:snippet');

TP.tsh.snippet.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.tsh.snippet.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @method cmdRunContent
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object}
     * @abstract
     */

    var node,
        shell,

        hid,

        entries,

        str,
        req,
        output,
        isEdit,
        origReq;

    node = aRequest.at('cmdNode');
    shell = aRequest.at('cmdShell');

    sid = TP.elementGetAttribute(node, 'tsh:sid', true);
    //  Initial # is stripped by desugaring so we have just the "second char"
    //  which should either be ? or blank for "all snippets" shorthand.
    if (TP.isEmpty(sid) || sid === '?') {
        entries = TP.hc();
        output = '<dl>';
        shell.get('snippets').perform(
                        function(aShellReq, index) {
                            var id;

                            id = index;
                            output += '<dt>' +
                                '<a href="#" onclick="TP.bySystemId(\'SherpaConsoleService\').sendConsoleRequest(\'#' +
                                id + '\'); return false;">#' +
                                id + '</a>' +
                            '</dt>' +
                            '<dd><![CDATA[' +
                                aShellReq.at('cmd') +
                            ']]></dd>';
                        });

        aRequest.atPut('cmdAsIs', true);
        output += '</dl>'
        return aRequest.complete(output);
    }

    //  Snippet access is relatively simply, you have an indexed set and you run
    //  them by number.
    entry = shell.get('snippets').at(sid);
    if (TP.isString(entry)) {
        str = entry;
    } else {
        str = entry.at('cmd');
    }

    if (TP.isEmpty(str)) {
        //  report on specific error should come from translation
        aRequest.fail('Unable to find snippet #' + hid);
        return;
    }

    //  if no translation really occurred then we should terminate
    if (str === hid) {
        aRequest.fail(
            TP.sc('Snippet lookup failed.'));
        return;
    }

    //  Construct a new request that can process the history event and
    //  notify the current request when complete.
    req = TP.sig.ShellRequest.construct(
            TP.hc('cmd', str,
                    'cmdAllowSubs', aRequest.at('cmdAllowSubs'),
                    'cmdAsIs', aRequest.at('cmdAsIs'),
                    'cmdExecute', true,
                    //  Do not make a history entry for this request. A history
                    //  entry will be made for the main request that started us.
                    'cmdHistory', false,
                    //  Do not build GUI for this request.
                    'cmdBuildGUI', false,
                    'cmdLiteral', aRequest.at('cmdLiteral'),
                    'cmdPeer', aRequest,
                    'cmdPhases', aRequest.at('cmdPhases'),
                    'cmdRecycle', aRequest.at('cmdRecycle'),
                    //  We configure this request as silent since we don't want
                    //  it to output to stdout. We will output its result
                    //  through the main request that started us in the
                    //  'completeJob' below.
                    'cmdSilent', true
            ));

    origReq.atPut('cmdTitle', str);

    req.defineMethod('cancelJob',
        function(aFaultString, aFaultCode, aFaultInfo) {

            return aRequest.cancel(aFaultString, aFaultCode, aFaultInfo);
        });
    req.defineMethod('completeJob',
        function(aResult) {

            return aRequest.complete(aResult || req.getResult());
        });
    req.defineMethod('failJob',
        function(aFaultString, aFaultCode, aFaultInfo) {

            return aRequest.fail(aFaultString, aFaultCode, aFaultInfo);
        });

    //  run that baby!
    shell[TP.composeHandlerName('ShellRequest')](req);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
