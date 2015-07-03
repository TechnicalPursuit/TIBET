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
 * @type {TP.sig.UserIORequest}
 * @summary The common supertype used for all user IO requests. These requests
 *     are typically handled by the console, whose response is to provide the
 *     user with an input cell for entering a response.
 */

//  ------------------------------------------------------------------------

TP.sig.IORequest.defineSubtype('UserIORequest');

TP.sig.UserIORequest.addTraits(TP.sig.UserIOSignal);

TP.sig.UserIORequest.Type.resolveTrait('shouldLog', TP.sig.UserIOSignal);
TP.sig.UserIORequest.Type.resolveTrait('getSignalName', TP.sig.Signal);

TP.sig.UserIORequest.Inst.resolveTrait('resume', TP.core.JobStatus);

TP.sig.UserIORequest.Inst.resolveTraits(
    TP.ac('init', 'handle', 'recycle'),
    TP.sig.Request);

TP.sig.UserIORequest.Inst.resolveTraits(
    TP.ac('asDumpString', 'asHTMLString', 'asJSONSource', 'asPrettyString',
            'asRecursionString', 'asSource', 'asString', 'asXMLString', 'at',
            'atPut', 'copy', 'getProperty', 'getSignalName', 'isRecyclable',
            'removeKey', 'shouldLog'),
    TP.sig.Signal);

//  Finalize the traits right away as subtypes of this type are used during the
//  booting process.
TP.sig.UserIORequest.finalizeTraits();

TP.sig.UserIORequest.isSignalingRoot(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.UserIORequest.Type.defineAttribute('defaultPolicy',
                                            TP.INHERITANCE_FIRING);

TP.sig.UserIORequest.Type.defineAttribute('responseType',
                                            'TP.sig.UserIOResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
