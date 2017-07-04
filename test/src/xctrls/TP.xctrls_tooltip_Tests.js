//  ========================================================================
//  TP.tooltiptest
//  ========================================================================

/**
 * @type {Namespace}
 * @summary Defines namespace-level objects and functionality for the project.
 */

TP.defineNamespace('TP.tooltiptest');

TP.w3.Xmlns.registerNSInfo('urn:app:tooltiptest',
    TP.hc('prefix', 'tooltiptest'));

//  ========================================================================
//  TP.tooltiptest.TooltipTestContent
//  ========================================================================

/**
 * @type {TP.tooltiptest.TooltipTestContent}
 * @summary TP.tooltiptest.TooltipTestContent
 */

//  ------------------------------------------------------------------------

TP.core.CompiledTag.defineSubtype('tooltiptest.TooltipTestContent');

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.tooltiptest.TooltipTestContent.defineAttribute('styleURI', TP.NO_RESULT);
TP.tooltiptest.TooltipTestContent.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tooltiptest.TooltipTestContent.Type.defineMethod('tagCompile',
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
    '<div tibet:tag="tooltiptest:TooltipTestContent"' +
            ' class="type_test_content">' +
        '<h3>' +
            'A tooltip from tooltiptest:TooltipTestContent' +
        '</h3>' +
    '</div>');

    //  Note here how we return the *result* of this method due to node
    //  importing, etc.
    return TP.elementReplaceWith(elem, newElem);
});

//  ------------------------------------------------------------------------

TP.uc('urn:tibet:test_tooltip_content').setResource(
    TP.elem('<div xmlns="http://www.w3.org/1999/xhtml"><span>Some test content for a tooltip</span></div>'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
