//  ========================================================================
/*
NAME:   svg_Element.js
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
 * @type {TP.svg.Element}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('svg:Element');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.svg.Element.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @name cmdRunContent
     * @synopsis Invoked by the TIBET Shell when the tag is being "run" as part
     *     of a pipe or command sequence. For a UI element like an HTML element
     *     this effectively means to render itself onto the standard output
     *     stream.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest The request/param hash.
     */

    var elem;

    //  Make sure that we have an Element to work from.
    if (!TP.isElement(elem = aRequest.at('cmdNode'))) {
        return;
    }

    aRequest.atPut('cmdAsIs', true);
    aRequest.atPut('cmdBox', false);

    aRequest.complete(elem);

    return;
});

//  ------------------------------------------------------------------------
//  TSH Phase Support
//  ------------------------------------------------------------------------

TP.svg.Element.Type.defineMethod('tshCompile',
function(aRequest) {

    /**
     * @name tshCompile
     * @synopsis Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @description This method overrides the implementation in its supertype to
     *     prevent any conversion (otherwise, SVG elements will be converted
     *     into HTML 'span' elements).
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Array} An array containing the new node and a TSH loop control
     *     constant, TP.DESCEND by default.
     * @todo
     */

    //  Don't even bother going down any further.

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------

TP.svg.Element.Type.defineMethod('tshUnmarshal',
function(aRequest) {

    /**
     * @name tshUnmarshal
     * @synopsis Unmarshals the receiver's content. This includes resolving XML
     *     Base URIs and virtual URIs that may occur on the receiver's
     *     attributes.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request or hash
     *     containing control parameters.
     * @returns {Number} The TP.DESCEND flag, telling the system to descend into
     *     the children of this element.
     */

    var node,
        uriAttrs;

    //  Make sure that we have a node to work from.
    if (TP.notValid(node = aRequest.at('cmdNode'))) {
        //  TODO: Raise an exception.
        return;
    }

    //  Grab the element's 'URI attributes'. If that's empty, then just
    //  return.
    if (TP.isEmpty(uriAttrs = this.get('uriAttrs'))) {
        return TP.DESCEND;
    }

    //  update the XML Base references in the node

    //  This call is the reason we overrode this method from our supertype's
    //  definition - note how we pass a prefix and a suffix to be stripped
    //  before URI computation and then to be prepended/appended back on
    //  when setting the result.
    TP.elementResolveXMLBase(node, uriAttrs, 'url(', ')');

    //  We want the system traverse our children
    return TP.DESCEND;
});

//  ------------------------------------------------------------------------

TP.svg.Element.Type.defineMethod('tshAwakenDOM',
function(aRequest) {

    /**
     * @name tshAwakenDOM
     * @synopsis Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Number} The TP.DESCEND flag, telling the system to descend into
     *     the children of this element.
     */

    var elem,
        uriAttrs,

        loc;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('cmdNode'))) {
        //  TODO: Raise an exception.
        return;
    }

    //  Work around a bug that is present (at least in Gecko-based browsers)
    //  when SVG attributes have URLs like '#url(foo)' and the SVG is living
    //  inside of an HTML document with a 'base' tag.

    //  Grab the element's 'URI attributes'. If that's empty, then just
    //  return.
    if (TP.isEmpty(uriAttrs = this.get('uriAttrs'))) {
        return TP.DESCEND;
    }

    //  Note here how we go after the document's "URL" directly - we don't
    //  use TP.documentGetLocation(), since that will return the XML/HTML
    //  base location, which doesn't fix this bug.
    loc = TP.nodeGetDocument(elem).URL;

    uriAttrs.perform(
        function(anAttrName) {

            var val;

            if (TP.isEmpty(val = TP.elementGetAttribute(elem,
                                                        anAttrName,
                                                        true))) {
                return;
            }

            //  If the value is already a URI, don't mess with it. Changing
            //  the value here is only meant for when the whole value is
            //  something like 'url(#foo)'.
            if (TP.isURI(val)) {
                return;
            }

            if (val.startsWith('url(')) {
                val = val.slice(4, -1);

                TP.elementSetAttribute(elem,
                                        anAttrName,
                                        TP.join('url(', loc, val, ')'),
                                        true);
            }
});

    return TP.DESCEND;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
