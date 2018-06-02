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
 * @type {TP.tsh.history}
 * @summary Provides support for constrained history expansion during command
 *     processing. This is a subset of standard shell history referencing which
 *     is focused on accessing entire commands and reinvoking them.
 * @summary Traditional shell history substitution is literally
 *     that...substitution of some or all of a prior command's text into the
 *     current command input stream. The tsh:history tag does that to a certain
 *     extent, but there are some clear differences between goals. This tag's
 *     purpose is to make it easy to reinvoke a previous command by number,
 *     name, or regex match. To the extent that this is done by reprocessing the
 *     prior command's text as a new buffer you can consider it substitution.
 *     However, the tsh:history mechanism does not work inside of strings and it
 *     only partially concerns itself with "word" access within a prior command
 *     buffer.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:history');

TP.tsh.history.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.tsh.history.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @method cmdRunContent
     * @summary
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object}
     */

    var shell,

        hid,

        str,
        req,
        output,
        isEdit,
        origReq;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    hid = shell.getArgument(aRequest, 'tsh:hid', null, false);

    //  Initial ! is stripped by desugaring so we have just the "second char"
    //  which should either be ? or blank for "all history" shorthand.
    if (TP.isEmpty(hid) || hid === '?') {
        output = '<dl>';
        shell.get('history').perform(
                        function(aShellReq) {
                            var id;

                            id = aShellReq.at('cmdHistoryID');
                            output +=
                                '<dt>' +
                                    '<a href="#" onclick="TP.bySystemId(\'SherpaConsoleService\').sendConsoleRequest(\':snippet hid=' + id + '\'); return false;">' +
                                    '+' +
                                    '</a>' +
                                    '&#160;&#160;' +
                                    '<a href="#" onclick="TP.bySystemId(\'SherpaConsoleService\').sendConsoleRequest(\'!' + id + '\'); return false;">' +
                                    '!' + id +
                                    '</a>' +
                                    '&#160;&#160;' +
                                    '<a href="#" onclick="TP.bySystemId(\'SherpaConsoleService\').sendConsoleRequest(\'#' + id + '\'); return false;">' +
                                    '#' + id +
                                    '</a>' +
                                '</dt>' +
                                '<dd>' +
                //  We don't use a CDATA section here because we can't copy and
                //  paste entries from history on Chrome when we do:
                //  https://bugs.chromium.org/p/chromium/issues/detail?id=696551
                                    TP.xmlLiteralsToEntities(
                                                    aShellReq.at('cmd')) +
                                '</dd>';
                        });

        output += '</dl>';

        aRequest.atPut('cmdAsIs', true);

        return aRequest.complete(output);
    }

    hid = TP.str(hid);
    str = this.translateHistoryReference(hid, aRequest, shell, false);
    if (TP.isEmpty(str)) {
        //  report on specific error should come from translation
        aRequest.fail();
        return;
    }

    //  if no translation really occurred then we should terminate
    if (str === hid) {
        aRequest.fail(
            TP.sc('History translation failed.'));
        return;
    }

    //  if we got history back we can't process that...
    if (str.indexOf('tsh:history') !== TP.NOT_FOUND) {
        aRequest.fail(
            TP.sc('Recursive history translation unsupported.'));
        return;
    }

    //  aRequest's 'rootRequest's (if it has one) 'cmd' will be something
    //  like '!1', but we want the title text to be that of the command that
    //  we're executing.
    if (TP.notValid(origReq = aRequest.at('rootRequest'))) {
        origReq = aRequest;
    }

    isEdit = shell.getArgument(aRequest, 'tsh:edit', false, false);
    if (TP.bc(isEdit)) {
        req = TP.sig.ConsoleRequest.construct(
                                    TP.hc('cmd', 'input', 'body', str));
        req.fire(shell);

        //  This is a bit hackish - having to put the cmdInput flag on the
        //  response to avoid having the console blow away the input cell
        //  content...
        origReq.getResponse().atPut('cmdInput', true);

        return aRequest.complete(TP.TSH_NO_VALUE);
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

TP.tsh.history.Type.defineMethod('translateHistoryReference',
function(aString, aRequest, aShell, expand) {

    /**
     * @method translateHistoryReference
     * @summary Translates a history reference to the appropriate replacement
     *     string. History entries come in the form #n[:w] where the N can be an
     *     absolute or relative reference to a history entry and W represents a
     *     word specifier.
     * @param {String} aString The history reference to replace.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @param {TP.shell.Shell} aShell The shell handling processing and holding
     *     the history list.
     * @returns {String|undefined} The history replacement.
     */

    var rest,

        arr,
        token,

        parts,
        re,

        cmd,

        index,
        num,

        ref,
        tail,
        ndx,
        found,

        str,

        reg,
        list,
        i;

    //  initialize rest to empty string. we'll reset as needed during
    //  processing
    rest = '';

    //  ---
    //  command access
    //  ---

    if (aString === '!') {
        //  entry is the last command
        cmd = aShell.getHistory(-1, expand);
    } else if (aString.charAt(0) === '/') {
        //  should be able to tokenize a regex token from the string which
        //  will help avoid noise around embedded symbols like :
        arr = TP.$tokenize(aString);
        token = arr.at(0);
        if (TP.notValid(token) || token.name !== 'regexp') {
            aRequest.fail(
                TP.sc('Invalid history regex specification'));

            return;
        }

        parts = token.value.split('/');
        re = TP.rc(RegExp.escapeMetachars(parts.at(1)), parts.at(2));
        if (TP.notValid(re)) {
            aRequest.fail(
                TP.sc('Invalid history regex specification'));

            return;
        }

        //  constructed the regex, now off to find the command :)
        cmd = aShell.getHistory(re, expand);
    } else if (/^[\-0-9]/.test(aString)) {
        //  numerical with/without '-' prefixing. split off any word portion
        //  and find the command at that index if possible.
        parts = aString.split(':');
        index = parts.at(0);

        num = index === '0' ? 0 : parseInt(index, 10);
        if (!TP.isNumber(num)) {
            aRequest.fail(
                TP.sc('Invalid history index.'));

            return;
        }

        //  If the user specified a negative index, then we need to adjust the
        //  index to be the current history list size minus that number of
        //  entries (per normal sh behavior)
        if (aString.charAt(0) === '-') {
            //  Note we add here. Since value is negative,we'll back up.
            num = aShell.getHistory().getSize() + num;
        }

        cmd = aShell.getHistory(num, expand);
    } else {
        //  alpha reference, but not a regex...? exact match for start
        cmd = aShell.getHistory(aString, expand);
    }

    //  if we didn't find a command no point in continuing. also, if the command
    //  we did find is just the current entry we're looking for, it's
    //  nonsensical to continue - it's self-referential and will result in an
    //  endless recursion.
    /* eslint-disable no-extra-parens */
    if (TP.isEmpty(cmd) || (cmd === '!' + aString)) {
        aRequest.fail(
            TP.sc('Unable to find specified history entry.'));

        return;
    }
    /* eslint-enable no-extra-parens */

    if (cmd === '!' || cmd === '!?') {
        return ':history';
    }

    //  if we got a reference to another history execution do a deeper
    //  translation
    while (/^!\d*/.test(cmd)) {
        cmd = this.translateHistoryReference(
            cmd.slice(1), aRequest, aShell, expand);

        //  If we translated from a numeric reference try to push the translated
        //  text back up to the root request so it's reflected in history rather
        //  than a reference to a numerical entry.
        if (TP.notEmpty(cmd)) {
            if (aRequest.at('rootRequest')) {
                aRequest.at('rootRequest').atPut('cmd', cmd);
            } else {
                aRequest.atPut('cmd', cmd);
            }
        }
    }

    //  ---
    //  word access
    //  ---

    if (!TP.regex.HAS_COLON.test(aString)) {
        //  no word specifier...we're done
        return cmd;
    }

    //  the history reference is any portion ahead of an optional word
    //  specifier (:), which _must_ not be the first char since we allow
    //  searches to include command text such as :history
    if (TP.regex.HAS_COLON.test(aString)) {
        //  tricky part here is that if we're looking at :alpha then it's
        //  probably a request for an old command
        if (/^:[^\+\-0-9]/.test(aString)) {
            ref = aString;
        } else if (/^:/.test(aString)) {
            ref = '!' + aString;

            arr = ref.split(':');
            ref = arr.at(0);

            if (arr.getSize() > 1) {
                arr.shift();
                //  tail = arr.join('');
            }
        } else {
            arr = aString.split(':');
            ref = arr.at(0);

            arr.shift();
            tail = arr.join('');
        }
    } else {
        ref = aString;
    }

    //  if start is a +/- we're a relative address, else absolute
    if (/^[+\-]/.test(ref)) {
        //  relative, question is do we have an offset?
        if (ref.getSize() === 1) {
            //  +/- only so our index is just 1
            ndx = 1;
        } else {
            //  more than just +/- so we need to see what's there
            ndx = ref.slice(1);
            if (/^[0-9]/.test(ndx)) {
                if (TP.isNaN(parseInt(ndx, 10))) {
                    //  might be a #-2.doMore() where the .doMore() is being
                    //  added to the history reference

                    /* eslint-disable no-extra-parens */
                    if ((found = ndx.match(/[^0-9]/))) {
                    /* eslint-enable no-extra-parens */
                        //  have to split at boundary between numbers and
                        //  text
                        ndx = ndx.slice(0, found);
                        rest = ndx.slice(found);
                    } else {
                        aRequest.fail(
                            TP.sc('Invalid history index.'));

                        return;
                    }
                } else {
                    //  just a number with no trailing non-numerics
                    ndx = parseInt(ndx, 10);
                }
            } else {
                //  didn't follow +/- with a number...not valid
                aRequest.fail(
                    TP.sc('Invalid history index.'));

                return;
            }
        }

        if (ref.charAt(0) === '+') {
            ndx = aShell.get('historyIndex') + ndx - 1;
            str = aShell.getHistory(ndx);
        } else {
            ndx = aShell.get('historyIndex') - ndx - 1;
            str = aShell.getHistory(ndx);
        }
    } else {
        //  absolute reference

        //  does it start with a number? if so we need to look for the
        //  specific numeric reference
        if (/^[0-9]/.test(ref)) {
            if (TP.isNaN(parseInt(ref, 10))) {
                //  might be a #23.doMore() where the .doMore() is being
                //  added to the history reference

                /* eslint-disable no-extra-parens */
                if ((found = ndx.match(/[^0-9]/))) {
                /* eslint-enable no-extra-parens */
                    //  have to split at boundary between numbers and text
                    ndx = ndx.slice(0, found);
                    rest = ndx.slice(found);
                } else {
                    aRequest.fail(
                        TP.sc('Invalid history index.'));

                    return;
                }
            } else {
                str = aShell.getHistory(parseInt(ref, 10));
            }
        } else {
            //  must be # or an alpha reference
            if (/^!/.test(ref)) {
                //  ## means the same as !! (last entry)
                ndx = aShell.get('historyIndex') - 1;
                str = aShell.getHistory(ndx);

                //  pull off the # and process any word/rest text
                ref = ref.slice(1);

                if (TP.notValid(tail)) {
                    rest = ref;
                }
            } else if (/^\?/.test(ref)) {
                //  dump the history list
                return ':history';
            } else {
                //  looks like an alpha reference which we treat like
                //  a regex and try to find in the list
                str = '';
                reg = TP.rc('^' + ref);
                list = aShell.get('history');

                for (i = list.getSize() - 1; i >= 0; i--) {
                    if (reg.test(str = aShell.getHistory(i))) {
                        break;
                    }
                }
            }
        }
    }

    //  if there was no tail (word index) just return the string
    if (TP.notValid(tail)) {
        return TP.ifInvalid(str + rest, '');
    }

    //  found a word index so process it on the current string
    if (TP.isNaN(parseInt(tail, 10))) {
        //  might be a #23:1.doMore() where the .doMore() is being
        //  added to the history reference
        /* eslint-disable no-extra-parens */
        if ((found = tail.match(/[^0-9]/))) {
        /* eslint-enable no-extra-parens */
            //  have to split at boundary between numbers and text
            ndx = tail.slice(0, found);
            rest = tail.slice(found);
        } else {
            aRequest.fail(
                TP.sc('Invalid history index.'));

            return;
        }
    } else {
        ndx = tail;
    }

    str = str.split(' ').at(ndx);

    return TP.isString(str) ? str + rest : '';
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('history',
    TP.tsh.history.Type.getMethod('cmdRunContent'),
    'Displays a list of recent commands.',
    ':history [--hid] [--edit]',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
