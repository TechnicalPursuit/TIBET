//  ========================================================================
/*
NAME:   tsh_test.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

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
        obj;

    TP.debug('break.tsh_test');

    suite = TP.sys.getTypeByName('TP.test.Suite');
    if (TP.notValid(suite)) {
        aRequest.fail(TP.FAILURE, 'Unable to find TP.test.Suite.');
        return;
    }

    shell = aRequest.at('cmdShell');

    ignore_only = shell.getArgument(aRequest, 'tsh:ignore_only', false);
    ignore_skip = shell.getArgument(aRequest, 'tsh:ignore_skip', false);
    options = TP.hc('ignore_only', ignore_only, 'ignore_skip', ignore_skip);

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

        obj.runTestSuites(options).then(
            function(result) {
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
