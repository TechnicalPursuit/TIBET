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
 * @type {TP.sherpa.about}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('about');

//  ------------------------------------------------------------------------

TP.sherpa.about.Inst.defineHandler('Feedback',
function(aSignal) {

    TP.open('mailto:tibet@technicalpursuit.com?subject=TIBET Feedback');

    this.signal('UIToggle');

    return this;
});

TP.sherpa.about.Inst.defineHandler('Help',
function(aSignal) {

    TP.open('https://www.technicalpursuit.com/support.xhtml', '_blank');

    this.signal('UIToggle');

    return this;
});

TP.sherpa.about.Inst.defineHandler('Issue',
function(aSignal) {

    TP.open('https://github.com/TechnicalPursuit/TIBET/issues', '_blank');

    this.signal('UIToggle');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
