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
 * @synopsis The common supertype used for all user IO requests. These requests
 *     are typically handled by the console, whose response is to provide the
 *     user with an input cell for entering a response.
 */

//  ------------------------------------------------------------------------

TP.sig.IORequest.defineSubtype('UserIORequest');

TP.sig.UserIORequest.addTraits(TP.sig.UserIOSignal);
TP.sig.UserIORequest.Type.resolveTraits(
    TP.ac('shouldLog', 'getSignalName'),
    TP.sig.UserIORequest);

TP.sig.UserIORequest.Inst.resolveTraits(
    TP.ac('asDumpString', 'asHTMLString', 'asJSONSource', 'asPrettyString',
            'asRecursionString', 'asSource', 'asString', 'asXMLString', 'at',
            'atPut', 'copy', 'getProperty', 'getSignalName', 'handle', 'init',
            'isRecyclable', 'recycle', 'removeKey', 'shouldLog'),
    TP.sig.UserIORequest);

//  LOOK AT THE END OF THIS TYPE DEFINITION AFTER THE TYPE IS FULLY DEFINED FOR
//  TRAIT FINALIZATION

TP.sig.UserIORequest.Type.defineAttribute('defaultPolicy', TP.INHERITANCE_FIRING);

TP.sig.UserIORequest.isSignalingRoot(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.UserIORequest.Type.defineAttribute('responseType', 'TP.sig.UserIOResponse');

//  Resolve the traits right away as subtypes of this type are used during the
//  booting process.
TP.sig.UserIORequest.finalizeTraits();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
