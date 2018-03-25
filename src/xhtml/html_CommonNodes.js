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
 * @summary The following types aren't strict XHTML "entities" as defined in
 *     the XTHML DTD but they form a useful framework for attribute inheritance.
 *     TIBET's XHTML node types inherit from appropriate points in this
 *     hierarchy. To improve reuse where necessary, multiple inheritance is used
 *     to further reduce code size.
 * @subject XHTML common node supertypes
 */

//  ========================================================================
//  XHTML "base" types
//  ========================================================================

//  can't construct concrete instances of any of these types

//  ========================================================================
//  TP.html.CoreAttrs
//  ========================================================================

TP.dom.UIElementNode.defineSubtype('html.CoreAttrs');

//  A subtype of TP.core.UIElement that has 4 common attributes:
//  id, class, style, title

TP.html.CoreAttrs.isAbstract(true);

TP.html.CoreAttrs.addTraits(TP.html.Element);

TP.html.CoreAttrs.Type.resolveTrait('booleanAttrs', TP.html.Element);

TP.html.CoreAttrs.Inst.resolveTraits(
        TP.ac('getDisplayValue', 'setDisplayValue'),
        TP.html.Element);

//  ========================================================================
//  TP.html.Attrs
//  ========================================================================

TP.dom.UIElementNode.defineSubtype('html.Attrs');
TP.html.Attrs.isAbstract(true);

TP.html.Attrs.addTraits(TP.html.Element);

TP.html.Attrs.Type.resolveTrait('booleanAttrs', TP.html.Element);

TP.html.Attrs.Inst.resolveTraits(
        TP.ac('getDisplayValue', 'setDisplayValue'),
        TP.html.Element);

//  ========================================================================
//  TP.html.Aligned
//  ========================================================================

TP.html.Attrs.defineSubtype('Aligned');
TP.html.Aligned.isAbstract(true);

//  ========================================================================
//  TP.html.Focused
//  ========================================================================

TP.html.Attrs.defineSubtype('Focused');
TP.html.Focused.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.html.Focused.Type.defineAttribute('opaqueCapturingSignalNames',
        TP.ac(
            'TP.sig.DOMClick',
            'TP.sig.DOMDblClick',

            'TP.sig.DOMKeyDown',
            'TP.sig.DOMKeyPress',
            'TP.sig.DOMKeyUp',

            'TP.sig.DOMMouseDown',
            'TP.sig.DOMMouseEnter',
            'TP.sig.DOMMouseLeave',
            'TP.sig.DOMMouseOut',
            'TP.sig.DOMMouseOver',
            'TP.sig.DOMMouseUp',

            'TP.sig.DOMFocus',
            'TP.sig.DOMBlur'
        ));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.Focused.Type.defineMethod('isResponderForUIFocusChange',
function(aNode, aSignal) {

    /**
     * @method isResponderForUIFocusChange
     * @summary Returns true if the node does not have a 'disabled' attribute to
     *     match (X)HTML semantics.
     * @param {Node} aNode The node to check which may have further data as to
     *     whether this type should be considered to be a responder.
     * @param {TP.sig.Signal} aSignal The signal that responders are being
     *     computed for.
     * @returns {Boolean} True when the receiver should respond to aSignal.
     */

    return !TP.elementHasAttribute(aNode, 'disabled', true);
});

//  ------------------------------------------------------------------------

TP.html.Focused.Type.defineMethod('isResponderForUIFocusComputation',
function(aNode, aSignal) {

    /**
     * @method isResponderForUIFocusComputation
     * @summary Returns true if the node does not have a 'disabled' attribute to
     *     match (X)HTML semantics.
     * @param {Node} aNode The node to check which may have further data as to
     *     whether this type should be considered to be a responder.
     * @param {TP.sig.Signal} aSignal The signal that responders are being
     *     computed for.
     * @returns {Boolean} True when the receiver should respond to aSignal.
     */

    return !TP.elementHasAttribute(aNode, 'disabled', true);
});

//  ========================================================================
//  TP.html.Citation
//  ========================================================================

TP.html.Attrs.defineSubtype('Citation');
TP.html.Citation.isAbstract(true);

//  ========================================================================
//  TP.html.List
//  ========================================================================

TP.html.Attrs.defineSubtype('List');
TP.html.List.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.List.Type.defineMethod('generateMarkup',
function(anObject, attrStr, itemFormat, shouldAutoWrap, formatArgs,
         theRequest) {

    /**
     * @method generateMarkup
     * @summary Generates markup for the supplied Object using the other
     *     parameters supplied.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {String} attrStr The String containing either the literal
     *     attribute markup or a 'template invocation' that can be used inside
     *     of a template.
     * @param {String} itemFormat The name of an 'item format', either a tag
     *     name (which defaults to the 'item tag name' of this type) or some
     *     other format type which can be applied to this type.
     * @param {Boolean} shouldAutoWrap Whether or not the markup generation
     *     machinery should 'autowrap' items of the supplied object (each item
     *     in an Array or each key/value pair in an Object).
     * @param {TP.core.Hash} formatArgs The 'formatting arguments' used by this
     *     machinery to generate item markup.
     * @param {TP.sig.Request|TP.core.Hash} theRequest An optional object
     *     containing parameters.
     * @returns {String} The markup generated by taking the supplied Object and
     *     iterating over its items.
     */

    var tagName,
        template,
        str;

    //  Don't generate markup annotated with the data expression
    theRequest.atPut('annotateMarkup', false);

    //  If the object is an Array, then just skip to the bottom of the
    //  method.
    if (TP.isArray(anObject)) {
        void 0;
    } else if (TP.isTrue(shouldAutoWrap) && TP.isTrue(theRequest.at('repeat'))) {
        //  Otherwise, if we're autowrapping and repeating, the object that
        //  will be handed to the iteration mechanism will be [key,value]
        //  pairs, so we can use that fact to generate item tags around each
        //  one.

        tagName = this.getCanonicalName();

        //  Build a template by joining the tag name with an invocation
        //  of the itemFormat for both the key and the value.
        template = TP.join('<', tagName, attrStr, '>',
                            '{{0.%', itemFormat, '}}',
                            '{{1.%', itemFormat, '}}',
                            '</', tagName, '>');

        //  Perform the transformation.
        str = template.transform(anObject, theRequest);

        return str;
    }

    //  It was either an Array or we weren't autowrapping and repeating. In
    //  that case, just call up the supertype chain and return the value.
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.html.List.Type.defineMethod('getItemTagName',
function() {

    /**
     * @method getItemTagName
     * @summary Returns the 'default item tag name' for use it the
     *     fromArray()/fromObject() methods. Note that this should return the
     *     receiver's *canonical* name.
     * @returns {String} The ID of the observer.
     */

    return 'html:li';
});

//  ------------------------------------------------------------------------

TP.html.List.Type.defineMethod('shouldAutoWrapItems',
function(anObject, formatArgs) {

    /**
     * @method shouldAutoWrapItems
     * @summary Whether or not our fromArray() / fromObject() methods
     *     'auto-wrap items'. See those methods for more information.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.core.Hash} formatArgs An optional object containing
     *     parameters.
     * @returns {Boolean} Whether or not we automatically wrap items.
     */

    if (TP.isBoolean(formatArgs.at('autowrap'))) {
        return formatArgs.at('autowrap');
    }

    //  An TP.html.List's default is to *not* wrap each item of an Array in
    //  its own tags (maybe each one goes in an 'li').
    if (TP.isArray(anObject)) {
        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
