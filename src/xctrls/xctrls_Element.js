//  ========================================================================
/*
NAME:   xctrls_Element.js
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
 * @type {TP.xctrls.Element}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:Element');

TP.xctrls.Element.addTraitsFrom(TP.core.NonNativeUIElementNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.Element.executeTraitResolution();

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  A TP.core.Hash of 'required attributes' that should be populated on all
//  new instances of the tag.
TP.xctrls.Element.Type.defineAttribute('requiredAttrs');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.Element.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @name tagCompile
     * @synopsis Compiles templates defined with this element into TIBET
     *     representations for use in templating.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     */

    var elem,

        reqAttrs,
        compAttrs;

    elem = aRequest.at('node');

    //  Make sure that the element gets stamped with a 'tibet:nodetype' of
    //  its tag's QName
    TP.elementSetAttribute(elem, 'tibet:nodetype', TP.qname(elem), true);

    //  If the type (but not inherited - just at the individual type level)
    //  has specified 'required attributes' that need to be populated on all
    //  new tag instances, then do that here.
    if (TP.notEmpty(reqAttrs = this.get('requiredAttrs'))) {
        TP.elementSetAttributes(elem, reqAttrs, true);
    }

    //  Make sure to add any 'compilation attributes' to the element (since
    //  we don't call up to our supertype here).
    if (TP.notEmpty(compAttrs = this.getCompilationAttrs(aRequest))) {
        TP.elementSetAttributes(elem, compAttrs, true);
    }

    return;
});

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.xctrls.Element.Type.defineMethod('cmdRunContent',
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
//  end
//  ========================================================================
