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
 * @type {tsh.Element}
 * @summary The root type for all tsh: action tags and command elements.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('tsh.Element');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.tsh.Element.isAbstract(true);

//  ------------------------------------------------------------------------

TP.tsh.Element.Type.defineMethod('showDebug',
function(aRequest, expandArguments, resolveArguments) {

    /**
     * @method showDebug
     * @summary Prints debugging information about the tag, including the full
     *     XML information that got generated when the source code was
     *     'desugared' and all different values of the passed arguments.
     * @param {TP.sig.Request} aRequest The shell request to print debugging
     *     information for.
     * @param {Boolean} expandArguments Whether or not to show the 'expanded'
     *     value for arguments. The default is true.
     * @param {Boolean} resolveArguments Whether or not to show the 'resolved'
     *     value for arguments. The default is false.
     */

    var shell,

        requestKeys,
        reportHash,

        payload,

        argsReportHash,

        attrs,
        len,
        i,

        item,
        name,

        values,
        originalValue,

        valueDict,

        expandedValue,
        expandedTN,

        j,

        resolvedValue,
        resolvedTN;

    shell = aRequest.at('cmdShell');

    reportHash = TP.hc();

    payload = aRequest.getPayload();
    requestKeys = payload.getKeys();

    len = requestKeys.getSize();
    for (i = 0; i < len; i++) {
        reportHash.atPut(
            requestKeys.at(i),
            TP.xmlLiteralsToEntities(TP.str(payload.at(requestKeys.at(i)))));
    }

    argsReportHash = TP.hc();

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
                valueDict = TP.hc(
                    'Original value tname', TP.tname(originalValue),
                    'Original value', originalValue);

                if (TP.notFalse(expandArguments)) {
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

                    valueDict.add(
                        'Expanded value tname', expandedTN,
                        'Expanded value', expandedValue);
                }

                if (TP.isTrue(resolveArguments)) {

                    resolvedValue = shell.resolveObjectReference(
                                        expandedValue, aRequest);

                    if (TP.notDefined(resolvedValue)) {
                        resolvedValue = TP.UNDEF;
                        resolvedTN = 'Undefined';
                    } else if (TP.isNull(resolvedValue)) {
                        resolvedValue = TP.NULL;
                        resolvedTN = 'Null';
                    } else {
                        resolvedTN = TP.tname(resolvedValue);
                    }

                    valueDict.add(
                        'Resolved value tname', resolvedTN,
                        'Resolved value', resolvedValue);
                }

                argsReportHash.atPut(
                    name + '[' + j + ']',
                    valueDict);
            }
        } else {
            originalValue = item.last().first();
            valueDict = TP.hc(
                'Original value tname', TP.tname(originalValue),
                'Original value', originalValue);

            if (TP.notFalse(expandArguments)) {
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

                valueDict.add(
                    'Expanded value tname', expandedTN,
                    'Expanded value', expandedValue);
            }

            if (TP.isTrue(resolveArguments)) {
                resolvedValue = shell.resolveObjectReference(
                                        expandedValue, aRequest);

                if (TP.notDefined(resolvedValue)) {
                    resolvedValue = TP.UNDEF;
                    resolvedTN = 'Undefined';
                } else if (TP.isNull(resolvedValue)) {
                    resolvedValue = TP.NULL;
                    resolvedTN = 'Null';
                } else {
                    resolvedTN = TP.tname(resolvedValue);
                }

                valueDict.add(
                    'Resolved value tname', resolvedTN,
                    'Resolved value', resolvedValue);
            }

            argsReportHash.atPut(
                name,
                valueDict);
        }
    }

    reportHash.atPut('ARGS:', argsReportHash);

    aRequest.stdout(reportHash);

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
