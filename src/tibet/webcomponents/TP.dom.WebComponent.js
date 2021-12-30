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
 * @type {TP.dom.WebComponent}
 * @summary Manages custom elements that use ReactJS components.
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('dom.WebComponent');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are *NOT*
//  TYPE_LOCAL, by design. We *want* subtypes to inherit these values..
TP.dom.WebComponent.Type.defineAttribute('styleURI', TP.NO_RESULT);
TP.dom.WebComponent.Type.defineAttribute('themeURI', TP.NO_RESULT);

TP.dom.WebComponent.Type.defineAttribute('webComponentTagName');
TP.dom.WebComponent.Type.defineAttribute('extendsTagName');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.dom.WebComponent.Type.defineMethod('tagExpand',
function(aRequest) {

    /**
     * @method tagExpand
     * @summary Expand the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @description This method operates differently depending on a variety of
     *     factors:
     *          - If the current node has a 'tibet:ctrl', but not a
     *              'tibet:tag', and its operating in a native namespace,
     *              this method returns with no transformation occurring and no
     *              child content being processed.
     *          - If the request contains a command target document and that
     *              target document is not an HTML document, then this element
     *              remains untransformed but its children are processed.
     *          - Otherwise, the element is transformed into a 'div' or 'span',
     *              depending on the return value of the 'isBlockLevel' method.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The element that this tag has become.
     */

    var elem,
        tpElem,

        webcomponentTagName,
        extendsTagName,

        str,

        tibetTagName,

        newElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    tpElem = TP.wrap(elem);

    //  Grab the WebComponent tag name that should be a type attribute on this
    //  type.
    webcomponentTagName = this.get('webComponentTagName');
    if (TP.isEmpty(webcomponentTagName)) {
        TP.ifWarn() ?
            TP.warn('Could not find a WebComponent tag name for: ' +
                    tpElem.getTagName()) : 0;
        return;
    }

    //  Grab the optional 'extends' tag name (if the author is extending a
    //  built-in concrete HTML element type).
    extendsTagName = this.get('extendsTagName');

    //  Grab our tag name - this is the one recognized by TIBET.
    tibetTagName = tpElem.getTagName();

    //  Strip out any '-'s from the name. WebComponents are required to use '-'
    //  as part of their name and those won't work for JavaScript identifiers.
    //  So a WebComponent with a tag name of 'my-component' should have been
    //  authored to have a TIBET type name of 'mycomponent'.
    tibetTagName = tibetTagName.strip(/\-/g);

    //  If the WebComponents author supplied an 'extends' tag name on this type,
    //  this means that they're extending a (concrete) built-in HTML element and
    //  we need to generate different markup.
    if (TP.notEmpty(extendsTagName)) {
        str = `<${extendsTagName} is="${webcomponentTagName}" tibet:tag="${tibetTagName}"/>`;
    } else {
        //  Not an extension to a built-in HTML element? Just generate markup
        //  appropriate for an 'anonymous' WebComponent (one that inherits from
        //  HTMLElement directly).
        str = `<${webcomponentTagName} tibet:tag="${tibetTagName}"/>`;
    }

    //  Create that element in the XHTML namespace (the only place where
    //  WebComponents can live :-( ).
    newElem = TP.xhtmlnode(str);

    //  Replace ourself in the DOM with the newly generated element and copy our
    //  attributes and children over to it. Note the reassignment here to make
    //  sure we're getting the imported node.
    newElem = TP.elementReplaceWith(elem, newElem);
    TP.elementCopyAttributes(elem, newElem);
    TP.nodeCopyChildNodesTo(elem, newElem);

    //  Set the new element's generator to ourself.
    TP.elementSetGenerator(newElem);

    //  Tell the tag processor to descend into our children.
    newElem[TP.PROCESSOR_HINT] = TP.DESCEND;

    //  Return the newly generated element so that the tag processor knows that
    //  it's already processed us.
    return newElem;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
