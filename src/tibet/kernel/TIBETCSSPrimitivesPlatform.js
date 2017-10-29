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

/* JSHint checking */

/* global CSSRule:false */

//  ------------------------------------------------------------------------
//  ELEMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('$elementCSSFlush',
TP.hc(
    'test',
    'trident',
    'true',
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

        //  Just setting the className to its own value causes the flush to
        //  happen. I guess it's just if the slot is touched.
        anElement.className = anElement.className;

        return;
    },
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
    'test',
    'trident',
    'true',
    function(anElement, propertyName) {

        /**
         * @method elementClearStyleProperty
         * @summary Clears the style property on the element provided.
         * @param {Element} anElement The element to clear the style property
         *     on.
         * @param {String} propertyName The name of the CSS property to clear on
         *     the provided element.
         */

        //  On IE9, trying to clear the 'clip' property in the normal way
        //  doesn't work. The only other way to do it is to use a RegExp
        //  that strips the 'clip' (and IE variants cliptop, etc.)
        //  declaration out of the elements local 'cssText' property.
        if (propertyName === 'clip') {
            TP.elementGetStyleObj(anElement).cssText =
                anElement.style.cssText.strip(
                            /\s*clip(top|right|bottom|left)?:.+?(;\s*|$)/i);

            return;
        }

        TP.elementGetStyleObj(anElement)[propertyName] = '';

        return;
    },
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
