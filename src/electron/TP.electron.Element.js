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
 * @type {TP.electron.Element}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('electron.Element');

TP.electron.Element.addTraits(TP.dom.NonNativeUIElementNode);

TP.electron.Element.Type.resolveTrait(
        'tagExpand',
        TP.dom.UIElementNode);

TP.electron.Element.Inst.resolveTraits(
        TP.ac('$setAttribute', 'removeAttribute', 'select', 'signal'),
        TP.dom.UIElementNode);

//  Note how this property is TYPE_LOCAL, by design.
TP.electron.Element.defineAttribute('styleURI', TP.NO_RESULT);
TP.electron.Element.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.electron.Element.Type.defineMethod('buildConfigObjectFromAttributes',
function(anElement, attrList) {

    /**
     * @method buildConfigObjectFromAttributes
     * @summary Builds a POJO configuration object by using the names from the
     *     attribute list and the values obtained by getting the value of the
     *     same named attribute on the supplied element.
     * @param {Element} anElement The element to retrieve the values from.
     * @param {String[]} attrList The list of attributes to retrieve from the
     *     supplied element.
     * @returns {Object} The constructed POJO configuration object.
     */

    var configPOJO;

    configPOJO = {};

    attrList.forEach(
        function(anAttribute) {
            var val;

            val = TP.elementGetAttribute(anElement, anAttribute, true);
            if (TP.notEmpty(val)) {
                configPOJO[anAttribute] = val;
            }
        });

    return configPOJO;
});

//  ========================================================================
//  TP.electron.ActionTag
//  ========================================================================

/**
 * @type {TP.electron.ActionTag}
 * @summary A tag type that is an action tag and also has the common aspect of all
 *     Electron tags.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('electron.ActionTag');

TP.electron.ActionTag.addTraits(TP.electron.Element);

//  Resolve the 'tagExpand' method in favor of TP.electron.Element, but go ahead
//  and execute the one inherited from TP.tag.ActionTag afterwards as well.
TP.electron.ActionTag.Type.resolveTrait(
                                'tagExpand', TP.electron.Element, TP.BEFORE);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
