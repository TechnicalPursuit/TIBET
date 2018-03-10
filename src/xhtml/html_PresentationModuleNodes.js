//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.html.b
//  ========================================================================

/**
 * @type {TP.html.b}
 * @summary 'b' tag. Bold font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('b');

//  ========================================================================
//  TP.html.big
//  ========================================================================

/**
 * @type {TP.html.big}
 * @summary 'big' tag. Bigger font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('big');

//  ========================================================================
//  TP.html.data (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.data}
 * @summary 'data' tag. A tag that links content with a machine-readable
 *     translation.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('data');

//  ------------------------------------------------------------------------

TP.html.data.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the value of the receiver.
     * @returns {String} The receiver's formatted input value.
     */

    return this.getNativeNode().value;
});

//  ------------------------------------------------------------------------

TP.html.data.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the value of the receiver.
     * @returns {TP.html.data} The receiver.
     */

    this.getNativeNode().value = TP.str(aValue);

    return this;
});

//  ========================================================================
//  TP.html.details (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.details}
 * @summary 'details' tag. Represents additional information which the user can
 *     obtain on demand.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('details');

TP.html.details.Type.set('booleanAttrs', TP.ac('open'));

//  ========================================================================
//  TP.html.dialog (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.dialog}
 * @summary 'dialog' tag. Defines a dialog box or window.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('dialog');

TP.html.dialog.Type.set('booleanAttrs', TP.ac('open'));

//  ========================================================================
//  TP.html.hr
//  ========================================================================

/**
 * @type {TP.html.hr}
 * @summary 'hr' tag. Horizontal rule.
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('hr');

TP.html.hr.Type.set('booleanAttrs', TP.ac('noShade'));

TP.html.hr.addTraits(TP.core.EmptyElementNode);

TP.html.hr.Type.resolveTrait('booleanAttrs', TP.html.Element);

TP.html.hr.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.core.EmptyElementNode);

//  ========================================================================
//  TP.html.i
//  ========================================================================

/**
 * @type {TP.html.i}
 * @summary 'i' tag. Italic font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('i');

//  ========================================================================
//  TP.html.menu (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.menu}
 * @summary 'menu' tag. Defines a menu.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('menu');

//  ========================================================================
//  TP.html.menuitem (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.menuitem}
 * @summary 'menuitem' tag. Defines a menuitem.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('menuitem');

//  ========================================================================
//  TP.html.meter (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.meter}
 * @summary 'meter' tag. A measurement, such as disk usage.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('meter');

//  ========================================================================
//  TP.html.progress (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.progress}
 * @summary 'progress' tag. A completion of a task, such as downloading.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('progress');

//  ========================================================================
//  TP.html.small
//  ========================================================================

/**
 * @type {TP.html.small}
 * @summary 'small' tag. Smaller font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('small');

//  ========================================================================
//  TP.html.sub
//  ========================================================================

/**
 * @type {TP.html.sub}
 * @summary 'sub' tag. Subscript.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('sub');

//  ========================================================================
//  TP.html.summary (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.summary}
 * @summary 'summary' tag. Represents summary information for a 'details' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('summary');

//  ========================================================================
//  TP.html.sup
//  ========================================================================

/**
 * @type {TP.html.sup}
 * @summary 'sup' tag. Superscript.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('sup');

//  ========================================================================
//  TP.html.time (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.time}
 * @summary 'time' tag. A data and/or time.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('time');

//  ========================================================================
//  TP.html.tt
//  ========================================================================

/**
 * @type {TP.html.tt}
 * @summary 'tt' tag. Fixed (teletype/typewriter) font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('tt');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
