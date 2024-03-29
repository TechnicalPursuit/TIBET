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
 * @type {TP.sig.UserIOResponse}
 * @summary A type used as the common response type for TP.sig.UserIORequests.
 */

//  ------------------------------------------------------------------------

TP.sig.IOResponse.defineSubtype('UserIOResponse');

TP.sig.UserIOResponse.addTraitTypes(TP.sig.UserIOSignal);

TP.sig.UserIOResponse.Type.resolveTrait('shouldLog', TP.sig.UserIOSignal);
TP.sig.UserIOResponse.Type.resolveTrait('getSignalName', TP.sig.Signal);

TP.sig.UserIOResponse.Inst.resolveTrait('resume', TP.core.JobStatus);

TP.sig.UserIOResponse.Inst.resolveTrait('init', TP.sig.Response);

TP.sig.UserIOResponse.Inst.resolveTraits(
    TP.ac('asDumpString', 'asHTMLString', 'asJSONSource', 'asPrettyString',
            'asRecursionString', 'asSource', 'asString', 'asXMLString', 'at',
            'atPut', 'copy', 'getProperty', 'getSignalName', 'isRecyclable',
            'recycle', 'removeKey', 'shouldLog'),
    TP.sig.Signal);

//  ========================================================================
//  TP.sig.UserOutput
//  ========================================================================

/**
 * @type {TP.sig.UserOutput}
 * @summary A common type for holding output generated by the user.
 */

//  ------------------------------------------------------------------------

TP.sig.UserIOResponse.defineSubtype('UserOutput');

//  ========================================================================
//  TP.sig.UserInput
//  ========================================================================

/**
 * @type {TP.sig.UserInput}
 * @summary The type used to contain input from the user. This is the primary
 *     form of TP.sig.UserIOResponse used by the console.
 */

//  ------------------------------------------------------------------------

TP.sig.UserIOResponse.defineSubtype('UserInput');

//  ========================================================================
//  TP.sig.UserInputEntry
//  ========================================================================

/**
 * @type {TP.sig.UserInputEntry}
 * @summary A response containing a single entry of user input in what will
 *     likely be a series of query/response pairs. This type is used by the
 *     TP.sig.UserInputSeries request type as its response type.
 */

//  ------------------------------------------------------------------------

TP.sig.UserInput.defineSubtype('UserInputEntry');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
