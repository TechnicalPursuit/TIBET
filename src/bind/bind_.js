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
 * @type {bind:}
 * @summary This type represents the TIBET bind namespace
 *     (http://www.technicalpursuit.com/2005/binding) in the tag processing
 *     system.
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('bind.XMLNS');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.defineMethod('setup',
function(anElement) {

    /**
     * @method setup
     * @param {Element} anElement The element to set up.
     * @returns {null}
     */

    var tpElem;

    tpElem = TP.wrap(anElement);

    tpElem.rebuild(TP.hc('shouldDefine', true, 'shouldDestroy', false));

    return;
});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.defineMethod('teardown',
function(anElement) {

    /**
     * @method teardown
     * @param {Element} anElement The element to tear down.
     * @returns {null}
     */

    var tpElem;

    tpElem = TP.wrap(anElement);

    tpElem.rebuild(TP.hc('shouldDefine', false, 'shouldDestroy', true));

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
