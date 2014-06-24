//  ========================================================================
/*
NAME:   smil_animate.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

/**
 * @type {TP.smil.animate}
 * @synopsis A custom tag that implements a W3C-compliant SMIL 'animate' element
 *     for use in user interfaces.
 * @description This element uses the following attributes in the following
 *     ways:
 *     
 *     targetElement <IDREF> (takes precedence over xctrls:control)
 *     attributeName <attribute name> attributeType [XML|CSS]
 *     
 *     from {pixels|percentage} to {pixels|percentage} by {pixels|percentage}
 *     values list of {pixels|percentage}
 *     
 *     (colorvalue currently unsupported in all of the above)
 *     
 *     repeatCount {number} repeatDur {number} (currently unsupported)
 *     
 *     begin {number} end {number} (currently unsupported) dur {number} fill
 *     [freeze]
 *     
 *     accumulate [none|sum] (currently unsupported) additive [replace|sum]
 *     (currently unsupported) calcMode [discrete|linear|paced] (currently
 *     unsupported)
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('smil:animate');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.smil.animate.Inst.defineMethod('act',
function(aRequest) {

    /**
     * @name act
     * @param {TP.sig.Request} aRequest The request to process.
     * @returns {TP.smil.animate} The receiver.
     * @abstract
     * @raise TP.sig.InvalidNode,TP.sig.InvalidParameter
     * @todo
     */

    var controlInput,
        control,

        attributeType,
        attributeName,

        styleObj,

        realTarget,
        realTargetIsCSS,

        begin,

        duration,

        repeatCount,

        oldValue,
        currentValue,

        postFunc,

        fillAttribute,

        values,

        from,
        to,
        by,

        valueVals,
        units,

        animParams,

        computeFunc;

    this.callNextMethod();

    //  First, check to see if we have a standard SMIL 'targetElement'
    //  attribute.
    controlInput = this.getAttribute('smil:targetElement', true);

    //  If not, check the 'xctrls:control' attribute
    if (TP.isEmpty(controlInput)) {
        controlInput = this.getActionInput(aRequest);
    }

    if (TP.isString(controlInput)) {
        //  things with colons are likely URIs and not valid IDs
        if (!TP.regex.HAS_COLON.test(controlInput)) {
            //  fast check is for the ID, but trim any optional # prefix
            control = TP.unwrap(this.getDocument().getElementById(
                                                controlInput.strip('#')));
        } else {
            //  probably a URI so we use $byOID as our entry point
            control = TP.byOID(controlInput);
            if (TP.canInvoke(control, 'getNativeNode')) {
                control = control.getNativeNode();
            }
        }
    } else if (TP.isElement(controlInput)) {
        control = controlInput;
    } else if (TP.isKindOf(controlInput, 'TP.core.ElementNode')) {
        control = controlInput.getNativeNode();
    }

    //  Can't obtain a real object from the control source(s) we were given,
    //  so raise an exception and bail out here.
    if (!TP.isElement(control)) {
        return this.raise(
                    'TP.sig.InvalidElement',
                    arguments,
                    'Unable to locate control for: ' + this.asString());
    }

    //  Set up the 'real control' that we're going to animate against. This
    //  could either be the control itself, or its CSS 'style' object
    //  depending on the setting (or absence) of the the attributeType
    //  attribute on this element.

    //  First, we have to make sure we have a valid attributeName
    if (TP.isEmpty(attributeName = this.getAttribute('smil:attributeName',
                                                    true))) {
        return this.raise('TP.sig.InvalidParameter',
                            arguments,
                            'Missing attribute in: ' +
                            this.asString());
    }

    //  Make sure its a DOM name
    attributeName = attributeName.asDOMName();

    attributeType = this.getAttribute('smil:attributeType', true);

    styleObj = TP.elementGetStyleObj(control);

    //  The spec says that if 'CSS' is the value, we should use the 'style'
    //  of the element.
    if (attributeType.toUpperCase() === 'CSS') {
        realTarget = styleObj;
        realTargetIsCSS = true;
    } else if (attributeType.toUpperCase() === 'XML') {
        //  If 'XML' is the value, we use the element itself.
        realTarget = control;
        realTargetIsCSS = false;
    } else {
        //  If its neither value, then we see if the property that was given
        //  to be animated is a property on the element's CSS 'style'
        //  object. If the property is found on that object, we assume that
        //  the property is a CSS property and we use the 'style' of the
        //  element. Otherwise, we just use the element itself. Note that it
        //  doesn't matter if the value here is 'auto' or '' as long as it
        //  is not null or undefined. All we're trying to see is if the
        //  attribute name given is a real property on that object.
        if (TP.isValid(styleObj[attributeName])) {
            realTarget = styleObj;
            realTargetIsCSS = true;
        } else {
            realTarget = control;
            realTargetIsCSS = false;
        }
    }

    //  If the animation wants a delay to begin, capture it here.
    if (TP.notEmpty(begin = this.getAttribute('smil:begin'))) {
        //  The user almost got it right - xs:duration types should begin
        //  with 'PT'
        if (!begin.startsWith('PT')) {
            begin = 'PT' + begin;
        }
    }

    //  Grab the duration, which should conform to the xs:duration XML
    //  Schema data type.
    duration = this.getAttribute('smil:dur', true);

    //  The user almost got it right - xs:duration types should begin with
    //  'PT'
    if (!duration.startsWith('PT')) {
        duration = 'PT' + duration;
    }

    //  Grab a repeat count if it is not empty, otherwise set it to null and
    //  let the TP.animate() machinery handle it.
    repeatCount = TP.ifEmpty(this.getAttribute('smil:repeatCount'),
                                    null);

    if (realTargetIsCSS) {
        //  Note here the difference between 'old value' and 'current
        //  value'. 'oldValue' is the real old value of the style if the
        //  user has manually set it on the 'style' object. It is what the
        //  style will be set back to if there is no 'fill="freeze"' on
        //  the receiver.

        //  If its the empty string, null or undefined we just normalize
        //  that to the empty string. The CSS property will be set back
        //  to that when the animation finishes (if there is no
        //  'fill="freeze"').
        if (TP.isEmpty(oldValue = styleObj[attributeName])) {
            oldValue = '';
        }

        //  The 'currentValue' is the *computed* value that the CSS
        //  property has on the target element. This is the value that
        //  we will start the animation from.
        currentValue = TP.elementGetComputedStyleObj(
                                        control)[attributeName];
    } else {
        //  This is an XML property, so oldValue and currentValue are
        //  the same.
        oldValue = TP.elementGetAttribute(
                                realTarget, attributeName, true).asNumber();

        if (!TP.isNumber(oldValue)) {
            return this.raise('TP.sig.InvalidParameter',
                                arguments,
                                'Attribute: ' + attributeName +
                                ' is non-numeric in: ' + this.asString());
        }

        currentValue = oldValue;
    }

    //  Start a hash containing the animation parameters.
    animParams = TP.hc(
            'post',
                postFunc,
            'count',
                TP.isValid(repeatCount) ? repeatCount.asNumber() : null,
            'limit',
                duration);

    if (TP.notEmpty(begin)) {
        animParams.atPut('delay', begin);
    }

    //  If there is a 'smil:fill' attribute and it's set to 'freeze', then
    //  that means the user wants the object to hold the final value used by
    //  the animation routine. Our CSS transition machinery does this
    //  automatically if we set 'freeze' to 'true'.
    if (TP.notEmpty(fillAttribute = this.getAttribute('smil:fill')) &&
        (fillAttribute === 'freeze')) {
        animParams.atPut('freeze', true);
    } else {
        animParams.atPut('preserve', true);
        animParams.atPut('restore', true);
    }

    //  Set up the animation values. Note that the 'values' attribute
    //  overrides 'from', 'to' and 'by', so we only do the latter when
    //  'values' is empty.
    if (TP.isEmpty(values = this.getAttribute('smil:values', true))) {
        from = this.getAttribute('smil:from', true);

        //  In the spec, 'to' overrides 'by', so we only use 'by' if 'to' is
        //  empty.
        if (TP.isEmpty(to = this.getAttribute('smil:to', true))) {
            if (TP.isEmpty(by = this.getAttribute('smil:by', true))) {
                //  Throw an error - we need either 'to' or 'by'.
                return;
            }
        }

        //  Here we test to see if the from, to or by values are
        //  percentages. If so, then we convert them here. The CSS
        //  transition machinery takes values with percentages, but it will
        //  compute them *relative to the parent*, whereas the SMIL
        //  specification says that percentages should be computed *relative
        //  to the element itself*.

        //  The one benefit with that approach is that we can also use the
        //  same code when animating XML attributes

        if (TP.notEmpty(from) && TP.regex.PERCENTAGE.test(from)) {
            //  The 'from' is a percentage, so parse a number from the
            //  current value and divide the numeric value of the supplied
            //  value by 100 to obtain the proper percentage and multiply
            //  the 2 together.
            from = parseFloat(currentValue) * (parseFloat(from) / 100);
        }

        if (TP.notEmpty(to) && TP.regex.PERCENTAGE.test(to)) {
            //  The 'to' is a percentage, so parse a number from the
            //  current value and divide the numeric value of the supplied
            //  value by 100 to obtain the proper percentage and multiply
            //  the 2 together.
            to = parseFloat(currentValue) * (parseFloat(to) / 100);
        }

        if (TP.notEmpty(by) && TP.regex.PERCENTAGE.test(by)) {
            //  The 'by' is a percentage, so parse a number from the
            //  current value and divide the numeric value of the supplied
            //  value by 100 to obtain the proper percentage and multiply
            //  the 2 together.
            by = parseFloat(currentValue) * (parseFloat(by) / 100);
        }

        //  Configure the stepping parameters with rest of the
        //  parameters for this animation.
        animParams.atPut('from', from);
        animParams.atPut('to', to);
        animParams.atPut('by', by);
    } else {
        //  Split up the supplied values attribute along semicolons.
        values = values.split(/\s*;\s*/);

        //  The values 'values' Array will hold the actual numeric values
        //  computed from the supplied values attribute.
        valueVals = TP.ac();

        //  For percentage conversion below, we will append a real unit
        //  length of 'px', if the target is a CSS one. Otherwise, we'll use
        //  an empty one.
        if (realTargetIsCSS) {
            units = 'px';
        } else {
            units = '';
        }

        //  Loop over the values and try to split their units off of the
        //  actual numeric value.
        values.perform(
            function(aValueVal) {

                var val;

                val = aValueVal;

                //  Quick check to see if the value is just a number so that
                //  we don't have to do any extra work to obtain the units.
                if (TP.isNaN(val)) {
                    //  It's not a number. Check to see if its a percentage.
                    //  If so, then compute a numeric value from that. See
                    //  above for why we do this here as opposed to just
                    //  handing the percentage values to the animateCSS()
                    //  function.

                    if (TP.notEmpty(val) && TP.regex.PERCENTAGE.test(val)) {
                        //  The value is a percentage, so parse a number
                        //  from the current value and divide the numeric
                        //  value of the supplied value by 100 to obtain the
                        //  proper percentage and multiply the 2 together.
                        val = parseFloat(currentValue) *
                                    (parseFloat(val) / 100);

                        valueVals.push(val + units);
                    } else {
                        valueVals.push(val);
                    }
                } else {
                    //  Push the numeric value onto the end of the valueVals
                    //  array
                    valueVals.push(val + units);
                }
            });

        //  Configure the stepping parameters with rest of the parameters
        //  for this animation.
        animParams.atPut('values', valueVals);
    }

    //  Add the TIBET extension to be able to supply a 'compute function' so
    //  that we can have 'bouncy', etc. animations :-).
    if (TP.notEmpty(computeFunc = this.getAttribute('tibet:computeFunc',
                                                    true))) {
        animParams.atPut('compute', computeFunc);
    }

    //  Go ahead and obtain the event IDs for the control element. We'll
    //  pass those along to the transition if it wants to use them to signal
    //  its signals.
    animParams.atPut('targetOrigins', TP.elementGetEventIds(control));

    //  We also tell the transition engine that we want to signal using a
    //  TP.DOM_FIRING signaling policy
    animParams.atPut('signalPolicy', TP.DOM_FIRING);

    //  All the set up is over. Do the deed.
    if (realTargetIsCSS) {
        TP.core.CSSPropertyTransition.transition(
                                control, attributeName, animParams);
    } else {
        TP.core.AttributeTransition.transition(
                                control, attributeName, animParams);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
