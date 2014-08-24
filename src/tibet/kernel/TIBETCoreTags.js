//  ========================================================================
/*
NAME:   TIBETCoreTags.js
AUTH:   Scott Shattuck (ss), William J. Edney (wje)
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
//  ========================================================================

/**
 */

//  ========================================================================
//  TP.core.ApplicationElement
//  ========================================================================

/**
 * @type {TP.core.ApplicationElement}
 * @synopsis TP.core.ApplicationElement is the common supertype of the
 *     TP.tibet.app and TP.tibet.sherpa tag types.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('ApplicationElement');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ApplicationElement.Inst.defineMethod('getApplicationType',
function() {

    /**
     * @name getApplicationType
     * @synopsis Returns the application type that the singleton Application
     *     instance will be created from.
     * @description This method looks for a 'tibet:appctrl' attribute on the
     *     receiver and, if present, will try to resolve the value of that
     *     attribute to a TIBET type. If the attribute is missing or a type
     *     cannot be found, the standard TP.core.Application type will be
     *     returned
     * @returns {TP.lang.RootObject.<TP.core.Application>} A
     *     TP.core.Application subtype type object to create the singleton
     *     Application object from or TP.core.Application if none can be found.
     */

    var typeName,
        type;

    if (TP.notEmpty(typeName = this.getAttribute('tibet:appctrl'))) {
        if (TP.isType(type = TP.sys.require(typeName))) {
            return type;
        } else {
            TP.ifWarn() ?
                TP.warn('Unable to load application controller type: ' +
                            typeName,
                        TP.LOG, arguments) : 0;
        }
    }

    return TP.sys.require('TP.core.Application');
});

//  ========================================================================
//  TP.tibet.app
//  ========================================================================

/**
 * @type {TP.tibet.app}
 * @synopsis TP.tibet.app represents the 'non-Sherpa' application tag. It is
 *     usually generated by the TP.tibet.root tag type if Sherpa is not loaded
 *     or disabled.
 */

//  ------------------------------------------------------------------------

TP.core.ApplicationElement.defineSubtype('tibet:app');

//  ------------------------------------------------------------------------

TP.tibet.app.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    // TODO: The UICANVAS should be set to be the UIROOT here.

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.tibet.app.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @name tagCompile
     * @synopsis Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @description In this type, this method generates either a 'tibet:app' or
     *     a 'tibet:sherpa' tag, depending on whether or not the current boot
     *     environment is set to 'development' or not.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {null}
     */

    var elem,
        name,
        newElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    if (TP.notEmpty(elem.getAttribute('tibet:appctrl'))) {
        return this.callNextMethod();
    }

    name = TP.sys.cfg('project.name');

    newElem = TP.xhtmlnode(
        '<div tibet:sourcetag="tibet:app">' +
            '<h1 class="tag-defaulted">' +
                'Application type for: ' + name + ' not found. ' +
                '&lt;tibet:root/&gt; defaulted to &lt;tibet:app/&gt;' +
            '</h1>' +
        '</div>');

    TP.elementReplaceWith(elem, newElem);

    return;
});

//  ========================================================================
//  TP.tibet.root
//  ========================================================================

/**
 * @type {TP.tibet.root}
 * @synopsis TP.tibet.root represents the tag placed in 'UIROOT' pages (i.e. the
 *     root page of the system). Depending on whether the Sherpa project is
 *     loaded/disabled, this tag will generate either a 'tibet:app' tag or a
 *     'tibet:sherpa' tag to handle the main UI.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('tibet:root');

//  ------------------------------------------------------------------------

TP.tibet.root.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @name tagCompile
     * @synopsis Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @description In this type, this method generates either a 'tibet:app' or
     *     a 'tibet:sherpa' tag, depending on whether or not the current boot
     *     environment is set to 'development' or not.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Element} The new element.
     */

    var elem,
    
        cfg,
        opts,

        profile,
        type,
        name,

        newElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    //  Build up a list of tag names to check. We'll use the first one we have a
    //  matching type for.
    opts = TP.ac();

    cfg = TP.sys.cfg('tibet.apptag');
    if (TP.notEmpty(cfg)) {
        opts.push(cfg);
    }

    cfg = TP.sys.cfg('project.name');
    if (TP.notEmpty(cfg)) {
        opts.push(cfg + ':app');
    }

    profile = TP.sys.cfg('boot.profile');

    //  If the system is configured to run the sherpa, then push its tag into
    //  the list for consideration.
    if (TP.sys.cfg('tibet.sherpa') === true) {
        opts.unshift('tibet:sherpa');
    }

    //  When in doubt at least render something :)
    opts.push('tibet:app');

    //  Keep string for error reporting.
    cfg = opts.join();

    while (TP.notValid(type) && TP.notEmpty(name = opts.shift())) {
        type = TP.sys.getTypeByName(name, false);
    }

    if (TP.notValid(type)) {
        this.raise('TypeNotFound', 'Expected one of: ' + cfg);
        return;
    }

    newElem = TP.elementBecome(elem, name);

    //  We're changing out the tag entirely, so remove any evidence via the
    //  tibet:sourcetag reference.
    TP.elementRemoveAttribute(newElem, 'tibet:sourcetag', true);

    return newElem;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
