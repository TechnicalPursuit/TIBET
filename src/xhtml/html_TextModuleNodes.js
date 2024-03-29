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
//  TP.html.abbr
//  ========================================================================

/**
 * @type {TP.html.abbr}
 * @summary 'abbr' tag. Abbreviation.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('abbr');

//  ========================================================================
//  TP.html.acronym
//  ========================================================================

/**
 * @type {TP.html.acronym}
 * @summary 'acronym' tag. Acronym.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('acronym');

//  ========================================================================
//  TP.html.address
//  ========================================================================

/**
 * @type {TP.html.address}
 * @summary 'address' tag. Address information.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('address');

//  ========================================================================
//  TP.html.bdi (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.bdi}
 * @summary 'bdi' tag. Defines a section that might be formatted in a different
 * direction.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('bdi');

//  ========================================================================
//  TP.html.blockquote
//  ========================================================================

/**
 * @type {TP.html.blockquote}
 * @summary 'blockquote' tag. Inline quotation.
 */

//  ------------------------------------------------------------------------

TP.html.Citation.defineSubtype('blockquote');

TP.html.blockquote.Type.set('uriAttrs', TP.ac('cite'));

//  ========================================================================
//  TP.html.br
//  ========================================================================

/**
 * @type {TP.html.br}
 * @summary 'br' tag. Paragraph break.
 */

//  ------------------------------------------------------------------------

TP.html.CoreAttrs.defineSubtype('br');

TP.html.br.addTraitTypes(TP.dom.EmptyElementNode);

TP.html.br.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.dom.EmptyElementNode);

//  ========================================================================
//  TP.html.cite
//  ========================================================================

/**
 * @type {TP.html.cite}
 * @summary 'cite' tag. Citation.
 */

//  ------------------------------------------------------------------------

TP.html.Citation.defineSubtype('cite');

//  ========================================================================
//  TP.html.code
//  ========================================================================

/**
 * @type {TP.html.code}
 * @summary 'code' tag. Program code.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('code');

//  ========================================================================
//  TP.html.dfn
//  ========================================================================

/**
 * @type {TP.html.dfn}
 * @summary 'dfn' tag. Definition.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('dfn');

//  ========================================================================
//  TP.html.div
//  ========================================================================

/**
 * @type {TP.html.div}
 * @summary DIV tag. Generic block container.
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('div');

//  ========================================================================
//  TP.html.em
//  ========================================================================

/**
 * @type {TP.html.em}
 * @summary 'em' tag. Emphasis.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('em');

//  ========================================================================
//  TP.html.h1
//  ========================================================================

/**
 * @type {TP.html.h1}
 * @summary 'h1' tag. Heading.
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('h1');

//  ========================================================================
//  TP.html.h2
//  ========================================================================

/**
 * @type {TP.html.h2}
 * @summary 'h2' tag. Sub-heading.
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('h2');

//  ========================================================================
//  TP.html.h3
//  ========================================================================

/**
 * @type {TP.html.h3}
 * @summary 'h3' tag. Sub-sub-heading.
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('h3');

//  ========================================================================
//  TP.html.h4
//  ========================================================================

/**
 * @type {TP.html.h4}
 * @summary 'h4' tag. Sub-sub-sub-heading.
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('h4');

//  ========================================================================
//  TP.html.h5
//  ========================================================================

/**
 * @type {TP.html.h5}
 * @summary 'h5' tag. Sub-sub-sub-sub-heading. Are we there yet?
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('h5');

//  ========================================================================
//  TP.html.h6
//  ========================================================================

/**
 * @type {TP.html.h6}
 * @summary 'h6' tag. You get the picture ;).
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('h6');

//  ========================================================================
//  TP.html.kbd
//  ========================================================================

/**
 * @type {TP.html.kbd}
 * @summary 'kbd' tag. Example keyboard input.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('kbd');

//  ========================================================================
//  TP.html.mark (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.mark}
 * @summary 'mark' tag. A run of text highlighted for reference purposes.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('mark');

//  ========================================================================
//  TP.html.p
//  ========================================================================

/**
 * @type {TP.html.p}
 * @summary 'p' tag. Paragraph.
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('p');

//  ========================================================================
//  TP.html.pre
//  ========================================================================

/**
 * @type {TP.html.pre}
 * @summary 'pre' tag. Preserve formatting.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('pre');

//  ========================================================================
//  TP.html.q
//  ========================================================================

/**
 * @type {TP.html.q}
 * @summary 'q' tag. Inline quotation.
 */

//  ------------------------------------------------------------------------

TP.html.Citation.defineSubtype('q');

TP.html.q.Type.set('uriAttrs', TP.ac('cite'));

//  ========================================================================
//  TP.html.ruby (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.ruby}
 * @summary 'ruby' tag. Mark up 'Ruby text' annotations.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('ruby');

//  ========================================================================
//  TP.html.rp (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.rp}
 * @summary 'rp' tag. Mark up 'Ruby text' annotations.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('rp');

//  ========================================================================
//  TP.html.rt (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.rt}
 * @summary 'rt' tag. Mark up 'Ruby text' annotations.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('rt');

//  ========================================================================
//  TP.html.rtc (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.rtc}
 * @summary 'rtc' tag. Contain marked up 'Ruby text' annotations.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('rtc');

//  ========================================================================
//  TP.html.samp
//  ========================================================================

/**
 * @type {TP.html.samp}
 * @summary 'samp' tag. Sample.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('samp');

//  ========================================================================
//  TP.html.span
//  ========================================================================

/**
 * @type {TP.html.span}
 * @summary 'span' tag. Generic inline container.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('span');

//  ========================================================================
//  TP.html.strong
//  ========================================================================

/**
 * @type {TP.html.strong}
 * @summary 'strong' tag. Strong emphasis.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('strong');

//  ========================================================================
//  TP.html.var
//  ========================================================================

/**
 * @type {TP.html.var}
 * @summary 'var' tag. Variable.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('var');

//  ========================================================================
//  TP.html.wbr (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.wbr}
 * @summary 'wbr' tag. Line break opportunity.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('wbr');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
