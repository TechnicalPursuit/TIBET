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
 * @type {TP.tsh.as}
 * @summary A subtype of TP.core.ActionTag that takes stdin data and formats
 *     is via typical TIBET as() processing.
 */

//  ------------------------------------------------------------------------

TP.core.ActionTag.defineSubtype('tsh:as');

TP.tsh.as.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.as.Type.defineMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @method cmdTransformInput
     * @summary Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to transform standard input using a
     *     simple transform operation such as .|
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.tshExecute(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.as.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Executes a formatting or template transformation operation on
     *     the current value of stdin.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input.
     * @returns {TP.sig.ShellRequest} The request.
     */

    var shell,
        node,
        format,
        input,
        repeat,
        len,
        i,
        item,
        result;

    shell = aRequest.at('cmdShell');

    if (TP.notValid(node = aRequest.at('cmdNode'))) {
        return aRequest.fail();
    }

    //  'input' cannot be empty.
    if (TP.isEmpty(input = aRequest.stdin())) {
        return aRequest.fail(
            'Unable to find input for: ' + TP.str(node));
    }

    //  get our primary argument by adding true to our lookup call
    //  NB: We supply 'null' as the default value if 'tsh:format' wasn't
    //  specified.
    format = shell.getArgument(aRequest, 'tsh:format', null, true);

    //  'format' might be null, but we still do the work in case 'repeat' was
    //  specified or the -asis flag was specified. In this case, the
    //  'TP.format()' call below will just hand back the original object.

    //  NB: We supply 'false' as the default value if 'tsh:repeat' wasn't
    //  specified.
    repeat = shell.getArgument(aRequest, 'tsh:repeat', false);

    /* eslint-disable no-loop-func */

    len = input.getSize();
    for (i = 0; i < len; i++) {
        item = input.at(i);
        if (TP.isTrue(aRequest.at('cmdIterate'))) {
            if (TP.canInvoke(item, 'collect')) {
                result = item.collect(
                            function(it) {

                                return TP.format(
                                            it,
                                            format,
                                            TP.hc('repeat', repeat));
                            });
            } else {
                result = TP.format(item, format, TP.hc('repeat', repeat));
            }
        } else {
            result = TP.format(item, format, TP.hc('repeat', repeat));
        }

        aRequest.stdout(result);
    }

    /* eslint-enable no-loop-func */

    aRequest.complete();

    return;
});


//  ------------------------------------------------------------------------
//
TP.core.TSH.addHelpTopic('as',
    TP.tsh.as.Type.getMethod('tshExecute'),
    'Transforms stdin and writes it to stdout.',
    ':as',
    '');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
