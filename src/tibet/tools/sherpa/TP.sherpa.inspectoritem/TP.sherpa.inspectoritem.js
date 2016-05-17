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
 * @type {TP.sherpa.inspectoritem}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('inspectoritem');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.inspectoritem.Inst.defineAttribute('config');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.inspectoritem.Inst.defineMethod('getBayIndex',
function() {

    /**
     * @method getBayIndex
     * @summary
     * @param
     */

    var inspectorTPElem;

    inspectorTPElem = this.getParentNode();

    return inspectorTPElem.getChildIndex(this.getNativeNode());
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
