//  ========================================================================
/*
NAME:   tsh_transform.js
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
//  TSH Phase Support
//  ------------------------------------------------------------------------

TP.tsh.transform.Type.defineMethod('tshCompile',
function(aRequest) {

    /**
     * @name tshCompile
     * @synopsis Compiles transform elements. This method causes underlying
     *     'tsh:template' elements to be skipped, since they are compiled
     *     on-the-fly using the mechanism in this type's 'compileTemplates'
     *     method.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Constant} The TP.CONTINUE flag, telling the system to leave the
     *     current node in the DOM but to skip any children of the current node.
     */

    return TP.CONTINUE;
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
