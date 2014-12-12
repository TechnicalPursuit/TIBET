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
//  TP.html.style
//  ========================================================================

/**
 * @type {TP.html.style}
 * @synopsis 'style' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('style');

TP.html.style.Type.set('booleanAttrs', TP.ac('scoped'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.html.style.Type.defineMethod('tagPrecompile',
function(aRequest) {

    /**
     * @name tagPrecompile
     * @synopsis Replaces the style element with a css:style element suitable for
     *     compiling or otherwise processing the CSS.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,
        base,
        styleText,
        arr,
        newStyleText,
        newNode,
        str;

    TP.stop('break.css_processing');

    //  wall off conversion of TP.html.style elements so the css processing
    //  pipeline never gets off the ground.
    if (!TP.sys.cfg('css.process_styles')) {
        return TP.CONTINUE;
    }

    if (TP.notValid(node = aRequest.at('node'))) {
        return aRequest.fail('Unable to find command node.');
    }

    base = TP.ifInvalid(TP.elementGetAttribute(node, 'src'), '.');

    //  get all text content, which should be in a CDATA block
    styleText = TP.nodeGetTextContent(node);

    //  we'll be building up a string representation of our output node so
    //  get an array ready to accept the chunks.
    arr = TP.ac();

    //  replace @import references with a new css:sheet node containing that
    //  import's file content, marking the new css:sheet node with the URI
    //  for reference during indexing. the @import is replaced with a
    //  comment.
    //  The basic strategy is that since @imports have to be processed as if
    //  they were first, no matter where they were found, any @imports we
    //  find inside the inline style node can be placed in front of it in
    //  the order they were found as if they were link elements.

    TP.regex.CSS_IMPORT_RULE.lastIndex = 0;
    newStyleText = styleText.replace(
        TP.regex.CSS_IMPORT_RULE,
        function(wholeMatch, arg1, href) {

            var url,
                path,
                content;

            path = href.unquoted();
            path = /\//.test(path) ? path : './' + path;
            if (TP.notValid(url = TP.uc(TP.uriResolvePaths(base, path)))) {
                content = TP.join(
                        '/* ',
                        TP.sc('Invalid import URL: '),
                        href,
                        ' */');

                return content;
            }

            //  put the import's content into a new css:sheet node (we'll
            //  build the real node outside the loop) and replace @import
            //  with a placeholder notation
                //          arr.push('<css:sheet type="import" src="', href, '" ',
                //              'xmlns:css="', TP.w3.Xmlns.CSSML, '"/>');
            arr.push('<html:link type="text/css" rel="stylesheet"',
                ' href="', url.getLocation(), '" ',
                'xmlns:html="', TP.w3.Xmlns.XHTML, '"/>');

            return '/* Externalized ' + href + ' import. */\n';
        });

    //  put the style node and its content on as the last portion of
    //  the array before we build the fragment. NOTE that this one has
    //  no tibet:src attribute.
    arr.push('<css:sheet type="inline" xmlns:css="', TP.w3.Xmlns.CSSML, '">',
            '<![CDATA[', newStyleText, ']]></css:sheet>');

    str = arr.join('');

    newNode = TP.fragmentFromString(str);
    if (TP.notValid(newNode)) {
        //  oops, something went wrong, probably badly formed CSS that
        //  wasn't in a CDATA block to keep it from interfering with XML
        return aRequest.fail(
            'Unable to create new css:sheet node for inline TP.html.style.');
    }

    //  NOTE that we have to capture the return value from the replace
    //  due to node importing requirements which may create a new node.
    TP.nodeReplaceChild(node.parentNode, newNode, node);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
