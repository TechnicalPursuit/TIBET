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

TP.sig.UserIORequest.addTraitsFrom(TP.sig.UserIOSignal);
TP.sig.UserIORequest.Type.resolveTraits(
    TP.ac('shouldLog', 'getSignalName'),
    TP.sig.UserIORequest);
TP.sig.UserIORequest.Inst.resolveTraits(
    TP.ac('asSource', 'asDumpString', 'asHTMLString', 'asJSONSource',
            'asPrettyString', 'asXMLString', 'asString', 'at', 'atPut',
            'getSignalName', 'getProperty', 'copy', 'shouldLog', 'init',
            'handle', 'isRecyclable', 'recycle'),
    TP.sig.UserIORequest);

//  Resolve the traits right away as subtypes of this type are used during the
//  booting process.
TP.sig.UserIORequest.executeTraitResolution();

TP.sig.UserIORequest.Type.defineAttribute('defaultPolicy', TP.INHERITANCE_FIRING);

TP.sig.UserIORequest.isSignalingRoot(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.UserIORequest.Type.defineAttribute('responseType', 'TP.sig.UserIOResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

