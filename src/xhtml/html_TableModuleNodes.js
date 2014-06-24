//  ========================================================================
/*
NAME:   html_TableModuleNodes.js
AUTH:   Scott Shattuck (ss)
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

//  ========================================================================
//  TP.html.tcell
//  ========================================================================

TP.html.Attrs.defineSubtype('tcell');

//  can't construct concrete instances of this
TP.html.tcell.isAbstract(true);

//  ========================================================================
//  TP.html.tcolumn
//  ========================================================================

TP.html.tcell.defineSubtype('tcolumn');

//  can't construct concrete instances of this
TP.html.tcolumn.isAbstract(true);

//  ========================================================================
//  TP.html.caption
//  ========================================================================

/**
 * @type {TP.html.caption}
 * @synopsis 'caption' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('caption');

//  ========================================================================
//  TP.html.col
//  ========================================================================

/**
 * @type {TP.html.col}
 * @synopsis 'col' tag.
 */

//  ------------------------------------------------------------------------

TP.html.tcolumn.defineSubtype('col');

//  ========================================================================
//  TP.html.colgroup
//  ========================================================================

/**
 * @type {TP.html.colgroup}
 * @synopsis 'colgroup' tag.
 */

//  ------------------------------------------------------------------------

TP.html.tcolumn.defineSubtype('colgroup');

//  ========================================================================
//  TP.html.table
//  ========================================================================

/**
 * @type {TP.html.table}
 * @synopsis 'table' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('table');

//  ------------------------------------------------------------------------

TP.backstop(
    TP.ac('createCaption',
            'createTFoot',
            'createTHead',
            'deleteCaption',
            'deleteRow',
            'deleteTFoot',
            'deleteTHead',
            'insertRow'),
            TP.html.table.getInstPrototype());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.table.Type.defineMethod('generateMarkup',
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

    tagName = this.getTagName();

    if (TP.isTrue(shouldAutoWrap) && TP.isTrue(theRequest.at('repeat'))) {
        //  Build a template by joining the tag name with an invocation of
        //  the 'TP.html.tr' format for the value.
        template = TP.join('<', tagName, attrStr, '>',
                            '{{value%%TP.html.tr}}',
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

TP.html.table.Type.defineMethod('getItemTagName',
function() {

    /**
     * @name getItemTagName
     * @synopsis Returns the 'default item tag name' for use it the
     *     fromArray()/fromObject() methods.
     * @returns {String} The item tag name.
     * @todo
     */

    return 'html:tr';
});

//  ------------------------------------------------------------------------

TP.html.table.Type.defineMethod('shouldAutoWrapItems',
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

    if (TP.isBoolean(formatArgs.at('autowrap'))) {
        return formatArgs.at('autowrap');
    }

    //  An 'TP.html.table's default is to *not* wrap each item of an Object
    //  in its own tags (maybe each one goes in an 'TP.html.tr').
    return false;
});

//  ========================================================================
//  TP.html.tbody
//  ========================================================================

/**
 * @type {TP.html.tbody}
 * @synopsis 'tbody' tag. Table body.
 */

//  ------------------------------------------------------------------------

TP.html.tcell.defineSubtype('tbody');

//  ------------------------------------------------------------------------

TP.backstop(
    TP.ac('deleteRow',
            'insertRow'),
            TP.html.tbody.getInstPrototype());


//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.tbody.Inst.defineMethod('refresh',
function(aSignal) {

    /**
     * @name refresh
     * @synopsis Updates the receiver to reflect the current value of any data
     *     binding it may have. If the signal argument's payload specified a
     *     'deep' refresh then descendant elements are also updated.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action. This signal should include a key of 'deep' and a value of
     *     true to cause a deep refresh that updates all nodes.
     * @todo
     */

    return this;
});

//  ========================================================================
//  TP.html.td
//  ========================================================================

/**
 * @type {TP.html.td}
 * @synopsis 'td' tag. Table data.
 */

//  ------------------------------------------------------------------------

TP.html.tcell.defineSubtype('td');

//  ========================================================================
//  TP.html.tfoot
//  ========================================================================

/**
 * @type {TP.html.tfoot}
 * @synopsis 'tfoot' tag. Table footing.
 */

//  ------------------------------------------------------------------------

TP.html.tcell.defineSubtype('tfoot');

//  ========================================================================
//  TP.html.th
//  ========================================================================

/**
 * @type {TP.html.th}
 * @synopsis 'th' tag. Table heading.
 */

//  ------------------------------------------------------------------------

TP.html.tcell.defineSubtype('th');

//  ========================================================================
//  TP.html.thead
//  ========================================================================

/**
 * @type {TP.html.thead}
 * @synopsis 'thead' tag. Table heading.
 */

//  ------------------------------------------------------------------------

TP.html.tcell.defineSubtype('thead');

//  ========================================================================
//  TP.html.tr
//  ========================================================================

/**
 * @type {TP.html.tr}
 * @synopsis 'tr' tag. Table row.
 */

//  ------------------------------------------------------------------------

TP.html.tcell.defineSubtype('tr');

//  ------------------------------------------------------------------------

TP.backstop(
    TP.ac('deleteCell',
            'insertCell'),
            TP.html.tr.getInstPrototype());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.tr.Type.defineMethod('generateMarkup',
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

//  ------------------------------------------------------------------------

TP.html.tr.Type.defineMethod('getItemTagName',
function() {

    /**
     * @name getItemTagName
     * @synopsis Returns the 'default item tag name' for use it the
     *     fromArray()/fromObject() methods.
     * @returns {String} The item tag name.
     * @todo
     */

    return 'html:td';
});

//  ------------------------------------------------------------------------

TP.html.tr.Type.defineMethod('shouldAutoWrapItems',
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

    if (TP.isBoolean(formatArgs.at('autowrap'))) {
        return formatArgs.at('autowrap');
    }

    //  An 'TP.html.tr's default is to *not* wrap each item of an Array in
    //  its own tags (maybe each one goes in an 'TP.html.td').
    if (TP.isArray(anObject)) {
        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
