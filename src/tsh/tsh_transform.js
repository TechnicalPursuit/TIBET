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
 * @type {TP.tsh.transform}
 * @synopsis A subtype of TP.core.ActionElementNode that knows how to transform
 *     source data (supplied by stdin) against registered templates (or
 *     templates embedded as child nodes) and write it to stdout.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:transform');

TP.tsh.transform.addTraitsFrom(TP.core.PipeSegmentElementNode);
TP.tsh.transform.addTraitsFrom(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.transform.Type.defineMethod('compileTemplates',
function(transformElem) {

    /**
     * @name compileTemplates
     * @synopsis Compiles all of the 'tsh:template' elements under the supplied
     *     transform element
     * @param {TP.tsh.transform} transformElem The transform element to look for
     *     templates.
     */

    var templateElems,
        transformID;

    //  Get all of the template elements under the transform element.
    templateElems = TP.nodeGetElementsByTagName(transformElem,
                                                'tsh:template');

    //  Grab the transform elem's ID (making sure we have one and
    //  generate/assign one if we don't)
    transformID = TP.lid(transformElem, true);

    templateElems.perform(
        function(anElem) {

            var templateName,
                templateURI,

                compileRequest,

                templateContentElem;

            //  If the template doesn't have a 'template name', then we
            //  construct one out of our ID and the template name and set
            //  it.
            if (TP.isEmpty(
                    templateName =
                        TP.elementGetAttribute(anElem, 'tsh:name', true))) {
                templateName = 'template_' + transformID + '_' + TP.genID();

                TP.elementSetAttribute(anElem,
                                        'tsh:name',
                                        templateName,
                                        true);
            }

            //  Construct a URI from the 'tibet' urn scheme and the name.
            templateURI = TP.uc(TP.TIBET_URN_PREFIX + templateName);

            //  Try to fetch the compiled template (which will be the
            //  resource of that URI) and, if its not available, compile it.
            if (TP.notValid(templateURI.getResource(TP.hc('async', false)))) {
                //  Set the 'tsh:generator' to be the transform element's ID
                TP.elementSetAttribute(anElem,
                                        'tsh:generator',
                                        transformID,
                                        true);

                //  Create a 'compile request' to compile the template.
                compileRequest = TP.request(
                    TP.hc('cmdExecute', false,
                            'cmdSilent', true,
                            'cmdTargetDoc', TP.nodeGetDocument(transformElem),
                            'cmdPhases', TP.core.TSH_COMPILE_PHASES,
                            'targetPhase', 'Compile'));

                //  Compile the template
                TP.process(anElem, compileRequest);

                templateContentElem = TP.nodeGetFirstChildElement(anElem);

                //  Set the resource to a clone of the node. We do this
                //  in case the DOM where the node is sitting goes away.
                templateURI.setResource(
                            TP.wrap(TP.nodeCloneNode(templateContentElem)));
            }
        });

    return;
});

//  ------------------------------------------------------------------------

TP.tsh.transform.Type.defineMethod('transformInput',
function(anInput, cmdNode, aRequest) {

    /**
     * @name transformInput
     * @synopsis Transforms an input object using information from the request
     *     provided.
     * @description This type's version of this method executes the templates
     *     configured for it against the supplied input and returns the result.
     * @param {Object} anInput The object to transform.
     * @param {Node} cmdNode The original transformation node.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @raises TP.sig.InvalidTransform
     * @returns {Object} The transformed input.
     * @todo
     */

    var rootName,
        templateName,
        template,
        params,
        result;

    //  The transform must reference the "root template" in a tsh:template
    //  attribute. This attribute can be provided manually, or it is
    //  injected on the transform by a child template tag during
    //  compilation.
    rootName = TP.elementGetAttribute(cmdNode, 'tsh:root_template', true);
    if (TP.isEmpty(rootName)) {
        aRequest.fail(TP.FAILURE, 'Invalid root template name.');

        return;
    }

    //  Compute a URI that is a 'tibet:' URN that will point to the template
    //  (which should have been registered with the same URN)
    templateName = rootName.startsWith(TP.TIBET_URN_PREFIX) ?
                    rootName :
                    TP.TIBET_URN_PREFIX + rootName;

    //  Fetch the template from the URI.
    if (TP.notValid(template =
                    TP.uc(templateName).getResource(TP.hc('async', false)))) {

        //  The template couldn't be found. Compile any templates under us.
        this.compileTemplates(cmdNode);

        //  Try again.
        if (TP.notValid(template =
                    TP.uc(templateName).getResource(TP.hc('async', false)))) {
            aRequest.fail(TP.FAILURE,
                            'Unable to find template: ' + templateName);

            return;
        }
    }

    //  If the transform has a 'repeat' attribute on it, then set up a hash
            //  that will have 'repeat' so the template invocation will iterate.
    if (TP.elementGetAttribute(cmdNode, 'tsh:repeat', true) === 'true') {
        params = TP.hc('repeat', true);
    }

    //  Execute the template
    result = TP.format(anInput, template, params);

    if (TP.isValid(result)) {
        return result;
    } else {
        aRequest.fail(TP.FAILURE, 'Transform failed to produce output.');

        return;
    }
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tsh.transform.Inst.defineMethod('isSingleValued',
function() {

    /**
     * @name isSingleValued
     * @synopsis Returns true if the receiver binds to single values.
     * @description This method on this type always returns 'false', since we
     *     can handle 'collection' data, not just single values.
     * @returns {Boolean} True when single valued.
     */

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
