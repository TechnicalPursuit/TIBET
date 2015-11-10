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
 * @type {TP.sherpa.snippetbar}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('sherpa:snippetbar');

TP.sherpa.snippetbar.Inst.defineAttribute(
        'body',
        {value: TP.cpc('> .body', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.snippetbar.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     */

    alert('hi');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
