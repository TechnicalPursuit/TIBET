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
 * @type {on:}
 * @summary This type represents the TIBET on namespace
 *     (http://www.technicalpursuit.com/2005/on) in the tag processing system.
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('on.XMLNS');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.on.XMLNS.Type.defineMethod('setup',
function(anElement) {

    /**
     * @method setup
     * @param {Element} anElement The element to set up.
     * @returns {null}
     */

    var onAttrNodes;

    if (TP.notEmpty(onAttrNodes = TP.elementGetAttributeNodesInNS(
                            anElement, null, TP.w3.Xmlns.ON))) {
        //TP.info('on namespace attach: ' + TP.str(onAttrNodes));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.on.XMLNS.Type.defineMethod('teardown',
function(anElement) {

    /**
     * @method teardown
     * @param {Element} anElement The element to tear down.
     * @returns {null}
     */

    var onAttrNodes;

    if (TP.notEmpty(onAttrNodes = TP.elementGetAttributeNodesInNS(
                            anElement, null, TP.w3.Xmlns.ON))) {
        //TP.info('on namespace detach: ' + TP.str(onAttrNodes));
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
