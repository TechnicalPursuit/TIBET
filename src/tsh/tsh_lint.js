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
