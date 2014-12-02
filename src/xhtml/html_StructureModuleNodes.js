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
//  TP.html.article (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.article}
 * @synopsis 'article' tag. Blog entry or newspaper article.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('article');

//  ========================================================================
//  TP.html.aside (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.aside}
 * @synopsis 'aside' tag. Content that is slightly related to the rest of the
 *     page.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('aside');

//  ========================================================================
//  TP.html.body
//  ========================================================================

/**
 * @type {TP.html.body}
 * @synopsis 'body' tag. Document body.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('body');

TP.html.body.Type.set('uriAttrs', TP.ac('background'));

//  ========================================================================
//  TP.html.figcaption (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.figcaption}
 * @synopsis 'figcaption' tag. A figure caption.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('figcaption');

//  ========================================================================
//  TP.html.figure (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.figure}
 * @synopsis 'figure' tag. A piece of self-contained flow content.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('figure');

//  ========================================================================
//  TP.html.footer (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.footer}
 * @synopsis 'footer' tag. A footer for a section.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('footer');

//  ========================================================================
//  TP.html.head
//  ========================================================================

/**
 * @type {TP.html.head}
 * @synopsis 'head' tag. Document head.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('head');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.head.Type.defineMethod('tagTidy',
function(aRequest) {

    /**
     * @name tagTidy
     * @synopsis Coalesce and rewrite head content such as css:sheet nodes to
     *     ensure we have them ready for css:* processing later on.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    TP.ifTrace() && TP.sys.cfg('log.css_processing') ?
        TP.trace('Merging css:sheet elements into css:sheetset',
                    TP.CSS_LOG) : 0;

    //  TODO:   tidy up the css:sheet elements from tagCompile phase.

    return;
});

//  ========================================================================
//  TP.html.header (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.header}
 * @synopsis 'header' tag. A header for a section.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('header');

//  ========================================================================
//  TP.html.hgroup (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.hgroup}
 * @synopsis 'hgroup' tag. The header of a 'section'.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('hgroup');

//  ========================================================================
//  TP.html.html
//  ========================================================================

/**
 * @type {TP.html.html}
 * @synopsis 'html' tag. Document root.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('html');

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.html.html.Type.defineMethod('tagAttachData',
function(aRequest) {

    var cmdDoc;

    cmdDoc = TP.nodeGetDocument(aRequest.at('node'));

    TP.signal(cmdDoc, 'TP.sig.DOMModelConstruct');
    TP.signal(cmdDoc, 'TP.sig.DOMModelConstructDone');

    return;
});

//  ------------------------------------------------------------------------

TP.html.html.Type.defineMethod('tagTidy',
function(aRequest) {

    /**
     * @name tagTidy
     * @synopsis Updates the document so that it remains valid and ready for
     *     storage. The primary responsibility here is moving any expanded
     *     content from the head to the body so the browser stays happy.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,

        doc,

        head,

        nonValidElements,

        body,

        len,
        i,

        child;

    node = aRequest.at('node');

    doc = TP.nodeGetDocument(node);
    if (TP.isDocument(doc)) {
        head = TP.nodeGetElementsByTagName(doc, 'head').at(0);

        if (TP.isElement(head)) {
            nonValidElements = TP.nodeEvaluateXPath(
                                head,
                                TP.join('./*[',
                                        'local-name() != "base" and ',
                                        'local-name() != "link" and ',
                                        'local-name() != "meta" and ',
                                        'local-name() != "object" and ',
                                        'local-name() != "script" and ',
                                        'local-name() != "style" and ',
                                        'local-name() != "title" and ',
                                        'namespace-uri() != "',
                                            TP.w3.Xmlns.CSSML, '"',
                                        ']'),
                                TP.NODESET);
        }

        if (TP.notEmpty(nonValidElements)) {
            body = TP.nodeGetElementsByTagName(doc, 'body').at(0);

            if (TP.isElement(body)) {
                len = nonValidElements.getSize();
                for (i = 0; i < len; i++) {
                    child = nonValidElements.at(i);
                    body.appendChild(child);
                }
            }
        }
    }

    return;
});

//  ========================================================================
//  TP.html.nav (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.nav}
 * @synopsis 'nav' tag. Section of the document intended for navigation.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('nav');

//  ========================================================================
//  TP.html.section (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.section}
 * @synopsis 'section' tag. Document section.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('section');

//  ========================================================================
//  TP.html.title
//  ========================================================================

/**
 * @type {TP.html.title}
 * @synopsis 'title' tag. Document title.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('title');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
