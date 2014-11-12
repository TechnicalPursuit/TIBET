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

/* global CSSPrimitiveValue:false,
          Components:false,
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
         * @name $elementCSSFlush
         * @synopsis Jiggers the element to flush out any CSS changes. IE should
         *     do this automatically, but won't sometimes, especially for
         *     'custom' attributes.
         * @param {Element} anElement The element to flush the CSS style changes
         *     for.
         * @raises TP.sig.InvalidElement
         */

        //  Just setting the className to its own value causes the flush to
        //  happen. I guess it's just if the slot is touched.
        anElement.className = anElement.className;

        return;
    },
    TP.DEFAULT,
    function(anElement) {

        /**
         * @name $elementCSSFlush
         * @synopsis Jiggers the element to flush out any CSS changes. IE should
         *     do this automatically, but won't sometimes, especially for
         *     'custom' attributes.
         * @param {Element} anElement The element to flush the CSS style changes
         *     for.
         * @raises TP.sig.InvalidElement
         */

        //  For browser UIs other than 'trident', this is unnecessary.
        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('$eventHandleStyleInsertion',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(insertionEvent) {

        /**
         * @name $eventHandleStyleNodeInsertion
         * @synopsis An event handler that is called upon document loading or
         *     writing to capture DOM Node insertions of 'style' or 'link' (to
         *     CSS style sheets) elements.
         * @description Because Mozilla 1.8+ (FF 1.5+) is so "particular" about
         *     the CSS in loaded sheets (normally a good thing), we've got to
         *     grab our CSS sheets early and rip them out of the document to
         *     avoid all of the errors that it will spew to the JavaScript
         *     console.
         *
         *     What errors? Primarily warnings about pseudo-classes or
         *     pseudo-elements, which seems to us to be a possible bug in the
         *     CSS logic of Mozilla since our usage of these is limited to
         *     namespaces where they are a part of the spec (as in XForms'
         *     ::value) for that namespace, or where they're attached to a class
         *     or ID as in #mydiv::head, where the namespace of the element
         *     can't really be known to the CSS processor when it's running --
         *     which is before the body of the document has been constructed.
         *
         *     In any case, we define a function here that is used as the
         *     handler to a DOMNodeInserted event installed on the 'head'
         *     element. It grabs any 'style' elements or 'link' elements (with a
         *     'rel' of 'stylesheet'), stores them away and rips them out of the
         *     document to avoid errors.
         * @param {Event} insertionEvent The Event object that was sent when the
         *     style node was inserted into the document.
         */

        var nodeJustInserted,
            nodeWindow;

        //  The node that was just inserted is the target of the event.
        nodeJustInserted = insertionEvent.target;

        //  If its not an Element, it must have been a Text node or
        //  something else. Exit here.
        if (!TP.isElement(nodeJustInserted)) {
            return;
        }

        nodeWindow = TP.nodeGetWindow(nodeJustInserted);

        //  If the style or link element has been marked as
        //  'tibet:opaque', then mark it as 'dontprocess' and return.
        if (TP.elementHasAttribute(nodeJustInserted, 'tibet:opaque', true)) {
            TP.elementSetAttribute(nodeJustInserted, 'dontprocess', 'true');

            return;
        }

        //  If it was a 'style' element, then push it onto our global
        //  style elements list and rip it out of the document.
        if (nodeJustInserted.tagName.toLowerCase() === 'style') {
            if (TP.notValid(nodeWindow.$globalStyleElements)) {
                nodeWindow.$globalStyleElements = TP.ac();
            }

            nodeWindow.$globalStyleElements.push(nodeJustInserted);
            TP.nodeDetach(nodeJustInserted);
        }

        //  If it was a 'link' element (and was a 'stylesheet'), then
        //  push it onto our global link elements list and rip it out of
        //  the document.
        if (nodeJustInserted.tagName.toLowerCase() === 'link') {
            if (TP.elementGetAttribute(nodeJustInserted, 'rel') !==
                'stylesheet') {
                return;
            }

            if (TP.notValid(nodeWindow.$globalLinkElements)) {
                nodeWindow.$globalLinkElements = TP.ac();
            }

            nodeWindow.$globalLinkElements.push(nodeJustInserted);
            TP.nodeDetach(nodeJustInserted);
        }

        return;
    },
    'webkit',
    function(insertionEvent) {

        /**
         * @name $eventHandleStyleNodeInsertion
         * @synopsis An event handler that is called upon document loading or
         *     writing to capture DOM Node insertions of 'style' or 'link' (to
         *     CSS style sheets) elements.
         * @description Because Webkit-based browsers are so "particular" about
         *     the CSS in loaded sheets (normally a good thing), we've got to
         *     grab our CSS sheets early and rip them out of the document to
         *     avoid all of the errors that it will spew to the JavaScript
         *     console.
         *
         *     What errors? Primarily warnings about pseudo-classes or
         *     pseudo-elements, which seems to us to be a possible bug in the
         *     CSS logic of Mozilla since our usage of these is limited to
         *     namespaces where they are a part of the spec (as in XForms'
         *     ::value) for that namespace, or where they're attached to a class
         *     or ID as in #mydiv::head, where the namespace of the element
         *     can't really be known to the CSS processor when it's running --
         *     which is before the body of the document has been constructed.
         *
         *     In any case, we define a function here that is used as the
         *     handler to a DOMNodeInserted event installed on the 'head'
         *     element. It grabs any 'style' elements or 'link' elements (with a
         *     'rel' of 'stylesheet'), stores them away and rips them out of the
         *     document to avoid errors.
         * @param {Event} insertionEvent The Event object that was sent when the
         *     style node was inserted into the document.
         */

        var nodeJustInserted,
            nodeWindow,

            nodeDoc;

        //  The node that was just inserted is the target of the event.
        nodeJustInserted = insertionEvent.target;

        //  If its not an Element, it must have been a Text node or
        //  something else. Exit here.
        if (!TP.isElement(nodeJustInserted)) {
            return;
        }

        nodeDoc = TP.nodeGetDocument(nodeJustInserted);

        if (nodeDoc.readyState === 'complete') {
            return;
        }

        nodeWindow = TP.nodeGetWindow(nodeJustInserted);

        //  If the style or link element has been marked as
        //  'tibet:opaque', then mark it as 'dontprocess' and return.
        if (TP.elementHasAttribute(nodeJustInserted, 'tibet:opaque', true)) {
            TP.elementSetAttribute(nodeJustInserted, 'dontprocess', 'true');

            return;
        }

        //  If it was a 'style' element, then push it onto our global
        //  style elements list and rip it out of the document.
        if (nodeJustInserted.tagName.toLowerCase() === 'style') {
            if (TP.notValid(nodeWindow.$globalStyleElements)) {
                nodeWindow.$globalStyleElements = TP.ac();
            }

            nodeWindow.$globalStyleElements.push(nodeJustInserted);
            TP.nodeDetach(nodeJustInserted);
        }

        //  If it was a 'link' element (and was a 'stylesheet'), then
        //  push it onto our global link elements list and rip it out of
        //  the document.
        if (nodeJustInserted.tagName.toLowerCase() === 'link') {
            if (TP.elementGetAttribute(nodeJustInserted, 'rel') !==
                'stylesheet') {
                return;
            }

            if (TP.notValid(nodeWindow.$globalLinkElements)) {
                nodeWindow.$globalLinkElements = TP.ac();
            }

            nodeWindow.$globalLinkElements.push(nodeJustInserted);
            TP.nodeDetach(nodeJustInserted);
        }

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
         * @name elementClearStyleProperty
         * @synopsis Clears the style property on the element provided.
         * @param {Element} anElement The element to clear the style property
         *     on.
         * @param {String} propertyName The name of the CSS property to clear on
         *     the provided element.
         * @todo
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
         * @name elementClearStyleProperty
         * @synopsis Clears the style property on the element provided.
         * @param {Element} anElement The element to clear the style property
         *     on.
         * @param {String} propertyName The name of the CSS property to clear on
         *     the provided element.
         * @todo
         */

        TP.elementGetStyleObj(anElement)[propertyName] = '';

        return;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('elementConvertUnitLengthToPixels',
TP.hc(
    'test',
    'trident',
    'true',
    function(anElement, aValue, targetProperty, wantsTransformed) {

        /**
         * @name elementConvertUnitLengthToPixels
         * @synopsis A routine that computes a number of pixels from the
         *     supplied CSS unit value.
         * @description Note that the supplied value here must be a 'CSS unit
         *     value' (i.e. '3em' or '27%'). It cannot be a CSS value such as
         *     'normal' or 'inherit'.
         * @param {HTMLElement} anElement The element to use to compute the
         *     pixel value from.
         * @param {String} aValue The size value to convert into pixels.
         * @param {String} targetProperty The name of the property being
         *     converted. This isn't strictly required, but is desired to
         *     produce the most accurate results.
         * @param {Boolean} wantsTransformed An optional parameter that
         *     determines whether to return 'transformed' values if the element
         *     has been transformed with a CSS transformation. The default is
         *     false.
         * @raises TP.sig.InvalidElement,TP.sig.InvalidString,
         *     TP.sig.InvalidParameter
         * @returns {Number} The number of pixels that the supplied value will
         *     be in pixels for the supplied Element.
         * @todo
         */

        var targetPropName,
            pixelValueName,

            elementCurrentStyleVal,
            elementRuntimeStyleVal,

            valueInPixels;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        if (TP.isEmpty(aValue)) {
            return TP.raise(this, 'TP.sig.InvalidString');
        }

        //  If the value is not expressed using 'unit length' (i.e. it is a
        //  keyword such as 'inherit', 'initial', 'none', etc.), then we
        //  bail out here - can't do anything.
        if (!TP.regex.CSS_UNIT.test(aValue)) {
            return TP.raise(this, 'TP.sig.InvalidParameter');
        }

        targetPropName = TP.ifInvalid(targetProperty, 'left');
        targetPropName = targetPropName.toLowerCase();

        //  The target prop name should be one of the following in order to
        //  compute a 'pixel value' slot name.
        switch (targetPropName) {
            case 'top':
                pixelValueName = 'pixelTop';
            break;
            case 'right':
                pixelValueName = 'pixelRight';
            break;
            case 'bottom':
                pixelValueName = 'pixelBottom';
            break;
            case 'left':
                pixelValueName = 'pixelLeft';
            break;
            case 'width':
                pixelValueName = 'pixelWidth';
            break;
            case 'height':
                pixelValueName = 'pixelHeight';
            break;

            default:
                //  NB: There are only 'pixel*' slots provided for the above
                //  property names. If it wasn't one of those, we should
                //  just use 'left'.
                targetPropName = 'left';
                pixelValueName = 'pixelLeft';
            break;
        }

        //  Capture the inline 'style' for the target property (note that
        //  we're *not* interested in the computed style here - just if any
        //  value has been placed directly in the target property on the
        //  'style' object, either by JavaScript or by using the 'style'
        //  attribute).
        //  Note that if no value has been specified by either of these
        //  mechanisms, this value will be null (or the empty String).
        elementCurrentStyleVal = anElement.style[targetPropName];

        //  Capture and twiddle the runtime style too.
        elementRuntimeStyleVal = anElement.runtimeStyle[targetPropName];
        anElement.runtimeStyle[targetPropName] =
                                anElement.currentStyle[targetPropName];

        //  Set the target property on element to the supplied value (or 0,
        //  if the value isn't valid).
        anElement.style[targetPropName] = aValue || 0;

        //  Get the value in pixels by asking for the IE-only 'pixel*'
        //  property.
        valueInPixels = anElement.style[pixelValueName];

        //  Reset the inline style back to what it was (maybe null... see
        //  above).
        anElement.style[targetPropName] = elementCurrentStyleVal;

        //  Reset the runtime style too.
        anElement.runtimeStyle[targetPropName] = elementRuntimeStyleVal;

        //  If the computation returned NaN, be nice and return 0.
        if (TP.isNaN(valueInPixels)) {
            return 0;
        }

        if (TP.isTrue(wantsTransformed)) {
            return TP.elementTransformCSSPixelValue(anElement,
                                                    valueInPixels,
                                                    targetPropName);
        }

        return valueInPixels;
    },
    TP.DEFAULT,
    function(anElement, aValue, targetProperty, wantsTransformed) {

        /**
         * @name elementConvertUnitLengthToPixels
         * @synopsis A routine that computes a number of pixels from the
         *     supplied CSS unit value.
         * @description Note that the supplied value here must be a 'CSS unit
         *     value' (i.e. '3em' or '27%'). It cannot be a CSS value such as
         *     'normal' or 'inherit'.
         * @param {HTMLElement} anElement The element to use to compute the
         *     pixel value from.
         * @param {String} aValue The size value to convert into pixels.
         * @param {String} targetProperty The name of the property being
         *     converted. This isn't strictly required, but is desired to
         *     produce the most accurate results.
         * @param {Boolean} wantsTransformed An optional parameter that
         *     determines whether to return 'transformed' values if the element
         *     has been transformed with a CSS transformation. The default is
         *     false.
         * @raises TP.sig.InvalidElement,TP.sig.InvalidString,
         *     TP.sig.InvalidParameter
         * @returns {Number} The number of pixels that the supplied value will
         *     be in pixels for the supplied Element.
         * @todo
         */

        var targetPropName,

            styleObj,

            elementCurrentStyleVal,
            computedStyle,

            valueInPixels;

        if (!TP.isElement(anElement)) {
            return TP.raise(this, 'TP.sig.InvalidElement');
        }

        if (TP.isEmpty(aValue)) {
            return TP.raise(this, 'TP.sig.InvalidString');
        }

        //  If the value is not expressed using 'unit length' (i.e. it is a
        //  keyword such as 'inherit', 'initial', 'none', etc.), then we
        //  bail out here - can't do anything.
        if (!TP.regex.CSS_UNIT.test(aValue)) {
            return TP.raise(this, 'TP.sig.InvalidParameter');
        }

        targetPropName = TP.ifInvalid(targetProperty, 'left');
        targetPropName = targetPropName.toLowerCase();

        styleObj = TP.elementGetStyleObj(anElement);

        //  Capture the inline 'style' for the target property (note that
        //  we're *not* interested in the computed style here - just if any
        //  value has been placed directly in the target property on the
        //  'style' object, either by JavaScript or by using the 'style'
        //  attribute).
        //  Note that if no value has been specified by either of these
        //  mechanisms, this value will be null (or the empty String).
        elementCurrentStyleVal = styleObj[targetPropName];

        //  Set the target property on element to the supplied value (or 0,
        //  if the value isn't valid).
        styleObj[targetPropName] = aValue || 0;

        //  Grab the computed style for the element.
        computedStyle = TP.elementGetComputedStyleObj(anElement);

        //  We wrap this in a try...catch, since sometimes Mozilla throws an
        //  exception when attempting to get the computed value, especially
        //  on the 'body' element.
        try {
            //  Get the value in pixels by using the 'getPropertyCSSValue'
            //  call of the computed style, asking for 'pixels' as type of
            //  the return value.
            valueInPixels =
                parseInt(computedStyle.getPropertyCSSValue(
                                    targetPropName).getFloatValue(
                                        CSSPrimitiveValue.CSS_PX), 10);
        } catch (e) {
            //  Can't compute the value anyway, so just return 0.
            return 0;
        }

        //  Reset the inline style back to what it was (maybe the empty
        //  String... see above).
        styleObj[targetPropName] = elementCurrentStyleVal;

        //  If the computation returned NaN, be nice and return 0.
        if (TP.isNaN(valueInPixels)) {
            return 0;
        }

        if (TP.isTrue(wantsTransformed)) {
            return TP.elementTransformCSSPixelValue(anElement,
                                                    valueInPixels,
                                                    targetPropName);
        }

        return valueInPixels;
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
         * @name elementGetAppliedNativeStyleRules
         * @synopsis Returns an Array of CSSRule objects that apply to the
         *     supplied element.
         * @param {Element} anElement The element to retrieve the CSS style
         *     rules for.
         * @raises TP.sig.InvalidElement
         * @returns {Array} An Array of CSSRule objects.
         * @todo
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
                    queryObj = Components.classes[
                        '@mozilla.org/inspector/dom-utils;1'].getService(
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
         * @name elementGetAppliedNativeStyleRules
         * @synopsis Returns an Array of CSSRule objects that apply to the
         *     supplied element.
         * @param {Element} anElement The element to retrieve the CSS style
         *     rules for.
         * @raises TP.sig.InvalidElement
         * @returns {Array} An Array of CSSRule objects.
         * @todo
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
         * @name elementGetAppliedNativeStyleRules
         * @synopsis Returns an Array of CSSRule objects that apply to the
         *     supplied element.
         * @param {Element} anElement The element to retrieve the CSS style
         *     rules for.
         * @raises TP.sig.InvalidElement
         * @returns {Array} An Array of CSSRule objects.
         * @todo
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
//  STYLE PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('styleRuleGetSourceInfo',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(aStyleRule) {

        /**
         * @name styleRuleGetSourceInfo
         * @synopsis Returns the 'origin' of the supplied style rule. This will
         *     be an Array of the source (either the String 'style element') or
         *     the href of the style sheet that the style rule belongs to and
         *     the line number of the style rule.
         * @param {CSSStyleRule} aStyleRule The style rule to retrieve the
         *     origin of.
         * @raises TP.sig.InvalidParameter
         * @returns {Array} An Array of the style rule origin and its line
         *     number in that origin.
         * @todo
         */

        var styleSheet,
            retVal;

        if (TP.notValid(aStyleRule)) {
            return TP.raise(this, 'TP.sig.InvalidParameter');
        }

        if (!TP.sys.shouldRequestPrivileges()) {
            TP.sys.logSecurity(
                'Permission not available to read style rule origin.',
                TP.DEBUG);

            return;
        }

        styleSheet = aStyleRule.parentStyleSheet;

        TP.executePrivileged(
            TP.ACCESS_DOM_INSPECT,
            TP.sc('This TIBET-based application would like to read style' +
                    ' rule info'),
            TP.sc(
                'This TIBET-based application cannot read style rule info'),
            false,  //  don't bother trying to do this without privileges
            function() {

                var queryObj,

                    source,
                    lineNum;

                //  style rule access in Mozilla requires special
                //  privileges,because we need to use an XPCOM component
                //  that's really only available with DOMInspector.

                //  DOM Inspector-specific components
                try {
                    queryObj = Components.classes[
                        '@mozilla.org/inspector/dom-utils;1'].getService(
                                Components.interfaces.nsIDOMUtils);
                } catch (e) {
                    return TP.raise(this,
                                    'TP.sig.DOMComponentException',
                                    TP.ec(e));
                }

                //  If the style rule's stylesheet object has no href, then
                //  it came from a style element in the head.
                if (TP.isEmpty(source = styleSheet.href)) {
                    source = 'style element';
                }

                //  We can only retrieve the line number if it was indeed a
                //  real style rule (i.e. it wasn't something like an
                //  @import rule).
                if (aStyleRule.type === CSSRule.STYLE_RULE) {
                    lineNum = queryObj.getRuleLine(aStyleRule);
                } else {
                    lineNum = '';
                }

                retVal = TP.ac(source, lineNum);
            });

        return retVal;
    },
    'trident',
    function(aStyleRule) {

        /**
         * @name styleRuleGetSourceInfo
         * @synopsis Returns the 'origin' of the supplied style rule. This will
         *     be an Array of the source (either the String 'style element') or
         *     the href of the style sheet that the style rule belongs to and
         *     the line number of the style rule.
         * @param {CSSStyleRule} aStyleRule The style rule to retrieve the
         *     origin of.
         * @raises TP.sig.InvalidParameter
         * @returns {Array} An Array of the style rule origin and its line
         *     number in that origin.
         * @todo
         */

        var styleSheet,

            source,
            lineNum;

        if (TP.notValid(aStyleRule)) {
            return TP.raise(this, 'TP.sig.InvalidParameter');
        }

        //  If there's not a valid stylesheet reference associated with this
        //  rule it must not have been obtained from the stylesheet using
        //  TIBET code. Therefore, we can go no further.
        if (TP.notValid(styleSheet = TP.styleRuleGetStyleSheet(aStyleRule))) {
            return TP.ac();
        }

        //  If 'readOnly' is false, that means that the stylesheet comes from
        //  a 'style' element embedded in the head of the document.
        if (TP.isFalse(styleSheet.readOnly)) {
            source = 'style element';
        } else {
            //  Otherwise, it came from a 'link' element or an '@import'
            //  statement.
            source = styleSheet.href;
        }

        //  TODO: Figure out how to extract this.
        lineNum = '';

        return TP.ac(source, lineNum);
    },
    'webkit',
    function(aStyleRule) {

        /**
         * @name styleRuleGetSourceInfo
         * @synopsis Returns the 'origin' of the supplied style rule. This will
         *     be an Array of the source (either the String 'style element') or
         *     the href of the style sheet that the style rule belongs to and
         *     the line number of the style rule.
         * @param {CSSStyleRule} aStyleRule The style rule to retrieve the
         *     origin of.
         * @raises TP.sig.InvalidParameter
         * @returns {Array} An Array of the style rule origin and its line
         *     number in that origin.
         * @todo
         */

        if (TP.notValid(aStyleRule)) {
            return TP.raise(this, 'TP.sig.InvalidParameter');
        }

        return TP.todo();
    }
));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
