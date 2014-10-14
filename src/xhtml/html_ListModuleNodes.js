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
//  TP.html.dl
//  ========================================================================

/**
 * @type {TP.html.dl}
 * @synopsis 'dl' tag. Definition list.
 */

//  ------------------------------------------------------------------------

TP.html.List.defineSubtype('dl');

TP.html.dl.set('booleanAttrs', TP.ac('compact'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.dl.Type.defineMethod('generateMarkup',
function(anObject, attrStr, itemFormat, shouldAutoWrap, formatArgs, theRequest) {

    /**
     * @name generateMarkup
     * @synopsis Generates markup for the supplied Object using the other
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
     * @param {TP.lang.Hash} formatArgs The 'formatting arguments' used by this
     *     machinery to generate item markup.
     * @param {TP.sig.Request|TP.lang.Hash} theRequest An optional object
     *     containing parameters.
     * @returns {String} The markup generated by taking the supplied Object and
     *     iterating over its items.
     * @todo
     */

    var tagName,
        template,
        str;

    tagName = this.getTagName();

    if (TP.isTrue(shouldAutoWrap) && TP.isTrue(theRequest.at('repeat'))) {
        if (TP.isArray(anObject)) {
            //  The object that handed to the iteration mechanism is an
            //  Array, generate 'TP.html.dt' tags around each index and
            //  'TP.html.dd' tags around each value.

            //  Build a template by joining the tag name with an invocation
            //  of the 'TP.html.dt' format for the index and an invocation
            //  of the 'TP.html.dd' format for the value.
            template = TP.join('<', tagName, attrStr, '>',
                                '{{$INDEX%%TP.html.dt}}',
                                '{{value%%TP.html.dd}}',
                                '</', tagName, '>');
        } else {
            //  Otherwise, the object that will be handed to the iteration
            //  mechanism will be [key,value] pairs, so we can use that fact
            //  to generate item tags around each one.

            //  Build a template by joining the tag name with an invocation
            //  of the itemFormat for both the key and the value.
            template = TP.join('<', tagName, attrStr, '>',
                                '{{0%%TP.html.dt}}',
                                '{{1%%TP.html.dd}}',
                                '</', tagName, '>');
        }

        //  Perform the transformation.
        str = template.transform(anObject, theRequest);

        return str;
    }

    //  It was either an Array or we weren't autowrapping and repeating. In
    //  that case, just call up the supertype chain and return the value.
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.html.dl.Type.defineMethod('getItemTagName',
function() {

    /**
     * @name getItemTagName
     * @synopsis Returns the 'default item tag name' for use it the
     *     fromArray()/fromObject() methods.
     * @returns {String} The ID of the observer.
     * @todo
     */

    //  NB: We return the empty String here because, if we're repeating, the
    //  generateMarkup() routine above will choose the proper dt/dd
    //  combination, based on the data source supplied, but if not we can't
    //  determine where to place what (i.e. 'TP.html.dl' tags don't have a
    //  'single' item tag) so we just bail out here.

    return '';
});

//  ------------------------------------------------------------------------

TP.html.dl.Type.defineMethod('shouldAutoWrapItems',
function(anObject, formatArgs) {

    /**
     * @name shouldAutoWrapItems
     * @synopsis Whether or not our fromArray() / fromObject() methods
     *     'auto-wrap items'. See those methods for more information.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.lang.Hash} formatArgs An optional object containing
     *     parameters.
     * @returns {Boolean} Whether or not we automatically wrap items.
     * @todo
     */

    //  We should always set this to 'true' since our markup generation
    //  method override always uses templates (even though our markup
    //  generation method doesn't support autowrap).
    return true;
});

//  ========================================================================
//  TP.html.dt
//  ========================================================================

/**
 * @type {TP.html.dt}
 * @synopsis 'dt' tag. Definition term.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('dt');

//  ========================================================================
//  TP.html.dd
//  ========================================================================

/**
 * @type {TP.html.dd}
 * @synopsis 'dd' tag. Definition definition ;).
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('dd');

//  ========================================================================
//  TP.html.ol
//  ========================================================================

/**
 * @type {TP.html.ol}
 * @synopsis 'ol' tag. Ordered list.
 */

//  ------------------------------------------------------------------------

TP.html.List.defineSubtype('ol');

TP.html.ol.set('booleanAttrs', TP.ac('compact', 'reversed'));

//  ========================================================================
//  TP.html.ul
//  ========================================================================

/**
 * @type {TP.html.ul}
 * @synopsis 'ul' tag. Unordered list.
 */

//  ------------------------------------------------------------------------

TP.html.List.defineSubtype('ul');

TP.html.ul.set('booleanAttrs', TP.ac('compact'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.ul.Type.defineMethod('generateMarkup',
function(anObject, attrStr, itemFormat, shouldAutoWrap,
formatArgs, theRequest        ) {

    /**
     * @name generateMarkup
     * @synopsis Generates markup for the supplied Object using the other
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
     * @param {TP.lang.Hash} formatArgs The 'formatting arguments' used by this
     *     machinery to generate item markup.
     * @param {TP.sig.Request|TP.lang.Hash} theRequest An optional object
     *     containing parameters.
     * @returns {String} The markup generated by taking the supplied Object and
     *     iterating over its items.
     * @todo
     */

    var tagName,
        template,
        str;

    //  If the object is an Array, then just skip to the bottom of the
    //  method.
    if (TP.isArray(anObject)) {

    } else if (TP.isTrue(shouldAutoWrap) && TP.isTrue(theRequest.at('repeat'))) {
        //  Otherwise, if we're autowrapping and repeating, the object that
        //  will be handed to the iteration mechanism will be [key,value]
        //  pairs, so we can use that fact to generate item tags around each
        //  one.

        tagName = this.getTagName();

        //  Build a template by joining the tag name with an invocation
        //  of the itemFormat for both the key and the value.
        template = TP.join('<', tagName, attrStr, '>',
                            '{{0%%', itemFormat, '}}',
                            '{{1%%', itemFormat, '}}',
                            '</', tagName, '>');

        //  Perform the transformation.
        str = template.transform(anObject, theRequest);

        return str;
    }

    //  It was either an Array or we weren't autowrapping and repeating. In
    //  that case, just call up the supertype chain and return the value.
    return this.callNextMethod();
});

//  ========================================================================
//  TP.html.li
//  ========================================================================

/**
 * @type {TP.html.li}
 * @synopsis 'li' tag. List item.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('li');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
