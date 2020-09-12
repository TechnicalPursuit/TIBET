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
 * @type {TP.lama.about}
 */

//  ------------------------------------------------------------------------

TP.lama.TemplatedTag.defineSubtype('about');

//  ------------------------------------------------------------------------

TP.lama.about.Inst.defineHandler('Feedback',
function(aSignal) {

    /**
     * @method handleFeedback
     * @summary Handles notification of when the receiver wants to provide
     *     feedback to Technical Pursuit Inc.
     * @param {TP.sig.Feedback} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.lama.about} The receiver.
     */

    TP.open('mailto:tibet@technicalpursuit.com?subject=TIBET Feedback');

    this.signal('UIToggle');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.about.Inst.defineHandler('Help',
function(aSignal) {

    /**
     * @method handleHelp
     * @summary Handles notification of when the receiver wants to obtain help
     *     from Technical Pursuit Inc.
     * @param {TP.sig.Help} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.lama.about} The receiver.
     */

    TP.open('https://www.technicalpursuit.com/support.xhtml', '_blank');

    this.signal('UIToggle');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.about.Inst.defineHandler('Issue',
function(aSignal) {

    /**
     * @method handleIssue
     * @summary Handles notification of when the receiver wants to file an issue
     *     with Technical Pursuit Inc.
     * @param {TP.sig.Issue} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.lama.about} The receiver.
     */

    TP.open('https://github.com/TechnicalPursuit/TIBET/issues', '_blank');

    this.signal('UIToggle');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
