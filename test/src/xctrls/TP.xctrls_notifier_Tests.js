//  ========================================================================
//  TP.tmp.NotifierTestContent
//  ========================================================================

/**
 * @type {TP.tmp.NotifierTestContent}
 * @summary TP.tmp.NotifierTestContent
 */

//  ------------------------------------------------------------------------

TP.tag.ComputedTag.defineSubtype('tmp.NotifierTestContent');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.tmp.NotifierTestContent.defineAttribute('styleURI', TP.NO_RESULT);
TP.tmp.NotifierTestContent.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tmp.NotifierTestContent.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Element} The new element.
     */

    var elem,
        newElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    newElem = TP.xhtmlnode(
    '<div tibet:tag="tmp:NotifierTestContent"' +
            ' class="type_test_content">' +
        '<ul>' +
            '<li>' + 'Item #1' + '</li>' +
            '<li>' + 'Item #2' + '</li>' +
            '<li>' + 'Item #3' + '</li>' +
            '<li>' + 'Item #4' + '</li>' +
            '<li>' + 'Item #5' + '</li>' +
        '</ul>' +
    '</div>');

    //  Note here how we return the *result* of this method due to node
    //  importing, etc.
    return TP.elementReplaceWith(elem, newElem);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
