//  ========================================================================
/*
NAME:   tsh_lint.js
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
 * @type {TP.tsh.lint}
 * @synopsis A command tag capable of running a "lint" operation on one or more
 *     objects/functions.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:lint');

TP.tsh.lint.addTraitsFrom(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.lint.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @name cmdRunContent
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object}
     * @abstract
     * @todo
     */

    var node,
        shell,
        target,
    
        obj;

    TP.debug('break.tsh_lint');

    node = aRequest.at('cmdNode');
    shell = aRequest.at('cmdShell');

    target = shell.getArgument(aRequest, 'ARG0');
    if (TP.isEmpty(target)) {
        aRequest.stdout('Assembling full coverage worklist.');
    } else {
        // Try to resolve object reference.
        obj = shell.resolveObjectReference(target, aRequest);
        if (TP.notValid(obj)) {
            aRequest.fail(TP.FAILURE, 'Unable to resolve object: ' + target);
            return;
        }
        aRequest.stdout('Assembling ' + target + '-only worklist.');
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
