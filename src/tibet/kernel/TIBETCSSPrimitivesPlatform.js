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

/* global Components:false,
          CSSRule:false
*/

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

        //  For browser UIs other than 'trident', this is unnecessary.
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

TP.definePrimitive('elementGetAppliedNativeStyleRules',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(anElement) {

        /**
         * @method elementGetAppliedNativeStyleRules
         * @summary Returns an Array of CSSRule objects that apply to the
         *     supplied element.
         * @param {Element} anElement The element to retrieve the CSS style
         *     rules for.
         * @exception TP.sig.InvalidElement
         * @returns {Array} An Array of CSSRule objects.
         */

        var ruleArray,
            successfulExec;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        ruleArray = TP.ac();

        successfulExec = TP.executePrivileged(
            TP.ACCESS_DOM_INSPECT,
            TP.sc('This TIBET-based application would like to read style ' +
                    'rules'),
            TP.sc('This TIBET-based application cannot read style rules'),
            false,      //  don't bother trying to do this without
                        //  privileges
            function() {

                var queryObj,

                    rules,
                    i;

                //  style rule access in Mozilla requires special
                //  privileges, because we need to use an XPCOM component
                //  that's really only available with DOMInspector.

                //  DOM Inspector-specific components
                try {
                    queryObj = Components.
                    classes['@mozilla.org/inspector/dom-utils;1'].getService(
                                Components.interfaces.nsIDOMUtils);
                } catch (e) {
                    TP.raise(this, 'TP.sig.DOMComponentException', TP.ec(e));

                    return false;
                }

                rules = queryObj.getCSSStyleRules(anElement);

                //  Repackage this into an array for convenience.
                /* eslint-disable new-cap */
                for (i = 0; i < rules.Count(); i++) {
                    ruleArray.push(rules.GetElementAt(i));
                }
                /* eslint-enable new-cap */
            });

        //  If we couldn't successfully execute the XPCOM call...

        if (!successfulExec) {
            //  Can't get it via the XPCOM component (either we don't have
            //  the security permissions or DOMInspector isn't installed).
            //  So we have to do this the slow way...

            //  We check to see if the element has an 'appliedRules' array.
            //  If not, we have to run the refresh call, which can be slow.
            if (TP.notValid(anElement.appliedRules)) {
                TP.$documentRefreshAppliedRulesCaches(
                    TP.nodeGetDocument(anElement));
            }

            ruleArray = anElement.appliedRules;
        }

        return ruleArray;
    },
    'trident',
    function(anElement) {

        /**
         * @method elementGetAppliedNativeStyleRules
         * @summary Returns an Array of CSSRule objects that apply to the
         *     supplied element.
         * @param {Element} anElement The element to retrieve the CSS style
         *     rules for.
         * @exception TP.sig.InvalidElement
         * @returns {Array} An Array of CSSRule objects.
         */

        var ruleArray;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        ruleArray = TP.ac();

        //  Since IE has no built-in capability for this, we have to do it
        //  the manual, and possibly slow, way.

        //  We check to see if the element has an 'appliedRules' array. If
        //  not, we have to run the refresh call, which can be slow.
        if (TP.notValid(anElement.appliedRules)) {
            TP.$documentRefreshAppliedRulesCaches(
                        TP.nodeGetDocument(anElement));
        }

        ruleArray = anElement.appliedRules;

        return ruleArray;
    },
    'webkit',
    function(anElement) {

        /**
         * @method elementGetAppliedNativeStyleRules
         * @summary Returns an Array of CSSRule objects that apply to the
         *     supplied element.
         * @param {Element} anElement The element to retrieve the CSS style
         *     rules for.
         * @exception TP.sig.InvalidElement
         * @returns {Array} An Array of CSSRule objects.
         */

        var ruleArray,

            elemWin,

            rules,
            i;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        ruleArray = TP.ac();

        elemWin = TP.nodeGetWindow(anElement);

        try {
            //  Note here how we *must* supply the empty string for the
            //  'pseudo element'.
            rules = elemWin.getMatchedCSSRules(anElement, '');

            //  Repackage this into an array for convenience.
            for (i = 0; i < rules.length; i++) {
                ruleArray.push(rules[i]);
            }
        } catch (e) {
            //  If using the native call threw an exception, we have to do
            //  this the slow way...

            //  We check to see if the element has an 'appliedRules' array.
            //  If not, we have to run the refresh call, which can be slow.
            if (TP.notValid(anElement.appliedRules)) {
                TP.$documentRefreshAppliedRulesCaches(
                            TP.nodeGetDocument(anElement));
            }

            ruleArray = anElement.appliedRules;
        }

        return ruleArray;
    }
));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
