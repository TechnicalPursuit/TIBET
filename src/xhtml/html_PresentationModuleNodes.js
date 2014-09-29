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
 * @synopsis 'b' tag. Bold font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('b');

//  ========================================================================
//  html:big
//  ========================================================================

/**
 * @type {html:big}
 * @synopsis 'big' tag. Bigger font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('big');

//  ========================================================================
//  html:datalist (HTML 5)
//  ========================================================================

/**
 * @type {html:datalist}
 * @synopsis 'datalist' tag. Together with 'list' attribute for input can be
 *     used to make a combobox.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('datalist');

//  ========================================================================
//  html:details (HTML 5)
//  ========================================================================

/**
 * @type {html:details}
 * @synopsis 'details' tag. Represents additional information which the user can
 *     obtain on demand.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('details');

//  ========================================================================
//  html:hr
//  ========================================================================

/**
 * @type {html:hr}
 * @synopsis 'hr' tag. Horizontal rule.
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('hr');

TP.html.hr.addTraitsFrom(TP.core.EmptyElementNode);
TP.html.hr.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.core.EmptyElementNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.html.hr.executeTraitResolution();

//  ========================================================================
//  html:i
//  ========================================================================

/**
 * @type {html:i}
 * @synopsis 'i' tag. Italic font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('i');

//  ========================================================================
//  html:output (HTML 5)
//  ========================================================================

/**
 * @type {html:output}
 * @synopsis 'output' tag. Some form of output.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('output');

//  ========================================================================
//  html:meter (HTML 5)
//  ========================================================================

/**
 * @type {html:meter}
 * @synopsis 'meter' tag. A measurement, such as disk usage.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('meter');

//  ========================================================================
//  html:progress (HTML 5)
//  ========================================================================

/**
 * @type {html:progress}
 * @synopsis 'progress' tag. A completion of a task, such as downloading.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('progress');

//  ========================================================================
//  html:small
//  ========================================================================

/**
 * @type {html:small}
 * @synopsis 'small' tag. Smaller font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('small');

//  ========================================================================
//  html:sub
//  ========================================================================

/**
 * @type {html:sub}
 * @synopsis 'sub' tag. Subscript.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('sub');

//  ========================================================================
//  html:summary (HTML 5)
//  ========================================================================

/**
 * @type {html:summary}
 * @synopsis 'summary' tag. Represents summary information for a 'details' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('summary');

//  ========================================================================
//  html:sup
//  ========================================================================

/**
 * @type {html:sup}
 * @synopsis 'sup' tag. Superscript.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('sup');

//  ========================================================================
//  html:time (HTML 5)
//  ========================================================================

/**
 * @type {html:time}
 * @synopsis 'time' tag. A data and/or time.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('time');

//  ========================================================================
//  html:tt
//  ========================================================================

/**
 * @type {html:tt}
 * @synopsis 'tt' tag. Fixed (teletype/typewriter) font.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('tt');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
