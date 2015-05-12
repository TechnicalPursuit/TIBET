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
//  html:b
//  ========================================================================

/**
 * @type {html:b}
 * @summary 'b' tag. Bold font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('b');

//  ========================================================================
//  html:big
//  ========================================================================

/**
 * @type {html:big}
 * @summary 'big' tag. Bigger font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('big');

//  ========================================================================
//  html:details (HTML 5)
//  ========================================================================

/**
 * @type {html:details}
 * @summary 'details' tag. Represents additional information which the user can
 *     obtain on demand.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('details');

TP.html.details.Type.set('booleanAttrs', TP.ac('open'));

//  ========================================================================
//  html:hr
//  ========================================================================

/**
 * @type {html:hr}
 * @summary 'hr' tag. Horizontal rule.
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('hr');

TP.html.hr.Type.set('booleanAttrs', TP.ac('noShade'));

TP.html.hr.addTraits(TP.core.EmptyElementNode);

TP.html.hr.Type.resolveTrait('booleanAttrs', TP.html.Element);

TP.html.hr.Inst.resolveTraits(
        TP.ac('$setAttribute', 'getNextResponder', 'isResponderFor',
                'removeAttribute', 'select', 'signal'),
        TP.core.UIElementNode);

TP.html.hr.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.core.EmptyElementNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.html.hr.finalizeTraits();

//  ========================================================================
//  html:i
//  ========================================================================

/**
 * @type {html:i}
 * @summary 'i' tag. Italic font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('i');

//  ========================================================================
//  html:meter (HTML 5)
//  ========================================================================

/**
 * @type {html:meter}
 * @summary 'meter' tag. A measurement, such as disk usage.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('meter');

//  ========================================================================
//  html:progress (HTML 5)
//  ========================================================================

/**
 * @type {html:progress}
 * @summary 'progress' tag. A completion of a task, such as downloading.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('progress');

//  ========================================================================
//  html:small
//  ========================================================================

/**
 * @type {html:small}
 * @summary 'small' tag. Smaller font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('small');

//  ========================================================================
//  html:sub
//  ========================================================================

/**
 * @type {html:sub}
 * @summary 'sub' tag. Subscript.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('sub');

//  ========================================================================
//  html:summary (HTML 5)
//  ========================================================================

/**
 * @type {html:summary}
 * @summary 'summary' tag. Represents summary information for a 'details' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('summary');

//  ========================================================================
//  html:sup
//  ========================================================================

/**
 * @type {html:sup}
 * @summary 'sup' tag. Superscript.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('sup');

//  ========================================================================
//  html:time (HTML 5)
//  ========================================================================

/**
 * @type {html:time}
 * @summary 'time' tag. A data and/or time.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('time');

//  ========================================================================
//  html:tt
//  ========================================================================

/**
 * @type {html:tt}
 * @summary 'tt' tag. Fixed (teletype/typewriter) font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('tt');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
