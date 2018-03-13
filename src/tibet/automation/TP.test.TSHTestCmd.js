//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.test.TSHTestCmd}
 * @summary A command which exercises common shell functionality. This command
 *     is used in shell testing.
 */

//  ------------------------------------------------------------------------

TP.core.ActionTag.defineSubtype('test.TSHTestCmd');

TP.test.TSHTestCmd.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.test.TSHTestCmd.Type.defineMethod('cmdAddContent',
function(aRequest) {

    /**
     * @method cmdAddContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using an
     *     appending operation such as .>>.
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.test.TSHTestCmd.Type.defineMethod('cmdFilterInput',
function(aRequest) {

    /**
     * @method cmdFilterInput
     * @summary Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to filter standard input using a
     *     filter operation such as .|?.
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.test.TSHTestCmd.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @method cmdGetContent
     * @summary Invoked by the TSH when the receiver is the data source for a
     *     command sequence which is piping data from the receiver.
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.test.TSHTestCmd.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @method cmdRunContent
     * @summary Runs the receiver, effectively invoking its action. For
     *     TP.test.TSHTestCmd this method is responsible for dispatching all the
     *     variations of pipe methods which are suitable for use with a URI.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     */

    var shell,

        reportHash,

        attrs,
        len,
        i,

        item,
        name,

        values,
        originalValue,

        expandedValue,
        expandedTN,

        j,

        resolvedValue,
        resolvedTN;

    shell = aRequest.at('cmdShell');

    reportHash = TP.hc();

    //  all parameters should be named, those with tsh: prefixes are used
    //  by the enclosing request.
    attrs = shell.getArguments(aRequest, TP.ALLFORMS).getItems();
    len = attrs.getSize();
    for (i = 0; i < len; i++) {

        item = attrs.at(i);

        name = item.first();

        if (/^ARGV/.test(name)) {

            values = item.last();

            for (j = 0; j < values.getSize(); j++) {

                originalValue = values.at(j).first();
                expandedValue = values.at(j).last();

                if (TP.notDefined(expandedValue)) {
                    expandedValue = TP.UNDEF;
                    expandedTN = 'Undefined';
                } else if (TP.isNull(expandedValue)) {
                    expandedValue = TP.NULL;
                    expandedTN = 'Null';
                } else {
                    expandedTN = TP.tname(expandedValue);
                }

                if (originalValue.unquoted().quoted('\'') === originalValue) {
                    resolvedValue = expandedValue;
                } else {
                    resolvedValue = shell.resolveObjectReference(
                                    expandedValue, aRequest);
                }

                if (TP.notDefined(resolvedValue)) {
                    resolvedValue = TP.UNDEF;
                    resolvedTN = 'Undefined';
                } else if (TP.isNull(resolvedValue)) {
                    resolvedValue = TP.NULL;
                    resolvedTN = 'Null';
                } else {
                    resolvedTN = TP.tname(resolvedValue);
                }

                reportHash.atPut(
                    name + '[' + j + ']',
                    TP.hc(
                        'Original value tname', TP.tname(originalValue),
                        'Original value', originalValue,
                        'Expanded value tname', expandedTN,
                        'Expanded value', expandedValue,
                        'Resolved value tname', resolvedTN,
                        'Resolved value', resolvedValue
                        ));
            }
        } else {
            originalValue = item.last().first();
            expandedValue = item.last().last();

            if (TP.notDefined(expandedValue)) {
                expandedValue = TP.UNDEF;
                expandedTN = 'Undefined';
            } else if (TP.isNull(expandedValue)) {
                expandedValue = TP.NULL;
                expandedTN = 'Null';
            } else {
                expandedTN = TP.tname(expandedValue);
            }

            if (originalValue.unquoted().quoted('\'') === originalValue) {
                resolvedValue = expandedValue;
            } else {
                resolvedValue = shell.resolveObjectReference(
                                expandedValue, aRequest);
            }

            if (TP.notDefined(resolvedValue)) {
                resolvedValue = TP.UNDEF;
                resolvedTN = 'Undefined';
            } else if (TP.isNull(resolvedValue)) {
                resolvedValue = TP.NULL;
                resolvedTN = 'Null';
            } else {
                resolvedTN = TP.tname(resolvedValue);
            }

            reportHash.atPut(
                name,
                TP.hc(
                    'Original value tname', TP.tname(originalValue),
                    'Original value', originalValue,
                    'Expanded value tname', expandedTN,
                    'Expanded value', expandedValue,
                    'Resolved value tname', resolvedTN,
                    'Resolved value', resolvedValue
                    ));
        }
    }

    aRequest.stdout(reportHash);

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------

TP.test.TSHTestCmd.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @method cmdSetContent
     * @summary Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.test.TSHTestCmd.Type.defineMethod('cmdTransformInput',
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

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.test.TSHTestCmd.Type.defineMethod('tshCompile',
function(aRequest) {

    /**
     * @method tshCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Array} An array containing the new node and a TSH loop control
     *     constant, TP.DESCEND by default.
     */

    var node,
        newNode;

    //  Don't copy attributes with defaulting of namespaces, just leave them
    //  as they were input.
    node = aRequest.at('cmdNode');
    newNode = TP.elementBecome(
                    node,
                    'code',
                    TP.hc('class', 'tibet-action'),
                    TP.w3.Xmlns.XHTML);

    return TP.ac(newNode, TP.DESCEND);
});

//  ------------------------------------------------------------------------

TP.test.TSHTestCmd.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. TP.CONTINUE and TP.BREAK are common values.
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
