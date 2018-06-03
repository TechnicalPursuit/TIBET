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
 * @summary 'article' tag. Blog entry or newspaper article.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('article');

//  ========================================================================
//  TP.html.aside (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.aside}
 * @summary 'aside' tag. Content that is slightly related to the rest of the
 *     page.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('aside');

//  ========================================================================
//  TP.html.body
//  ========================================================================

/**
 * @type {TP.html.body}
 * @summary 'body' tag. Document body.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('body');

TP.html.body.Type.set('uriAttrs', TP.ac('background'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.body.Type.defineMethod('isResponderForUIFocusChange',
function(aNode, aSignal) {

    /**
     * @method isResponderForUIFocusChange
     * @summary Returns true because the body is always focusable.
     * @param {Node} aNode The node to check which may have further data as to
     *     whether this type should be considered to be a responder.
     * @param {TP.sig.Signal} aSignal The signal that responders are being
     *     computed for.
     * @returns {Boolean} True when the receiver should respond to aSignal.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.html.body.Type.defineMethod('isResponderForUIFocusComputation',
function(aNode, aSignal) {

    /**
     * @method isResponderForUIFocusComputation
     * @summary Returns true because the body can always participate in focus
     *     computations.
     * @param {Node} aNode The node to check which may have further data as to
     *     whether this type should be considered to be a responder.
     * @param {TP.sig.Signal} aSignal The signal that responders are being
     *     computed for.
     * @returns {Boolean} True when the receiver should respond to aSignal.
     */

    return true;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.body.Inst.defineMethod('becomeFocusedResponder',
function() {

    /**
     * @method becomeFocusedResponder
     * @summary Tells the receiver that it is now the 'focused responder'.
     * @returns {TP.html.body} The receiver.
     */

    //  We override this from our supertype because, while we're considered
    //  officially 'focusable', we'll never want to be pushed onto the focus
    //  stack.

    return this;
});

//  ------------------------------------------------------------------------

TP.html.body.Inst.defineMethod('resignFocusedResponder',
function() {

    /**
     * @method resignFocusedResponder
     * @summary Tells the receiver that it is no longer the 'focused
     *     responder'.
     * @returns {TP.html.body} The receiver.
     */

    //  We override this from our supertype because, while we're considered
    //  officially 'focusable', we'll never be pushed onto the focus stack and
    //  'blurring' us should never cause the focus stack to be manipulated.

    return this;
});

//  ========================================================================
//  TP.html.figcaption (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.figcaption}
 * @summary 'figcaption' tag. A figure caption.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('figcaption');

//  ========================================================================
//  TP.html.figure (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.figure}
 * @summary 'figure' tag. A piece of self-contained flow content.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('figure');

//  ========================================================================
//  TP.html.footer (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.footer}
 * @summary 'footer' tag. A footer for a section.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('footer');

//  ========================================================================
//  TP.html.head
//  ========================================================================

/**
 * @type {TP.html.head}
 * @summary 'head' tag. Document head.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('head');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.head.Type.defineMethod('tagTidy',
function(aRequest) {

    /**
     * @method tagTidy
     * @summary Coalesce and rewrite head content such as css:sheet nodes to
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
 * @summary 'header' tag. A header for a section.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('header');

//  ========================================================================
//  TP.html.html
//  ========================================================================

/**
 * @type {TP.html.html}
 * @summary 'html' tag. Document root.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('html');

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.html.html.Type.defineMethod('tagTidy',
function(aRequest) {

    /**
     * @method tagTidy
     * @summary Updates the document so that it remains valid and ready for
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
//  TP.html.main (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.main}
 * @summary 'main' tag. Defines a main.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('main');

//  ========================================================================
//  TP.html.nav (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.nav}
 * @summary 'nav' tag. Section of the document intended for navigation.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('nav');

//  ========================================================================
//  TP.html.section (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.section}
 * @summary 'section' tag. Document section.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('section');

//  ========================================================================
//  TP.html.title
//  ========================================================================

/**
 * @type {TP.html.title}
 * @summary 'title' tag. Document title.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('title');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
