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
 * @type {TP.tibet.template}
 * @summary A subtype of TP.tag.CustomTag that knows how to define XML
 *     templates.
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('tibet:template');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.tibet.template.defineAttribute('styleURI', TP.NO_RESULT);
TP.tibet.template.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tibet.template.Type.defineMethod('populateCompilationAttrs',
function(aRequest, anElement) {

    /**
     * @method populateCompilationAttrs
     * @summary Populates attributes on the element that is produced by this
     *     type when it is processed.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @param {Element} anElement The element to populate the attributes onto.
     * @returns {TP.meta.tibet.template} The receiver.
     */

    //  Make sure that we have an element to work from.
    if (!TP.isElement(anElement)) {
        return null;
    }

    TP.elementSetAttribute(anElement, 'tibet:opaque', 'bind', true);

    //  We do not want our descendant content to be compiled. By stamping this
    //  attribute on ourself, we prevent compilation of that content.
    TP.elementSetAttribute(anElement, 'tibet:no-compile', 'true', true);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
