//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
Platform-specific functionality related to CSS operations.
*/

//  ------------------------------------------------------------------------
//  ELEMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('$elementCSSFlush',
TP.hc(
    TP.DEFAULT,
    function(anElement) {

        /**
         * @method $elementCSSFlush
         * @summary Jiggers the element to flush out any CSS changes. IE should
         *     do this automatically, but won't sometimes, especially for
         *     'custom' attributes.
         * @param {Element} anElement The element to flush the CSS style changes
         *     for.
         * @exception TP.sig.InvalidElement
         */

        var styleObj;

        styleObj = TP.elementGetStyleObj(anElement);

        styleObj.transform = 'rotateZ(0deg)';
        styleObj.transform = 'none';

        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementClearStyleProperty',
TP.hc(
    TP.DEFAULT,
    function(anElement, propertyName) {

        /**
         * @method elementClearStyleProperty
         * @summary Clears the style property on the element provided.
         * @param {Element} anElement The element to clear the style property
         *     on.
         * @param {String} propertyName The name of the CSS property to clear on
         *     the provided element.
         */

        TP.elementGetStyleObj(anElement)[propertyName] = '';

        return;
    }
));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
