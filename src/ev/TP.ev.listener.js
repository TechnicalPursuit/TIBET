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
 * @type {ev:listener}
 * @summary A wrapper for the XML Events ev:listener element.
 * @summary The official XML Events listener element is considered by some
 *     to be superfluous since you can place ev: attributes on elements to
 *     event-enable them. Of course, you can XInclude listener elements as one
 *     way of getting "value" from them by allowing you to factor them out into
 *     reusable blocks of event handler support.
 */

//  ------------------------------------------------------------------------

TP.tag.InfoTag.defineSubtype('ev:listener');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
